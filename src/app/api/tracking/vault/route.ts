import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import VaultModel from '@/models/Vault';
import ProspectModel from '@/models/Prospect';
import TerminalEventModel from '@/models/TerminalEvent';

export async function POST(req: NextRequest) {
  try {
    const { prospectId, fileId } = await req.json();

    if (!prospectId || !fileId) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    if (mongoose.connection.readyState !== 1) {
      const uri = process.env.MONGODB_URI;
      if (uri) await mongoose.connect(uri);
    }

    const vault = await VaultModel.findOne({ prospectId });
    if (!vault) {
      return NextResponse.json({ error: "Vault non trouvé" }, { status: 404 });
    }

    const file = vault.files.find((f: any) => f.id === fileId);
    if (file && !file.viewed) {
      file.viewed = true;
      file.viewedAt = new Date();
      await vault.save();

      const prospect = await ProspectModel.findById(prospectId);
      if (prospect) {
        prospect.activities.push({
          id: `act-vault-view-${Date.now()}`,
          type: 'document_viewed',
          description: `Document consulté : ${file.name}`,
          timestamp: new Date(),
          status: 'completed'
        });
        
        // S'il n'était pas encore en négociation, on peut le passer en 'negotiating'
        if (prospect.status !== 'won' && prospect.status !== 'lost') {
          prospect.status = 'negotiating';
        }
        
        await prospect.save();

        await TerminalEventModel.create({
          type: 'success',
          module: 'vault',
          source: prospect.companyName,
          message: `Le prospect a consulté : ${file.name}`,
          prospectId: prospect.id
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vault Tracking Error:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
