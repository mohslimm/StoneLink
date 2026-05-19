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

    // Le prospect souhaite être recontacté
    prospect.status = 'engaged';
    prospect.stage = 'interested';
    prospect.priority = 'hot';
    
    prospect.activities.push({
      id: `act-contact-${Date.now()}`,
      type: 'contact_request',
      description: 'Le prospect a demandé à être recontacté depuis le Mirror',
      timestamp: new Date(),
      status: 'completed'
    });

    await prospect.save();

    await TerminalEventModel.create({
      type: 'success',
      module: 'mirror',
      source: prospect.companyName,
      message: `Lead entrant : ${prospect.companyName} souhaite être recontacté !`,
      prospectId: prospect.id
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mirror Contact Tracking Error:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
