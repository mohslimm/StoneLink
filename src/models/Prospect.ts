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
    _id: { type: String },
    companyName: { type: String, default: 'Sans entreprise' },
    contactName: { type: String, default: 'Sans contact' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },

    score: { type: Number, default: 0 },
    niche: { type: String, default: 'Général' },
    country: { type: String, default: 'Algérie' },
    city: { type: String, default: '' },

    stage: { type: String, default: 'nouveau' },
    priority: { type: String, default: 'cold' },

    estimatedDealValue: { type: Number },
    lastContactedAt: { type: Date },
    lastReminderAt: { type: Date },
    customizedPrototypeUrl: { type: String },

    notes: { type: Schema.Types.Mixed, default: '' },
    emails: { type: [EmailSchema], default: [] },
    activities: { type: [ActivitySchema], default: [] },
    callHistory: { type: Array, default: [] },

    aiAssets: {
      siteAdaptation: Schema.Types.Mixed,
      logoConcept: Schema.Types.Mixed,
      callScript: Schema.Types.Mixed,
    },
  },
  { timestamps: true, strict: false }
);

const ProspectModel: mongoose.Model<any> =
  models.Prospect && models.Prospect.schema.paths['_id']?.instance === 'String'
    ? models.Prospect
    : (delete (models as any).Prospect, model('Prospect', ProspectSchema));
export default ProspectModel;