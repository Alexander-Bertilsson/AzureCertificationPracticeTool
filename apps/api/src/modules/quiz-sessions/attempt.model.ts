import { Schema, Types, model, type InferSchemaType, type Model } from 'mongoose';

const attemptSchema = new Schema(
  {
    userId: { type: String, required: true },
    quizSessionId: { type: Types.ObjectId, ref: 'QuizSession', required: true },
    certificationId: { type: Types.ObjectId, ref: 'Certification', required: true },
    // Denormalized from the question for cheap weak-area aggregation in the
    // progress module — questions can't change topic without a reseed.
    topicId: { type: Types.ObjectId, ref: 'Topic', required: true },
    questionId: { type: Types.ObjectId, ref: 'Question', required: true },
    selectedChoiceIds: { type: [String], required: true },
    isCorrect: { type: Boolean, required: true },
    answeredAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: false, collection: 'attempts' },
);

attemptSchema.index({ userId: 1, quizSessionId: 1 });
attemptSchema.index({ userId: 1, certificationId: 1, topicId: 1, answeredAt: -1 });
attemptSchema.index({ userId: 1, questionId: 1, answeredAt: -1 });

export type AttemptDoc = InferSchemaType<typeof attemptSchema>;

export const AttemptModel: Model<AttemptDoc> = model<AttemptDoc>('Attempt', attemptSchema);
