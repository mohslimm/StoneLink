import mongoose, { Schema, Document } from 'mongoose';

export interface ISequence extends Document {
  prospectId: string;
  steps: {
    dayOffset: number; // e.g., 0, 3, 5
    subjectTemplate: string;
    bodyTemplate: string;
    executed: boolean;
    executedAt?: Date;
  }[];
  active: boolean;
  startDate: Date;
}

const SequenceSchema: Schema = new Schema(
  {
    prospectId: { type: String, required: true },
    steps: [{
      dayOffset: { type: Number, required: true },
      subjectTemplate: { type: String, required: true },
      bodyTemplate: { type: String, required: true },
      executed: { type: Boolean, default: false },
      executedAt: { type: Date }
    }],
    active: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.models.Sequence || mongoose.model<ISequence>('Sequence', SequenceSchema);
