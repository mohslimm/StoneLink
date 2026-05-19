import { NextResponse } from "next/server";



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
      return NextResponse.json({ error: errorData.error?.message || "Erreur API Anthropic" }, { status: response.status });
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
