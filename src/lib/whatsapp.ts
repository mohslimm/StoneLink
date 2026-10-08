/**
 * StoneLink - WhatsApp Outreach Automation Engine
 * Supports individual & batch WhatsApp dispatching for Algerian & International prospects.
 * Specifically configured for Algerian Travel Agencies with the "Parfait Voyage" Prototype.
 */

export const TRAVEL_AGENCY_PROTOTYPE_MESSAGE = `Salam alaykoum,

Ravi de notre échange téléphonique ! Comme promis, voici le prototype de plateforme conçu spécialement pour les agences de voyage en Algérie :
👉 https://parfait-voyage.vercel.app/

Ce qui fait toute la différence : nous avons poussé l'accessibilité à 100 %.

Que votre client soit à Alger ou au fin fond du Sahara, même avec une toute petite connexion, il peut parcourir vos offres et réserver chez vous — sans bug, sans blocage, sans page qui n'en finit pas de charger.

Un client qui abandonne parce que le site rame, c'est une réservation perdue. Avec notre architecture, ce problème disparaît : où qu'il soit, chaque client peut réserver chez vous. C'est ça, la vraie force de ce que nous proposons.

Et en seulement 48 h, toute la plateforme passe à vos couleurs : votre logo, vos offres Omra et été, le numéro officiel de votre agence.

Pour aller plus loin, voici nos 3 formules selon la taille de votre agence :
✈️ One-Page : idéale pour l'Omra et le Sud
✈️ Agence Pro : site complet + tableau de bord de gestion sur smartphone
✈️ Sur-mesure : plateforme complète avec système de réservation en ligne

Tout est détaillé ici, avec des tarifs de lancement réservés à nos premiers clients partenaires :
👉 https://flyer-parfait-voyage.vercel.app/

Jetez-y un œil dès maintenant et dites-moi ce que vous en pensez. Je suis certain que vous verrez tout de suite ce que ça peut changer pour votre agence 🌍`;

export interface WhatsAppTemplate {
  id: string;
  name: string;
  sector: string;
  message: string;
  prototypeUrl?: string;
  flyerUrl?: string;
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'travel_parfait_voyage',
    name: 'Prototype Agence de Voyage (Parfait Voyage + Flyer)',
    sector: 'Agence de voyage',
    message: TRAVEL_AGENCY_PROTOTYPE_MESSAGE,
    prototypeUrl: 'https://parfait-voyage.vercel.app/',
    flyerUrl: 'https://flyer-parfait-voyage.vercel.app/',
  },
  {
    id: 'dental_zekri',
    name: 'Prototype Cabinet Dentaire (Zekri Clinic)',
    sector: 'Santé / Dentaire',
    message: `Salam alaykoum,

Ravi de notre échange ! Comme convenu, voici le prototype de plateforme conçu spécialement pour les cliniques et cabinets dentaires d'excellence :
👉 https://zekri-clinic.vercel.app/

Une vitrine épurée, rassurante et ultra-rapide permettant à vos patients de découvrir vos actes et de réserver une consultation en 3 clics.

Je reste à votre disposition pour adapter la charte et vos spécialités sous 48h.`,
    prototypeUrl: 'https://zekri-clinic.vercel.app/',
  },
  {
    id: 'custom_message',
    name: 'Message Personnalisé Libre',
    sector: 'Personnalisé',
    message: `Salam alaykoum,

Ravi de notre échange ! Voici le lien de votre prototype sur-mesure :
👉 https://parfait-voyage.vercel.app/

N'hésitez pas à me faire vos retours 🌍`,
  }
];

export const EMOJI_PALETTES = [
  {
    category: 'Voyage & Algérie',
    icon: '✈️',
    emojis: ['✈️', '🌍', '🌴', '🏖️', '🕌', '🕋', '🗺️', '🏨', '🛳️', '🌅', '🧳', '📍', '💺', '🎫', '🏝️', '🧭', '🇩🇿', '🚗', '🚌', '⛰️'],
  },
  {
    category: 'Actions & CTA',
    icon: '👉',
    emojis: ['👉', '🚀', '⚡', '📞', '💬', '📩', '🎯', '🔥', '✨', '⭐', '🔔', '👀', '💡', '📲', '👇', '🔗', '📌', '📢', '⏰', '⏳'],
  },
  {
    category: 'Business & Tarifs',
    icon: '💼',
    emojis: ['✅', '🤝', '💼', '🏆', '👑', '💎', '📈', '📊', '💰', '🏷️', '🔒', '🛡️', '⭐', '💯', '👏', '🎯', '💳', '🎁', '📑', '🔑'],
  },
  {
    category: 'Santé & Clinique',
    icon: '🦷',
    emojis: ['🏥', '🦷', '🩺', '💊', '👨‍⚕️', '👩‍⚕️', '✨', '🩹', '💉', '🤍', '🪥', '⚕️', '🧴', '🔬'],
  },
  {
    category: 'Expressions & Smileys',
    icon: '😊',
    emojis: ['👋', '😊', '🤝', '🙏', '👍', '👌', '🙌', '🌟', '🎉', '😃', '💪', '🔥', '🤩', '🫡', '❤️', '💡', '😎', '☀️'],
  }
];

export const QUICK_EMOJIS = [
  '✈️', '👉', '🌍', '🚀', '📞', '📍', '⭐', '🔥', '💬', '🌴', '🕌', '🕋', '✅', '🤝', '💰', '🦷', '🏥', '💎', '🏆', '✨', '👍', '💡', '📲', '🇩🇿'
];

export const QUICK_SNIPPETS = [
  {
    label: '🔗 Lien Prototype',
    text: '👉 https://parfait-voyage.vercel.app/',
  },
  {
    label: '📑 Lien Flyer',
    text: '👉 https://flyer-parfait-voyage.vercel.app/',
  },
  {
    label: '✈️ 3 Formules',
    text: '✈️ One-Page : idéale pour l\'Omra et le Sud\n✈️ Agence Pro : site complet + tableau de bord\n✈️ Sur-mesure : plateforme complète avec réservation',
  },
  {
    label: '👋 Salutation',
    text: 'Salam alaykoum,\n\n',
  },
];

/**
 * Cleans and converts an Algerian or international phone number into a valid WhatsApp format (E.164 without '+')
 * Examples:
 * "0559 31 60 54" -> "213559316054"
 * "0771-64-41-31" -> "213771644131"
 * "0674 07 53 72" -> "213674075372"
 * "+213 559 31 60 54" -> "213559316054"
 * "00213550123456" -> "213550123456"
 * "038 86 13 52" -> "21338861352"
 */
export function formatPhoneForWhatsApp(rawPhone?: string): string | null {
  if (!rawPhone) return null;
  const cleaned = rawPhone.replace(/\D/g, '');
  if (!cleaned) return null;

  // Already prefixed with 00213
  if (cleaned.startsWith('00213')) {
    return cleaned.slice(2);
  }
  // Already prefixed with 213 (Algeria international)
  if (cleaned.startsWith('213') && cleaned.length >= 11) {
    return cleaned;
  }

  // Local Algerian number starting with 0 (mobile 05/06/07 or landline 02/03/04)
  if (cleaned.startsWith('0') && cleaned.length >= 9) {
    return `213${cleaned.slice(1)}`;
  }

  // 9-digit Algerian number without leading 0
  if (cleaned.length === 9 && ['5', '6', '7', '2', '3', '4'].includes(cleaned[0])) {
    return `213${cleaned}`;
  }

  // Fallback for valid international numbers (> 9 digits)
  if (cleaned.length >= 9) {
    return cleaned;
  }

  return cleaned;
}

export function isValidWhatsAppPhone(phone?: string): boolean {
  if (!phone) return false;
  const formatted = formatPhoneForWhatsApp(phone);
  return Boolean(formatted && formatted.length >= 9);
}

export function buildWhatsAppUrl(phone?: string, message?: string): string {
  const cleanPhone = formatPhoneForWhatsApp(phone) || '';
  const text = message || TRAVEL_AGENCY_PROTOTYPE_MESSAGE;
  const encodedText = encodeURIComponent(text);

  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

export function openWhatsAppDirect(phone?: string, message?: string): boolean {
  if (typeof window === 'undefined') return false;
  const url = buildWhatsAppUrl(phone, message);
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

export interface AiToneOption {
  id: 'ultra_persuasive' | 'short_punchy' | 'relational' | 'darija_pro';
  label: string;
  icon: string;
  desc: string;
}

export const AI_TONE_OPTIONS: AiToneOption[] = [
  {
    id: 'ultra_persuasive',
    label: 'Ultra-Persuasif',
    icon: '🌟',
    desc: 'Pitch complet, argumenté avec prototype et 3 formules',
  },
  {
    id: 'short_punchy',
    label: 'Court & Percutant',
    icon: '⚡',
    desc: 'Rapide, direct 3-4 lignes avec liens & emojis',
  },
  {
    id: 'relational',
    label: 'Suite d\'Appel',
    icon: '🤝',
    desc: 'Remerciement chaleureux suite à échange téléphonique',
  },
  {
    id: 'darija_pro',
    label: 'Darija Pro',
    icon: '🇩🇿',
    desc: 'Message en darija algérienne professionnelle',
  },
];

export interface FollowUpAiContext {
  step?: number;
  reaction?: string;
  verbatim?: string;
  language?: 'fr' | 'darija';
  delayDays?: number;
}

export async function generateWhatsAppAiMessage(
  prospect: any,
  tone: string = 'ultra_persuasive',
  customInstructions?: string,
  prototype?: { name?: string; prototypeUrl?: string; flyerUrl?: string; description?: string; sector?: string },
  followUpContext?: FollowUpAiContext
): Promise<string> {
  try {
    const res = await fetch('/api/ai/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prospect,
        tone: followUpContext?.language === 'darija' ? 'darija_pro' : tone,
        customInstructions,
        targetSector: prototype?.sector,
        prototypeName: prototype?.name,
        prototypeUrl: prototype?.prototypeUrl,
        flyerUrl: prototype?.flyerUrl,
        prototypeDescription: prototype?.description,
        step: followUpContext?.step,
        reaction: followUpContext?.reaction,
        verbatim: followUpContext?.verbatim,
        language: followUpContext?.language,
        delayDays: followUpContext?.delayDays,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.message) {
        return data.message;
      }
    }
  } catch (err) {
    console.warn('[WhatsApp AI Client] API request failed, using local generation fallback', err);
  }

  // Local fallback if API is unavailable
  const contact = prospect?.name ? ` ${prospect.name}` : '';
  const comp = prospect?.company || 'votre établissement';
  const city = prospect?.city ? ` à ${prospect.city}` : '';
  const activeProtoUrl = prototype?.prototypeUrl || 'https://parfait-voyage.vercel.app/';
  const activeFlyerUrl = prototype?.flyerUrl || 'https://flyer-parfait-voyage.vercel.app/';
  const delay = followUpContext?.delayDays ?? 0;
  const isDarija = followUpContext?.language === 'darija';

  // 14+ days Breakup hook fallback
  if (delay >= 14 && !followUpContext?.reaction) {
    if (isDarija) {
      return `Salam alaykoum${contact} ! 🇩🇿✨\n\nخويا${contact}، راني شفت بلي جازو سيمانتين ملي بعثنا لو سيت بروتوتيب لوكالة ${comp}${city} :\n👉 ${activeProtoUrl}\n\nعلابالي بلي الخدمة تدي كامل وقتكم والواحد ما يقعدش.\n\nحبيت برك نسقسيك قبل ما نقفلو الدوسي ونشوفو مع وكالة ثانية في جهتكم : قولي بصراحة، اسكو المشروع مازالو يهمكم هاد الفترة ولا نلغيوه ويبقى الاتصال بيناتنا للمستقبل ؟ 🤝🇩🇿`;
    }
    return `Salam alaykoum${contact} ! 🇩🇿✨\n\nÇa fait maintenant plus de 2 semaines que je vous ai transmis la démo de la plateforme pour ${comp}${city} :\n👉 ${activeProtoUrl}\n\nJ'imagine que le quotidien a pris le dessus ou que le timing n'est pas idéal en ce moment.\n\nAvant que je n'archive votre dossier pour attribuer la priorité à une autre agence sur votre secteur, dites-moi simplement : est-ce que le projet est toujours d'actualité pour vous, ou préfère-t-on mettre cela de côté ? 🤝🌍`;
  }

  // 7-13 days 1-week mark fallback
  if (delay >= 7 && !followUpContext?.reaction) {
    if (isDarija) {
      return `Salam alaykoum${contact} ! 🇩🇿💼\n\nجاز سمانة ملي تكلمنا وبعثنالكم لو سيت بروتوتيب لوكالة ${comp}${city} :\n👉 ${activeProtoUrl}\n\nكيما علابالك الموسم راهو قريب ورانا نحددو فالوكالات الشريكة في منطقتكم بالعرض الترويجي قبل ما نغلقو التسجيلات :\n📑 👉 ${activeFlyerUrl}\n\nحبيت برك نعرف اسكو راكم حابين تطلقو لو سيت تاعكم هاد الفترة قبل الزحام ولا مازال ؟ 🤝🇩🇿`;
    }
    return `Salam alaykoum${contact} ! 🇩🇿💼\n\nCela fait une semaine que nous vous avons partagé le prototype conçu pour ${comp}${city} :\n👉 ${activeProtoUrl}\n\nComme la saison approche et que nous finalisons actuellement les agences partenaires sur votre zone avec nos formules de lancement :\n📑 👉 ${activeFlyerUrl}\n\nJe voulais faire le point avec vous : est-ce toujours une priorité pour votre agence d'avoir votre site en ligne avant le rush ? 🤝✨`;
  }

  // 3-6 days Mid-week busy check fallback
  if (delay >= 3 && !followUpContext?.reaction) {
    if (isDarija) {
      return `Salam alaykoum${contact} ! 🇩🇿✈️\n\nعلابالي بلي السيمانة هادي معمرة خدمة عندكم في ${comp}${city}.\n\nباش نسهلوها عليكم، هاوليك لو سيت بروتوتيب لي وجدناه باش تشوفوه في 30 ثانية برك على التيليفون :\n👉 ${activeProtoUrl}\n\nاسكو نقدر نعيطلك غدوة 3 دقائق نوضحلك كيفاش نطلقوه باسمكم في 48 ساعة ؟ 🤝🇩🇿`;
    }
    return `Salam alaykoum${contact} ! 🇩🇿✈️\n\nJe sais que vos journées sont bien chargées en agence cette semaine pour ${comp}${city}.\n\nPour vous faire gagner du temps, voici le lien direct du prototype rapide pour tester en 30 secondes sur smartphone :\n👉 ${activeProtoUrl}\n\nSeriez-vous partant pour un court échange de 3 minutes demain afin de valider si cela correspond à vos objectifs ? 🤝📞`;
  }

  if (followUpContext?.step === 1) {
    if (isDarija) {
      return `Salam alaykoum${contact} ! 🇩🇿✈️\n\nان شاء الله راك مليح خويا. راني نتواصل معاك بخصوص لو سيت بروتوتيب لي وجدناه لوكالة ${comp}${city} :\n👉 ${activeProtoUrl}\n\nاسكو شفتو ولا مازال ما قعدتش ؟ واش رايك فيه ؟ 🤝\n\nرانا هنا باش نساعدوكم ونحطوه باسمكم في 48 ساعة ان شاء الله ✨`;
    }
    return `Salam alaykoum${contact} ! 🇩🇿✈️\n\nJ'espère que vous allez très bien. Je reviens vers vous suite à l'envoi de la démo de la plateforme pour ${comp}${city} :\n👉 ${activeProtoUrl}\n\nAvez-vous eu l'occasion d'y jeter un coup d'œil sur smartphone ? Qu'en avez-vous pensé pour vos clients ? 🤝✨`;
  }

  if (followUpContext?.step === 2) {
    if (followUpContext?.reaction === 'price') {
      return `Salam alaykoum${contact} ! 🇩🇿💼\n\nConcernant votre réflexion pour ${comp}, sachez qu'une seule réservation supplémentaire grâce à la plateforme rembourse déjà la totalité du site pour l'année.\n\nNous avons également la formule One-Page très accessible (ou un règlement échelonné) :\n👉 ${activeFlyerUrl}\n\nSeriez-vous partant pour un court échange de 3 minutes demain afin de trouver la solution adaptée à votre budget ? 🤝✨`;
    }
    return `Salam alaykoum${contact} ! 🇩🇿🤝\n\nJe fais un court suivi concernant la personnalisation de la plateforme pour ${comp}${city}.\n\nComme la saison approche, nous finalisons actuellement les agences partenaires de votre zone avec l'offre de lancement :\n👉 ${activeFlyerUrl}\n\nSeriez-vous disponible pour un appel express de 5 minutes demain afin de valider si cela correspond à vos objectifs ? 🤝📞`;
  }

  if (followUpContext?.step === 3) {
    return `Salam alaykoum${contact} ! 🇩🇿✨\n\nDernier message de ma part pour ne pas vous encombrer. Si vous souhaitez qu'on déploie votre site sous 48h avec vos offres et vos coordonnées pour ${comp}, dites-le-moi simplement d'ici demain soir.\n\nSinon, aucun problème du tout, je garde précieusement votre contact pour vos projets futurs ! Excellente réussite à vous 🌍🤝`;
  }

  if (tone === 'short_punchy') {
    return `Salam alaykoum${contact} ! 🇩🇿⚡\n\nRavi de notre échange pour ${comp}${city} !\n\nVoici le prototype ultra-rapide conçu spécialement pour votre activité :\n👉 ${activeProtoUrl}\n\n100 % accessible même avec une faible connexion 3G/4G. Vos clients réservent sans bug.\n\nConsultez nos 3 formules ici :\n👉 ${activeFlyerUrl}\n\nDites-moi quand vous avez 2 minutes pour en discuter ✈️🌍`;
  }

  if (tone === 'relational') {
    return `Salam alaykoum${contact} ! 🇩🇿🤝\n\nUn grand merci pour la qualité de notre échange téléphonique concernant ${comp} !\n\nComme promis, voici l'accès direct au prototype spécialement pensé pour votre agence :\n👉 ${activeProtoUrl}\n\nEn 48h, toute la plateforme passe à vos couleurs (logo, offres Omra, séjours été, contacts).\n\nDétail des 3 formules :\n👉 ${activeFlyerUrl}\n\nJe reste disponible si vous avez la moindre question 🤝✨`;
  }

  if (tone === 'darija_pro') {
    return `Salam alaykoum${contact} ! 🇩🇿✈️\n\nيعطيكم الصحة على المكالمة بخصوص وكالة ${comp}${city} !\n\nهاوليك لو سيت بروتوتيب لي خدمناه سبيسيالمون لوكالات السياحة والأسفار :\n👉 ${activeProtoUrl}\n\nخفيف بزاف ويفتح بسرعة حتى بالكونيكسيون الضعيفة في الجنوب ولا في أي ولاية.\n\nوهنا تلقاو تفاصيل العروض والأسعار (One-Page، Agence Pro، Sur-mesure) :\n👉 ${activeFlyerUrl}\n\nشوفوه وقولولي واش رايكم ✈️🇩🇿`;
  }

  return TRAVEL_AGENCY_PROTOTYPE_MESSAGE;
}
