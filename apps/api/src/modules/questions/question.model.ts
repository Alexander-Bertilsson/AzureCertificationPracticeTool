import { Schema, Types, model, type InferSchemaType, type Model } from 'mongoose';

const choiceSchema = new Schema(
  {
    id: { type: String, required: true, enum: ['A', 'B', 'C', 'D', 'E'] },
    text: { type: String, required: true },
  },
  { _id: false },
);

const questionSchema = new Schema(
  {
    certificationId: { type: Types.ObjectId, ref: 'Certification', required: true },
    topicId: { type: Types.ObjectId, ref: 'Topic', required: true },
    externalId: { type: String, required: true, unique: true },
    prompt: { type: String, required: true },
    choices: { type: [choiceSchema], required: true },
    correctChoiceIds: { type: [String], required: true },
    explanation: { type: String, default: '' },
    sourceUrl: { type: String, required: true },
    difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
    tags: { type: [String], default: [] },
  },
  { timestamps: true, collection: 'questions' },
);

questionSchema.index({ certificationId: 1, topicId: 1 });

export type QuestionDoc = InferSchemaType<typeof questionSchema>;

export const QuestionModel: Model<QuestionDoc> = model<QuestionDoc>('Question', questionSchema);
