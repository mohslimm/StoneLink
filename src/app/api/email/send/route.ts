// ─────────────────────────────────────────────────────────────────
// STONELINK — POST /api/email/send
// Envoi SMTP via Nodemailer + Hostinger Spacemail
// ─────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { randomUUID } from 'crypto'

// ─── Validation Schema ────────────────────────────────────────────

const SendEmailSchema = z.object({
  to:          z.string().email('Destinataire invalide'),
  subject:     z.string().min(1).max(200),
  bodyHtml:    z.string().min(1),
  bodyText:    z.string().min(1),
  prospectId:  z.string().min(5),
  prototypeUrl: z.string().url().optional(),
})

// ─── Handler ──────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = SendEmailSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { to, subject, bodyHtml, bodyText, prototypeUrl } = parsed.data
    const emailId  = randomUUID()
    const smtpHost = process.env.SMTP_HOST
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpPort = Number(process.env.SMTP_PORT ?? 465)

    if (!smtpHost || !smtpUser || !smtpPass) {
      // Mode démonstration : simuler l'envoi sans SMTP configuré
      return NextResponse.json({
        emailId,
        sentAt:  new Date().toISOString(),
        simulated: true,
        message: 'Email simulé — configurer SMTP_HOST, SMTP_USER, SMTP_PASS dans .env',
      })
    }

    // Nodemailer dynamique (évite l'import au build si non configuré)
    const nodemailer = await import('nodemailer')

    const transporter = nodemailer.default.createTransport({
      host:   smtpHost,
      port:   smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const trackingPixelUrl = `${appUrl}/api/tracking/email?id=${emailId}&prospectId=${parsed.data.prospectId}`
    
    // Si la balise </body> est présente, on insère le pixel juste avant, sinon on l'ajoute à la fin
    const finalHtml = bodyHtml.includes('</body>')
      ? bodyHtml.replace('</body>', `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;" /></body>`)
      : bodyHtml + `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;" />`

    await transporter.sendMail({
      from:    `"Mohamed — Stepping Stones" <${smtpUser}>`,
      to,
      cc:      smtpUser, // Copie à Mohamed automatiquement
      replyTo: smtpUser,
      subject,
      text:    bodyText,
      html:    finalHtml,
      headers: {
        'X-Email-ID':       emailId,
        'X-Prototype-URL':  prototypeUrl ?? '',
        'X-Mailer':         'StoneLink Agency Platform',
      },
    })

    return NextResponse.json({
      emailId,
      sentAt:    new Date().toISOString(),
      simulated: false,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json(
      { error: `Envoi email échoué : ${message}` },
      { status: 500 },
    )
  }
}
