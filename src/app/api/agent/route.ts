import { NextResponse } from "next/server";

/**
 * Realistic fallback for the Autonomous Agent when credits are low.
 */
function getSimulatedAgentResponse(message: string, prospect: any) {
  const msg = message.toLowerCase();
  const name = prospect?.companyName || "votre cible";
  
  if (msg.includes("linkedin") || msg.includes("outreach")) {
    return `Voici un message LinkedIn personnalisé pour ${name} : "Bonjour ${prospect?.contactName || 'Responsable'}, j'ai analysé votre tunnel de conversion à ${prospect?.city || 'votre ville'} et j'ai relevé des points critiques. Nous avons déjà aidé des acteurs de votre niche (${prospect?.niche || 'votre secteur'}) à tripler leurs leads. Seriez-vous ouvert à une brève discussion ?"`;
  }
  
  if (msg.includes("objection") || msg.includes("cher")) {
    return `Pour l'objection sur le prix avec ${name}, je recommande l'angle suivant : "Je comprends que le budget soit une considération. Cependant, avec un manque à gagner estimé à ${prospect?.estimatedLoss?.toLocaleString('fr-FR') || '2500'}€ par mois, notre solution est rentabilisée en moins de 90 jours. Préférez-vous continuer à perdre cette somme chaque mois ou investir une fraction de ce montant pour stopper l'hémorragie ?"`;
  }

  if (msg.includes("email") || msg.includes("follow-up")) {
    return `Séquence de follow-up générée pour ${name}. Objet : "Question stratégique sur votre présence digitale". Corps : "Suite à notre analyse, nous avons identifié que votre site actuel convertit 3x moins que la moyenne de votre secteur. Voici comment nous pouvons rectifier cela..."`;
  }

  return `J'ai analysé votre demande concernant ${name}. Je recommande d'approcher le décideur avec les données de Sales Intelligence que nous avons générées. Votre angle d'attaque principal doit être le ROI immédiat sur la conversion mobile.`;
}

export async function POST(req: Request) {
  try {
    const { message, history, activeProspect } = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Clé API non configurée" }, { status: 500 });
    }

    const prospectContext = activeProspect
      ? `PROSPECT ACTIF EN CE MOMENT :
Entreprise: ${activeProspect.companyName}
Contact: ${activeProspect.contactName}
Niche: ${activeProspect.niche}
Ville: ${activeProspect.city}
Score site: ${activeProspect.lighthouseScore ?? '?'}/100
Perte estimée: ${activeProspect.estimatedLoss?.toLocaleString('fr-FR') ?? '?'}€/mois
Stage: ${activeProspect.stage}
Priorité: ${activeProspect.priority}`
      : 'Aucun prospect actif sélectionné.';

    const systemPrompt = `Tu es l'Agent Autonome de Stepping Stones Agency.
Tu assistes Mohamed Slimani (fondateur, Montréal) dans ses ventes de sites web et ERP.

TES CAPACITÉS CONCRÈTES :
1. Rédiger des messages d'outreach LinkedIn personnalisés
2. Préparer des emails de prospection pour des PME francophones
3. Traiter les objections de vente en temps réel (prix, timing, prestataire)
4. Analyser un prospect et suggérer l'angle d'approche optimal
5. Simuler une conversation de vente pour entraînement
6. Générer un plan de suivi post-appel (follow-up sequence)
7. Suggérer les prochaines actions prioritaires

CONTEXTE AGENCE :
- Services : sites web (3k-15k€), ERP/systèmes (15k-50k€)
- Clientèle : PME francophones (France, Canada, Belgique, Maroc, Algérie)
- Niches : dental, restaurant, immobilier, droit, clinique, beauté, voyages, logistique
- Design premium, approche conseil (pas de vente agressive)

RÈGLES :
- Réponses concrètes, actionnables, jamais génériques
- Si prospect actif dans le contexte → utiliser ses données pour personnaliser
- Français uniquement
- Ton : expert bienveillant, jamais corporate

${prospectContext}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 1000,
        system: systemPrompt,
        messages: history.map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        })).concat([{ role: 'user', content: message }])
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.error?.message?.includes("credit balance")) {
        return NextResponse.json({ message: getSimulatedAgentResponse(message, activeProspect) });
      }
      return NextResponse.json({ error: errorData.error?.message || "Erreur API" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ message: data.content?.[0]?.text || "" });

  } catch (error) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
