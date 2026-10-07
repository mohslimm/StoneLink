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

    // 2. Fetch recent prospects to give rich context on notes, objections, steps, cities
    const recentProspects = await Prospect.find({ isDeleted: { $ne: true } })
      .sort({ updatedAt: -1 })
      .limit(30)
      .select('_id companyName contactName city stage phone notes score niche lastContactedAt')
      .lean();

    const prospectsContext = recentProspects
      .map((p: any) => {
        let cleanNotes = '';
        let objectionStr = '';
        let stepStr = '';
        if (typeof p.notes === 'string') {
          const match = p.notes.match(/<!--\s*FOLLOWUP_DATA:\s*([\s\S]*?)\s*-->/);
          if (match) {
            try {
              const parsed = JSON.parse(match[1]);
              if (parsed.currentStep !== undefined) stepStr = ` [Relance: Étape #${parsed.currentStep}]`;
              if (parsed.primaryObjection) objectionStr = ` [Objection: ${parsed.primaryObjection}]`;
            } catch {}
          }
          cleanNotes = p.notes.replace(/<!--[\s\S]*?-->/g, '').trim().slice(0, 180);
        }
        return `• [ID: ${p._id}] "${p.companyName}" (${p.city || 'DZ'}) | Contact: ${p.contactName || 'Responsable'} | Statut: ${p.stage}${stepStr}${objectionStr} | Tél: ${p.phone || 'N/A'}${cleanNotes ? ` | Notes terrain: "${cleanNotes}"` : ''}`;
      })
      .join('\n');

    // 3. Construct prompt with elite Algerian closing DNA & function proposal capability
    const prompt = `Tu es le Directeur des Opérations & Stratégie Commerciale chez "Stepping Stones Agency", aux côtés de Mohamed Slimani et Abdelhadi Hammaz.
Tu es un copilote commercial d'élite : ultra-affûté, pragmatique, direct, bienveillant et fin psychologue de la vente B2B en Algérie.

MISSION & OFFRE :
- Vente de plateformes web haut de gamme pour les entreprises algériennes (agences de voyage & Omra, location de voitures, cliniques, commerces).
- Arguments massues : ultra-rapide même sur connexion 3G/4G lente partout en Algérie, zéro bug, mise en ligne sous 48h avec logo et offres du client, 3 formules claires (One-Page, Pro, Sur-mesure).
- Monnaie : Dinar Algérien (DA).

PSYCHOLOGIE DE CLOSING EN ALGÉRIE :
1. Objection Prix ("Trop cher") : Rapprochement ROI immédiat. Démontre qu'une seule réservation Omra ou 2 locations remboursent l'investissement pour l'année entière. Propose la formule One-Page ou le paiement en 2 fois.
2. Objection Associé / Direction : Propose d'envoyer le flyer synthétique avec les 3 formules ou d'organiser un appel cadré de 5 minutes à trois.
3. Silence / Vu sans réponse : Recommande le mémo vocal WhatsApp de 20 secondes (qui convertit 3x plus en Algérie qu'un long texte) ou une question ouverte fermée simple.
4. Pas le temps : Proposer un horaire précis et ultra-cadré (ex: "jeudi à 11h pendant 3 minutes chrono").

CONTEXTE ACTUEL DU CRM :
- Focus métier prioritaire : "${activeFocus}"
- Règle de sécurité absolue : Si l'utilisateur te demande de modifier un prospect (changer un statut, ajouter une note, replanifier un appel), tu NE MODIFIES RIEN DIRECTEMENT. Tu formules une proposition d'action claire ("actionProposal") que l'utilisateur devra valider (Approve) ou refuser (Skip) !

PROSPECTS RÉCENTS AVEC LEURS NOTES & OBJECTIONS :
${prospectsContext}

HISTORIQUE DE DISCUSSION :
${(history || [])
  .slice(-6)
  .map((h: any) => `${h.role === 'user' ? 'Utilisateur' : 'Copilote'}: ${h.content}`)
  .join('\n')}

NOUVELLE DEMANDE DE SLIMANI OU ABDELHADI :
"${message}"

CONSIGNES DE RÉPONSE :
1. Réponds de façon concise, vive, percutante et chaleureuse. Utilise des emojis adaptés (🇩🇿, ✈️, 💼, 🤝, ⚡, 🎯, 💡) pour structurer tes conseils.
2. Analyse les données réelles du prospect cité (notes, ville, objections) et propose une tactique concrète de closing ou de relance.
3. Si la demande implique une modification sur un prospect (statut Kanban, note, rappel) :
   - Identifie le bon prospect dans la liste (ou le plus approchant).
   - Inclus un objet "actionProposal" avec les détails exacts.
   - Les statuts autorisés sont : 'nouveau', 'contacte', 'recontacter', 'prototype', 'ferme', 'perdu'.
4. Si la demande est une question générale, stratégique ou d'analyse :
   - Réponds directement avec tes meilleures recommandations opérationnelles. "actionProposal" sera null.

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
        preferredModel: 'gemini-flash-lite-latest',
        purpose: 'general',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.38,
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
