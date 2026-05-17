// ─────────────────────────────────────────────────────────────────
// STONELINK — POST /api/email/generate
// Génère un email commercial personnalisé via Claude API
// ─────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ─── Validation Schema ────────────────────────────────────────────

const GenerateEmailSchema = z.object({
  prospect: z.object({
    id:               z.string(),
    companyName:      z.string(),
    contactName:      z.string(),
    email:            z.string().email(),
    niche:            z.string(),
    lighthouseScore:  z.number().optional(),
    estimatedLoss:    z.number().optional(),
  }),
  previewUrl: z.string().url(),
})

// ─── Utilities ────────────────────────────────────────────────────

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const NICHE_LABELS: Record<string, string> = {
  dental:     'Clinique Dentaire',
  restaurant: 'Restaurant',
  realestate: 'Immobilier',
  law:        'Cabinet Juridique',
  clinic:     'Clinique Médicale',
  salon:      'Salon de Beauté',
  logistics:  'Transport & Logistique',
  travel:     'Agence de Voyage',
  saas:       'SaaS',
  ecommerce:  'E-commerce',
}

// ─── Email HTML Builder ───────────────────────────────────────────

const buildEmailHtml = (
  subject:    string,
  body:       string,
  previewUrl: string,
  companyName: string,
): string => {
  const safeBody = escapeHtml(body)
  const safeSubject = escapeHtml(subject)
  const safeCompany = escapeHtml(companyName)
  const safeUrl = encodeURI(previewUrl)

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeSubject}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation"
        style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#07090F;padding:28px 40px;text-align:center;">
          <div style="font-family:Georgia,serif;font-size:22px;color:#c5a059;letter-spacing:0.05em;font-weight:normal;">
            Stepping Stones
          </div>
          <div style="font-size:10px;color:rgba(197,160,89,0.55);letter-spacing:0.18em;text-transform:uppercase;margin-top:4px;">
            Agency · Digital Solutions
          </div>
        </td></tr>

        <!-- Preview Banner -->
        <tr><td style="background:linear-gradient(135deg,#1a1a2e,#0f3460);padding:24px 40px;text-align:center;">
          <div style="font-size:12px;color:rgba(197,160,89,0.7);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;">
            Votre futur site · ${safeCompany}
          </div>
          <div style="font-size:28px;margin-bottom:16px;">✨</div>
          <a href="${safeUrl}"
             style="display:inline-block;background:linear-gradient(135deg,#B8924A,#c5a059);color:#1A1200;font-weight:700;font-size:14px;letter-spacing:0.06em;text-decoration:none;padding:14px 32px;border-radius:8px;">
            → Voir votre site personnalisé
          </a>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <div style="font-size:15px;line-height:1.75;color:#1e293b;white-space:pre-line;">${safeBody}</div>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px;">
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:0;" />
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;padding:24px 40px;border-radius:0 0 16px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td>
                <div style="font-size:13px;color:#64748b;line-height:1.6;">
                  <strong style="color:#1e293b;">Mohamed Slimani</strong><br>
                  Fondateur — Stepping Stones Agency<br>
                  <a href="https://steppingstones.cloud" style="color:#c5a059;text-decoration:none;">steppingstones.cloud</a>
                </div>
              </td>
              <td align="right">
                <div style="font-size:10px;color:#94a3b8;text-align:right;line-height:1.8;">
                  Montréal, Canada<br>
                  contact@steppingstones.cloud
                </div>
              </td>
            </tr>
          </table>
        </td></tr>

      </table>

      <!-- Legal -->
      <div style="margin-top:20px;font-size:11px;color:#94a3b8;text-align:center;">
        Vous recevez cet email suite à un échange téléphonique.<br>
        <a href="#" style="color:#94a3b8;">Se désabonner</a>
      </div>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── Handler ──────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    const parsed = GenerateEmailSchema.safeParse(requestBody)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { prospect, previewUrl } = parsed.data
    const firstName = prospect.contactName.split(' ')[0] ?? prospect.contactName
    const nicheLabel = NICHE_LABELS[prospect.niche] ?? prospect.niche

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      // Fallback si pas de clé API configurée
      const fallbackSubject = `${prospect.companyName} — votre site est prêt`
      const fallbackBody = `${firstName},\n\nSuite à notre échange, j'ai préparé une démonstration concrète pour ${prospect.companyName}.\n\nVoici ce que votre site pourrait être dès la semaine prochaine :\n${previewUrl}\n\nDix minutes de démo cette semaine pour vous montrer le potentiel en détail ?\n\nMohamed Slimani\nStepping Stones Agency`

      return NextResponse.json({
        subject:  fallbackSubject,
        bodyText: fallbackBody,
        bodyHtml: buildEmailHtml(fallbackSubject, fallbackBody, previewUrl, prospect.companyName),
        generated: false,
      })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 600,
        system: `Tu es Mohamed Slimani, fondateur de Stepping Stones Agency (Montréal).
Tu rédiges des emails de vente premium, courts et percutants, en français.
Ton : expert bienveillant, direct, jamais corporate. Chaque mot justifié. Max 100 mots dans le corps.
Réponds en JSON uniquement : { "subject": "...", "body": "..." }
Le body est en texte brut. Des sauts de ligne avec \\n.
INTERDIT : "Bonjour", "Cher(e)", "Cordialement", "J'espère que vous allez bien", emojis dans le corps.`,
        messages: [{
          role:    'user',
          content: `Rédige l'email de suivi après mon appel avec ce prospect.

Prénom : ${firstName}
Entreprise : ${prospect.companyName}
Secteur : ${nicheLabel}
Score site actuel : ${prospect.lighthouseScore ?? '?'}/100
Perte mensuelle estimée : ${prospect.estimatedLoss ? `${prospect.estimatedLoss}€` : 'non calculée'}/mois
Lien prototype personnalisé : ${previewUrl}

L'email doit :
- Commencer directement par le prénom (ex: "Marc,")
- Rappeler le problème clé en 1 phrase percutante
- Présenter le lien comme "votre site tel qu'il pourrait être dès la semaine prochaine"
- CTA clair : cliquer sur le lien et me donner son avis en 2 mots
- Proposer 20 min de démo cette semaine
- Signature : Mohamed Slimani — Stepping Stones Agency
- Objet : accrocheur, max 8 mots, naturel (pas tout en majuscules)`,
        }],
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    const data = await response.json() as {
      content: Array<{ type: string; text?: string }>
    }

    const rawText = data.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text ?? '')
      .join('')

    // Extraire le JSON de la réponse Claude (peut contenir du markdown)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Claude response ne contient pas de JSON valide')
    }

    const { subject, body: emailBody } = JSON.parse(jsonMatch[0]) as {
      subject: string
      body:    string
    }

    return NextResponse.json({
      subject,
      bodyText: emailBody,
      bodyHtml: buildEmailHtml(subject, emailBody, previewUrl, prospect.companyName),
      generated: true,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json(
      { error: `Génération email échouée : ${message}` },
      { status: 500 },
    )
  }
}
