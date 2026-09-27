// ─────────────────────────────────────────────────────────────────
// STONELINK — POST /api/call/live-assist
// Copilote & Agent Vocal IA en direct via Google Gemini Flash
// Stepping Stones Agency — Mohamed Slimani & Abdelhadi Hammaz
// ─────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callGeminiResilient } from '@/lib/gemini';

export const runtime = 'nodejs';

const LiveAssistSchema = z.object({
  prospect: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    company: z.string(),
    sector: z.string().optional(),
    city: z.string().optional(),
    url: z.string().optional(),
    score: z.number().optional(),
    phone: z.string().optional(),
  }),
  transcript: z.array(
    z.object({
      sender: z.enum(['prospect', 'agent', 'system']),
      text: z.string(),
    })
  ).optional().default([]),
  lastUserSpeech: z.string().min(1),
  speakerMode: z.enum(['human', 'ai']).optional().default('human'),
  selectedOffer: z.string().optional().default('vitrine'),
  language: z.enum(['fr', 'ar', 'en']).optional().default('fr'),
});

function hasValidWebsite(url?: string): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return clean !== '' &&
         clean !== 'pas de site web' &&
         clean !== 'non renseigné' &&
         clean !== 'aucun' &&
         clean.length > 3;
}

export async function POST(req: NextRequest) {
  let capturedLastSpeech = '';

  try {
    const body = await req.json();
    capturedLastSpeech = typeof body?.lastUserSpeech === 'string' ? body.lastUserSpeech : '';

    const parsed = LiveAssistSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { prospect, transcript, lastUserSpeech, speakerMode, selectedOffer, language } = parsed.data;
    const hasSite = hasValidWebsite(prospect.url);
    const prenom = prospect.name?.trim() ? prospect.name.trim().split(' ')[0] : 'Responsable';

    const recentConversation = transcript
      .slice(-6)
      .map((t) => `${t.sender === 'prospect' ? 'PROSPECT' : 'AGENT'}: ${t.text}`)
      .join('\n');

    const prompt = `Tu es l'Agent Vocal d'élite et le Copilote Téléphonique de Stepping Stones Agency (agence de prestige co-fondée par Mohamed Slimani & Abdelhadi Hammaz).
Tu es en communication téléphonique directe avec un client potentiel en B2B.

CONTEXTE DU PROSPECT :
- Société : ${prospect.company}
- Interlocuteur : ${prenom}
- Secteur : ${prospect.sector || 'Professionnel'}
- Ville : ${prospect.city || 'Algérie'}
- Statut Web : ${hasSite ? `Site existant (${prospect.url}) avec audit score ${prospect.score || 45}/100` : 'AUCUN SITE WEB (Forte réputation Google Maps mais invisible sur le web)'}
- Offre défendue : ${selectedOffer}
- Langue demandée : ${language === 'ar' ? 'Darija algérienne professionnelle' : language === 'en' ? 'Anglais' : 'Français naturel et percutant'}

DERNIÈRE RÉPLIQUE DU PROSPECT :
"${lastUserSpeech}"

HISTORIQUE RÉCENT :
${recentConversation || '(Début de l\'appel)'}

RÈGLES D'OR ABSOLUES :
1. RÈGLE TARIFAIRE STRICTE : Ne donne JAMAIS de prix ou montant en chiffres par téléphone. Si le prospect demande "c'est combien ?", "combien ça coûte ?", "vos tarifs ?", réponds TOUJOURS que nous lui préparons une proposition chiffrée détaillée sur-mesure qu'on lui envoie directement en PDF sur WhatsApp immédiatement après l'échange.
2. CONCISION ORALE PARFAITE : La réponse parlée doit être courte, naturelle et punchy (1 à 2 phrases MAXIMUM, moins de 28 mots au total) pour garder un rythme téléphonique dynamique.
3. TON : Très poli, confiant, chaleureux et orienté action (proposer l'envoi de la maquette gratuite ou le devis WhatsApp).

Réponds UNIQUEMENT sous forme d'un objet JSON strict :
{
  "spokenResponse": "La réplique exacte à prononcer à haute voix (ultra-naturelle, courte, sans jargon inutile)",
  "quickPivot": "Le conseil tactique en 5 mots pour le commercial",
  "intent": "question_prix" | "objection_temps" | "objection_prestataire" | "objection_reseaux" | "accord_rdv" | "interet_maquette" | "refus" | "autre",
  "suggestedAction": "speak_and_listen" | "send_whatsapp_devis" | "book_meeting" | "handoff_human"
}`;

    const geminiRes = await callGeminiResilient({
      prompt,
      preferredModel: 'gemini-3.8-flash',
      purpose: 'calls',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.35,
      },
    });

    // Robust JSON sanitization: strip markdown code fences if model enclosed JSON
    const sanitizedJson = geminiRes.text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(sanitizedJson);

    return NextResponse.json({
      success: true,
      source: geminiRes.modelUsed,
      fallbackUsed: geminiRes.fallbackUsed,
      latencyMs: geminiRes.latencyMs,
      ...parsedData,
    });
  } catch (err: any) {
    console.error('[Live Assist Error]:', err);

    // Reliable fallback response using captured speech
    const last = capturedLastSpeech.toLowerCase().trim();
    const isPrice =
      last.includes('combien') ||
      last.includes('prix') ||
      last.includes('tarif') ||
      last.includes('cout') ||
      last.includes('coût') ||
      last.includes('budget') ||
      last.includes('cher');

    const isSocial =
      last.includes('facebook') ||
      last.includes('insta') ||
      last.includes('réseau') ||
      last.includes('reseau');

    const isNoTime =
      last.includes('temps') ||
      last.includes('occupé') ||
      last.includes('occupe');

    const isLater =
      last.includes('tard') ||
      last.includes('rappeler') ||
      last.includes('rappel');

    let spokenResponse = "Je comprends parfaitement. Le plus simple est que je vous partage notre maquette sans engagement pour que vous jugiez sur pièce.";
    let quickPivot = "Recentrer sur la maquette gratuite";
    let intent = "autre";
    let suggestedAction = "speak_and_listen";

    if (isPrice) {
      spokenResponse = "Nous préparons une proposition chiffrée détaillée sur-mesure que je vous envoie directement en PDF sur WhatsApp juste après notre échange. Comme ça vous avez le détail exact des prestations sans mauvaise surprise.";
      quickPivot = "Pivot Devis WhatsApp PDF";
      intent = "question_prix";
      suggestedAction = "send_whatsapp_devis";
    } else if (isSocial) {
      spokenResponse = "Les réseaux sont parfaits pour vos abonnés, mais sur Google, les clients qui ont un besoin urgent recherchent un site officiel. S'ils ne le trouvent pas, ils cliquent directement sur un concurrent.";
      quickPivot = "Différence Google vs Réseaux";
      intent = "objection_reseaux";
      suggestedAction = "speak_and_listen";
    } else if (isNoTime) {
      spokenResponse = "C'est précisément pour cela qu'on a tout automatisé : vous n'avez absolument rien à gérer techniquement. Le site fonctionne en totale autonomie.";
      quickPivot = "Zéro gestion technique";
      intent = "objection_temps";
      suggestedAction = "speak_and_listen";
    } else if (isLater) {
      spokenResponse = "Absolument. Je vous fais parvenir la maquette par message dès maintenant pour que vous puissiez y jeter un œil tranquillement ce soir.";
      quickPivot = "Transmission Maquette + Rappel";
      intent = "accord_rdv";
      suggestedAction = "speak_and_listen";
    }

    return NextResponse.json({
      success: true,
      source: 'offline_emergency_engine',
      spokenResponse,
      quickPivot,
      intent,
      suggestedAction,
    });
  }
}
