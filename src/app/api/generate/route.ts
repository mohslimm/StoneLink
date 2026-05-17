import { NextResponse } from "next/server";

/**
 * High-quality fallback for demonstration stability when credits are low.
 */
function getSimulatedResponse(prospect: any) {
  const isDental = prospect.niche === 'dental';
  const name = prospect.name || "Prospect";
  
  return {
    "siteAdaptation": {
      "colorPrimary": isDental ? "#0ea5e9" : "#c5a059",
      "colorAccent": isDental ? "#0c4a6e" : "#8e6d2f",
      "tagline": isDental 
        ? "L'Excellence Dentaire à la pointe de l'innovation."
        : "L'Art de Voyager, Redéfini par Stepping Stones.",
      "heroTitle": isDental
        ? `Le futur de la dentisterie à ${prospect.city}.`
        : `Explorez le Monde avec un Regard Nouveau.`,
      "heroSubtitle": isDental
        ? "Une expérience patient révolutionnaire alliant technologie de pointe et confort absolu."
        : "Des itinéraires exclusifs conçus pour transformer vos rêves en souvenirs inoubliables.",
      "ctaText": isDental ? "Réserver mon Bilan" : "Demander mon Itinéraire",
      "sections": [
        { "name": "Expertise Digitale", "description": "Prise de rendez-vous en ligne et suivi patient automatisé." },
        { "name": "Confort Premium", "description": "Un environnement pensé pour votre bien-être total." }
      ],
      "designNotes": "Utilisation d'un espace blanc généreux pour évoquer la pureté. Typographie Serif pour l'autorité.",
      "performanceGains": "+45% de conversion de leads grâce à l'optimisation LCP."
    },
    "logoConcept": {
      "style": "Minimaliste Géométrique",
      "symbol": "Fusion d'une forme organique et d'un éclat lumineux.",
      "typography": "Cormorant Garamond (Light weight)",
      "colorRationale": "Or brossé pour le prestige, bleu nuit pour la confiance.",
      "concept": "Représenter l'équilibre parfait entre tradition et modernité."
    },
    "callScript": {
      "bestTimeToCall": "Mar-Jeu 10h-12h",
      "opener": `Bonjour, je souhaite parler au responsable de ${name} ?`,
      "accroche": "J'ai analysé votre site actuel et j'ai relevé 3 failles critiques qui vous font perdre environ 2500€ de CA chaque mois.",
      "pitchCore": "Nous avons développé un jumeau numérique spécifique à votre secteur qui règle ces problèmes en 48h sans aucun effort de votre part.",
      "socialProof": "Nous avons déjà aidé des cliniques similaires à doubler leur taux de conversion en 30 jours.",
      "transitionQuestion": "Seriez-vous ouvert à voir le prototype que j'ai déjà préparé pour vous ?",
      "objections": [
        { "trigger": "C'est trop cher", "response": "Je comprends, mais le coût de l'inaction est de 30 000€ par an. Notre solution s'autofinance en 3 mois." },
        { "trigger": "J'ai déjà une agence", "response": "C'est parfait. Notre outil est complémentaire et se concentre sur la conversion pure, pas juste le visuel." }
      ],
      "close": "On se bloque 15 min jeudi à 14h pour que je vous montre les chiffres ?"
    }
  };
}

export async function POST(req: Request) {
  try {
    const prospect = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Clé API non configurée" }, { status: 500 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 2500,
        system: `Tu es StoneLink, l'IA commerciale de Stepping Stones Agency.
Tu génères des packages commerciaux ultra-personnalisés pour vendre des sites web premium.
RÈGLE ABSOLUE : Ta réponse est UNIQUEMENT un objet JSON valide.
Aucun texte avant. Aucun texte après. Aucun backtick. Aucun markdown.
Commence DIRECTEMENT par { et termine DIRECTEMENT par }.
Tous les textes en français. Ton : expert, direct, orienté ROI.`,
        messages: [{
          role: 'user',
          content: `Génère un package commercial complet.

PROSPECT :
Niche: ${prospect.niche}
Entreprise: ${prospect.name}
Ville: ${prospect.city}
Site actuel: ${prospect.website ?? 'inconnu'}
Score Lighthouse: ${prospect.lighthouseScore ?? '?'}/100
Perte mensuelle: ${prospect.estimatedLoss ?? '?'}€/mois
Contexte: ${prospect.context ?? 'aucun'}

JSON ATTENDU (respecter exactement cette structure) :
{
  "siteAdaptation": {
    "colorPrimary": "#HEX adapté à la niche",
    "colorAccent": "#HEX complémentaire",
    "tagline": "Tagline mémorable et puissante",
    "heroTitle": "Titre hero accrocheur (max 8 mots)",
    "heroSubtitle": "Sous-titre persuasif (1-2 phrases)",
    "ctaText": "Texte du bouton CTA (max 4 mots)",
    "sections": [
      {"name": "Nom de section", "description": "Ce que contient cette section"}
    ],
    "designNotes": "Recommandations design précises : style, ambiance, typographie",
    "performanceGains": "Gains concrets : +X% conversions, LCP < Xs, etc."
  },
  "logoConcept": {
    "style": "Style du logo (ex: minimaliste géométrique)",
    "symbol": "Description du symbole et sa signification",
    "typography": "Police recommandée et pourquoi",
    "colorRationale": "Signification des couleurs choisies",
    "concept": "Description visuelle complète et détaillée"
  },
  "callScript": {
    "bestTimeToCall": "Meilleur moment (ex: Mar-Jeu 10h-12h)",
    "opener": "Phrase d'ouverture naturelle et non-agressive",
    "accroche": "Accroche percutante qui capte l'attention en 10 secondes",
    "pitchCore": "Pitch principal en 3-4 phrases orientées ROI",
    "socialProof": "Preuve sociale ou résultat à mentionner",
    "transitionQuestion": "Question ouverte pour engager le prospect",
    "objections": [
      {"trigger": "C'est trop cher", "response": "Réponse persuasive et empathique"},
      {"trigger": "J'ai déjà un prestataire", "response": "Réponse persuasive"},
      {"trigger": "C'est pas le bon moment", "response": "Réponse persuasive"},
      {"trigger": "Envoyez-moi un mail", "response": "Réponse persuasive"},
      {"trigger": "Je dois réfléchir", "response": "Réponse persuasive"}
    ],
    "close": "Formule de clôture pour obtenir un RDV de 20 minutes"
  }
}`
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.error?.message?.includes("credit balance")) {
        return NextResponse.json(getSimulatedResponse(prospect));
      }
      return NextResponse.json({ error: errorData.error?.message || "Erreur API" }, { status: response.status });
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text || "";
    
    // Blindage du parsing (Phase 2 Convergence)
    try {
      // Nettoyage des backticks markdown si présents
      const cleanText = rawText.replace(/```json\n?|```/g, '').trim();
      
      // Extraction chirurgicale du bloc JSON le plus large
      const match = cleanText.match(/\{[\s\S]*\}/);
      
      if (!match) {
        console.error("Agent IA : Échec de détection du JSON dans la réponse brute.", rawText);
        throw new Error('Pas de structure JSON valide détectée');
      }
      
      const parsed = JSON.parse(match[0]);
      return NextResponse.json(parsed);
    } catch (e) {
      console.error("Agent IA : Erreur critique de parsing JSON.", e);
      return NextResponse.json({ 
        error: "Le moteur IA a généré un format illisible.", 
        raw: rawText.substring(0, 200) + "..." 
      }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
