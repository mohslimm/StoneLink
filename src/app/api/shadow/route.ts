import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ProspectModel from '@/models/Prospect';
import TerminalEventModel from '@/models/TerminalEvent';

// Simule la détection d'une intention d'achat via le module Shadow Intelligence
export async function POST(req: NextRequest) {
  try {
    const { prospectId, signalType } = await req.json();

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

    let signalDescription = "Signal d'achat détecté sur LinkedIn";
    if (signalType === 'website_visit') signalDescription = "Visite répétée du site détectée";
    else if (signalType === 'funding') signalDescription = "Levée de fonds ou croissance annoncée";
    else if (signalType === 'hiring') signalDescription = "Recrutement clé détecté (Marketing/Tech)";

    // Mettre à jour le prospect (changement de priorité par exemple)
    prospect.priority = 'hot';
    prospect.activities.push({
      id: `act-shadow-${Date.now()}`,
      type: 'shadow_signal',
      description: signalDescription,
      timestamp: new Date(),
      status: 'completed'
    });

    await prospect.save();

    await TerminalEventModel.create({
      type: 'alert',
      module: 'shadow-intelligence',
      source: 'LinkedIn / Web',
      message: `[SHADOW] ${signalDescription} pour ${prospect.companyName}`,
      prospectId: prospect.id
    });

    return NextResponse.json({ success: true, message: "Signal enregistré" });
  } catch (error) {
    console.error('Shadow Intelligence Error:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
