import { Schema, model, type InferSchemaType, type Model } from 'mongoose';

const certificationSchema = new Schema(
  {
    code: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    mslearnPathUrl: { type: String, required: true },
  },
  { timestamps: true, collection: 'certifications' },
);

export type CertificationDoc = InferSchemaType<typeof certificationSchema>;

export const CertificationModel: Model<CertificationDoc> = model<CertificationDoc>(
  'Certification',
  certificationSchema,
);
