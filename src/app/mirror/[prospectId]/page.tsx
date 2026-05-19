import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import ProspectModel from '@/models/Prospect';
import MirrorClient from './MirrorClient';

export default async function MirrorPage(props: { params: Promise<{ prospectId: string }> }) {
  const params = await props.params;
  const prospectId = params.prospectId;

  if (mongoose.connection.readyState !== 1) {
    const uri = process.env.MONGODB_URI;
    if (uri) await mongoose.connect(uri);
  }

  const prospect = await ProspectModel.findById(prospectId).lean();

  if (!prospect) {
    notFound();
  }

  // Sérialiser pour passer au Client Component
  const serializedProspect = {
    ...prospect,
    _id: prospect._id?.toString(),
    id: prospect.id,
    createdAt: prospect.createdAt?.toISOString(),
    updatedAt: prospect.updatedAt?.toISOString(),
  };

  return <MirrorClient prospect={serializedProspect as any} />;
}
