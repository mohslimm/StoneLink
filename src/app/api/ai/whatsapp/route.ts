// ─────────────────────────────────────────────────────────────────
// STONELINK — POST /api/ai/whatsapp
// Générateur de Messages WhatsApp Commerciaux Ultra-Personnalisés
// Piloté par Google Gemini Flash avec Cascade de Résilience & Fallback Local
// ─────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callGeminiResilient } from '@/lib/gemini';
import { 
  TRAVEL_AGENCY_PROTOTYPE_MESSAGE, 
  WHATSAPP_TEMPLATES 
} from '@/lib/whatsapp';

export const runtime = 'nodejs';

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

function generateLocalSmartFallback(
  prospect: { company: string; name?: string; sector?: string; city?: string; url?: string; score?: number },
  tone: string
): string {
  const isTravel = (prospect.sector || '').toLowerCase().includes('voyage') || 
                   prospect.company.toLowerCase().includes('voyage') ||
                   prospect.company.toLowerCase().includes('travel') ||
                   prospect.company.toLowerCase().includes('tour');

  const isDental = (prospect.sector || '').toLowerCase().includes('dent') || 
                   (prospect.sector || '').toLowerCase().includes('sant') ||
                   (prospect.sector || '').toLowerCase().includes('médic');

  const cityStr = prospect.city ? ` à ${prospect.city}` : '';
  const contactName = prospect.name ? ` ${prospect.name}` : '';

  if (isTravel) {
    if (tone === 'short_punchy') {
      return `Salam alaykoum${contactName},

Ravi de notre échange pour ${prospect.company}${cityStr} !

Voici le prototype ultra-rapide conçu pour les agences de voyage :
👉 https://parfait-voyage.vercel.app/

Pourquoi c'est puissant : 100 % accessible, même avec une faible connexion 3G/4G dans le Sud ou à Alger. Zéro bug, réservation directe.

Consultez nos 3 formules ici :
👉 https://flyer-parfait-voyage.vercel.app/

Dites-moi quand vous avez 2 minutes pour en discuter ✈️🌍`;
    }

    if (tone === 'relational') {
      return `Salam alaykoum${contactName},

Un grand merci pour la qualité de notre échange téléphonique concernant ${prospect.company} !

Comme promis, voici l'accès direct au prototype spécialement pensé pour votre agence :
👉 https://parfait-voyage.vercel.app/

En 48h, nous pouvons le personnaliser entièrement à votre image (logo, offres Omra, séjours été, contacts).

Vous trouverez également le détail des formules adaptées à votre agence :
👉 https://flyer-parfait-voyage.vercel.app/

Je reste disponible si vous avez la moindre question 🤝✨`;
    }

    if (tone === 'darija_pro') {
      return `Salam alaykoum${contactName},

يعطيكم الصحة على المكالمة بخصوص وكالة ${prospect.company}${cityStr} !

كيما تفاهمنا، هاوليك لو سيت بروتوتيب لي خدمناه سبيسيالمون لوكالات السياحة والأسفار :
👉 https://parfait-voyage.vercel.app/

الحاجة المليحة : خفيف بزاف ويفتح بسرعة حتى بالكونيكسيون الضعيفة في الجنوب ولا في أي ولاية.

وهنا تلقاو تفاصيل العروض والأسعار (One-Page، Agence Pro، Sur-mesure) :
👉 https://flyer-parfait-voyage.vercel.app/

شوفوه وقولولي واش رايكم ✈️🇩🇿`;
    }

    return TRAVEL_AGENCY_PROTOTYPE_MESSAGE;
  }

  if (isDental) {
    return `Salam alaykoum${contactName},

Ravi de notre échange pour ${prospect.company}${cityStr} !

Comme convenu, voici le prototype de plateforme conçu spécialement pour les cabinets et cliniques dentaires d'excellence :
👉 https://zekri-clinic.vercel.app/

Une vitrine moderne, rassurante et ultra-rapide permettant à vos patients de découvrir vos actes et de réserver leur consultation en toute simplicité.

Nous adaptons l'ensemble de la charte et vos spécialités sous 48h.

Je reste à votre entière disposition 🦷✨`;
  }

  return `Salam alaykoum${contactName},

Ravi de notre échange concernant ${prospect.company}${cityStr} !

Comme promis, voici le lien de votre prototype sur-mesure à haute conversion :
👉 https://parfait-voyage.vercel.app/

Une vitrine ultra-rapide conçue pour convertir vos visiteurs en clients fidèles sans aucune perte de trafic.

Je reste à votre disposition pour personnaliser la plateforme à vos couleurs 🚀🤝`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = WhatsAppAiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { prospect, tone, customInstructions, targetSector } = parsed.data;
    const hasSite = hasValidWebsite(prospect.url);
    const sector = targetSector || prospect.sector || 'Professionnel';

    const isTravel = sector.toLowerCase().includes('voyage') || 
                     prospect.company.toLowerCase().includes('voyage') ||
                     prospect.company.toLowerCase().includes('travel') ||
                     prospect.company.toLowerCase().includes('tour');

    const isDental = sector.toLowerCase().includes('dent') || 
                     sector.toLowerCase().includes('sant') ||
                     sector.toLowerCase().includes('médic');

    const prompt = `Tu es le Copywriter d'élite et l'expert en prospection WhatsApp B2B de Stepping Stones Agency.
Tu rédiges un message WhatsApp professionnel, percutant et élégant pour Mohamed Slimani.

PROSPECT :
- Nom Entreprise : ${prospect.company}
- Contact / Responsable : ${prospect.name || 'Responsable'}
- Secteur d'activité : ${sector}
- Ville / Wilaya : ${prospect.city || 'Algérie'}
- Présence Web : ${hasSite ? `Site existant (${prospect.url}) avec score Lighthouse ${prospect.score || 40}/100` : 'Aucun site internet officiel'}
- Notes prospect : ${prospect.notes || 'Aucune'}

INSTRUCTIONS SPÉCIFIQUES :
- Tonalité demandée : ${tone} (ultra_persuasive = argumenté & structuré, short_punchy = court direct 4-5 lignes max, relational = chaleureux suite d'appel, darija_pro = darija algérienne professionnelle)
- Consignes additionnelles : ${customInstructions || 'Mettre en valeur l\'accessibilité 100%, la rapidité sans bug et l\'adaptation en 48h'}

LIENS OBLIGATOIRES À INTÉGRER :
${isTravel 
  ? `1. Prototype Démo Agence : 👉 https://parfait-voyage.vercel.app/\n2. Flyer Tarifs & 3 Formules : 👉 https://flyer-parfait-voyage.vercel.app/`
  : isDental 
  ? `1. Prototype Démo Dentaire : 👉 https://zekri-clinic.vercel.app/`
  : `1. Prototype Démo : 👉 https://parfait-voyage.vercel.app/`
}

RÈGLES D'OR DE RÉDACTION WHATSAPP :
1. Reste ultra-naturel, professionnel, valorisant pour l'entreprise du prospect.
2. Inclus des emojis pertinents (✈️, 👉, 🌍, 📍, ⭐, ✅, 🤝, 💰, 🏆, ✨, 🇩🇿) bien espacés pour une lisibilité parfaite sur smartphone (pas d'empilement excessif).
3. Aère avec des sauts de ligne clairs entre chaque paragraphe.
4. Pas de jargon complexe. Focalise sur le ROI, la rapidité et la facilité pour ses clients.
5. Réponds UNIQUEMENT avec le texte brut du message prêt à être envoyé sur WhatsApp. Aucun préambule, aucune explication, pas de balises markdown type \`\`\`.`;

    try {
      const geminiRes = await callGeminiResilient({
        prompt,
        preferredModel: 'gemini-3.8-flash',
        purpose: 'general',
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 650,
        },
      });

      const cleanMessage = geminiRes.text.replace(/```(?:markdown|text)?/gi, '').replace(/```/g, '').trim();

      return NextResponse.json({
        success: true,
        message: cleanMessage,
        source: geminiRes.modelUsed,
        fallbackUsed: geminiRes.fallbackUsed,
        latencyMs: geminiRes.latencyMs,
      });
    } catch (aiError) {
      console.warn('[WhatsApp AI Engine] AI Model fallback triggered:', aiError);
      // Seamless local smart fallback
      const fallbackMessage = generateLocalSmartFallback(prospect, tone);
      return NextResponse.json({
        success: true,
        message: fallbackMessage,
        source: 'smart_fallback_engine',
        fallbackUsed: true,
      });
    }
  } catch (error: any) {
    console.error('[WhatsApp AI Route Error]:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de la génération', details: error?.message },
      { status: 500 }
    );
  }
}
