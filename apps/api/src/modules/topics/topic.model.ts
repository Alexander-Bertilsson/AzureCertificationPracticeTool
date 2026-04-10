import { Schema, Types, model, type InferSchemaType, type Model } from 'mongoose';

const topicSchema = new Schema(
  {
    certificationId: { type: Types.ObjectId, ref: 'Certification', required: true },
    slug: { type: String, required: true },
    title: { type: String, required: true },
    order: { type: Number, required: true },
    description: { type: String, default: '' },
  },
  { timestamps: true, collection: 'topics' },
);

// Unique within a certification — different certs can share a slug.
topicSchema.index({ certificationId: 1, slug: 1 }, { unique: true });
topicSchema.index({ certificationId: 1, order: 1 });

export type TopicDoc = InferSchemaType<typeof topicSchema>;

export const TopicModel: Model<TopicDoc> = model<TopicDoc>('Topic', topicSchema);
