/**
 * StoneLink - Neural Follow-Up & Strategy Optimization Engine
 * Manages post-prototype follow-up stages, objection data entry,
 * timing heuristics, and strategy weakness diagnosis.
 */

import type { Prospect } from '@/types';
import { formatPhoneForWhatsApp, buildWhatsAppUrl } from '@/lib/whatsapp';

export type FollowUpStep = 0 | 1 | 2 | 3;
// 0 = Prototype envoyé (Noyau initial)
// 1 = Relance #1 (Validation intérêt / 24-48h)
// 2 = Relance #2 (Traitement objections / 3-5j)
// 3 = Closing & Négociation finale (6j+)

export type ReactionType =
  | 'no_reply'          // Vu sans réponse (Ghost / Silence)
  | 'interested'        // Intéressé / En réflexion
  | 'price'             // Objection Prix / "Trop cher"
  | 'no_time'           // "Pas le temps / Rappelez plus tard"
  | 'partner'           // "Doit voir avec associé / patron"
  | 'custom_request'    // Demande de modifications / devis spécial
  | 'refusal'           // Refus catégorique
  | 'other';            // Autre retour libre

export interface ReactionMeta {
  id: ReactionType;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  recommendedCounterTip: string;
}

export const REACTION_CONFIG: Record<ReactionType, ReactionMeta> = {
  no_reply: {
    id: 'no_reply',
    label: 'Vu sans réponse (Ghost)',
    emoji: '👀',
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.12)',
    description: 'Le prospect a ouvert le message WhatsApp sans répondre.',
    recommendedCounterTip: 'Envoyez un mémo vocal court (20s) ou une question ouverte fermée type : "Avez-vous réussi à ouvrir le lien du prototype ?"',
  },
  interested: {
    id: 'interested',
    label: 'Intéressé / En réflexion',
    emoji: '👍',
    color: '#4ade80',
    bgColor: 'rgba(74, 222, 128, 0.12)',
    description: 'A aimé le design et réfléchit à la mise en place.',
    recommendedCounterTip: 'Proposez un appel cadré de 10 min pour lui montrer ses offres et son logo intégrés en direct.',
  },
  price: {
    id: 'price',
    label: 'Objection Prix ("Trop cher")',
    emoji: '💰',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    description: 'Trouve le tarif trop élevé ou pas dans son budget immédiat.',
    recommendedCounterTip: 'Proposez la formule One-Page (plus accessible) ou un paiement échelonné en 2 tranches. Montrez que 1 seule réservation rembourse le site.',
  },
  no_time: {
    id: 'no_time',
    label: 'Pas le temps ("Rappelez plus tard")',
    emoji: '⏳',
    color: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.12)',
    description: 'Occupé avec des clients ou en déplacement.',
    recommendedCounterTip: 'Fixez immédiatement un créneau précis : "Je vous rappelle jeudi à 11h ou 15h, quel horaire préférez-vous ?"',
  },
  partner: {
    id: 'partner',
    label: 'Décision collective (Associé / Patron)',
    emoji: '👥',
    color: '#c084fc',
    bgColor: 'rgba(192, 132, 252, 0.12)',
    description: 'Doit montrer le prototype à son associé ou directeur d\'agence.',
    recommendedCounterTip: 'Envoyez le flyer récapitulatif PDF/Web : "Voici le lien flyer à transférer directement à votre associé pour qu\'il voie les 3 formules".',
  },
  custom_request: {
    id: 'custom_request',
    label: 'Demande de modifs / Options',
    emoji: '🛠️',
    color: '#a78bfa',
    bgColor: 'rgba(167, 139, 250, 0.12)',
    description: 'Veut des fonctionnalités supplémentaires (système visa, paiement ciblé, etc.).',
    recommendedCounterTip: 'Validez la demande : "C\'est tout à fait faisable dans la formule Sur-mesure, je vous prépare un aperçu sous 24h".',
  },
  refusal: {
    id: 'refusal',
    label: 'Pas intéressé / Refus',
    emoji: '❌',
    color: '#f87171',
    bgColor: 'rgba(248, 113, 113, 0.12)',
    description: 'Ne souhaite pas de site web ou a déjà un contrat actif.',
    recommendedCounterTip: 'Remerciez chaleureusement et gardez la porte ouverte : "Entendu, je garde votre contact pour vos futures campagnes saisonnières".',
  },
  other: {
    id: 'other',
    label: 'Autre retour spécifique',
    emoji: '📝',
    color: '#cbd5e1',
    bgColor: 'rgba(203, 213, 225, 0.12)',
    description: 'Cas particulier ou note personnalisée.',
    recommendedCounterTip: 'Notez précisément les mots du client pour identifier de nouvelles opportunités.',
  },
};

export interface FollowUpRecord {
  step: FollowUpStep;
  date: string; // ISO String
  channel: 'whatsapp' | 'call' | 'audio_note' | 'email';
  reaction: ReactionType;
  verbatim: string;
  notes?: string;
}

export interface LeadFollowUpData {
  currentStep: FollowUpStep;
  prototypeSentAt: string; // ISO String
  lastActionAt: string; // ISO String
  history: FollowUpRecord[];
  primaryObjection?: ReactionType;
  urgency: 'today' | 'overdue' | 'fresh' | 'pending';
  daysSinceLastAction: number;
  daysSincePrototype: number;
}

export const STEP_NAMES: Record<FollowUpStep, { title: string; subtitle: string; daysTarget: string; color: string; badge: string }> = {
  0: {
    title: 'Prototype Envoyé',
    subtitle: 'Consultation & Découverte initiale',
    daysTarget: 'J+0 à J+1',
    color: '#a855f7',
    badge: 'Noyau Initial',
  },
  1: {
    title: 'Relance #1',
    subtitle: 'Validation intérêt & Découverte besoins',
    daysTarget: 'J+1 à J+2',
    color: '#eab308',
    badge: 'Synapse I',
  },
  2: {
    title: 'Relance #2',
    subtitle: 'Traitement des objections & Offre',
    daysTarget: 'J+3 à J+5',
    color: '#3b82f6',
    badge: 'Synapse II',
  },
  3: {
    title: 'Closing & Décision',
    subtitle: 'Finalisation contrat ou signature',
    daysTarget: 'J+6+',
    color: '#10b981',
    badge: 'Terminaison Axonale',
  },
};

// WhatsApp Strategy Message Templates per Step
export const FOLLOW_UP_SCRIPTS: Record<
  FollowUpStep,
  { fr: string; darija: string }
> = {
  0: {
    fr: `Salam alaykoum {name} ! 🇩🇿✈️\n\nRavi de notre échange téléphonique pour {company}{city} !\n\nComme promis, voici l'accès direct au prototype spécialement pensé pour votre activité :\n👉 https://parfait-voyage.vercel.app/\n\n⚡ Conçu pour s'ouvrir en moins de 2 secondes même avec une connexion lente : vos clients réservent sans aucun bug.\n\nEn seulement 48h, nous intégrons vos éléments officiels (logo, offres, WhatsApp).\n\n📑 Flyer de présentation & 3 formules :\n👉 https://flyer-parfait-voyage.vercel.app/\n\nJetez-y un œil et dites-moi ce que vous en pensez ! 🤝✨`,
    darija: `Salam alaykoum {name} ! 🇩🇿✈️\n\nيعطيكم الصحة على المكالمة بخصوص {company}{city} !\n\nهاوليك لو سيت بروتوتيب لي وجدناه سبيسيالمون ليكم :\n👉 https://parfait-voyage.vercel.app/\n\n⚡ خفيف بزاف ويفتح بسرعة حتى بالكونيكسيون الضعيفة في الجنوب ولا في أي ولاية. زبائنك يقدرو يشوفو العروض ويحجزو فورا وبدون أي بلوكاج.\n\nوفي 48 ساعة برك نحطو لوغو تاعكم والعروض ورقم الهاتف الرسمي.\n\nوهنا تلقاو تفاصيل العروض والأسعار الترويجية :\n📑 👉 https://flyer-parfait-voyage.vercel.app/\n\nشوفوه وقولولي واش رايكم 🤝✨`,
  },
  1: {
    fr: `Salam alaykoum {name} ! 🇩🇿✈️\n\nJ'espère que vous allez très bien ! Je reviens vers vous suite à l'envoi de la démo de la plateforme pour {company}{city} :\n👉 https://parfait-voyage.vercel.app/\n\nAvez-vous eu l'occasion d'y jeter un coup d'œil rapide sur votre téléphone ? Qu'en avez-vous pensé pour vos clients ? 🤝✨`,
    darija: `Salam alaykoum {name} ! 🇩🇿✈️\n\nان شاء الله راك مليح خويا ! راني نتواصل معاك بخصوص لو سيت بروتوتيب لي بعثتهولك للوكالة {company}{city} :\n👉 https://parfait-voyage.vercel.app/\n\nاسكو شفتو ولا مازال ما قعدتش ؟ واش رايك فيه مقارنة باحتياجات زبائنك ؟ 🤝🇩🇿`,
  },
  2: {
    fr: `Salam alaykoum {name} ! 🇩🇿💼\n\nJe fais un court suivi concernant la personnalisation de la plateforme pour {company}{city}.\n\nComme la saison approche, nous finalisons actuellement les agences partenaires de votre zone avec nos offres de lancement (One-Page, Pro, Sur-mesure) :\n📑 👉 https://flyer-parfait-voyage.vercel.app/\n\nSeriez-vous disponible pour un appel express de 5 minutes demain afin de valider vos objectifs ? 🤝📞`,
    darija: `Salam alaykoum {name} ! 🇩🇿💼\n\nراني نعاود نراسلكم برك باش نعرف اذا نقفلو الحجز تاع العرض الترويجي للوكالة {company}{city} قبل ما نغلقو التسجيلات للدفعة هادي :\n📑 👉 https://flyer-parfait-voyage.vercel.app/\n\nقولي برك واش هي النقاط لي مازال ما وضحتش ولا اسكو نقدرو نديرو مكالمة خفيفة تاع 5 دقائق نوضحلك كلش ؟ 🤝🇩🇿`,
  },
  3: {
    fr: `Salam alaykoum {name} ! 🇩🇿✨\n\nDernier message de ma part pour ne pas vous encombrer.\n\nSi vous souhaitez qu'on déploie votre site sous 48h avec vos offres et coordonnées pour {company} avant le rush, dites-le-moi simplement d'ici demain soir.\n\nSinon, aucun problème du tout, je garde précieusement votre contact pour vos projets futurs ! Excellente réussite à vous 🌍🤝`,
    darija: `Salam alaykoum {name} ! 🇩🇿✨\n\nاخر رسالة برك خويا باش ما نثقلش عليك. اذا راك حاب نطلقو لو سيت تاع {company} في 48 ساعة قبل بداية الموسم، قولي برك قبل غدوة فالعشية باش نحطوك فالبرنامج.\n\nواذا ماشي الوقت المناسب، ماكاش مشكل خلاص، ربي يوفقكم ويبقى الاتصال بيناتنا ! 🌍🇩🇿`,
  },
};

export type DelayMilestone = 'fresh_48h' | 'midweek' | 'week_mark' | 'breakup_2w';

export function getDelayMilestone(days: number): DelayMilestone {
  if (days >= 14) return 'breakup_2w';
  if (days >= 7) return 'week_mark';
  if (days >= 3) return 'midweek';
  return 'fresh_48h';
}

/**
 * Returns an enriched, personalized follow-up script with prospect details,
 * objection handling, and human elapsed-time psychology (48h, 1 week, 2 weeks+).
 */
export function getSmartFollowUpScript(
  step: FollowUpStep,
  prospect: Prospect,
  lang: 'fr' | 'darija' = 'fr',
  reaction?: ReactionType,
  delayDays?: number
): string {
  const comp = prospect.company || 'votre agence';
  const city = prospect.city ? ` (${prospect.city})` : '';
  const name = prospect.name && !prospect.name.toLowerCase().includes('responsable') ? prospect.name : comp;
  const days = typeof delayDays === 'number' ? delayDays : 0;

  // 1. Direct objection handling has highest priority when selected
  if (reaction) {
    if (reaction === 'price') {
      return (lang === 'darija'
        ? `Salam alaykoum ${name} ! 🇩🇿💼\n\nبخصوص السعر لوكالة ${comp}، على بالك بلي حجز واحد برك إضافي عبر الموقع يرجعلك كامل حق لو سيت للعام كامل.\n\nوعندنا ثاني عرض One-Page بسعر رمزي جدا نقدر نبعثهولك :\n👉 https://flyer-parfait-voyage.vercel.app/\n\nاسكو نقدر نعيطلك 3 دقائق غدوة نقترحو حل يساعد الميزانية تاعكم ؟ 🤝✨`
        : `Salam alaykoum ${name} ! 🇩🇿💼\n\nConcernant votre réflexion budgétaire pour ${comp}, sachez qu'une seule réservation supplémentaire grâce à la plateforme rembourse déjà la totalité du site pour l'année.\n\nNous proposons également la formule One-Page très accessible (ou un règlement échelonné en 2 fois) :\n👉 https://flyer-parfait-voyage.vercel.app/\n\nSeriez-vous partant pour un court échange de 3 minutes demain afin de trouver la solution adaptée à votre budget ? 🤝✨`
      );
    }
    if (reaction === 'partner') {
      return (lang === 'darija'
        ? `Salam alaykoum ${name} ! 🇩🇿🤝\n\nباش تسهل عليك النقاش مع الشريك تاعك في ${comp}، هاوليك لو فلاير فيه العروض بوضوح تقدر تبعثهولو مباشرة :\n👉 https://flyer-parfait-voyage.vercel.app/\n\nوهاوليك رابط الديمو الحية :\n👉 https://parfait-voyage.vercel.app/\n\nقولي اذا تحب نديرو مكالمة خفيفة تاع 5 دقائق نجاوبو على كامل استفساراتكم ! ✨`
        : `Salam alaykoum ${name} ! 🇩🇿🤝\n\nPour faciliter la décision avec votre associé pour ${comp}, voici le flyer récapitulatif avec nos 3 formules claires à lui transférer directement :\n👉 https://flyer-parfait-voyage.vercel.app/\n\nEt le lien du prototype en direct :\n👉 https://parfait-voyage.vercel.app/\n\nN'hésitez pas si vous souhaitez qu'on fasse un mini-point à trois de 5 minutes pour répondre à ses questions ! ✨`
      );
    }
    if (reaction === 'no_reply') {
      return (lang === 'darija'
        ? `Salam alaykoum ${name} ! 🇩🇿✈️\n\nرسالة خفيفة برك خويا باش نتطمن. اسكو فتحت الرابط تاع لو سيت بروتوتيب لي بعثتهولك للوكالة ${comp} ؟\n👉 https://parfait-voyage.vercel.app/\n\nاذا لقيت أي مشكل فالرابط ولا ما قعدتش، قولي برك 🤝🇩🇿`
        : `Salam alaykoum ${name} ! 🇩🇿✈️\n\nCourt message pour prendre de vos nouvelles concernant ${comp}. Avez-vous réussi à ouvrir le lien du prototype sur votre téléphone ?\n👉 https://parfait-voyage.vercel.app/\n\nSi vous n'avez pas eu le temps, aucun souci, dites-moi simplement quand vous êtes plus disponible 🤝✨`
      );
    }
  }

  // 2. Elapsed time milestones psychology (when no specific objection is active)
  if (days >= 14) {
    // Tier 4: Critical Core (+14 days / 2+ weeks) — Breakup / Permission to close
    return (lang === 'darija'
      ? `Salam alaykoum ${name} ! 🇩🇿✨\n\nخويا ${name}، راني شفت بلي جازو سيمانتين ملي بعثنا لو سيت بروتوتيب لوكالة ${comp}${city} :\n👉 https://parfait-voyage.vercel.app/\n\nعلابالي بلي الخدمة تدي كامل وقتكم والواحد ما يقعدش.\n\nحبيت برك نسقسيك قبل ما نقفلو الدوسي ونشوفو مع وكالة ثانية في جهتكم : قولي بصراحة، اسكو المشروع مازالو يهمكم هاد الفترة ولا نلغيوه ويبقى الاتصال بيناتنا للمستقبل ؟ 🤝🇩🇿`
      : `Salam alaykoum ${name} ! 🇩🇿✨\n\nÇa fait maintenant plus de 2 semaines que je vous ai transmis la démo de la plateforme pour ${comp}${city} :\n👉 https://parfait-voyage.vercel.app/\n\nJ'imagine que le quotidien a pris le dessus ou que le timing n'est pas idéal en ce moment.\n\nAvant que je n'archive votre dossier pour attribuer la priorité à une autre agence sur votre secteur, dites-moi simplement : est-ce que le projet est toujours d'actualité pour vous, ou préfère-t-on mettre cela de côté ? 🤝🌍`
    );
  }

  if (days >= 7) {
    // Tier 3: One Week Mark (+7 to +13 days) — Territory exclusivity & season rush
    return (lang === 'darija'
      ? `Salam alaykoum ${name} ! 🇩🇿💼\n\nجاز سمانة ملي تكلمنا وبعثنالكم لو سيت بروتوتيب لوكالة ${comp}${city} :\n👉 https://parfait-voyage.vercel.app/\n\nكيما علابالك الموسم راهو قريب ورانا نحددو فالوكالات الشريكة في منطقتكم بالعرض الترويجي قبل ما نغلقو التسجيلات :\n📑 👉 https://flyer-parfait-voyage.vercel.app/\n\nحبيت برك نعرف اسكو راكم حابين تطلقو لو سيت تاعكم هاد الفترة قبل الزحام ولا مازال ؟ 🤝🇩🇿`
      : `Salam alaykoum ${name} ! 🇩🇿💼\n\nCela fait une semaine que nous vous avons partagé le prototype conçu pour ${comp}${city} :\n👉 https://parfait-voyage.vercel.app/\n\nComme la saison approche et que nous finalisons actuellement les agences partenaires sur votre zone avec nos formules de lancement (One-Page, Pro, Sur-mesure) :\n📑 👉 https://flyer-parfait-voyage.vercel.app/\n\nJe voulais faire le point avec vous : est-ce toujours une priorité pour votre agence d'avoir votre site en ligne avant le rush ? 🤝✨`
    );
  }

  if (days >= 3) {
    // Tier 2: Mid-Week (+3 to +6 days) — Busy hustle empathy & 30-sec test
    return (lang === 'darija'
      ? `Salam alaykoum ${name} ! 🇩🇿✈️\n\nعلابالي بلي السيمانة هادي معمرة خدمة عندكم في ${comp}${city}.\n\nباش نسهلوها عليكم، هاوليك لو سيت بروتوتيب لي وجدناه باش تشوفوه في 30 ثانية برك على التيليفون :\n👉 https://parfait-voyage.vercel.app/\n\nاسكو نقدر نعيطلك غدوة 3 دقائق نوضحلك كيفاش نطلقوه باسمكم في 48 ساعة ؟ 🤝🇩🇿`
      : `Salam alaykoum ${name} ! 🇩🇿✈️\n\nJe sais que vos journées sont bien chargées en agence cette semaine pour ${comp}${city}.\n\nPour vous faire gagner du temps, voici le lien direct du prototype rapide pour tester en 30 secondes sur smartphone :\n👉 https://parfait-voyage.vercel.app/\n\nSeriez-vous partant pour un court échange de 3 minutes demain afin de valider si cela correspond à vos objectifs ? 🤝📞`
    );
  }

  // Tier 1: Fresh 24h-48h (+0 to +2 days)
  const baseTemplate = FOLLOW_UP_SCRIPTS[step]?.[lang] || FOLLOW_UP_SCRIPTS[0][lang];
  return baseTemplate
    .replace(/{company}/g, comp)
    .replace(/{city}/g, city)
    .replace(/{name}/g, name);
}

/**
 * Parses structured follow-up data from prospect notes, or initializes defaults.
 */
export function parseLeadFollowUp(prospect: Prospect): LeadFollowUpData {
  const notes = prospect.notes || '';
  const now = new Date();

  // Baseline dates
  const rawCreation = prospect.runDate || prospect.createdAt;
  const initialDate = rawCreation ? new Date(rawCreation) : new Date(now.getTime() - 2 * 86400000);
  const prototypeSentAt = isNaN(initialDate.getTime()) ? now.toISOString() : initialDate.toISOString();

  let stored: Partial<LeadFollowUpData> | null = null;
  const match = notes.match(/<!--\s*FOLLOWUP_DATA:\s*([\s\S]*?)\s*-->/);
  if (match) {
    try {
      stored = JSON.parse(match[1]);
    } catch {
      stored = null;
    }
  }

  const history: FollowUpRecord[] = Array.isArray(stored?.history) ? stored!.history! : [];
  let currentStep: FollowUpStep = (typeof stored?.currentStep === 'number' ? stored.currentStep : 0) as FollowUpStep;
  if (![0, 1, 2, 3].includes(currentStep)) currentStep = 0;

  // Infer last action timestamp
  let lastActionAt = stored?.lastActionAt || prototypeSentAt;
  if (history.length > 0) {
    const lastRec = history[history.length - 1];
    if (lastRec?.date) lastActionAt = lastRec.date;
  } else if (currentStep === 0) {
    lastActionAt = prototypeSentAt;
  }

  const lastActionDate = new Date(lastActionAt);
  const validLastAction = isNaN(lastActionDate.getTime()) ? now : lastActionDate;
  const daysSinceLastAction = Math.max(0, Math.floor((now.getTime() - validLastAction.getTime()) / 86400000));
  const daysSincePrototype = Math.max(0, Math.floor((now.getTime() - new Date(prototypeSentAt).getTime()) / 86400000));

  // Determine urgency
  let urgency: 'today' | 'overdue' | 'fresh' | 'pending' = 'pending';
  if (currentStep === 0) {
    if (daysSincePrototype >= 1 && daysSincePrototype <= 2) {
      urgency = 'today';
    } else if (daysSincePrototype > 2) {
      urgency = 'overdue';
    } else {
      urgency = 'fresh';
    }
  } else if (currentStep === 1) {
    if (daysSinceLastAction >= 2 && daysSinceLastAction <= 3) {
      urgency = 'today';
    } else if (daysSinceLastAction > 3) {
      urgency = 'overdue';
    } else {
      urgency = 'pending';
    }
  } else if (currentStep === 2) {
    if (daysSinceLastAction >= 3) {
      urgency = 'overdue';
    } else if (daysSinceLastAction >= 2) {
      urgency = 'today';
    } else {
      urgency = 'pending';
    }
  } else {
    urgency = daysSinceLastAction > 4 ? 'overdue' : 'pending';
  }

  // Find primary objection
  const primaryObjection = stored?.primaryObjection || history.find((h) => h.reaction && h.reaction !== 'interested')?.reaction;

  return {
    currentStep,
    prototypeSentAt,
    lastActionAt: validLastAction.toISOString(),
    history,
    primaryObjection,
    urgency,
    daysSinceLastAction,
    daysSincePrototype,
  };
}

/**
 * Serializes follow-up data inside prospect notes while preserving human text notes.
 */
export function serializeLeadNotes(cleanTextNotes: string, data: LeadFollowUpData): string {
  const clean = cleanTextNotes.replace(/<!--\s*FOLLOWUP_DATA:[\s\S]*?-->/g, '').trim();
  const payload = JSON.stringify({
    currentStep: data.currentStep,
    prototypeSentAt: data.prototypeSentAt,
    lastActionAt: data.lastActionAt,
    history: data.history,
    primaryObjection: data.primaryObjection,
  });

  const marker = `<!-- FOLLOWUP_DATA: ${payload} -->`;
  return clean ? `${clean}\n\n${marker}` : marker;
}

/**
 * Strips technical metadata markers to get clean human note.
 */
export function extractCleanNoteText(notes?: string): string {
  if (!notes) return '';
  return notes.replace(/<!--\s*FOLLOWUP_DATA:[\s\S]*?-->/g, '').trim();
}

/**
 * Aggregates follow-up diagnostics across all prototype leads to identify strategy weaknesses.
 */
export interface StrategyDiagnosis {
  totalPrototypes: number;
  stepDistribution: Record<FollowUpStep, number>;
  stepPercentages: Record<FollowUpStep, number>;
  urgencyCounts: {
    today: number;
    overdue: number;
    fresh: number;
    pending: number;
  };
  objectionsBreakdown: Array<{
    type: ReactionType;
    count: number;
    percentage: number;
    meta: ReactionMeta;
  }>;
  dropOffRateStep1: number; // % who don't advance past step 1
  dropOffRateStep2: number; // % who don't advance past step 2
  keyWeakness: {
    title: string;
    description: string;
    actionableAdvice: string;
  };
  topRecommendations: string[];
}

export function calculateStrategyMetrics(prospects: Prospect[]): StrategyDiagnosis {
  const prototypeLeads = prospects.filter((p) => p.stage === 'prototype');
  const total = prototypeLeads.length || 1; // avoid /0

  const stepCounts: Record<FollowUpStep, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
  const urgencyCounts = { today: 0, overdue: 0, fresh: 0, pending: 0 };
  const objectionCounts: Record<ReactionType, number> = {
    no_reply: 0,
    interested: 0,
    price: 0,
    no_time: 0,
    partner: 0,
    custom_request: 0,
    refusal: 0,
    other: 0,
  };

  prototypeLeads.forEach((p) => {
    const data = parseLeadFollowUp(p);
    stepCounts[data.currentStep] = (stepCounts[data.currentStep] || 0) + 1;
    urgencyCounts[data.urgency] = (urgencyCounts[data.urgency] || 0) + 1;

    if (data.primaryObjection) {
      objectionCounts[data.primaryObjection] = (objectionCounts[data.primaryObjection] || 0) + 1;
    } else if (data.history.length > 0) {
      const last = data.history[data.history.length - 1];
      if (last.reaction) {
        objectionCounts[last.reaction] = (objectionCounts[last.reaction] || 0) + 1;
      }
    }
  });

  const stepPercentages: Record<FollowUpStep, number> = {
    0: Math.round((stepCounts[0] / total) * 100),
    1: Math.round((stepCounts[1] / total) * 100),
    2: Math.round((stepCounts[2] / total) * 100),
    3: Math.round((stepCounts[3] / total) * 100),
  };

  const objectionsBreakdown = (Object.keys(objectionCounts) as ReactionType[])
    .map((type) => ({
      type,
      count: objectionCounts[type],
      percentage: Math.round((objectionCounts[type] / total) * 100),
      meta: REACTION_CONFIG[type],
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

  // Calculate Drop-off
  const step0And1 = stepCounts[0] + stepCounts[1];
  const dropOffRateStep1 = Math.round((step0And1 / total) * 100);
  const dropOffRateStep2 = Math.round(((stepCounts[1] + stepCounts[2]) / total) * 100);

  // Identify Key Weakness & Advice
  let keyWeakness = {
    title: 'Goulot d\'étranglement : Relance #1 non effectuée',
    description: `${stepCounts[0]} prospects restent au stade de prototype sans 1ère relance.`,
    actionableAdvice: 'Programmez 15 minutes le matin pour déclencher la Relance #1 en WhatsApp dès 24h après l\'envoi du prototype.',
  };

  const topObjection = objectionsBreakdown[0];
  if (topObjection && topObjection.type === 'price' && topObjection.percentage >= 25) {
    keyWeakness = {
      title: 'Objection dominante : Sensibilité au Prix (Budget)',
      description: `${topObjection.percentage}% des prospects bloquent sur le coût de la solution.`,
      actionableAdvice: 'Ne baissez pas vos prix : proposez l\'offre One-Page d\'entrée ou un paiement en 2 fois (acompte 50% + solde à la livraison). Rappelez qu\'une seule réservation Omra rembourse le site entier.',
    };
  } else if (topObjection && topObjection.type === 'no_reply' && topObjection.percentage >= 30) {
    keyWeakness = {
      title: 'Silence radio : Les prospects ouvrent sans répondre',
      description: `${topObjection.percentage}% des agences ne répondent pas au 1er message.`,
      actionableAdvice: 'Remplacez les longs textes par un mémo vocal WhatsApp de 20 secondes. Le taux d\'écoute et de réponse d\'un vocal en Algérie est 3x supérieur à un texte écrit.',
    };
  } else if (stepCounts[0] >= total * 0.5) {
    keyWeakness = {
      title: 'Inertie post-envoi : 50%+ des prototypes dorment au niveau 0',
      description: 'Vos prototypes ont été envoyés mais le cycle de relance n\'a pas encore démarré.',
      actionableAdvice: 'Utilisez le filtre "⚡ À relancer aujourd\'hui" pour dépiler les agences en attente en moins de 10 minutes avec le bouton WhatsApp 1-clic.',
    };
  }

  const topRecommendations: string[] = [
    'Relancez systématiquement sous 24h à 48h : 70% des conversions se font sur la Relance #1.',
    'Testez la note vocale WhatsApp pour réactiver les prospects qui ne répondent pas à l\'écrit.',
    'Présentez le Flyer 3 Formules aux indécis pour leur offrir une porte d\'entrée financière rassurante.',
  ];

  return {
    totalPrototypes: prototypeLeads.length,
    stepDistribution: stepCounts,
    stepPercentages,
    urgencyCounts,
    objectionsBreakdown,
    dropOffRateStep1,
    dropOffRateStep2,
    keyWeakness,
    topRecommendations,
  };
}
