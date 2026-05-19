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

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Clé API non configurée" }, { status: 500 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 500,
        system: `Tu es le module Profiler de l'agence Stepping Stones.
Tu analyses le contexte d'un prospect et déduis sa psychologie et ses points de douleur commerciaux.
RÉPONSE JSON UNIQUEMENT. Aucun markdown.
Structure attendue :
{
  "decisionMakerType": "Le type de personnalité (ex: Pragmatique ROIste, Visionnaire, etc.)",
  "estimatedPains": ["Douleur 1", "Douleur 2", "Douleur 3"],
  "profilerSummary": "Résumé de 2 phrases sur l'angle d'approche recommandé"
}`,
        messages: [{
          role: 'user',
          content: `Analyse ce prospect et génère le profil psychologique pour faciliter la vente d'une refonte web ou d'un outil métier :
Entreprise: ${prospect.companyName}
Contact: ${prospect.contactName}
Niche: ${prospect.niche}
Site Web: ${prospect.website || 'Non spécifié'}
Valeur estimée du deal: ${prospect.estimatedDealValue || 'Inconnue'} €`
        }]
      })
    });

    if (!response.ok) {
       const err = await response.json();
       throw new Error(`API Anthropic: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text || "";
    
    const cleanText = rawText.replace(/```json\n?|```/g, '').trim();
    const match = cleanText.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("JSON invalide reçu de Claude");

    const parsed = JSON.parse(match[0]);

    // Ajouter l'analyse dans les notes du prospect
    const noteId = `note-${Date.now()}`;
    prospect.notes.push({
      id: noteId,
      content: `[PROFILER AI] Type: ${parsed.decisionMakerType}\n\nDouleurs estimées:\n- ${parsed.estimatedPains.join('\n- ')}\n\nRésumé: ${parsed.profilerSummary}`,
      author: 'StoneLink Profiler',
      timestamp: new Date()
    });

    // Ajouter une activité de profilage
    prospect.activities.push({
      id: `act-${Date.now()}`,
      type: 'profiler_run',
      description: 'Profilage psychologique IA généré',
      timestamp: new Date(),
      status: 'completed'
    });

    await prospect.save();

    // Logger l'événement dans le terminal
    await TerminalEventModel.create({
      type: 'detection',
      module: 'shadow-intelligence', // ou profiler s'il est ajouté
      source: prospect.companyName,
      message: `Profil IA généré pour ${prospect.contactName}`,
      prospectId: prospect.id
    });

    return NextResponse.json({ success: true, profile: parsed });
  } catch (error) {
    console.error('Profiler Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erreur serveur" }, { status: 500 });
  }
}
