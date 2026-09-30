import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CopilotSettings from '@/models/CopilotSettings';
import Prospect from '@/models/Prospect';
import { callGeminiResilient } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    // 1. Fetch settings and active focus
    const settings = await CopilotSettings.findById('copilot_config').lean();
    const activeFocus = settings?.activeFocus || 'Agence de voyage';

    // 2. Fetch recent prospects to give context on names, companies, cities
    const recentProspects = await Prospect.find({ isDeleted: { $ne: true } })
      .sort({ updatedAt: -1 })
      .limit(20)
      .select('_id companyName contactName city stage phone notes lastContactedAt')
      .lean();

    const prospectsContext = recentProspects
      .map(
        (p: any) =>
          `[ID: ${p._id}] "${p.companyName}" (${p.city || 'DZ'}) - Statut: ${p.stage} - Tél: ${p.phone || 'N/A'}`
      )
      .join('\n');

    // 3. Construct prompt with function/action proposal capability
    const prompt = `Tu es le Directeur des Opérations & Stratégie IA chez "Stepping Stones Agency" (fondée par Mohamed Slimani & Abdelhadi Hammaz).
Tu es un copilote commercial d'élite, pragmatique, direct, amical et axé sur les résultats (ventes de sites web et solutions digitales en Algérie).

CONTEXTE ACTUEL :
- Focus métier prioritaire : "${activeFocus}"
- Monnaie : Dinar Algérien (DA)
- Règle de sécurité absolue : Si l'utilisateur te demande de modifier un prospect (changer un statut, ajouter une note, replanifier un appel), tu NE MODIFIES RIEN DIRECTEMENT. Tu formules une proposition d'action claire ("actionProposal") que l'utilisateur devra valider (Approve) ou refuser (Skip) !

PROSPECTS RÉCENTS DU CRM :
${prospectsContext}

HISTORIQUE DE DISCUSSION :
${(history || [])
  .slice(-6)
  .map((h: any) => `${h.role === 'user' ? 'Utilisateur' : 'Copilote'}: ${h.content}`)
  .join('\n')}

NOUVELLE DEMANDE DE L'UTILISATEUR :
"${message}"

CONSIGNES :
1. Réponds de façon concise, naturelle, stratégique et encourageante (en français ou avec quelques touches de darija si opportun).
2. Si la demande implique une modification sur un prospect (statut Kanban, note, rappel) :
   - Identifie le bon prospect dans la liste (ou le plus approchant).
   - Inclus un objet "actionProposal" avec les détails exacts.
   - Les statuts autorisés sont : 'nouveau', 'contacte', 'recontacter', 'prototype', 'ferme', 'perdu'.
3. Si la demande est une question générale, stratégique ou d'analyse :
   - Réponds directement et donne des conseils concrets. "actionProposal" sera null.

RÉPONDS STRICTEMENT AU FORMAT JSON SUIVANT :
{
  "reply": "Ton message de réponse textuel",
  "actionProposal": null | {
    "id": "act_${Date.now()}",
    "prospectId": "ID du prospect ciblé",
    "companyName": "Nom de l'entreprise",
    "actionType": "update_stage" | "add_note" | "set_reminder",
    "targetStage": "nouveau" | "contacte" | "recontacter" | "prototype" | "ferme" | "perdu",
    "note": "Texte de la note à ajouter ou null",
    "summary": "Résumé en 1 ligne de ce qui sera appliqué après validation (ex: Déplacer BEJAIA TOURS vers 'À recontacter' avec note de suivi)"
  }
}`;

    let reply = "Je suis à votre disposition. Que souhaitez-vous analyser ou planifier ?";
    let actionProposal: any = null;

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
        const parsed = JSON.parse(match[0]);
        reply = parsed.reply || reply;
        actionProposal = parsed.actionProposal || null;
      }
    } catch (err: any) {
      console.error('[Copilot Chat Error]', err.message);
      reply = "Désolé, j'ai rencontré un court temps d'arrêt. Comment puis-je vous aider sur vos prospects ?";
    }

    return NextResponse.json({
      success: true,
      reply,
      actionProposal,
      activeFocus,
    });
  } catch (error: any) {
    console.error('[POST /api/copilot/chat] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
