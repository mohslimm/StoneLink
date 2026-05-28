import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProspect extends Document {
  name: string;
  company: string;
  sector: string;
  city: string;
  phone: string;
  email?: string;
  lighthouseScore?: number;
  monthlyLoss?: number;
  status: 'new' | 'contacted' | 'qualified' | 'lost' | 'won';
  notes: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProspectSchema = new Schema<IProspect>(
  {
    name: { type: String, required: true },
    company: { type: String, required: true },
    sector: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    lighthouseScore: { type: Number },
    monthlyLoss: { type: Number },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'lost', 'won'],
      default: 'new',
    },
    notes: [{ type: String }],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Prevent mongoose from recompiling the model in Next.js development
export const Prospect: Model<IProspect> =
  mongoose.models.Prospect || mongoose.model<IProspect>('Prospect', ProspectSchema);
