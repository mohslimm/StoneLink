import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import VaultModel from '@/models/Vault';
import ProspectModel from '@/models/Prospect';
import { VaultClient } from './VaultClient';

export default async function VaultPage(props: { params: Promise<{ prospectId: string }> }) {
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

  let vault = await VaultModel.findOne({ prospectId }).lean();
  
  if (!vault) {
    vault = { prospectId, files: [] };
  }

  const serializedVault = {
    ...vault,
    _id: vault._id?.toString(),
    files: vault.files.map((f: any) => ({
      ...f,
      _id: f._id?.toString(),
      uploadDate: f.uploadDate?.toISOString(),
      viewedAt: f.viewedAt?.toISOString(),
    }))
  };

  const serializedProspect = {
    ...prospect,
    _id: prospect._id?.toString(),
    id: prospect.id,
    createdAt: prospect.createdAt?.toISOString(),
    updatedAt: prospect.updatedAt?.toISOString(),
  };

  return <VaultClient prospect={serializedProspect as any} vault={serializedVault as any} />;
}
