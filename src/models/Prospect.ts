import mongoose, { Schema, InferSchemaType, model, models } from 'mongoose';

const NoteSchema = new Schema({
  id: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  author: { type: String, required: true },
}, { _id: false });

const EmailSchema = new Schema({
  id: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  opened: { type: Boolean, default: false },
  openedAt: { type: Date },
  clicked: { type: Boolean, default: false },
  clickedAt: { type: Date },
}, { _id: false });

const ActivitySchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: 'completed' },
}, { _id: false });

const ProspectSchema = new Schema(
  {
    companyName: { type: String, required: true },
    contactName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String },
    website: { type: String },

    niche: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },

    stage: { type: String, default: 'new' },
    priority: { type: String, default: 'cold' },

    estimatedDealValue: { type: Number },
    lastContactedAt: { type: Date },
    lastReminderAt: { type: Date },
    customizedPrototypeUrl: { type: String },

    notes: { type: [NoteSchema], default: [] },
    emails: { type: [EmailSchema], default: [] },
    activities: { type: [ActivitySchema], default: [] },

    aiAssets: {
      siteAdaptation: Schema.Types.Mixed,
      logoConcept: Schema.Types.Mixed,
      callScript: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// ✅ IMPORTANT: prevents overwrite in Next.js hot reload
export type Prospect = InferSchemaType<typeof ProspectSchema>;

const ProspectModel: mongoose.Model<any> = models.Prospect || model('Prospect', ProspectSchema);
export default ProspectModel;