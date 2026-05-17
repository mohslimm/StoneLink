// ─────────────────────────────────────────────────────────────────
// STONELINK — POST /api/call/script
// Génère un script d'appel commercial personnalisé via Claude AI
// Fallback statique si la clé n'est pas configurée
// ─────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { CallScript, ScriptStep, ObjectionHandler, CloseScript } from '@/types/pipeline'

// ─── Validation Schema ────────────────────────────────────────────

const ScriptRequestSchema = z.object({
  prospectId:      z.string().min(1),
  companyName:     z.string().min(1),
  contactName:     z.string().min(1),
  niche:           z.string().min(1),
  city:            z.string().min(1),
  country:         z.string().min(1),
  lighthouseScore: z.number().min(0).max(100).optional(),
  estimatedLoss:   z.number().optional(),
  website:         z.string().optional(),
  phone:           z.string().optional(),
})

type ScriptRequest = z.infer<typeof ScriptRequestSchema>

// ─── Niche Labels ─────────────────────────────────────────────────

const NICHE_LABELS: Record<string, string> = {
  dental:     'cabinet dentaire',
  restaurant: 'restaurant',
  travel:     'agence de voyage',
  realestate: 'agence immobilière',
  law:        'cabinet d\'avocat',
  clinic:     'clinique',
  salon:      'salon de beauté',
  logistics:  'entreprise logistique',
  saas:       'éditeur SaaS',
  ecommerce:  'boutique e-commerce',
}

// ─── Fallback Script Generator ────────────────────────────────────

function buildFallbackScript(req: ScriptRequest): CallScript {
  const prenom = req.contactName.split(' ')[0] ?? req.contactName
  const niche  = NICHE_LABELS[req.niche] ?? req.niche
  const score  = req.lighthouseScore ?? 42
  const perte  = req.estimatedLoss ? `${req.estimatedLoss.toLocaleString('fr-FR')} €/mois` : 'plusieurs milliers d\'euros par mois'

  const steps: ScriptStep[] = [
    {
      id: 1,
      phase: 'opener',
      label: 'Ouverture',
      script: `Bonjour ${prenom}, je suis [Votre Prénom] de Stepping Stones Agency. Je vous contacte car j'ai analysé le site de ${req.companyName} et j'ai identifié quelques points critiques qui méritent votre attention. Vous avez 2 minutes ?`,
      tip: 'Ton décontracté, sourire dans la voix. Pause après la question.',
      durationTarget: 20,
    },
    {
      id: 2,
      phase: 'audit_reveal',
      label: 'Révélation Audit',
      script: `J'ai passé votre site dans notre outil d'analyse — le score obtenu est de ${score}/100. Pour vous donner une idée, la moyenne des ${niche}s qui convertissent bien tourne autour de 85. Ce qui veut dire que des visiteurs quittent votre site sans vous contacter alors qu'ils cherchent exactement vos services.`,
      tip: `Score < 50 = ton urgent mais factuel. Laisser un silence après l'annonce du score.`,
      durationTarget: 40,
    },
    {
      id: 3,
      phase: 'pitch',
      label: 'La Solution',
      script: `On a développé un modèle de site spécialement conçu pour les ${niche}s — pré-optimisé, mobile-first, avec les éléments qui convainquent vos clients. Ce qu'on peut faire c'est vous montrer à quoi ressemblerait votre nouveau site avec votre logo, vos couleurs. Vous le recevez gratuitement dans votre boite mail aujourd'hui.`,
      tip: 'Insister sur "gratuit" et "aujourd\'hui". C\'est la proposition à faible friction.',
      durationTarget: 45,
    },
    {
      id: 4,
      phase: 'social_proof',
      label: 'Preuve Sociale',
      script: `On a refait le site d'un autre ${niche} à ${req.city} l'an dernier. En 3 mois, leurs demandes de contact avaient augmenté de 40%. Le propriétaire m'a dit que c'était la meilleure décision qu'il avait prise. Et ça a commencé exactement comme ça — un coup de fil.`,
      tip: 'Si le prospect est sceptique, demandez : "Vous recevez combien de demandes par semaine depuis le site ?"',
      durationTarget: 35,
    },
    {
      id: 5,
      phase: 'transition',
      label: 'Transition',
      script: `Pour vous envoyer le prototype personnalisé, j'aurais juste besoin de votre adresse email. Je l'envoie dans les minutes qui suivent notre appel. Vous me confirmez que c'est bien ${req.companyName.toLowerCase()}@gmail.com ou vous avez une autre adresse ?`,
      tip: 'Supposez qu\'ils vont dire oui. Reformuler l\'email qu\'on a déjà si possible.',
      durationTarget: 25,
    },
    {
      id: 6,
      phase: 'close',
      label: 'Clôture',
      script: `Parfait ${prenom}. Je vous envoie ça maintenant. Vous allez recevoir un email de ma part avec le lien du prototype — consultez-le tranquillement. Je vous rappelle dans 48h pour avoir votre retour. On est libres mercredi matin pour en discuter ?`,
      tip: 'Ne pas attendre une confirmation enthousiaste. Proposer un créneau directement = technique de l\'agenda.',
      durationTarget: 30,
    },
  ]

  const objections: ObjectionHandler[] = [
    {
      trigger: 'prix',
      label: 'Trop cher',
      response: `Je comprends, le budget c'est une vraie question. Mais avant de parler chiffres, regardez le prototype — vous jugez sur ce que vous voyez. Et si on estime que votre site actuel vous coûte ${perte} en leads perdus, l'investissement se rembourse en quelques semaines.`,
      pivot: 'Alors, je vous envoie le prototype maintenant pour que vous puissiez juger par vous-même ?',
    },
    {
      trigger: 'prestataire',
      label: 'J\'ai déjà quelqu\'un',
      response: `C'est super d'avoir déjà quelqu'un. Notre approche est différente — on ne remplace pas votre prestataire, on vous donne une base déjà optimisée qu'ils peuvent utiliser. Et de toute façon, regarder le prototype ne coûte rien. Vous décidez après.`,
      pivot: 'Je vous envoie quand même pour que vous ayez une référence de ce qui se fait de mieux dans votre secteur ?',
    },
    {
      trigger: 'pas_maintenant',
      label: 'Pas le bon moment',
      response: `Je comprends tout à fait. Justement, le prototype je vous l'envoie maintenant — vous le regardez quand vous avez 5 minutes, même dans 3 semaines. L'idée c'est que vous l'ayez sous la main quand le moment est venu.`,
      pivot: `C'est quoi votre email pour que je vous l'envoie ?`,
    },
    {
      trigger: 'pas_interesse',
      label: 'Pas intéressé',
      response: `Je respecte votre décision. Juste une dernière chose — votre score de ${score}/100 sur Google va continuer à affecter votre visibilité. Si ça change et que vous voulez qu'on en discute, gardez mes coordonnées. Bonne journée ${prenom}.`,
      pivot: 'Dans ce cas je note un rappel dans 3 mois. On ne sait jamais.',
    },
    {
      trigger: 'rappeler',
      label: 'Rappelez-moi',
      response: `Bien sûr. Vous êtes disponible plutôt en matinée ou en après-midi en général ? Je bloque un créneau dès maintenant dans mon agenda pour ne pas vous oublier.`,
      pivot: 'Parfait, je vous envoie quand même le prototype entre-temps pour vous faire une idée.',
    },
  ]

  const closes: CloseScript[] = [
    {
      id: 1,
      type: 'soft',
      script: `Est-ce que vous voulez qu'on en discute rapidement cette semaine, le temps que le prototype soit encore frais dans votre esprit ?`,
    },
    {
      id: 2,
      type: 'assumptive',
      script: `Je vous bloque mercredi à 10h — si ça vous convient on fait un point de 15 minutes sur le prototype. C'est bon pour vous ?`,
    },
    {
      id: 3,
      type: 'urgency',
      script: `On a actuellement 2 slots disponibles pour lancer un projet ce mois-ci. Si vous voulez qu'on en soit, c'est le bon moment pour se positionner.`,
    },
  ]

  return {
    niche: req.niche as CallScript['niche'],
    prospectName: prenom,
    companyName:  req.companyName,
    lighthouseScore: score,
    estimatedLoss:   req.estimatedLoss ?? 0,
    steps,
    objections,
    closes,
    generatedAt: new Date(),
  }
}

// ─── Claude Script Generator ──────────────────────────────────────

async function generateWithClaude(req: ScriptRequest): Promise<CallScript> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return buildFallbackScript(req)

  const prenom = req.contactName.split(' ')[0] ?? req.contactName
  const niche  = NICHE_LABELS[req.niche] ?? req.niche
  const score  = req.lighthouseScore ?? 42
  const perte  = req.estimatedLoss ? `${req.estimatedLoss.toLocaleString('fr-FR')} €/mois` : 'plusieurs milliers d\'euros/mois'

  const systemPrompt = `Tu es un expert en vente B2B pour une agence de création de sites web premium.
Tu génères des scripts d'appel commercial ultra-personnalisés, percutants et naturels en français.
Ton style : professionnel mais humain, factuel mais engageant. Pas de jargon. Pas de promesse excessive.
Tu dois répondre UNIQUEMENT avec un JSON valide, sans markdown, sans backticks.`

  const userPrompt = `Génère un script d'appel commercial pour ce prospect :
- Prénom contact : ${prenom}
- Entreprise : ${req.companyName}
- Secteur : ${niche} (niche: ${req.niche})
- Ville : ${req.city} (${req.country})
- Score Lighthouse actuel : ${score}/100
- Perte estimée : ${perte}
- Site web : ${req.website ?? 'inconnu'}

Génère ce JSON strict (pas de markdown) :
{
  "steps": [
    { "id": 1, "phase": "opener", "label": "Ouverture", "script": "...", "tip": "...", "durationTarget": 20 },
    { "id": 2, "phase": "audit_reveal", "label": "Révélation Audit", "script": "...", "tip": "...", "durationTarget": 40 },
    { "id": 3, "phase": "pitch", "label": "La Solution", "script": "...", "tip": "...", "durationTarget": 45 },
    { "id": 4, "phase": "social_proof", "label": "Preuve Sociale", "script": "...", "tip": "...", "durationTarget": 35 },
    { "id": 5, "phase": "transition", "label": "Transition", "script": "...", "tip": "...", "durationTarget": 25 },
    { "id": 6, "phase": "close", "label": "Clôture", "script": "...", "tip": "...", "durationTarget": 30 }
  ],
  "objections": [
    { "trigger": "prix", "label": "Trop cher", "response": "...", "pivot": "..." },
    { "trigger": "prestataire", "label": "J'ai déjà quelqu'un", "response": "...", "pivot": "..." },
    { "trigger": "pas_maintenant", "label": "Pas le bon moment", "response": "...", "pivot": "..." },
    { "trigger": "pas_interesse", "label": "Pas intéressé", "response": "...", "pivot": "..." },
    { "trigger": "rappeler", "label": "Rappelez-moi", "response": "...", "pivot": "..." }
  ],
  "closes": [
    { "id": 1, "type": "soft", "script": "..." },
    { "id": 2, "type": "assumptive", "script": "..." },
    { "id": 3, "type": "urgency", "script": "..." }
  ]
}`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25_000)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-3-5-haiku-20241022',
        max_tokens: 3000,
        system:     systemPrompt,
        messages:   [{ role: 'user', content: userPrompt }],
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.error('[call/script] Claude error:', response.status)
      return buildFallbackScript(req)
    }

    const claude = await response.json() as {
      content: Array<{ type: string; text: string }>
    }
    const text = claude.content[0]?.text ?? ''
    const parsed = JSON.parse(text) as {
      steps: ScriptStep[]
      objections: ObjectionHandler[]
      closes: CloseScript[]
    }

    return {
      niche:           req.niche as CallScript['niche'],
      prospectName:    prenom,
      companyName:     req.companyName,
      lighthouseScore: score,
      estimatedLoss:   req.estimatedLoss ?? 0,
      steps:           parsed.steps,
      objections:      parsed.objections,
      closes:          parsed.closes,
      generatedAt:     new Date(),
    }
  } catch {
    return buildFallbackScript(req)
  }
}

// ─── Route Handler ────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const parsed = ScriptRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const script = await generateWithClaude(parsed.data)

    return NextResponse.json({ script }, { status: 200 })
  } catch {
    return NextResponse.json(
      { error: 'Erreur serveur — veuillez réessayer' },
      { status: 500 }
    )
  }
}
