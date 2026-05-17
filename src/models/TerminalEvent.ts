import mongoose, { Schema, Document } from 'mongoose';

export interface ITerminalEvent extends Document {
  timestamp: Date;
  type: 'scan' | 'detection' | 'generation' | 'success' | 'alert' | 'deploy' | 'info' | 'error' | 'warning';
  module: string;
  source?: string;
  message: string;
  prospectId?: string;
}

const TerminalEventSchema: Schema = new Schema(
  {
    timestamp: { type: Date, default: Date.now },
    type: { 
      type: String, 
      required: true,
      enum: ['scan', 'detection', 'generation', 'success', 'alert', 'deploy', 'info', 'error', 'warning']
    },
    module: { type: String, required: true },
    source: { type: String },
    message: { type: String, required: true },
    prospectId: { type: String },
  },
  { timestamps: false } // We use the timestamp field manually
);

export default mongoose.models.TerminalEvent || mongoose.model<ITerminalEvent>('TerminalEvent', TerminalEventSchema);
