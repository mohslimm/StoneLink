import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CopilotSettings from '@/models/CopilotSettings';
import Prospect from '@/models/Prospect';
import { callGeminiResilient } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    // 1. Get or create settings
    let settings = await CopilotSettings.findById('copilot_config');
    if (!settings) {
      settings = await CopilotSettings.create({
        _id: 'copilot_config',
        activeFocus: 'Agence de voyage',
        autoAnalyzeDaily: true,
      });
    }

    const activeFocus = settings.activeFocus || 'Agence de voyage';

    // 2. Return cached briefing if fresh (< 4 hours old) and force is not requested
    const fourHoursAgo = new Date(Date.now() - 4 * 3600 * 1000);
    if (
      !force &&
      settings.cachedBriefing &&
      settings.lastBriefingAt &&
      new Date(settings.lastBriefingAt) > fourHoursAgo
    ) {
      return NextResponse.json({
        success: true,
        cached: true,
        activeFocus,
        lastBriefingAt: settings.lastBriefingAt,
        briefing: settings.cachedBriefing,
      });
    }

    // 3. Query MongoDB for real pipeline data
    const baseQuery: any = { isDeleted: { $ne: true } };

    // Query 1: Prospects in Prototype stage
    const prototypes = await Prospect.find({
      ...baseQuery,
      stage: { $in: ['prototype', 'prototype_sent'] },
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    // Query 2: Prospects in Contacted / Callback stage (potential 48h follow-ups)
    const contacted = await Prospect.find({
      ...baseQuery,
      stage: { $in: ['contacte', 'contacted', 'recontacter', 'to_call'] },
    })
      .sort({ updatedAt: -1 })
      .limit(15)
      .lean();

    // Query 3: Top New Prospects matching active focus
    const focusRegex = new RegExp(activeFocus, 'i');
    let newLeads = await Prospect.find({
      ...baseQuery,
      stage: { $in: ['nouveau', 'new'] },
      niche: focusRegex,
      phone: { $exists: true, $ne: '' },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Fallback if not enough in active focus: get any top new leads
    if (newLeads.length < 5) {
      const additional = await Prospect.find({
        ...baseQuery,
        stage: { $in: ['nouveau', 'new'] },
        phone: { $exists: true, $ne: '' },
      })
        .sort({ createdAt: -1 })
        .limit(10 - newLeads.length)
        .lean();
      newLeads = [...newLeads, ...additional];
    }

    // Pipeline counts
    const totalActive = await Prospect.countDocuments(baseQuery);
    const totalNew = await Prospect.countDocuments({ ...baseQuery, stage: { $in: ['nouveau', 'new'] } });
    const totalPrototypes = prototypes.length;
    const totalContacted = contacted.length;

    // 4. Construct AI Prompt for Gemini 3.8 Flash (GEMINI_API_KEY_AGENCY)
    const prompt = `Tu es le Directeur des Opérations & Stratégie IA chez "Stepping Stones Agency" (fondée par Mohamed Slimani & Abdelhadi Hammaz en Algérie).
Ton rôle est d'analyser le pipeline en direct pour élaborer le Plan de Bataille Quotidien.

CONTEXTE DE L'AGENCE :
- Focus Métier Actuel : "${activeFocus}"
- Total Prospects Actifs : ${totalActive}
- Nouveaux Prospects : ${totalNew}
- Prototypes en cours : ${totalPrototypes}
- Contacts / Relances : ${totalContacted}

DONNÉES EN DIRECT DU PIPELINE :
1. Prototypes en cours (${prototypes.length}) :
${prototypes.map((p: any) => `- ID: ${p._id} | Entreprise: ${p.companyName} | Ville: ${p.city} | Tél: ${p.phone} | Dernier contact: ${p.lastContactedAt || p.updatedAt}`).join('\n') || 'Aucun prototype en cours'}

2. Prospects Contactés / À Recontacter (${contacted.length}) :
${contacted.map((p: any) => `- ID: ${p._id} | Entreprise: ${p.companyName} | Ville: ${p.city} | Tél: ${p.phone} | Statut: ${p.stage} | Maj: ${p.updatedAt}`).join('\n') || 'Aucun prospect contacté'}

3. Nouveaux Prospects prioritaires (${newLeads.length}) :
${newLeads.map((p: any) => `- ID: ${p._id} | Entreprise: ${p.companyName} | Ville: ${p.city} | Tél: ${p.phone} | Score: ${p.score} | Site: ${p.website || 'Pas de site'}`).join('\n') || 'Aucun nouveau prospect'}

CONSIGNES STRICTES :
1. Génère un plan de bataille clair, percutant et ultra-pragmatique adapté au marché algérien (appels, WhatsApp, négociations en DA).
2. Pour les relances 48h, identifie les 3 à 5 prospects prioritaires où il faut battre le fer tant qu'il est chaud.
3. Pour les prototypes, donne l'angle de closing pour transformer la maquette en contrat signé.
4. Pour les nouveaux appels, propose l'accroche exacte adaptée à la ville et l'absence de site.
5. Donne un conseil stratégique du jour motivant pour Mohamed et Abdelhadi.

RÉPONDS UNIQUEMENT SOUS FORME D'UN OBJET JSON STRICT AU FORMAT SUIVANT :
{
  "headline": "Phrase d'accroche percutante résumant la priorité du jour",
  "activeFocus": "${activeFocus}",
  "urgent48hTasks": [
    {
      "prospectId": "ID",
      "companyName": "Nom entreprise",
      "city": "Ville",
      "phone": "Téléphone",
      "reason": "Pourquoi relancer maintenant (ex: Contacté il y a 48h, intérêt manifesté)",
      "recommendedAction": "Action recommandée (ex: Appel direct pour valider le besoin de maquette)",
      "urgency": "haute"
    }
  ],
  "prototypeTasks": [
    {
      "prospectId": "ID",
      "companyName": "Nom entreprise",
      "city": "Ville",
      "phone": "Téléphone",
      "closingTip": "Angle d'attaque pour transformer la maquette en contrat",
      "suggestedOffer": "Offre recommandée (ex: Pack Vitrine Dynamique 160 000 DA)"
    }
  ],
  "newCallingTargets": [
    {
      "prospectId": "ID",
      "companyName": "Nom entreprise",
      "city": "Ville",
      "phone": "Téléphone",
      "hookAngle": "Accroche rapide en 1 phrase pour le décrochage"
    }
  ],
  "strategicTip": "Le conseil tactique d'élite du jour pour dominer le marché algérien",
  "summaryStats": {
    "totalPipeline": ${totalActive},
    "urgentCount": ${contacted.length > 5 ? 5 : contacted.length},
    "prototypeCount": ${totalPrototypes},
    "newLeadCount": ${newLeads.length}
  }
}`;

    let parsedBriefing: any = null;

    try {
      const geminiRes = await callGeminiResilient({
        prompt,
        preferredModel: 'gemini-3.8-flash',
        purpose: 'general',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.35,
        },
      });

      const sanitized = geminiRes.text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      const match = sanitized.match(/\{[\s\S]*\}/);
      if (match) {
        parsedBriefing = JSON.parse(match[0]);
      }
    } catch (err: any) {
      console.warn('[Briefing API] Gemini error, using fallback briefing generator:', err.message);
    }

    // Fallback briefing if Gemini fails or rate limit
    if (!parsedBriefing) {
      parsedBriefing = {
        headline: `Plan de Bataille : Focus ${activeFocus} — Accélération des Closings`,
        activeFocus,
        urgent48hTasks: contacted.slice(0, 4).map((c: any) => ({
          prospectId: c._id,
          companyName: c.companyName,
          city: c.city || 'Algérie',
          phone: c.phone || 'Non renseigné',
          reason: 'Délai optimal de 48h atteint : relance nécessaire pour maintenir l\'intérêt.',
          recommendedAction: 'Appel de suivi ou message WhatsApp avec proposition de maquette.',
          urgency: 'haute',
        })),
        prototypeTasks: prototypes.slice(0, 4).map((p: any) => ({
          prospectId: p._id,
          companyName: p.companyName,
          city: p.city || 'Algérie',
          phone: p.phone || 'Non renseigné',
          closingTip: 'Vérifier la consultation de la maquette et proposer un call de 10 min pour validation.',
          suggestedOffer: 'Pack Signature Stepping Stones',
        })),
        newCallingTargets: newLeads.slice(0, 6).map((n: any) => ({
          prospectId: n._id,
          companyName: n.companyName,
          city: n.city || 'Algérie',
          phone: n.phone || 'Non renseigné',
          hookAngle: `Valoriser leur note Google Maps à ${n.city} et proposer une vitrine officielle pour sécuriser les réservations.`,
        })),
        strategicTip: 'La rapidité du follow-up fait la différence : un prospect contacté dans les 48h a 3x plus de chances de signer.',
        summaryStats: {
          totalPipeline: totalActive,
          urgentCount: contacted.length,
          prototypeCount: totalPrototypes,
          newLeadCount: newLeads.length,
        },
      };
    }

    // 5. Update cached briefing in database
    const now = new Date();
    await CopilotSettings.findByIdAndUpdate(
      'copilot_config',
      {
        cachedBriefing: parsedBriefing,
        lastBriefingAt: now,
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      cached: false,
      activeFocus,
      lastBriefingAt: now,
      briefing: parsedBriefing,
    });
  } catch (error: any) {
    console.error('[GET /api/copilot/briefing] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
