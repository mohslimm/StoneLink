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
