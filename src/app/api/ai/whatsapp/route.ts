// -----------------------------------------------------------------
// STONELINK - POST /api/ai/whatsapp
// Generateur de Messages WhatsApp Commerciaux Ultra-Personnalises
// Pilote par Google Gemini Flash avec Copywriting B2B Algerien & Emojis
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
  step: z.number().optional(), // 0 = envoi, 1 = relance 1, 2 = relance 2, 3 = closing
  reaction: z.string().optional(), // 'price', 'partner', 'no_reply', 'no_time', 'custom_request', 'interested', 'refusal', 'other'
  verbatim: z.string().optional(), // Ce que le prospect a dit
  language: z.enum(['fr', 'darija']).optional(),
  delayDays: z.number().optional(), // Nombre de jours écoulés depuis la dernière action ou le prototype
});

// EMOJI PALETTES PAR NICHE (Vrais emojis Unicode)

const NICHE_EMOJI_MAP: Record<string, { main: string; support: string[] }> = {
  voyage:     { main: '✈️',  support: ['🌍', '🇩🇿', '📍', '🤝', '✨', '🕌', '🏖️', '⚡'] },
  omra:       { main: '🕌',  support: ['🕋', '✈️', '🤲', '🇩🇿', '✨', '📍', '🤝', '⭐'] },
  voiture:    { main: '🚗',  support: ['🔑', '⚙️', '🇩🇿', '📍', '⚡', '📲', '🤝', '✨'] },
  location:   { main: '🚗',  support: ['🔑', '⚙️', '🇩🇿', '📍', '⚡', '📲', '🤝', '✨'] },
  dentaire:   { main: '🦷',  support: ['😁', '✨', '🩺', '🇩🇿', '📍', '🤝', '👨‍⚕️', '💊'] },
  clinique:   { main: '🏥',  support: ['🩺', '✨', '❤️', '🇩🇿', '📍', '🤝', '👨‍⚕️', '🏥'] },
  sante:      { main: '🏥',  support: ['🩺', '✨', '❤️', '🇩🇿', '📍', '🤝', '👨‍⚕️', '💊'] },
  immobilier: { main: '🏢',  support: ['📍', '🏠', '🔑', '💰', '🇩🇿', '✨', '🤝', '🗝️'] },
  restaurant: { main: '🍽️',  support: ['👨‍🍳', '🍲', '⭐', '✨', '🇩🇿', '📍', '🔥', '🍕'] },
  cafe:       { main: '☕',  support: ['🍰', '✨', '⭐', '🇩🇿', '📍', '🤝', '🥐'] },
  ecommerce:  { main: '🛒',  support: ['📦', '⚡', '💳', '🚀', '🇩🇿', '📲', '🤝', '🛍️'] },
  boutique:   { main: '🛍️',  support: ['✨', '💎', '⭐', '🎁', '🇩🇿', '📍', '🤝', '👗'] },
  default:    { main: '🚀',  support: ['✅', '⭐', '💡', '🤝', '🇩🇿', '📍', '✨', '⚡'] },
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
      `${emoji} One-Page Omra & Voyages : vitrine ultra-rapide pour convertir vos départs`,
      `${emoji} Agence Pro : site complet catalogue + gestion smartphone directe`,
      `${emoji} Sur-mesure : plateforme haut de gamme avec réservation & filtres avancés`,
    ];
  }
  if (s.includes('voiture') || s.includes('auto') || s.includes('locat')) {
    return [
      `${emoji} Starter Flotte : catalogue véhicules + réservation WhatsApp en 2 clics`,
      `${emoji} Pro Agence : gestion de disponibilité en temps réel + contrat digital`,
      `${emoji} Premium : plateforme complète avec paiement & suivi client intégré`,
    ];
  }
  if (s.includes('dent') || s.includes('clinic') || s.includes('sant') || s.includes('medic')) {
    return [
      `${emoji} Vitrine Médicale : présentation du cabinet + prise de RDV directe`,
      `${emoji} Clinique Pro : spécialités + équipe praticiens + avis patients certifiés`,
      `${emoji} Portail Santé : espace patient complet avec rappels automatiques`,
    ];
  }
  if (s.includes('immo') || s.includes('foncier')) {
    return [
      `${emoji} Portail Vitrine : catalogue biens + géolocalisation & demande de visite`,
      `${emoji} Agence Pro : recherche par wilaya + fiches détaillées & estimation`,
      `${emoji} Promoteur : projets neufs + visite virtuelle & simulation financement`,
    ];
  }
  if (s.includes('resto') || s.includes('restaurant') || s.includes('cafe')) {
    return [
      `${emoji} Menu Digital : carte interactive QR Code + réservation de table`,
      `${emoji} Restaurant Pro : galerie chef + avis clients + commande en direct`,
      `${emoji} Expérience Premium : site bilingue + événements & click & collect`,
    ];
  }
  if (s.includes('commerce') || s.includes('boutique') || s.includes('shop')) {
    return [
      `${emoji} Boutique Starter : catalogue produits + commande rapide WhatsApp`,
      `${emoji} E-Shop Pro : paiement à la livraison (COD) par wilaya + gestion stock`,
      `${emoji} Marketplace : plateforme automatisée avec suivi livraison`,
    ];
  }
  return [
    `${emoji} Starter : vitrine professionnelle personnalisée haute performance`,
    `${emoji} Pro : site complet interactif avec outils de conversion`,
    `${emoji} Premium : solution digitale intégrale sur-mesure`,
  ];
}

// AVANTAGE CONCRET PAR NICHE

function getNicheAdvantage(sector: string, city?: string): string {
  const loc = city ? ` à ${city} ou partout en Algérie` : ` partout en Algérie`;
  const s = sector.toLowerCase();
  if (s.includes('voyage') || s.includes('omra') || s.includes('travel')) {
    return `Un client qui abandonne parce que votre page rame, c'est une réservation Omra ou séjour perdue. Notre plateforme est conçue pour s'ouvrir en moins de 2 secondes même avec une connexion 3G/4G lente : vos clients${loc} réservent instantanément sans bug.`;
  }
  if (s.includes('voiture') || s.includes('auto') || s.includes('locat')) {
    return `Un client qui cherche une voiture et ne trouve pas votre catalogue part chez un concurrent. Avec notre système, il choisit son véhicule en 2 clics et vous recevez sa demande directement sur WhatsApp.`;
  }
  if (s.includes('dent') || s.includes('clinic') || s.includes('sant')) {
    return `Un patient rassuré dès la première seconde prend immédiatement rendez-vous. Notre vitrine valorise vos équipements et vos soins avec une clarté irréprochable.`;
  }
  return `Vos prospects${loc} découvrent vos services instantanément sur smartphone avec une vitesse maximale et un design qui inspire une confiance totale dès la première seconde.`;
}

// FALLBACK LOCAL INTELLIGENT AVEC EMOJIS ET PERSONNALISATION

function generateLocalSmartFallback(params: {
  prospect: { company: string; name?: string; sector?: string; city?: string };
  tone: string;
  step?: number;
  reaction?: string;
  protoUrl: string;
  flyerUrl: string;
  formule1: string;
  formule2: string;
  formule3: string;
  mainEmoji: string;
  delayDays?: number;
}): string {
  const { prospect, tone, step, reaction, protoUrl, flyerUrl, formule1, formule2, formule3, mainEmoji, delayDays } = params;
  const sector = prospect.sector || 'Professionnels';
  const cityStr = prospect.city ? ` à ${prospect.city}` : '';
  const contactName = prospect.name ? ` ${prospect.name}` : '';
  const delay = typeof delayDays === 'number' ? delayDays : 0;
  const isDarija = tone === 'darija_pro';

  // 14+ days Breakup hook fallback
  if (delay >= 14 && !reaction) {
    if (isDarija) {
      return `Salam alaykoum${contactName} ! 🇩🇿✨\n\nخويا${contactName}، راني شفت بلي جازو سيمانتين ملي بعثنا لو سيت بروتوتيب لوكالة ${prospect.company}${cityStr} :\n👉 ${protoUrl}\n\nعلابالي بلي الخدمة تدي كامل وقتكم والواحد ما يقعدش.\n\nحبيت برك نسقسيك قبل ما نقفلو الدوسي ونشوفو مع وكالة ثانية في جهتكم : قولي بصراحة، اسكو المشروع مازالو يهمكم هاد الفترة ولا نلغيوه ويبقى الاتصال بيناتنا للمستقبل ؟ 🤝🇩🇿`;
    }
    return `Salam alaykoum${contactName} ! 🇩🇿✨\n\nÇa fait maintenant plus de 2 semaines que je vous ai transmis la démo de la plateforme pour ${prospect.company}${cityStr} :\n👉 ${protoUrl}\n\nJ'imagine que le quotidien a pris le dessus ou que le timing n'est pas idéal en ce moment.\n\nAvant que je n'archive votre dossier pour attribuer la priorité à une autre agence sur votre secteur, dites-moi simplement : est-ce que le projet est toujours d'actualité pour vous, ou préfère-t-on mettre cela de côté ? 🤝🌍`;
  }

  // 7-13 days 1-week mark fallback
  if (delay >= 7 && !reaction) {
    if (isDarija) {
      return `Salam alaykoum${contactName} ! 🇩🇿💼\n\nجاز سمانة ملي تكلمنا وبعثنالكم لو سيت بروتوتيب لوكالة ${prospect.company}${cityStr} :\n👉 ${protoUrl}\n\nكيما علابالك الموسم راهو قريب ورانا نحددو فالوكالات الشريكة في منطقتكم بالعرض الترويجي قبل ما نغلقو التسجيلات :\n📑 👉 ${flyerUrl}\n\nحبيت برك نعرف اسكو راكم حابين تطلقو لو سيت تاعكم هاد الفترة قبل الزحام ولا مازال ؟ 🤝🇩🇿`;
    }
    return `Salam alaykoum${contactName} ! 🇩🇿💼\n\nCela fait une semaine que nous vous avons partagé le prototype conçu pour ${prospect.company}${cityStr} :\n👉 ${protoUrl}\n\nComme la saison approche et que nous finalisons actuellement les agences partenaires sur votre zone avec nos formules de lancement :\n📑 👉 ${flyerUrl}\n\nJe voulais faire le point avec vous : est-ce toujours une priorité pour votre agence d'avoir votre site en ligne avant le rush ? 🤝✨`;
  }

  // 3-6 days Mid-week busy check fallback
  if (delay >= 3 && !reaction) {
    if (isDarija) {
      return `Salam alaykoum${contactName} ! 🇩🇿✈️\n\nعلابالي بلي السيمانة هادي معمرة خدمة عندكم في ${prospect.company}${cityStr}.\n\nباش نسهلوها عليكم، هاوليك لو سيت بروتوتيب لي وجدناه باش تشوفوه في 30 ثانية برك على التيليفون :\n👉 ${protoUrl}\n\nاسكو نقدر نعيطلك غدوة 3 دقائق نوضحلك كيفاش نطلقوه باسمكم في 48 ساعة ؟ 🤝🇩🇿`;
    }
    return `Salam alaykoum${contactName} ! 🇩🇿✈️\n\nJe sais que vos journées sont bien chargées en agence cette semaine pour ${prospect.company}${cityStr}.\n\nPour vous faire gagner du temps, voici le lien direct du prototype rapide pour tester en 30 secondes sur smartphone :\n👉 ${protoUrl}\n\nSeriez-vous partant pour un court échange de 3 minutes demain afin de valider si cela correspond à vos objectifs ? 🤝📞`;
  }

  // Step 1: Relance #1
  if (step === 1) {
    if (isDarija) {
      return `Salam alaykoum${contactName} ! 🇩🇿✈️\n\nان شاء الله راك مليح خويا. راني نتواصل معاك بخصوص لو سيت بروتوتيب لي وجدناه لوكالة ${prospect.company}${cityStr} :\n👉 ${protoUrl}\n\nاسكو شفتو ولا مازال ما قعدتش ؟ واش رايك فيه مقارنة مع واش يحتاجو زبائنك ؟ 🤝\n\nرانا هنا باش نساعدوكم ونحطوه باسمكم في 48 ساعة ان شاء الله ✨`;
    }
    return `Salam alaykoum${contactName} ! 🇩🇿${mainEmoji}\n\nJ'espère que vous allez très bien. Je reviens vers vous suite à l'envoi de la démo de la plateforme conçue pour ${prospect.company}${cityStr} :\n👉 ${protoUrl}\n\nAvez-vous eu l'occasion d'y jeter un œil sur smartphone ? Qu'en avez-vous pensé pour vos clients ? 🤝✨`;
  }

  // Step 2: Relance #2 avec objection
  if (step === 2) {
    if (reaction === 'price') {
      return `Salam alaykoum${contactName} ! 🇩🇿💼\n\nConcernant votre réflexion pour ${prospect.company}, sachez qu'une seule réservation supplémentaire grâce à la plateforme rembourse déjà la totalité du site pour l'année.\n\nNous avons également la formule One-Page très accessible (ou un règlement échelonné) :\n👉 ${flyerUrl}\n\nSeriez-vous partant pour un court échange de 3 minutes demain afin de trouver la solution adaptée à votre budget ? 🤝✨`;
    }
    if (reaction === 'partner') {
      return `Salam alaykoum${contactName} ! 🇩🇿🤝\n\nPour faciliter la décision avec votre associé pour ${prospect.company}, voici le flyer récapitulatif avec nos 3 formules claires à lui transmettre directement :\n👉 ${flyerUrl}\n\nLien de la démo en direct :\n👉 ${protoUrl}\n\nN'hésitez pas si vous souhaitez qu'on fasse un mini-point à trois de 5 minutes pour répondre à toutes ses questions ! ✨`;
    }
    return `Salam alaykoum${contactName} ! 🇩🇿${mainEmoji}\n\nJe fais un court suivi concernant la mise en ligne de la plateforme pour ${prospect.company}${cityStr}.\n\nComme la saison approche à grands pas, nous finalisons les intégrations partenaires avec nos tarifs de lancement :\n👉 ${flyerUrl}\n\nSeriez-vous disponible pour un appel express de 5 minutes demain afin de valider vos priorités ? 🤝📞`;
  }

  // Step 3: Closing
  if (step === 3) {
    return `Salam alaykoum${contactName} ! 🇩🇿${mainEmoji}\n\nDernier petit message de ma part pour ne pas vous encombrer. Si vous souhaitez qu'on déploie votre site sous 48h avec votre logo et vos offres pour ${prospect.company}, faites-moi signe d'ici demain soir.\n\nSinon, aucun souci, je garde précieusement votre contact pour vos futures campagnes ! Excellente réussite à vous 🌍✨`;
  }

  // Step 0: Envoi initial
  if (tone === 'darija_pro') {
    return `Salam alaykoum${contactName} ! 🇩🇿✈️\n\nيعطيكم الصحة على المكالمة بخصوص وكالة ${prospect.company}${cityStr} !\n\nهاوليك لو سيت بروتوتيب لي وجدناه سبيسيالمون ليكم :\n👉 ${protoUrl}\n\n⚡ خفيف بزاف ويفتح بسرعة حتى بالكونيكسيون الضعيفة في الجنوب ولا في أي ولاية. زبائنك يقدرو يشوفو العروض ويحجزو فورا وبدون أي بلوكاج.\n\nوفي 48 ساعة برك نحطو لوغو تاعكم والعروض ورقم الهاتف الرسمي.\n\nوهنا تلقاو تفاصيل العروض والأسعار الترويجية :\n📑 👉 ${flyerUrl}\n\nشوفوه وقولولي واش رايكم، ربي يوفقكم ان شاء الله ! 🤝✨`;
  }

  return `Salam alaykoum${contactName} ! 🇩🇿${mainEmoji}\n\nRavi de notre échange téléphonique concernant ${prospect.company}${cityStr} !\n\nComme promis, voici l'accès direct au prototype spécialement pensé pour votre activité :\n👉 ${protoUrl}\n\n⚡ ${getNicheAdvantage(sector, prospect.city)}\n\nEn seulement 48h, nous intégrons vos éléments officiels (logo, offres de saison, coordonnées WhatsApp).\n\nDécouvrez nos 3 formules de lancement ici :\n${formule1}\n${formule2}\n${formule3}\n\n📑 Tarifs détaillés et flyer :\n👉 ${flyerUrl}\n\nJetez-y un œil dès maintenant et dites-moi ce que vous en pensez ! 🤝✨`;
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
      step = 0,
      reaction,
      verbatim,
      language,
      delayDays,
    } = parsed.data;

    const sector = targetSector || prospect.sector || 'Professionnels';
    const mainProtoUrl = prototypeUrl || 'https://parfait-voyage.vercel.app/';
    const mainFlyerUrl = flyerUrl || 'https://flyer-parfait-voyage.vercel.app/';

    const nicheKey = detectNicheKey(sector, prospect.company);
    const emojiInfo = NICHE_EMOJI_MAP[nicheKey] || NICHE_EMOJI_MAP['default'];
    const mainEmoji = nicheEmoji || emojiInfo.main;
    const supportEmojis = emojiInfo.support;

    const [f1Default, f2Default, f3Default] = getDefaultFormules(sector, mainEmoji);
    const f1 = formule1 || f1Default;
    const f2 = formule2 || f2Default;
    const f3 = formule3 || f3Default;
    const nicheAdvantage = getNicheAdvantage(sector, prospect.city);

    const isDarija = tone === 'darija_pro' || language === 'darija';

    // Description du stade de relance
    const stepContextMap: Record<number, string> = {
      0: "STADE : Envoi Initial du Prototype (J+0 à J+1). Objectif : Valider la prise de contact, susciter l'effet 'Wahou' avec le prototype et le flyer de lancement.",
      1: "STADE : Relance #1 (J+1 à J+2). Objectif : Demander chaleureusement s'il a pu ouvrir la démo sur smartphone, recueillir son avis sans pression.",
      2: "STADE : Relance #2 (J+3 à J+5) - Traitement d'Objection & Accélération. Objectif : Répondre chirurgicalement à son objection ou son silence, proposer un mini-appel de 3-5 min pour caler son projet.",
      3: "STADE : Relance Finale / Closing (J+6+). Objectif : Proposer de finaliser sous 48h avant de clore les créneaux partenaires de sa ville, tout en restant très élégant et respectueux.",
    };

    const currentStepContext = stepContextMap[step] || stepContextMap[0];

    // Contexte Temporel & Psychologie du Délai Écoulé
    let delayDirective = "";
    if (typeof delayDays === 'number') {
      if (delayDays >= 14) {
        delayDirective = `DÉLAI ÉCOULÉ : J+${delayDays} (PLUS DE 2 SEMAINES DEPUIS L'ENVOI OU LA DERNIÈRE ACTION).
PSYCHOLOGIE COMMERCIALE B2B (APPROCHE RUPTURE & PERMISSION DE CLÔTURE) :
- Le prospect n'a pas répondu depuis plus de deux semaines. INTERDICTION FORMELLE d'utiliser des formules passives comme "Avez-vous vu mon message ?".
- Adopte l'approche d'autorité bienveillante et de désengagement poli : "Ça fait maintenant plus de 2 semaines que je vous ai partagé la démo... J'imagine que le quotidien a pris le dessus ou que le timing n'est pas idéal en ce moment".
- Introduis la clôture du dossier et l'exclusivité territoriale : "Avant que je n'archive votre dossier pour attribuer la priorité à une autre agence sur ${prospect.city || 'votre région'}..."
- Pose une question binaire fermée et déculpabilisante pour forcer une décision rapide : "Dites-moi simplement en un mot : est-ce que le projet est toujours d'actualité pour vous, ou préfère-t-on mettre cela de côté pour l'instant ?"`;
      } else if (delayDays >= 7) {
        delayDirective = `DÉLAI ÉCOULÉ : J+${delayDays} (ENVIRON 1 SEMAINE PASSÉE).
PSYCHOLOGIE COMMERCIALE B2B (POINT D'ÉTAPE & PRESSION DU TEMPS) :
- Mentionne qu'environ une semaine s'est écoulée ("Cela fait une semaine qu'on a échangé...").
- Rappelle que la saison approche et que nous finalisons actuellement les partenaires prioritaires sur ${prospect.city || 'sa zone'} avec les tarifs de lancement.
- Demande si c'est toujours une priorité pour son agence avant le rush.`;
      } else if (delayDays >= 3) {
        delayDirective = `DÉLAI ÉCOULÉ : J+${delayDays} (MILIEU DE SEMAINE).
PSYCHOLOGIE COMMERCIALE B2B (EMPATHIE CHARGE DE TRAVAIL) :
- Reconnais avec empathie que ses journées sont bien chargées en agence cette semaine.
- Va droit au but, propose un test express en 30 secondes sur smartphone ou un court point de 3 minutes.`;
      } else {
        delayDirective = `DÉLAI ÉCOULÉ : J+${delayDays} (SUIVI IMMÉDIAT 24H-48H).
PSYCHOLOGIE COMMERCIALE B2B :
- La démo est encore très fraîche. Demande chaleureusement s'il a pu y jeter un coup d'œil rapide sur son téléphone et ce qu'il en a pensé pour ses clients.`;
      }
    }

    // Contexte de l'objection
    let objectionDirectives = "";
    if (reaction) {
      const objectionMap: Record<string, string> = {
        price: "OBJECTION PRINCIPALE : PRIX / 'TROP CHER'. Consigne : Valorise le ROI immédiat (1 seule réservation/vente rembourse tout le site à l'année), propose la formule accessible One-Page ou un échelonnement en 2 fois.",
        partner: "OBJECTION PRINCIPALE : DOIT VOIR AVEC L'ASSOCIÉ / DIRECTION. Consigne : Donne-lui les bons mots et le flyer pour convaincre son associé facilement, propose un mini-appel à 3 de 5 minutes.",
        no_reply: "OBJECTION PRINCIPALE : VU SANS RÉPONSE (SILENCE / GHOST). Consigne : Fais un message court, léger et déculpabilisant. Pose une question fermée simple ('Avez-vous réussi à ouvrir le lien du prototype sur votre téléphone ?').",
        no_time: "OBJECTION PRINCIPALE : PAS LE TEMPS / TROP OCCUPÉ. Consigne : Respecte son temps, propose un appel cadré de 3 minutes chrono à un horaire précis.",
        custom_request: "OBJECTION PRINCIPALE : DEMANDE D'OPTIONS SPÉCIFIQUES. Consigne : Confirme avec enthousiasme que c'est tout à fait faisable dans notre architecture sur-mesure sous 48h.",
        interested: "PROSPECT TRÈS INTÉRESSÉ / EN RÉFLEXION. Consigne : Propose de lui montrer ses offres et son logo intégrés en direct lors d'un appel rapide de 5 minutes.",
        refusal: "REFUS / PAS POUR LE MOMENT. Consigne : Remercie chaleureusement, valorise son établissement et laisse la porte grand ouverte.",
      };
      objectionDirectives = objectionMap[reaction] || `RETOUR DU CLIENT : ${reaction}. Adapte ta réponse avec tact.`;
    }

    const verbatimContext = verbatim ? `NOTE EXACTE SUR LE PROSPECT : "${verbatim}"` : (prospect.notes ? `NOTES CRM : "${prospect.notes}"` : "");

    const prompt = `Tu es l'Expert Copywriter Commercial & Directeur des Ventes chez Stepping Stones Agency (agence fondée par Mohamed Slimani & Abdelhadi Hammaz).
Tu rédiges un message WhatsApp commercial sur-mesure pour un prospect professionnel en Algérie.

DONNÉES DU PROSPECT :
- Entreprise : "${prospect.company}"
- Contact : "${prospect.name || 'Responsable'}"
- Ville / Wilaya : "${prospect.city || 'Algérie'}"
- Secteur / Niche : "${sector}"
- Prototype Web : ${mainProtoUrl}
- Flyer & Tarifs : ${mainFlyerUrl}
${verbatimContext}

${currentStepContext}
${delayDirective ? `\n${delayDirective}\n` : ''}
${objectionDirectives}

LES 3 FORMULES :
- ${f1}
- ${f2}
- ${f3}

LANGUE & TONALITÉ :
${isDarija 
  ? "RÉDIGE EN DARIJA ALGÉRIENNE PROFESSIONNELLE (en alphabet latin / arabe algérien retranscrit ou arabe fluide). Chaleureux, respectueux, direct entre professionnels algériens." 
  : "RÉDIGE EN FRANÇAIS B2B ALGÉRIEN. Professionnel, élégant, courtois, engageant, axé sur les résultats concrets."}

RÈGLES D'OR DU MESSAGE WHATSAPP :
1. Personnalise OBLIGATOIREMENT avec le nom de l'entreprise "${prospect.company}" et sa ville "${prospect.city || 'votre région'}".
2. UTILISE DES EMOJIS NATURELS ET PROFESSIONNELS (${mainEmoji}, ${supportEmojis.join(' ')}, 🇩🇿, 👉, 📲, 📑, 🤝, ✨, ⚡) pour structurer le texte, valoriser les liens et rendre le message agréable et chaleureux à lire sur mobile.
3. Le lien du prototype doit être mis en valeur avec 👉 sur sa propre ligne.
4. Reste concis (100 à 150 mots maximum). Sauts de ligne clairs et aérés.
5. JAMAIS de balises markdown techniques (pas de **gras** excessif, pas de balises html). Texte WhatsApp fluide uniquement.
6. Ne mentionne pas de noms d'agences tierces, sois naturel comme si Slimani envoyait le message directement de son téléphone.`;

    try {
      const geminiRes = await callGeminiResilient({
        prompt,
        preferredModel: 'gemini-flash-lite-latest',
        purpose: 'general',
        generationConfig: {
          temperature: 0.45,
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
      const fallbackMessage = generateLocalSmartFallback({
        prospect,
        tone: tone || 'ultra_persuasive',
        step,
        reaction,
        protoUrl: mainProtoUrl,
        flyerUrl: mainFlyerUrl,
        formule1: f1,
        formule2: f2,
        formule3: f3,
        mainEmoji,
        delayDays,
      });
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
