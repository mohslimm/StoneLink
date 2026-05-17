import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Prospect from '@/models/Prospect'
import { ProspectSchema } from '@/lib/validators'

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
    })
  } catch (error: any) {
    console.error('[GET /api/prospects]', error)
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    )
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/prospects (create + validation + dedup)
// ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    await dbConnect()

    const body = await request.json()

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
      { data: newProspect },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[POST /api/prospects]', error)
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    )
  }
}