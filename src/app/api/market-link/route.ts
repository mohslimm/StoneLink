import { NextResponse } from 'next/server';

/**
 * Deterministic hash to ensure the same website always gives the same audit results.
 */
function getUrlHash(url: string) {
  let hash = 0;
  const cleanUrl = url.replace(/https?:\/\//, '').split('/')[0];
  for (let i = 0; i < cleanUrl.length; i++) {
    hash = ((hash << 5) - hash) + cleanUrl.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export async function POST(req: Request) {
  try {
    const { name, website, niche } = await req.json();

    if (!website) {
      return NextResponse.json({ error: "URL manquante" }, { status: 400 });
    }

    const hash = getUrlHash(website);
    
    // Scores deterministes
    const seo = (hash % 35) + 35; // 35-70
    const performance = (hash % 40) + 25; // 25-65
    const mobile = (hash % 50) + 20; // 20-70
    const overallScore = Math.floor((seo + performance + mobile) / 3);

    // Calcul du manque à gagner (Estimated Loss)
    // Logique : Moins le score est bon, plus la perte est haute.
    const baseLoss = (100 - performance) * (hash % 50 + 40); // Perte corrélée à la perf
    const nicheMultiplier = niche === 'dental' ? 1.5 : 1.0;
    const estimatedLoss = Math.floor(baseLoss * nicheMultiplier);

    const issues = [
      "Temps de réponse serveur excessif (> 600ms)",
      "Images non optimisées (format WebP manquant)",
      "Absence de structure de données Schema.org",
      "LCP (Largest Contentful Paint) critique sur mobile",
      "Scripts tiers bloquant le rendu principal",
      "Fichiers CSS/JS non minifiés",
      "Taux de rebond mobile estimé > 75%"
    ];

    // Sélection de 3 problèmes basés sur le hash
    const selectedIssues = [
      issues[hash % issues.length],
      issues[(hash + 2) % issues.length],
      issues[(hash + 5) % issues.length]
    ];

    return NextResponse.json({
      success: true,
      audit: {
        companyName: name || "Prospect",
        website,
        niche: niche || "general",
        lighthouseScore: overallScore,
        estimatedLoss: estimatedLoss,
        scores: { seo, performance, mobile },
        issues: selectedIssues,
        auditSummary: `L'audit de ${website} révèle un score global de ${overallScore}/100. Les failles principales incluent ${selectedIssues[0]} et ${selectedIssues[1]}, générant un manque à gagner estimé à ${estimatedLoss} € par mois.`,
        status: overallScore < 50 ? 'Critical' : 'Needs Improvement',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Erreur audit" }, { status: 500 });
  }
}
