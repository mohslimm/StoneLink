import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IScriptStep {
  step: number;
  title: string;
  duration: string;
  objective: string;
  script: string;
  tips: string[];
}

export interface IScript extends Document {
  prospectId: mongoose.Types.ObjectId;
  steps: IScriptStep[];
  tone: string;
  version: number;
  generatedAt: Date;
  cached: boolean;
}

const ScriptSchema = new Schema<IScript>(
  {
    prospectId: { type: Schema.Types.ObjectId, ref: 'Prospect', required: true },
    steps: [
      {
        step: { type: Number, required: true },
        title: { type: String, required: true },
        duration: { type: String, required: true },
        objective: { type: String, required: true },
        script: { type: String, required: true },
        tips: [{ type: String }],
      },
    ],
    tone: { type: String, default: 'professional' },
    version: { type: Number, default: 1 },
    generatedAt: { type: Date, default: Date.now },
    cached: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Script: Model<IScript> =
  mongoose.models.Script || mongoose.model<IScript>('Script', ScriptSchema);
