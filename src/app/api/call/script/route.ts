// ─────────────────────────────────────────────────────────────────
// STONELINK — POST /api/call/script
// Génère un script d'appel commercial personnalisé via Google Gemini Flash
// Gestion intelligente : "Avec Site Web" vs "Sans Site Web (Google Maps)"
// ─────────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { callGeminiResilient } from '@/lib/gemini';
import type { CallScript, ScriptStep, ObjectionHandler, CloseScript } from '@/types/pipeline';

// ─── Validation Schema ────────────────────────────────────────────

const ScriptRequestSchema = z.object({
  prospectId:      z.string().min(1),
  companyName:     z.string().min(1),
  contactName:     z.string(),
  niche:           z.string().min(1),
  city:            z.string(),
  country:         z.string(),
  lighthouseScore: z.number().min(0).max(100).optional(),
  estimatedLoss:   z.number().optional(),
  website:         z.string().optional(),
  phone:           z.string().optional(),
});

type ScriptRequest = z.infer<typeof ScriptRequestSchema>;

// ─── Fallback Script Generator (Infaillible) ──────────────────────

function buildDeterministicFallback(req: ScriptRequest): CallScript {
  const prenom = req.contactName.trim() ? (req.contactName.trim().split(' ')[0] ?? req.contactName) : "Responsable";
  const hasWebsite = !!req.website && !req.website.toLowerCase().includes('pas de site') && req.website.trim().length > 3;
  const score = req.lighthouseScore ?? 42;
  const locationText = req.city.trim() ? `à ${req.city.trim()}` : "dans votre région";

  if (!hasWebsite) {
    // ─── SCENARIO SANS SITE WEB (Reputation Maps & Visibilité) ────
    return {
      niche: req.niche as CallScript['niche'],
      prospectName: prenom,
      companyName: req.companyName,
      lighthouseScore: 0,
      estimatedLoss: 0,
      steps: [
        {
          id: 1,
          phase: 'opener',
          label: 'Ouverture Google Maps',
          script: `Bonjour ${prenom}, je suis Abdelhadi de Stepping Stones Agency. J'ai vu votre excellente réputation et vos avis élogieux sur Google Maps pour ${req.companyName}. Cependant, en cherchant votre site internet officiel pour consulter vos offres, impossible de le trouver. Vous avez 2 minutes ?`,
          tip: 'Ton chaleureux et élogieux. Pause après la question.',
          durationTarget: 20,
        },
        {
          id: 2,
          phase: 'audit_reveal',
          label: 'Constat d\'Invisibilité',
          script: `Aujourd'hui, quand des clients à fort pouvoir d'achat recherchent vos prestations ${locationText} et ne trouvent pas de site officiel, ils pensent souvent que l'établissement est fermé ou peu moderne, et ils cliquent directement sur un concurrent qui a une vitrine en ligne. Vous perdez des clients prêts à payer chaque semaine.`,
          tip: 'Mettre le doigt sur le manque à gagner sans accuser le prospect.',
          durationTarget: 40,
        },
        {
          id: 3,
          phase: 'pitch',
          label: 'Vitrine Clé en Main',
          script: `La bonne nouvelle, c'est que nous avons déjà modélisé une vitrine digitale moderne spécialement conçue pour ${req.companyName}, pensée pour capturer les appels immédiatement et asseoir votre autorité n°1 dans votre ville. Je peux vous l'envoyer gratuitement par email aujourd'hui pour que vous la voyiez.`,
          tip: 'Insister sur "gratuit", "déjà modélisé" et "sans engagement".',
          durationTarget: 45,
        },
        {
          id: 4,
          phase: 'social_proof',
          label: 'Preuve Sociale',
          script: `Nous avons récemment digitalisé un professionnel de votre secteur qui n'avait qu'une page sur les réseaux. Dès le premier mois de mise en ligne, ses demandes de rendez-vous qualifiés ont doublé.`,
          tip: 'Démontrer que le site attire des clients plus rentables que les réseaux.',
          durationTarget: 35,
        },
        {
          id: 5,
          phase: 'transition',
          label: 'Transmission Maquette',
          script: `Pour vous faire parvenir l'accès à votre maquette aujourd'hui, sur quelle adresse email professionnelle puis-je vous l'adresser ?`,
          tip: 'Accord implicite : demander directement l\'adresse email.',
          durationTarget: 25,
        },
        {
          id: 6,
          phase: 'close',
          label: 'Clôture & RDV',
          script: `C'est noté ${prenom}. Je vous transmets le lien dans les 15 minutes. Je vous propose un point rapide de 5 minutes demain après-midi pour avoir votre ressenti. 14h vous convient ?`,
          tip: 'Technique de l\'agenda : verrouiller le créneau.',
          durationTarget: 30,
        },
      ],
      objections: [
        {
          trigger: 'facebook',
          label: 'Une page Facebook / Instagram me suffit',
          response: `Je comprends tout à fait, les réseaux sont utiles pour poster des photos. Mais quand un client a un besoin urgent et solvable, il ne va pas chercher sur Instagram, il tape sur Google. S'il n'y a pas de site officiel avec vos coordonnées nettes, il va chez le concurrent immédiat.`,
          pivot: 'Voulez-vous qu\'on regarde comment capter ces recherches Google avec la maquette ?',
        },
        {
          trigger: 'bouche_a_oreille',
          label: 'Le bouche-à-oreille me suffit',
          response: `C'est une grande force, et c'est la preuve de votre savoir-faire. Mais aujourd'hui, même quand un ami vous recommande, la première chose que fait le client est de taper votre nom sur son smartphone pour voir où vous êtes et ce que vous faites. S'il ne trouve rien, il hésite.`,
          pivot: 'La maquette renforce précisément ce bouche-à-oreille. Je vous l\'envoie pour voir ?',
        },
        {
          trigger: 'pas_temps',
          label: 'Pas le temps de gérer un site web',
          response: `C'est exactement pour ça qu'on a créé notre formule : vous n'avez absolument rien à gérer. Le site est 100% autonome, hébergé, sécurisé et optimisé pour que votre téléphone sonne sans que vous n'ayez à toucher à une seule ligne de code.`,
          pivot: 'Cela ne vous demandera que 5 minutes pour valider la maquette qu\'on a préparée.',
        },
        {
          trigger: 'prix',
          label: 'Combien ça coûte ? / Trop cher',
          response: `Nous préparons une proposition chiffrée détaillée sur-mesure que je vous envoie directement en PDF sur WhatsApp juste après notre échange. Comme ça vous avez le détail exact des prestations sans mauvaise surprise. Jetons d'abord un œil à la maquette gratuite pour voir si cela correspond à vos besoins.`,
          pivot: 'Sur quel numéro WhatsApp puis-je vous transmettre ce devis PDF chiffré ?',
        },
        {
          trigger: 'rappeler',
          label: 'Rappelez-moi plus tard',
          response: `Avec plaisir. Je vous transmets la maquette maintenant pour que vous puissiez l'ouvrir tranquillement à votre rythme ce soir.`,
          pivot: 'Je vous rappelle jeudi matin à 10h pour un échange rapide ?',
        },
      ],
      closes: [
        { id: 1, type: 'soft', script: `Je vous envoie le lien par mail, vous jetez un œil quand vous avez 2 minutes.` },
        { id: 2, type: 'assumptive', script: `Je vous bloque un créneau demain à 14h pour faire le point sur la maquette.` },
      ],
      generatedAt: new Date(),
    };
  }

  // ─── SCENARIO AVEC SITE WEB (Audit Lighthouse & Refonte) ──────────
  return {
    niche: req.niche as CallScript['niche'],
    prospectName: prenom,
    companyName: req.companyName,
    lighthouseScore: score,
    estimatedLoss: req.estimatedLoss ?? 0,
    steps: [
      {
        id: 1,
        phase: 'opener',
        label: 'Ouverture',
        script: `Bonjour ${prenom}, je suis Abdelhadi de Stepping Stones Agency. Je vous contacte car j'ai analysé le site de ${req.companyName} ce matin et j'ai relevé des points techniques critiques qui affectent directement vos conversions. Vous avez 2 minutes ?`,
        tip: 'Ton professionnel, direct et factuel. Laisser un blanc après la question.',
        durationTarget: 20,
      },
      {
        id: 2,
        phase: 'audit_reveal',
        label: 'Révélation Audit',
        script: `J'ai passé votre site dans nos audits de performance Google : votre score n'est que de ${score}/100. Cela signifie qu'une part importante de vos visiteurs sur mobile quitte la page par lenteur ou manque de clarté avant même de vous appeler.`,
        tip: 'Laisser un silence après l\'annonce du score.',
        durationTarget: 40,
      },
      {
        id: 3,
        phase: 'pitch',
        label: 'La Solution',
        script: `Nous avons conçu un modèle modernisé, ultra-rapide et taillé pour convertir vos visiteurs en clients payants. On peut vous montrer gratuitement à quoi ressemblerait votre nouveau site avec votre identité visuelle.`,
        tip: 'Mettre l\'accent sur le gain de clients concrets.',
        durationTarget: 45,
      },
      {
        id: 4,
        phase: 'social_proof',
        label: 'Preuve Sociale',
        script: `Sur une refonte similaire effectuée pour un confrère ${locationText}, le volume d'appels entrants a grimpé de 45% en moins de 6 semaines grâce à l'optimisation mobile.`,
        tip: 'Chiffre concret et crédible.',
        durationTarget: 35,
      },
      {
        id: 5,
        phase: 'transition',
        label: 'Transition',
        script: `Pour vous faire parvenir le prototype personnalisé dans l'heure, confirmez-moi simplement votre adresse email professionnelle ?`,
        tip: 'Passer à l\'action naturellement.',
        durationTarget: 25,
      },
      {
        id: 6,
        phase: 'close',
        label: 'Clôture & RDV',
        script: `Parfait ${prenom}. Je vous envoie l'accès dès maintenant. On se cale un bref appel de 5 minutes demain à 14h pour avoir votre avis ?`,
        tip: 'Proposer un horaire ferme.',
        durationTarget: 30,
      },
    ],
    objections: [
      {
        trigger: 'prix',
        label: 'Combien ça coûte ? / Trop cher',
        response: `Nous préparons une proposition chiffrée détaillée sur-mesure que je vous envoie directement en PDF sur WhatsApp juste après notre échange. Comme ça vous avez le détail exact des prestations sans mauvaise surprise. L'important aujourd'hui est d'évaluer le gain de clients concrets avec notre maquette gratuite.`,
        pivot: 'Sur quel numéro WhatsApp puis-je vous transmettre ce devis PDF chiffré ?',
      },
      {
        trigger: 'prestataire',
        label: 'J\'ai déjà un prestataire',
        response: `C'est une bonne chose d'avoir un partenaire technique. Cependant, votre score de ${score}/100 montre des fuites évidentes. Notre prototype gratuit vous donne une base d'évaluation sans aucun engagement.`,
        pivot: 'Je vous le partage simplement comme point de comparaison ?',
      },
      {
        trigger: 'satisfait',
        label: 'Mon site me convient actuellement',
        response: `Être satisfait de l'esthétique est une chose, mais la performance technique en est une autre. Si 40% des visiteurs sur mobile quittent le site avant le chargement complet, c'est du chiffre d'affaires laissé à la concurrence.`,
        pivot: 'Prenez 2 minutes pour voir la fluidité de la maquette optimisée.',
      },
    ],
    closes: [
      { id: 1, type: 'soft', script: `Je vous envoie le prototype pour que vous puissiez comparer.` },
      { id: 2, type: 'assumptive', script: `Je bloque mercredi à 10h pour en reparler 5 minutes.` },
    ],
    generatedAt: new Date(),
  };
}

// ─── Gemini 3.8 Flash Generation ──────────────────────────────────

async function generateWithGemini(req: ScriptRequest) {
  const prenom = req.contactName.trim() ? (req.contactName.trim().split(' ')[0] ?? req.contactName) : "Responsable";
  const hasWebsite = !!req.website && !req.website.toLowerCase().includes('pas de site') && req.website.trim().length > 3;
  const score = req.lighthouseScore ?? 42;
  const locationText = req.city.trim() ? `à ${req.city.trim()}` : "dans votre région";

  const prompt = `Tu es un directeur commercial d'élite pour une agence de développement web et systèmes digitaux de prestige (Stepping Stones Agency, co-fondée par Mohamed Slimani & Abdelhadi Hammaz).
Génère un script d'appel téléphonique B2B percutant, ultra-personnalisé et naturel en français, avec adaptation stricte au statut web du prospect :

DONNÉES DU PROSPECT :
- Entreprise : ${req.companyName}
- Interlocuteur : ${prenom}
- Secteur d'activité : ${req.niche}
- Localisation : ${locationText} (${req.country || 'Algérie'})
- Présence web : ${hasWebsite ? `Site web existant : ${req.website} (Score technique Google : ${score}/100)` : 'AUCUN SITE WEB (Présent uniquement sur Google Maps avec des avis clients)'}

CONSIGNES STRICTES :
${hasWebsite
  ? `Angle : Audit technique, lenteur mobile, score Lighthouse ${score}/100, perte de prospects vers les concurrents optimisés, proposition d'une maquette refondue gratuite livrable aujourd'hui.`
  : `Angle : Félicitations pour la réputation et les avis Google Maps, alerte sur l'invisibilité digitale (les clients qui cherchent sur Google ne trouvent aucun site officiel et vont chez les concurrents), proposition d'une vitrine moderne clé en main livrée aujourd'hui.`
}

RÈGLE D'OR TARIFAIRE ABSOLUE :
Tu ne dois JAMAIS donner de montant ou de prix brut par téléphone. Si le prospect demande "combien ça coûte ?", le script et les réponses d'objection doivent TOUJOURS pivoter sur le fait qu'une proposition chiffrée détaillée et personnalisée lui sera envoyée immédiatement en document PDF sur WhatsApp juste après l'appel.

Retourne UNIQUEMENT un objet JSON valide avec cette structure exacte :
{
  "steps": [
    { "id": 1, "phase": "opener", "label": "${hasWebsite ? 'Ouverture Audit' : 'Ouverture Google Maps'}", "script": "...", "tip": "...", "durationTarget": 20 },
    { "id": 2, "phase": "audit_reveal", "label": "${hasWebsite ? 'Révélation Audit' : 'Constat d\'Invisibilité'}", "script": "...", "tip": "...", "durationTarget": 40 },
    { "id": 3, "phase": "pitch", "label": "${hasWebsite ? 'La Solution Refonte' : 'Vitrine Clé en Main'}", "script": "...", "tip": "...", "durationTarget": 45 },
    { "id": 4, "phase": "social_proof", "label": "Preuve Sociale", "script": "...", "tip": "...", "durationTarget": 35 },
    { "id": 5, "phase": "transition", "label": "Transmission Maquette", "script": "...", "tip": "...", "durationTarget": 25 },
    { "id": 6, "phase": "close", "label": "Clôture & RDV", "script": "...", "tip": "...", "durationTarget": 30 }
  ],
  "objections": [
    { "trigger": "prix", "label": "Combien ça coûte ? / Trop cher", "response": "...", "pivot": "..." },
    { "trigger": "${hasWebsite ? 'prestataire' : 'facebook'}", "label": "${hasWebsite ? 'J\'ai déjà quelqu\'un' : 'Une page Facebook me suffit'}", "response": "...", "pivot": "..." },
    { "trigger": "${hasWebsite ? 'satisfait' : 'bouche_a_oreille'}", "label": "${hasWebsite ? 'Mon site actuel me suffit' : 'Le bouche-à-oreille me suffit'}", "response": "...", "pivot": "..." },
    { "trigger": "pas_temps", "label": "Pas le temps de gérer un site", "response": "...", "pivot": "..." },
    { "trigger": "rappeler", "label": "Rappelez-moi plus tard", "response": "...", "pivot": "..." }
  ]
}`;

  const geminiRes = await callGeminiResilient({
    prompt,
    preferredModel: 'gemini-flash-latest',
    purpose: 'calls',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.4,
    },
  });

  const sanitizedJson = geminiRes.text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(sanitizedJson);
  return parsed;
}

// ─── Route Handler ────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ScriptRequestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Paramètres invalides', details: parsed.error.flatten() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let scriptData: any = null;

    try {
      scriptData = await generateWithGemini(parsed.data);
    } catch (geminiError: any) {
      console.warn('[Gemini 3.8 Flash] Fallback to deterministic script engine:', geminiError.message);
      scriptData = buildDeterministicFallback(parsed.data);
    }

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(scriptData)}\n\n`));
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
