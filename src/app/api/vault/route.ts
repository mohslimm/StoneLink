import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import VaultModel from '@/models/Vault';
import ProspectModel from '@/models/Prospect';
import TerminalEventModel from '@/models/TerminalEvent';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const prospectId = searchParams.get('prospectId');

    if (!prospectId) {
      return NextResponse.json({ error: "prospectId manquant" }, { status: 400 });
    }

    if (mongoose.connection.readyState !== 1) {
      const uri = process.env.MONGODB_URI;
      if (uri) await mongoose.connect(uri);
    }

    const vault = await VaultModel.findOne({ prospectId });
    if (!vault) {
      return NextResponse.json({ files: [] }); // Vault vide au lieu de 404
    }

    return NextResponse.json({ success: true, vault });
  } catch (error) {
    console.error('Vault GET Error:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prospectId, file } = await req.json();

    if (!prospectId || !file) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    if (mongoose.connection.readyState !== 1) {
      const uri = process.env.MONGODB_URI;
      if (uri) await mongoose.connect(uri);
    }

    let vault = await VaultModel.findOne({ prospectId });
    if (!vault) {
      vault = new VaultModel({ prospectId, files: [] });
    }

    const newFile = {
      id: `file-${Date.now()}`,
      ...file,
      uploadDate: new Date(),
      viewed: false
    };

    vault.files.push(newFile);
    await vault.save();

    const prospect = await ProspectModel.findById(prospectId);
    if (prospect) {
      prospect.activities.push({
        id: `act-vault-${Date.now()}`,
        type: 'document_sent',
        description: `Document ajouté au Vault: ${file.name}`,
        timestamp: new Date(),
        status: 'completed'
      });
      await prospect.save();
    }

    await TerminalEventModel.create({
      type: 'info',
      module: 'vault',
      source: prospect?.companyName || 'Unknown',
      message: `Nouveau document: ${file.name}`,
      prospectId: prospectId
    });

    return NextResponse.json({ success: true, file: newFile });
  } catch (error) {
    console.error('Vault POST Error:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
