import mongoose, { Schema, InferSchemaType, model, models } from 'mongoose';

const UserCallRecordSchema = new Schema(
  {
    id: { type: String, required: true },
    prospectName: { type: String, required: true },
    company: { type: String, required: true },
    date: { type: Date, default: Date.now },
    duration: { type: String, required: true },
    outcome: { type: String, enum: ['rdv', 'prototype', 'rappeler', 'perdu'], required: true },
    score: { type: Number, min: 0, max: 100, default: 85 },
    notes: { type: String, required: true },
    transcript: [
      {
        role: { type: String, enum: ['agent', 'prospect'], required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { _id: false }
);

const UserTextRecordSchema = new Schema(
  {
    id: { type: String, required: true },
    prospectName: { type: String, required: true },
    channel: { type: String, enum: ['sms', 'email', 'note'], required: true },
    content: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['sent', 'delivered', 'opened', 'replied'], default: 'sent' },
  },
  { _id: false }
);

const UserProgressRecordSchema = new Schema(
  {
    id: { type: String, required: true },
    prospectName: { type: String, required: true },
    company: { type: String, required: true },
    previousStage: { type: String, required: true },
    newStage: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    reason: { type: String, required: true },
    dealValue: { type: Number, default: 0 },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }, // Same password for slim and lpiks: "StoneLink2026!"
    role: { type: String, default: 'agent' },
    avatarUrl: { type: String },
    calls: { type: [UserCallRecordSchema], default: [] },
    texts: { type: [UserTextRecordSchema], default: [] },
    progress: { type: [UserProgressRecordSchema], default: [] },
  },
  { timestamps: true }
);

export type UserType = InferSchemaType<typeof UserSchema>;

const UserModel: mongoose.Model<any> = models.User || model('User', UserSchema);
export default UserModel;
