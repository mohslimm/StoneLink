import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICall extends Document {
  prospectId: mongoose.Types.ObjectId;
  agentId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'no-answer';
  transcript: Array<{ role: 'agent' | 'prospect'; text: string; timestamp: Date }>;
  scriptUsed?: mongoose.Types.ObjectId;
  objections: Array<{ type: string; handled: boolean }>;
  score?: number;
  summary?: string;
  outcome?: string;
  recordingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CallSchema = new Schema<ICall>(
  {
    prospectId: { type: Schema.Types.ObjectId, ref: 'Prospect', required: true },
    agentId: { type: String },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    duration: { type: Number }, // in seconds
    status: {
      type: String,
      enum: ['initiated', 'ringing', 'in-progress', 'completed', 'failed', 'no-answer'],
      default: 'initiated',
    },
    transcript: [
      {
        role: { type: String, enum: ['agent', 'prospect'], required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    scriptUsed: { type: Schema.Types.ObjectId, ref: 'Script' },
    objections: [
      {
        type: { type: String, required: true },
        handled: { type: Boolean, default: false },
      },
    ],
    score: { type: Number, min: 0, max: 100 },
    summary: { type: String },
    outcome: { type: String },
    recordingUrl: { type: String },
  },
  { timestamps: true }
);

export const Call: Model<ICall> = mongoose.models.Call || mongoose.model<ICall>('Call', CallSchema);
