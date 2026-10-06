// -----------------------------------------------------------------
// STONELINK - POST /api/ai/whatsapp
// Generateur de Messages WhatsApp Commerciaux Ultra-Personnalises
// STRUCTURE OBLIGATOIRE v2 - Pilotee par Google Gemini Flash
// -----------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callGeminiResilient } from '@/lib/gemini';

export const runtime = 'nodejs';

// SCHEMA VALIDATION

const WhatsAppAiSchema = z.object({
  prospect: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    company: z.string(),
    sector: z.string().optional(),
    city: z.string().optional(),
    url: z.string().optional(),
    score: z.number().optional(),
    phone: z.string().optional(),
    notes: z.string().optional(),
  }),
  tone: z.enum(['ultra_persuasive', 'short_punchy', 'relational', 'darija_pro', 'custom']).optional().default('ultra_persuasive'),
  customInstructions: z.string().optional(),
  targetSector: z.string().optional(),
  prototypeName: z.string().optional(),
  prototypeUrl: z.string().optional(),
  flyerUrl: z.string().optional(),
  prototypeDescription: z.string().optional(),
  formule1: z.string().optional(),
  formule2: z.string().optional(),
  formule3: z.string().optional(),
  nicheEmoji: z.string().optional(),
});

// EMOJI PALETTES PAR NICHE

const NICHE_EMOJI_MAP: Record<string, { main: string; support: string[] }> = {
  voyage:     { main: 'ok_travel',  support: ['ok_world', 'ok_map', 'ok_beach', 'ok_mosque', 'ok_dz'] },
  omra:       { main: 'ok_mosque',  support: ['ok_travel', 'ok_moon', 'ok_hands', 'ok_sa', 'ok_dz'] },
  voiture:    { main: 'ok_car',     support: ['ok_key', 'ok_wheel', 'ok_pin', 'ok_bolt', 'ok_dz'] },
  location:   { main: 'ok_car',     support: ['ok_key', 'ok_wheel', 'ok_pin', 'ok_bolt', 'ok_dz'] },
  dentaire:   { main: 'ok_tooth',   support: ['ok_smile', 'ok_sparkle', 'ok_steth', 'ok_pill', 'ok_dz'] },
  clinique:   { main: 'ok_hosp',    support: ['ok_steth', 'ok_pill', 'ok_sparkle', 'ok_heart', 'ok_dz'] },
  sante:      { main: 'ok_hosp',    support: ['ok_steth', 'ok_pill', 'ok_sparkle', 'ok_heart', 'ok_dz'] },
  immobilier: { main: 'ok_build',   support: ['ok_pin', 'ok_house', 'ok_key2', 'ok_money', 'ok_dz'] },
  restaurant: { main: 'ok_plate',   support: ['ok_chef', 'ok_dish', 'ok_star', 'ok_sparkle', 'ok_dz'] },
  cafe:       { main: 'ok_coffee',  support: ['ok_cake', 'ok_sparkle', 'ok_star', 'ok_music', 'ok_dz'] },
  ecommerce:  { main: 'ok_cart',    support: ['ok_box', 'ok_bolt', 'ok_card', 'ok_rocket', 'ok_dz'] },
  boutique:   { main: 'ok_bag',     support: ['ok_sparkle', 'ok_gem', 'ok_star', 'ok_gift', 'ok_dz'] },
  default:    { main: 'ok_rocket',  support: ['ok_check', 'ok_star', 'ok_bulb', 'ok_hand', 'ok_dz'] },
};

function detectNicheKey(sector?: string, company?: string): string {
  const text = `${sector || ''} ${company || ''}`.toLowerCase();
  const keys = Object.keys(NICHE_EMOJI_MAP).filter(k => k !== 'default');
  return keys.find(k => text.includes(k)) || 'default';
}

// FORMULES PAR DEFAUT PAR NICHE

function getDefaultFormules(sector: string, emoji: string): [string, string, string] {
  const s = sector.toLowerCase();
  if (s.includes('voyage') || s.includes('omra') || s.includes('travel')) {
    return [
      `${emoji} One-Page Omra & Voyages : vitrine legere, ideale pour demarrer`,
      `${emoji} Agence Pro : site complet + tableau de bord de gestion smartphone`,
      `${emoji} Sur-mesure : plateforme complete avec systeme de reservation en ligne`,
    ];
  }
  if (s.includes('voiture') || s.includes('auto') || s.includes('locat')) {
    return [
      `${emoji} Starter : catalogue flotte + formulaire WhatsApp`,
      `${emoji} Pro : reservation en ligne + gestion de disponibilite`,
      `${emoji} Premium : systeme complet + paiement & suivi client integre`,
    ];
  }
  if (s.includes('dent') || s.includes('clinic') || s.includes('sant') || s.includes('medic')) {
    return [
      `${emoji} Vitrine Medicale : presentation du cabinet + prise de RDV`,
      `${emoji} Clinique Pro : specialites + equipe + temoignages patients`,
      `${emoji} Premium Sante : portail patient complet avec rappels automatiques`,
    ];
  }
  if (s.includes('immo') || s.includes('foncier')) {
    return [
      `${emoji} Portail Vitrine : catalogue biens + formulaire de visite`,
      `${emoji} Agence Pro : recherche avancee + geolocalisation par wilaya`,
      `${emoji} Promoteur Premium : catalogue projets neufs + simulation financement`,
    ];
  }
  if (s.includes('resto') || s.includes('restaurant') || s.includes('cafe')) {
    return [
      `${emoji} Menu Digital : carte interactive + reservation de table`,
      `${emoji} Restaurant Pro : galerie chef + avis clients + commande en ligne`,
      `${emoji} Experience Premium : site bilingue + evenements + livraison integree`,
    ];
  }
  if (s.includes('commerce') || s.includes('boutique') || s.includes('shop')) {
    return [
      `${emoji} Boutique Starter : catalogue produits + commande WhatsApp`,
      `${emoji} E-Shop Pro : paiement COD + gestion par wilaya`,
      `${emoji} Marketplace Premium : stock automatise + suivi livraison`,
    ];
  }
  return [
    `${emoji} Starter : vitrine professionnelle personnalisee`,
    `${emoji} Pro : site complet + fonctionnalites avancees`,
    `${emoji} Premium : solution sur-mesure integrale`,
  ];
}

// AVANTAGE CONCRET PAR NICHE

function getNicheAdvantage(sector: string): string {
  const s = sector.toLowerCase();
  if (s.includes('voyage') || s.includes('omra')) {
    return `Un client qui abandonne parce que votre site rame, c'est une reservation perdue. Notre plateforme, concue pour rester rapide meme avec une connexion lente, elimine ce probleme : ou qu'il soit en Algerie, votre client peut reserver.`;
  }
  if (s.includes('voiture') || s.includes('auto') || s.includes('locat')) {
    return `Un client qui ne trouve pas le vehicule disponible en 2 clics part chez le concurrent. Avec notre systeme, il reserve instantanement et vous recevez la notification directement sur WhatsApp.`;
  }
  if (s.includes('dent') || s.includes('clinic') || s.includes('sant')) {
    return `Un patient qui ne trouve pas vos specialites ou horaires en ligne consulte ailleurs. Notre vitrine medicale rassure des le premier regard et permet la prise de RDV en un clic.`;
  }
  if (s.includes('immo') || s.includes('foncier')) {
    return `Un acquereur qui ne trouve pas votre bien en quelques secondes scrolle plus loin. Notre portail presente chaque propriete avec photos HD, localisation et formulaire de visite instantane.`;
  }
  if (s.includes('resto') || s.includes('restaurant')) {
    return `Un client affame qui ne voit pas votre menu en 3 secondes commande ailleurs. Notre menu digital s'affiche instantanement avec vos photos appetissantes et la reservation en 2 clics.`;
  }
  if (s.includes('commerce') || s.includes('boutique') || s.includes('shop')) {
    return `Un client qui attend trop longtemps le chargement de votre boutique abandonne sa commande. Notre plateforme s'affiche en moins de 2 secondes meme sur mobile 3G, et la commande se valide via WhatsApp.`;
  }
  return `Un client potentiel qui ne trouve pas votre vitrine professionnelle en ligne part directement chez un concurrent. Notre plateforme, concue pour rester rapide meme avec une connexion limitee, transforme chaque visite en contact qualifie.`;
}

// FALLBACK LOCAL INTELLIGENT

function generateLocalSmartFallback(
  prospect: { company: string; name?: string; sector?: string; city?: string },
  tone: string,
  protoUrl: string,
  flyerUrl: string,
  formule1: string,
  formule2: string,
  formule3: string,
  nicheMainEmoji: string
): string {
  const sector = prospect.sector || 'professionnels';
  const advantage = getNicheAdvantage(sector);

  if (tone === 'darija_pro') {
    return [
      `Salam alaykoum${prospect.name ? ' ' + prospect.name : ''},`,
      ``,
      `Ravi de notre echange telephonique concernant ${prospect.company} !`,
      ``,
      `Haoulik el prototype li khedmnahou khesissi l${sector} :`,
      `\uD83D\uDC49 ${protoUrl}`,
      ``,
      `El haja el mliha fihe : yeftah b soraa hatta bel connexion edh-dhaifa. Zbounak yqder ychof ourodkoum w yahjouz mhma kanet el wilaya.`,
      ``,
      `F 48h ndiru kol chi b souretkoum w logo w numero.`,
      ``,
      `Hadhi 3 formules hasb ihtiyajatkoum :`,
      formule1,
      formule2,
      formule3,
      ``,
      `Lqaou kol et-tafasil w el athman ha :`,
      `\uD83D\uDC49 ${flyerUrl}`,
      ``,
      `Choufouha w qoulouli wach raykoum ${nicheMainEmoji}`,
    ].join('\n');
  }

  return [
    `Salam alaykoum,`,
    ``,
    `Ravi de notre echange telephonique ! Comme promis, voici le prototype de plateforme concu specialement pour les ${sector} en Algerie :`,
    `\uD83D\uDC49 ${protoUrl}`,
    ``,
    advantage,
    ``,
    `Et en seulement 48 h, toute la plateforme passe a vos couleurs : votre logo, vos offres, le numero officiel de votre etablissement.`,
    ``,
    `Nos 3 formules selon votre profil :`,
    formule1,
    formule2,
    formule3,
    ``,
    `Tout est detaille ici, avec les tarifs de lancement reserves a nos premiers partenaires :`,
    `\uD83D\uDC49 ${flyerUrl}`,
    ``,
    `Jetez-y un oeil et dites-moi ce que vous en pensez ${nicheMainEmoji}`,
  ].join('\n');
}

// HANDLER PRINCIPAL

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = WhatsAppAiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parametres invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      prospect,
      tone,
      customInstructions,
      targetSector,
      prototypeName,
      prototypeUrl,
      flyerUrl,
      prototypeDescription,
      formule1,
      formule2,
      formule3,
      nicheEmoji,
    } = parsed.data;

    const sector = targetSector || prospect.sector || 'Professionnel';
    const mainProtoUrl = prototypeUrl || 'https://parfait-voyage.vercel.app/';
    const mainFlyerUrl = flyerUrl || 'https://flyer-parfait-voyage.vercel.app/';

    // Emoji niche - on utilise l'emoji fourni directement ou on detecte par secteur
    const EMOJI_BY_NICHE: Record<string, string> = {
      voyage: '\u2708\uFE0F', omra: '\uD83D\uDD4C', voiture: '\uD83D\uDE97',
      location: '\uD83D\uDE97', dentaire: '\uD83E\uDDB7', clinique: '\uD83C\uDFE5',
      sante: '\uD83C\uDFE5', immobilier: '\uD83C\uDFE2', restaurant: '\uD83C\uDF7D\uFE0F',
      cafe: '\u2615', ecommerce: '\uD83D\uDED2', boutique: '\uD83D\uDECD\uFE0F',
      default: '\uD83D\uDE80',
    };
    const SUPPORT_BY_NICHE: Record<string, string[]> = {
      voyage: ['\uD83C\uDF0D', '\uD83D\uDDFA\uFE0F', '\uD83C\uDFD6\uFE0F', '\uD83D\uDD4C', '\uD83C\uDDE9\uD83C\uDDFF'],
      omra: ['\u2708\uFE0F', '\uD83C\uDF19', '\uD83E\uDD32', '\uD83C\uDDF8\uD83C\uDDE6', '\uD83C\uDDE9\uD83C\uDDFF'],
      voiture: ['\uD83D\uDD11', '\uD83D\uDEDE', '\uD83D\uDCCD', '\u26A1', '\uD83C\uDDE9\uD83C\uDDFF'],
      location: ['\uD83D\uDD11', '\uD83D\uDEDE', '\uD83D\uDCCD', '\u26A1', '\uD83C\uDDE9\uD83C\uDDFF'],
      dentaire: ['\uD83D\uDE01', '\u2728', '\uD83E\uDE7A', '\uD83D\uDC8A', '\uD83C\uDDE9\uD83C\uDDFF'],
      clinique: ['\uD83E\uDE7A', '\uD83D\uDC8A', '\u2728', '\u2764\uFE0F', '\uD83C\uDDE9\uD83C\uDDFF'],
      sante: ['\uD83E\uDE7A', '\uD83D\uDC8A', '\u2728', '\u2764\uFE0F', '\uD83C\uDDE9\uD83C\uDDFF'],
      immobilier: ['\uD83D\uDCCD', '\uD83C\uDFE0', '\uD83D\uDDDD\uFE0F', '\uD83D\uDCB0', '\uD83C\uDDE9\uD83C\uDDFF'],
      restaurant: ['\uD83D\uDC68\u200D\uD83C\uDF73', '\uD83E\uDD58', '\u2B50', '\u2728', '\uD83C\uDDE9\uD83C\uDDFF'],
      cafe: ['\uD83C\uDF70', '\u2728', '\u2B50', '\uD83C\uDFB6', '\uD83C\uDDE9\uD83C\uDDFF'],
      ecommerce: ['\uD83D\uDCE6', '\u26A1', '\uD83D\uDCB3', '\uD83D\uDE80', '\uD83C\uDDE9\uD83C\uDDFF'],
      boutique: ['\u2728', '\uD83D\uDC8E', '\u2B50', '\uD83C\uDF81', '\uD83C\uDDE9\uD83C\uDDFF'],
      default: ['\u2705', '\u2B50', '\uD83D\uDCA1', '\uD83E\uDD1D', '\uD83C\uDDE9\uD83C\uDDFF'],
    };

    const nicheKey = detectNicheKey(sector, prospect.company);
    const mainEmoji = nicheEmoji || EMOJI_BY_NICHE[nicheKey] || EMOJI_BY_NICHE['default'];
    const supportEmojis = SUPPORT_BY_NICHE[nicheKey] || SUPPORT_BY_NICHE['default'];

    const [f1Default, f2Default, f3Default] = getDefaultFormules(sector, mainEmoji);
    const f1 = formule1 || f1Default;
    const f2 = formule2 || f2Default;
    const f3 = formule3 || f3Default;
    const nicheAdvantage = getNicheAdvantage(sector);

    const toneInstructions: Record<string, string> = {
      ultra_persuasive: 'Ton argumente, structure, percutant. Chaque phrase doit convaincre. ROI concret. Tournures directes et valorisantes.',
      short_punchy: 'Ultra court : 80-100 mots max. Pas de superflu. Punch des la premiere ligne.',
      relational: 'Ton chaleureux, sincere, humain. Valorise la relation avant le business.',
      darija_pro: 'Redige INTEGRALEMENT en darija algerienne professionnelle (alphabet latin). AUCUN mot en arabe classique. Naturel, comme entre collegues qui se respectent.',
      custom: customInstructions || 'Ton professionnel et persuasif.',
    };
    const activeToneInstruction = toneInstructions[tone || 'ultra_persuasive'];

    const prompt = `Tu es le Copywriter d'elite de Stepping Stones Agency. Tu rediges des messages de prospection WhatsApp/SMS en FRANCAIS pour Mohamed Slimani, qui propose des plateformes web a des professionnels algeriens apres un echange telephonique.

NICHE : ${sector}
LIEN PROTOTYPE : ${mainProtoUrl}
LIEN FLYER / TARIFS : ${mainFlyerUrl}
LES 3 FORMULES :
${f1}
${f2}
${f3}

CONTEXTE PROSPECT :
- Entreprise : ${prospect.company}
- Contact : ${prospect.name || 'Responsable'}
- Ville : ${prospect.city || 'Algerie'}
- Prototype : ${prototypeName || sector} — ${prototypeDescription || 'Vitrine digitale haute performance'}
- Notes : ${prospect.notes || 'Aucune'}

TONALITE : ${activeToneInstruction}

STRUCTURE OBLIGATOIRE (dans cet ordre STRICT) :
1. "Salam alaykoum," + "Ravi de notre echange telephonique !"
2. Lien prototype precede de ${'\uD83D\uDC49'}, sur sa propre ligne
3. Avantage concret (inspire-toi de : "${nicheAdvantage}") — 2-3 phrases max
4. Promesse 48 h : logo, offres, numero officiel
5. Les 3 formules exactement telles que donnees ci-dessus, une par ligne
6. Lien flyer precede de ${'\uD83D\uDC49'} + "tarifs de lancement reserves a nos premiers partenaires"
7. CTA court : 1 phrase + 1 emoji final ${mainEmoji}

REGLES D'EMOJIS STRICTES :
- Utilise UNIQUEMENT : ${mainEmoji} ${supportEmojis.join(' ')} ${'\uD83D\uDC49'}
- Maximum 6 emojis au total dans TOUT le message
- JAMAIS d'emoji au milieu d'une phrase
- ${'\uD83D\uDC49'} est RESERVE aux deux liens uniquement
- Les formules utilisent UNIQUEMENT ${mainEmoji} comme puce

REGLES DE REDACTION :
- 120 a 160 mots maximum (sauf darija)
- PAS de promesses absolues : dis "concu pour rester rapide", "meme avec une connexion lente"
- Sauts de ligne clairs entre chaque bloc
- AUCUN markdown, AUCUNE balise — texte brut WhatsApp UNIQUEMENT
- Ne mentionne jamais "Stepping Stones Agency" ni "Mohamed Slimani"`;

    try {
      const geminiRes = await callGeminiResilient({
        prompt,
        preferredModel: 'gemini-3.8-flash',
        purpose: 'general',
        generationConfig: {
          temperature: 0.42,
          maxOutputTokens: 600,
        },
      });

      const cleanMessage = geminiRes.text
        .replace(/```(?:markdown|text|json)?/gi, '')
        .replace(/```/g, '')
        .trim();

      return NextResponse.json({
        success: true,
        message: cleanMessage,
        source: geminiRes.modelUsed,
        fallbackUsed: geminiRes.fallbackUsed,
        latencyMs: geminiRes.latencyMs,
      });
    } catch (aiError) {
      console.warn('[WhatsApp AI Engine] AI Model fallback triggered:', aiError);
      const fallbackMessage = generateLocalSmartFallback(
        prospect,
        tone || 'ultra_persuasive',
        mainProtoUrl,
        mainFlyerUrl,
        f1, f2, f3,
        mainEmoji
      );
      return NextResponse.json({
        success: true,
        message: fallbackMessage,
        source: 'smart_fallback_engine',
        fallbackUsed: true,
      });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[WhatsApp AI Route Error]:', msg);
    return NextResponse.json(
      { error: 'Erreur interne lors de la generation', details: msg },
      { status: 500 }
    );
  }
}
