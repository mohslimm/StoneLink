import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ProspectModel from '@/models/Prospect';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (mongoose.connection.readyState !== 1) {
      const uri = process.env.MONGODB_URI;
      if (uri) await mongoose.connect(uri);
    }

    const prospects = await ProspectModel.find({});

    // Calcul des statistiques de base
    const totalProspects = prospects.length;
    const stagesCount = prospects.reduce((acc: any, p: any) => {
      acc[p.stage] = (acc[p.stage] || 0) + 1;
      return acc;
    }, {});

    const wonProspects = prospects.filter((p: any) => p.status === 'won');
    const closedWonValue = wonProspects.reduce((acc: number, p: any) => acc + (p.estimatedDealValue || 0), 0);
    const pipelineValue = prospects.filter((p: any) => p.status !== 'won' && p.status !== 'lost').reduce((acc: number, p: any) => acc + (p.estimatedDealValue || 0), 0);

    const metrics = {
      totalLeads: totalProspects,
      dealsWon: wonProspects.length,
      conversionRate: totalProspects > 0 ? (wonProspects.length / totalProspects) * 100 : 0,
      totalPipelineValue: pipelineValue,
      totalClosedValue: closedWonValue,
      stages: stagesCount
    };

    // Génération d'insights via IA
    const apiKey = process.env.ANTHROPIC_API_KEY;
    let insights = [
      "Leads nécessitant un suivi identifiés.",
      "Pipeline sain."
    ];

    if (apiKey) {
      const prompt = `Voici les métriques actuelles de l'agence :
${JSON.stringify(metrics, null, 2)}
Et voici la liste des prospects (niche, status, priority, stage) :
${prospects.map((p: any) => `- ${p.companyName} (${p.niche}) : ${p.status} / ${p.priority} / ${p.stage}`).join('\n')}

Agis comme le Chief Revenue Officer de l'agence. Donne 3 insights très courts et percutants (max 10 mots chacun) sur ce qui marche, ce qui bloque, ou ce qu'il faut faire urgemment.
RÉPOND UNIQUEMENT UN JSON DE LA FORME : {"insights": ["insight 1", "insight 2", "insight 3"]}`;

      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-7-sonnet-20250219',
            max_tokens: 300,
            messages: [{ role: 'user', content: prompt }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data.content?.[0]?.text || "";
          const cleanText = rawText.replace(/```json\n?|```/g, '').trim();
          const match = cleanText.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            if (parsed.insights) insights = parsed.insights;
          }
        }
      } catch (e) {
        console.error("Erreur lors de la génération des insights AI:", e);
      }
    }

    return NextResponse.json({ success: true, metrics, insights });
  } catch (error) {
    console.error('Analytics Backend Error:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
