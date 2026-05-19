import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ProspectModel from '@/models/Prospect';
import TerminalEventModel from '@/models/TerminalEvent';

export async function POST(req: NextRequest) {
  try {
    const { prospectId, customizedPrototypeUrl } = await req.json();

    if (!prospectId || !customizedPrototypeUrl) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    if (mongoose.connection.readyState !== 1) {
      const uri = process.env.MONGODB_URI;
      if (uri) await mongoose.connect(uri);
    }

    const prospect = await ProspectModel.findById(prospectId);
    if (!prospect) {
      return NextResponse.json({ error: "Prospect non trouvé" }, { status: 404 });
    }

    prospect.customizedPrototypeUrl = customizedPrototypeUrl;
    prospect.stage = 'prototype_ready'; 
    
    prospect.activities.push({
      id: `act-forge-${Date.now()}`,
      type: 'prototype_customized',
      description: `Prototype personnalisé déployé : ${customizedPrototypeUrl}`,
      timestamp: new Date(),
      status: 'completed'
    });

    await prospect.save();

    await TerminalEventModel.create({
      type: 'success',
      module: 'forge',
      source: prospect.companyName,
      message: `Prototype déployé pour ${prospect.companyName}`,
      prospectId: prospect.id
    });

    return NextResponse.json({ success: true, prospect });
  } catch (error) {
    console.error('Forge Error:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
