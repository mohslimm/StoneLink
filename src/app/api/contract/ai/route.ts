import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { callGeminiResilient } from '@/lib/gemini';

export const runtime = 'nodejs';

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
  try {
    const body = await req.json();
    const {
      client,
      prospect,
      project,
      pricing,
      customInstructions = '',
      language = 'fr'
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    const hasWebsite = prospect ? hasValidWebsite(prospect.url) : false;

    // Deterministic fallback generator if no API key or on error
    const buildFallbackResponse = () => {
      const company = client?.company || 'Client';
      const sector = client?.activity || prospect?.sector || 'Commerce / Service';
      const isNoWeb = !hasWebsite;

      return {
        success: true,
        source: 'deterministic_engine',
        projectTitle: isNoWeb 
          ? `Plateforme Digitale Clé en Main & Acquisition Locale — ${company}`
          : `Refonte Haute Performance & Architecture Web — ${company}`,
        executiveSummary: isNoWeb
          ? `Ce projet d'ingénierie vise à doter ${company} (${sector}) d'une présence numérique souveraine et d'un canal d'acquisition direct. En l'absence de vitrine web actuelle, ce déploiement permettra de capter la patientèle/clientèle locale issue de Google Maps et de convertir les requêtes mobiles en chiffre d'affaires immédiat.`
          : `Ce projet a pour objectif la refonte intégrale de l'écosystème numérique de ${company}. L'intervention vise à éliminer les goulots d'étranglement techniques actuels, sécuriser l'infrastructure et hisser le score d'audit Google Lighthouse au-dessus de 90/100 afin de maximiser le taux de conversion commercial.`,
        tailoredScope: [
          {
            category: "Architecture & Socle Technique",
            label: isNoWeb ? "Développement Vitrine Next.js 15 & Tailwind" : "Refonte Full-Stack Next.js 15 & Optimisation Core Web Vitals",
            deliverables: [
              "Architecture moderne sur Next.js 15 avec rendu ultra-rapide (SSR/SSG)",
              "Optimisation mobile irréprochable avec score Google Lighthouse garanti ≥ 90",
              "Certificat SSL Let's Encrypt et protocoles HTTPS renforcés"
            ]
          },
          {
            category: "Acquisition & Conversion",
            label: isNoWeb ? "Intégration Google Maps & WhatsApp Instantané" : "SEO Technique, Métadonnées & Taux de Rebond",
            deliverables: [
              "Synchronisation de la fiche Google Business Profile et avis clients",
              "Bouton d'action directe WhatsApp et formulaire de contact sécurisé",
              "Intégration d'un outil d'analyse d'audience respectueux de la confidentialité"
            ]
          },
          {
            category: "Déploiement & Garantie",
            label: "Livraison Clé en Main & Support",
            deliverables: [
              `Déploiement sur infrastructure Cloud haute disponibilité`,
              `Garantie technique intégrale de ${project?.warrantyDays || 30} jours après livraison`,
              "Transfert complet de propriété des accès et du code source"
            ]
          }
        ],
        specialClauses: [
          {
            title: "Garantie de Performance Technique (Lighthouse ≥ 90)",
            textFr: "Le Prestataire s'engage formellement à livrer une solution atteignant un score d'audit Google Lighthouse supérieur ou égal à 90/100 sur mobile et desktop.",
            textEn: "The Service Provider formally commits to delivering an implementation achieving a Google Lighthouse score equal to or exceeding 90/100.",
            textAr: "يلتزم مقدم الخدمة رسمياً بتسليم نظام رقمي يحقق تقييماً لا يقل عن 90/100 في معايير Google Lighthouse للأداء والسرعة."
          },
          {
            title: "Transfert de Propriété & Souveraineté",
            textFr: "Dès l'acquittement intégral du solde facturé, le Client devient propriétaire exclusif du code source développé et des accès d'administration.",
            textEn: "Upon complete settlement of the invoice balance, the Client gains full and exclusive ownership of the source code and production credentials.",
            textAr: "فور سداد كامل المبلغ المستحق، تنتقل الملكية الحصرية والكاملة للكود المصدري وبيانات الاعتماد إلى العميل مباشرة."
          },
          {
            title: "Délai de Fourniture des Éléments par le Client",
            textFr: "Le Client s'engage à fournir l'ensemble des éléments textuels, logos et visuels sous 10 jours ouvrés pour garantir le calendrier de livraison.",
            textEn: "The Client undertakes to provide all textual assets, logos, and branding elements within 10 business days.",
            textAr: "يلتزم العميل بتزويد الفريق التقني بجميع النصوص والشعارات والصور اللازمة في غضون 10 أيام عمل لضمان سرعة الإنجاز."
          }
        ],
        closingPitch: `Bonjour ${client?.name || ''}, suite à notre échange, voici notre proposition sur-mesure pour propulser ${company}. Nous avons verrouillé l'offre clé en main à ${pricing?.totalDA?.toLocaleString() || '150 000'} DA avec une garantie de livraison sous ${project?.timeline || '2 semaines'}. Le contrat complet est prêt pour validation.`
      };
    };

    if (!apiKey) {
      console.warn("GEMINI_API_KEY non configurée dans .env.local, utilisation du moteur contractuel déterministe.");
      return NextResponse.json(buildFallbackResponse());
    }

    const systemPrompt = `Tu es un Ingénieur d'Affaires et Architecte Logiciel Senior chez "Stepping Stones Agency" (fondée par Mohamed Slimani & Abdelhadi Hammaz).
Ta mission est de rédiger les éléments juridiques et techniques sur-mesure pour un contrat de prestation de développement web et logiciel B2B.

Profil du Client :
- Entreprise : ${client?.company || 'Non renseigné'}
- Interlocuteur : ${client?.name || 'Responsable'}
- Activité / Niche : ${client?.activity || prospect?.sector || 'Entreprise B2B'}
- Localisation : ${client?.country || 'Algérie'}
- Téléphone : ${client?.phone || 'N/A'}
- Statut Site Web : ${hasWebsite ? `Site existant (${prospect?.url}) avec score audit : ${prospect?.score || 50}/100` : 'AUCUN SITE WEB EXISTANT (Cible clé en main)'}
- Notes d'audit / Faiblesses : ${prospect?.notes || 'Non renseigné'}

Paramètres du Projet :
- Base : ${project?.base || 'vitrine'}
- Modules choisis : ${(project?.modules || []).join(', ')}
- Délai : ${project?.timeline || '2 semaines'}
- Garantie : ${project?.warrantyDays || 30} jours
- Montant Total : ${pricing?.totalDA?.toLocaleString() || '0'} DA (${pricing?.currency || 'DA'})
- Tranches : ${pricing?.tranchesSplit || 2} tranches

Instructions Spécifiques de l'utilisateur :
"${customInstructions || 'Aucune consigne particulière'}"

Règles de Rédaction :
1. Si le prospect n'a PAS de site web :
   - Le contrat doit valoriser la création ex-nihilo, la synchronisation avec sa fiche Google Maps (forte réputation locale), la capture de prospects via mobile et WhatsApp, et la livraison clé en main.
2. Si le prospect A DÉJÀ un site web :
   - Le contrat doit cibler la refonte technique, la correction des faiblesses détectées (SSL manquant, lenteurs LCP, SEO local dégradé), avec une obligation de résultat sur la performance (Lighthouse ≥ 90).
3. Ton de "Quiet Luxury" : Professionnel, juridique, précis, technique sans jargon obscur.

Réponds STRICTEMENT avec un objet JSON valide (aucun bloc markdown, aucun texte avant ou après) respectant cette structure exacte :
{
  "projectTitle": "string (Titre percutant et valorisant du projet)",
  "executiveSummary": "string (1 à 2 paragraphes d'introduction stratégique expliquant pourquoi ce projet est indispensable et hautement rentable pour le client)",
  "tailoredScope": [
    {
      "category": "string (ex: Architecture & Frontend)",
      "label": "string",
      "deliverables": ["string (détail technique 1)", "string (détail technique 2)", "string (détail technique 3)"]
    }
  ],
  "specialClauses": [
    {
      "title": "string (ex: Garantie de Performance)",
      "textFr": "string (Clause juridique formelle en Français)",
      "textEn": "string (Clause juridique en Anglais)",
      "textAr": "string (Clause juridique formelle en Arabe)"
    }
  ],
  "closingPitch": "string (Message d'accompagnement direct et percutant de 2-3 phrases prêt à envoyer sur WhatsApp ou par email au client avec le contrat)"
}`;

    const geminiRes = await callGeminiResilient({
      prompt: systemPrompt,
      preferredModel: 'gemini-3.8-flash',
    });
    const rawText = geminiRes.text.trim();

    // Clean JSON response (handling potential markdown code fence)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("JSON invalide reçu de Gemini, fallback activé.");
      return NextResponse.json(buildFallbackResponse());
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      success: true,
      source: geminiRes.modelUsed,
      fallbackUsed: geminiRes.fallbackUsed,
      ...parsedData
    });

  } catch (error: any) {
    console.error('Erreur API Gemini Contrat:', error);
    // Graceful fallback
    return NextResponse.json({
      success: true,
      source: 'fallback_error_recovery',
      projectTitle: "Projet de Développement Web & Ingénierie Logicielle",
      executiveSummary: "Prestation de conception, développement technique et déploiement d'une solution web haute performance réalisée selon les normes Stepping Stones Agency.",
      tailoredScope: [
        {
          category: "Socle Technique",
          label: "Développement Next.js 15 & Core Web Vitals",
          deliverables: [
            "Architecture optimisée mobile & desktop",
            "Certificats de sécurité SSL et cryptage standard",
            "Formulaires et points de contact interactifs"
          ]
        }
      ],
      specialClauses: [
        {
          title: "Garantie Technique et Maintenance",
          textFr: "Le Prestataire garantit le parfait fonctionnement de la solution déployée pendant la durée contractuelle convenue.",
          textEn: "The Service Provider guarantees optimal system stability for the agreed contractual period.",
          textAr: "يضمن مقدم الخدمة استقرار وسلامة النظام التقني طوال المدة المحددة في العقد."
        }
      ],
      closingPitch: "Voici notre proposition technique et commerciale officielle. Nous restons disponibles pour le lancement opérationnel."
    });
  }
}
