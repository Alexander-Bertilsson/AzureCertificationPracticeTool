/* eslint-disable no-console -- the seed script runs outside the Fastify pino lifecycle. */
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CertificationInputSchema,
  WikiArticleInputSchema,
  QuestionInputSchema,
  type TopicId,
} from '@acpt/shared';
import 'dotenv/config';
import matter from 'gray-matter';
import { z } from 'zod';

import { connectMongo, disconnectMongo } from '../db/mongo.js';
import { upsertCertificationBySlug } from '../modules/certifications/certification.repository.js';
import { upsertQuestionByExternalId } from '../modules/questions/question.repository.js';
import { upsertTopicBySlug } from '../modules/topics/topic.repository.js';
import { upsertArticleBySlug } from '../modules/wiki/wiki.repository.js';

// --- file shapes ----------------------------------------------------------
//
// The on-disk content uses topic *slugs* (not branded ids) so it's editable
// by hand and survives reseeds. The seed script resolves slugs to ids after
// upserting the parent records.

const RawCertSchema = CertificationInputSchema;

const RawTopicFileSchema = z.array(
  z.object({
    slug: z.string().min(1),
    title: z.string().min(1),
    order: z.number().int().nonnegative(),
    description: z.string(),
  }),
);

const RawWikiFrontmatterSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  topic: z.string().min(1),
  summary: z.string(),
  sourceUrl: z.string().url(),
  tags: z.array(z.string()).default([]),
  readingTimeMinutes: z.number().int().nonnegative(),
});

const RawQuestionFileSchema = z.array(
  z.object({
    externalId: z.string().min(1),
    topic: z.string().min(1),
    prompt: z.string().min(1),
    choices: z
      .array(
        z.object({
          id: z.enum(['A', 'B', 'C', 'D', 'E']),
          text: z.string().min(1),
        }),
      )
      .min(2),
    correctChoiceIds: z.array(z.enum(['A', 'B', 'C', 'D', 'E'])).min(1),
    explanation: z.string(),
    sourceUrl: z.string().url(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    tags: z.array(z.string()).default([]),
  }),
);

// --- locate the /content directory ----------------------------------------
//
// Resolved relative to this file at runtime so the script works whether
// it's executed via tsx (src) or node (dist).

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CONTENT_ROOT = join(__dirname, '..', '..', '..', '..', 'content');

// --- helpers --------------------------------------------------------------

async function readJson<T>(path: string, schema: z.ZodSchema<T>): Promise<T> {
  const raw = await readFile(path, 'utf-8');
  const parsed: unknown = JSON.parse(raw);
  return schema.parse(parsed);
}

async function listFilesRecursive(dir: string): Promise<string[]> {
  // Manual walk — Dirent.parentPath was only added in Node 20.12, and we
  // target Node 20.11+. Recursing by hand keeps us portable.
  const out: string[] = [];
  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile()) {
        out.push(full);
      }
    }
  }
  await walk(dir);
  return out;
}

interface SeedCounts {
  certifications: number;
  topics: number;
  wikiArticles: number;
  questions: number;
}

async function seedCertification(certDir: string): Promise<SeedCounts> {
  const counts: SeedCounts = { certifications: 0, topics: 0, wikiArticles: 0, questions: 0 };

  // 1. Cert metadata
  const certPath = join(certDir, 'certification.json');
  const certInput = await readJson(certPath, RawCertSchema);
  const cert = await upsertCertificationBySlug(certInput);
  counts.certifications = 1;
  console.log(`  cert:    ${cert.slug} (${cert.id})`);

  // 2. Topics — build slug → id map for later lookups
  const topicsPath = join(certDir, 'topics.json');
  const rawTopics = await readJson(topicsPath, RawTopicFileSchema);
  const topicIdBySlug = new Map<string, TopicId>();

  for (const raw of rawTopics) {
    const topic = await upsertTopicBySlug({
      certificationId: cert.id,
      slug: raw.slug,
      title: raw.title,
      order: raw.order,
      description: raw.description,
    });
    topicIdBySlug.set(topic.slug, topic.id);
    counts.topics += 1;
  }
  console.log(`  topics:  ${String(counts.topics)}`);

  // 3. Wiki articles — walk wiki/<topic-slug>/*.md
  const wikiDir = join(certDir, 'wiki');
  const wikiFiles = await listFilesRecursive(wikiDir).catch(() => [] as string[]);

  for (const file of wikiFiles.filter((f) => f.endsWith('.md'))) {
    const raw = await readFile(file, 'utf-8');
    const { data, content } = matter(raw);
    const fm = RawWikiFrontmatterSchema.parse(data);

    const topicId = topicIdBySlug.get(fm.topic);
    if (topicId === undefined) {
      throw new Error(
        `Wiki article ${file} references unknown topic slug "${fm.topic}". Add the topic to topics.json first.`,
      );
    }

    const articleInput = WikiArticleInputSchema.parse({
      certificationId: cert.id,
      topicId,
      slug: fm.slug,
      title: fm.title,
      summary: fm.summary,
      body: content.trim(),
      sourceUrl: fm.sourceUrl,
      tags: fm.tags,
      readingTimeMinutes: fm.readingTimeMinutes,
    });
    await upsertArticleBySlug(articleInput);
    counts.wikiArticles += 1;
  }
  console.log(`  wiki:    ${String(counts.wikiArticles)} articles`);

  // 4. Questions — walk questions/*.json
  const questionsDir = join(certDir, 'questions');
  const questionFiles = await listFilesRecursive(questionsDir).catch(() => [] as string[]);

  for (const file of questionFiles.filter((f) => f.endsWith('.json'))) {
    const rawQuestions = await readJson(file, RawQuestionFileSchema);
    for (const raw of rawQuestions) {
      const topicId = topicIdBySlug.get(raw.topic);
      if (topicId === undefined) {
        throw new Error(
          `Question ${raw.externalId} in ${file} references unknown topic slug "${raw.topic}".`,
        );
      }

      const questionInput = QuestionInputSchema.parse({
        certificationId: cert.id,
        topicId,
        externalId: raw.externalId,
        prompt: raw.prompt,
        choices: raw.choices,
        correctChoiceIds: raw.correctChoiceIds,
        explanation: raw.explanation,
        sourceUrl: raw.sourceUrl,
        difficulty: raw.difficulty,
        tags: raw.tags,
      });
      await upsertQuestionByExternalId(questionInput);
      counts.questions += 1;
    }
  }
  console.log(`  qs:      ${String(counts.questions)} questions`);

  return counts;
}

async function main(): Promise<void> {
  console.log(`Seeding from ${CONTENT_ROOT}`);

  const certDirs = (await readdir(CONTENT_ROOT, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => join(CONTENT_ROOT, e.name));

  if (certDirs.length === 0) {
    console.warn('No certification directories found under /content. Nothing to seed.');
    return;
  }

  await connectMongo();

  const totals: SeedCounts = { certifications: 0, topics: 0, wikiArticles: 0, questions: 0 };
  try {
    for (const certDir of certDirs) {
      console.log(`\nProcessing ${certDir}`);
      const counts = await seedCertification(certDir);
      totals.certifications += counts.certifications;
      totals.topics += counts.topics;
      totals.wikiArticles += counts.wikiArticles;
      totals.questions += counts.questions;
    }
  } finally {
    await disconnectMongo();
  }

  console.log('\nSeed complete:');
  console.log(`  ${String(totals.certifications)} cert(s)`);
  console.log(`  ${String(totals.topics)} topic(s)`);
  console.log(`  ${String(totals.wikiArticles)} wiki article(s)`);
  console.log(`  ${String(totals.questions)} question(s)`);
}

main().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
