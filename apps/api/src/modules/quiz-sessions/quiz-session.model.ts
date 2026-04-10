import { Schema, Types, model, type InferSchemaType, type Model } from 'mongoose';

const quizSessionSchema = new Schema(
  {
    userId: { type: String, required: true },
    certificationId: { type: Types.ObjectId, ref: 'Certification', required: true },
    mode: { type: String, required: true, enum: ['single-topic', 'mixed'] },
    feedbackMode: { type: String, required: true, enum: ['practice', 'exam'] },
    topicId: { type: Types.ObjectId, ref: 'Topic' },
    length: { type: Number, required: true, enum: [25, 50] },
    questionIds: { type: [Types.ObjectId], required: true, default: [] },
    status: {
      type: String,
      required: true,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
    },
    startedAt: { type: Date, required: true, default: Date.now },
    completedAt: { type: Date },
    score: {
      type: new Schema(
        {
          correct: { type: Number, required: true },
          total: { type: Number, required: true },
          // Mongoose Mixed: per-topic record, validated by zod at the boundary.
          perTopic: { type: Schema.Types.Mixed, required: true },
        },
        { _id: false },
      ),
      required: false,
    },
  },
  { timestamps: true, collection: 'quizSessions' },
);

quizSessionSchema.index({ userId: 1, certificationId: 1, startedAt: -1 });

export type QuizSessionDoc = InferSchemaType<typeof quizSessionSchema>;

export const QuizSessionModel: Model<QuizSessionDoc> = model<QuizSessionDoc>(
  'QuizSession',
  quizSessionSchema,
);
