import { NextResponse } from "next/server";



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
      return NextResponse.json({ error: errorData.error?.message || "Erreur API Anthropic" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ message: data.content?.[0]?.text || "" });

  } catch (error) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
