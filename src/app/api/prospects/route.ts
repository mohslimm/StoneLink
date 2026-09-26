import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Prospect from '@/models/Prospect'
import { ProspectSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

// ─────────────────────────────────────────────────────────────
// GET /api/prospects (filters + search + pagination)
// ─────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)

    const niche = searchParams.get('niche')
    const stage = searchParams.get('stage')
    const priority = searchParams.get('priority')
    const country = searchParams.get('country')
    const search = searchParams.get('search')

    const limit = parseInt(searchParams.get('limit') ?? '100', 10)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)

    const query: any = {}

    // ─── Filters ─────────────────────────────
    if (niche && niche !== 'all') query.niche = niche
    if (stage && stage !== 'all') query.stage = stage
    if (priority && priority !== 'all') query.priority = priority
    if (country && country !== 'all') query.country = country

    // ─── Search (full text style) ───────────
    if (search) {
      const q = search.toLowerCase()

      query.$or = [
        { companyName: { $regex: q, $options: 'i' } },
        { contactName: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ]
    }

    // ─── Query DB ───────────────────────────
    const total = await Prospect.countDocuments(query)

    const prospects = await Prospect.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)

    return NextResponse.json({
      data: prospects,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      source: 'database',
    })
  } catch (error: any) {
    console.warn('[GET /api/prospects] MongoDB connection error, returning fallback data:', error.message)
    const { mockProspects } = await import('@/data/prospects')
    return NextResponse.json({
      data: mockProspects,
      meta: {
        total: mockProspects.length,
        limit: 100,
        offset: 0,
        hasMore: false,
      },
      source: 'memory_fallback',
      warning: 'MongoDB non joignable (IP non whitelistée sur Atlas). Données locales actives.',
    })
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/prospects (create + validation + dedup)
// ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  let body: any = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  try {
    await dbConnect()

    // ─── Validate input ─────────────────────
    const validation = ProspectSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid data',
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    // ─── Deduplication ──────────────────────
    const exists = await Prospect.findOne({
      email: validation.data.email,
    })

    if (exists) {
      return NextResponse.json(
        { error: 'Prospect already exists' },
        { status: 409 }
      )
    }

    // ─── Create prospect ────────────────────
    const newProspect = await Prospect.create({
      ...validation.data,
      stage: validation.data.stage ?? 'new',
      priority: validation.data.priority ?? 'cold',
      activities: [
        {
          type: 'prospect_created',
          description: 'Created via API',
          timestamp: new Date().toISOString(),
        },
      ],
    })

    return NextResponse.json(
      { data: newProspect, source: 'database' },
      { status: 201 }
    )
  } catch (error: any) {
    console.warn('[POST /api/prospects] Fallback creation due to DB error:', error.message)
    const fallbackProspect = {
      _id: 'local_' + Date.now(),
      id: 'local_' + Date.now(),
      contactName: body.contactName || body.name || 'Nouveau Contact',
      companyName: body.companyName || body.company || 'Entreprise',
      email: body.email || 'contact@example.com',
      phone: body.phone || '',
      website: body.website || body.url || '',
      niche: body.niche || body.sector || 'Général',
      country: body.country || 'FR',
      city: body.city || 'Paris',
      stage: body.stage || 'new',
      priority: body.priority || 'cold',
      notes: body.notes ? [{ id: 'n1', content: body.notes, author: 'User', timestamp: new Date() }] : [],
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(
      { data: fallbackProspect, source: 'memory_fallback' },
      { status: 201 }
    )
  }
}