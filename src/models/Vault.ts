import mongoose, { Schema, Document } from 'mongoose';

export interface IVault extends Document {
  prospectId: string;
  files: {
    id: string;
    name: string;
    type: 'proposal' | 'contract' | 'invoice' | 'audit' | 'other';
    url: string;
    uploadDate: Date;
    viewed: boolean;
    viewedAt?: Date;
  }[];
  passwordHash?: string;
}

const VaultSchema: Schema = new Schema(
  {
    prospectId: { type: String, required: true, unique: true },
    files: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      type: { type: String, enum: ['proposal', 'contract', 'invoice', 'audit', 'other'], default: 'other' },
      url: { type: String, required: true },
      uploadDate: { type: Date, default: Date.now },
      viewed: { type: Boolean, default: false },
      viewedAt: { type: Date }
    }],
    passwordHash: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.Vault || mongoose.model<IVault>('Vault', VaultSchema);
