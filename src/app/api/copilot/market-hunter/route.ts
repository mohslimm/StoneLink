import { NextResponse } from 'next/server';
import { callGeminiResilient } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { customQuery } = body;

    const prompt = `Tu es l'Analyste Stratégique & Chasseur de Marché B2B chez "Stepping Stones Agency" (Algérie).
Ton rôle est d'identifier les niches d'entreprises locales en Algérie les plus lucratives (fort pouvoir d'achat, besoin urgent de digitalisation, faible présence en ligne).

Demande spécifique : ${customQuery ? `"${customQuery}"` : "Propose 3 niches inexploitées à très haute valeur ajoutée en Algérie."}

Critères pour une bonne niche en Algérie :
1. Fort panier moyen (capables de payer entre 150 000 DA et 450 000 DA pour un site web / système sur-mesure).
2. Manque criant de vitrines modernes sur Google Maps (beaucoup de 'Sans site web').
3. Décideurs joignables par téléphone direct ou WhatsApp.

RÉPONDS STRICTEMENT EN JSON AU FORMAT SUIVANT :
{
  "niches": [
    {
      "title": "Nom de la Niche (ex: Promoteurs Immobiliers & Résidences Haut Standing)",
      "targetWilayas": ["Alger", "Oran", "Constantine", "Sétif"],
      "ticketMoyenDA": "250 000 - 450 000 DA",
      "digitalMaturity": "Faible à Moyenne (90% sur Facebook/Instagram, zéro site de standing)",
      "painPoint": "Leur problème douloureux (ex: Perte de crédibilité face à la diaspora et acheteurs aisés)",
      "suggestedBotQueries": ["Promoteur immobilier", "Promotion immobilière", "Résidence immobilière"],
      "hookPitch": "L'accroche téléphonique idéale pour cette niche"
    }
  ]
}`;

    const geminiRes = await callGeminiResilient({
      prompt,
      preferredModel: 'gemini-flash-latest',
      purpose: 'general',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const sanitized = geminiRes.text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    const match = sanitized.match(/\{[\s\S]*\}/);
    const data = match ? JSON.parse(match[0]) : { niches: [] };

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error('[POST /api/copilot/market-hunter] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
