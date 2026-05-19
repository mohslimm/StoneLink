import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ProspectModel from '@/models/Prospect';
import TerminalEventModel from '@/models/TerminalEvent';

export async function POST(req: NextRequest) {
  try {
    const { prospectId } = await req.json();

    if (!prospectId) {
      return NextResponse.json({ error: "prospectId manquant" }, { status: 400 });
    }

    if (mongoose.connection.readyState !== 1) {
      const uri = process.env.MONGODB_URI;
      if (uri) await mongoose.connect(uri);
    }

    const prospect = await ProspectModel.findById(prospectId);
    if (!prospect) {
      return NextResponse.json({ error: "Prospect non trouvé" }, { status: 404 });
    }

    prospect.status = 'won';
    prospect.stage = 'closed';
    
    prospect.activities.push({
      id: `act-sign-${Date.now()}`,
      type: 'contract_signed',
      description: 'Contrat signé électroniquement via le Vault.',
      timestamp: new Date(),
      status: 'completed'
    });

    await prospect.save();

    await TerminalEventModel.create({
      type: 'success',
      module: 'vault',
      source: prospect.companyName,
      message: `Signature du contrat confirmée. DEAL WON pour ${prospect.companyName} !`,
      prospectId: prospect.id
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vault Sign Error:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
