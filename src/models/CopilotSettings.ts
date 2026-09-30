import mongoose, { Schema, model, models } from 'mongoose';

export interface ICopilotSettings {
  _id: string;
  activeFocus: string;
  autoAnalyzeDaily: boolean;
  targetDailyCalls: number;
  lastBriefingAt?: Date;
  cachedBriefing?: any;
  notes?: string;
  updatedAt: Date;
}

const CopilotSettingsSchema = new Schema(
  {
    _id: { type: String, default: 'copilot_config' },
    activeFocus: { type: String, default: 'Agence de voyage' },
    autoAnalyzeDaily: { type: Boolean, default: true },
    targetDailyCalls: { type: Number, default: 20 },
    lastBriefingAt: { type: Date },
    cachedBriefing: { type: Schema.Types.Mixed },
    notes: { type: String, default: '' },
  },
  { timestamps: true, strict: false }
);

const CopilotSettingsModel: mongoose.Model<any> =
  models.CopilotSettings || model('CopilotSettings', CopilotSettingsSchema);

export default CopilotSettingsModel;
