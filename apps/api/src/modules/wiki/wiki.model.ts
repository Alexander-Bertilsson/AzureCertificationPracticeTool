import { Schema, Types, model, type InferSchemaType, type Model } from 'mongoose';

const wikiArticleSchema = new Schema(
  {
    certificationId: { type: Types.ObjectId, ref: 'Certification', required: true },
    topicId: { type: Types.ObjectId, ref: 'Topic', required: true },
    slug: { type: String, required: true },
    title: { type: String, required: true },
    summary: { type: String, default: '' },
    body: { type: String, required: true },
    sourceUrl: { type: String, required: true },
    tags: { type: [String], default: [] },
    readingTimeMinutes: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'wikiArticles' },
);

// Unique within a certification.
wikiArticleSchema.index({ certificationId: 1, slug: 1 }, { unique: true });
// Common query: list articles for a (cert, topic) pair.
wikiArticleSchema.index({ certificationId: 1, topicId: 1 });
// Reserved for future search — text index on the readable content.
wikiArticleSchema.index({ title: 'text', summary: 'text', body: 'text' });

export type WikiArticleDoc = InferSchemaType<typeof wikiArticleSchema>;

export const WikiArticleModel: Model<WikiArticleDoc> = model<WikiArticleDoc>(
  'WikiArticle',
  wikiArticleSchema,
);
