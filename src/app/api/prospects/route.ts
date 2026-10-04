import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Prospect from '@/models/Prospect'
import { ProspectSchema } from '@/lib/validators'
import { emitRealtimeEvent } from '@/lib/events'

export const dynamic = 'force-dynamic'

// ─────────────────────────────────────────────────────────────
// GET /api/prospects (filters + search + pagination)
// ─────────────────────────────────────────────────────────────
import fs from 'fs'
import path from 'path'

function mapStage(stage?: string) {
  if (!stage) return 'nouveau';
  const s = stage.toLowerCase();
  if (s.includes('recontact') || s.includes('rappel') || s.includes('callback')) return 'recontacter';
  if (s.includes('contact')) return 'contacte';
  if (s.includes('respond')) return 'contacte';
  if (s.includes('negot') || s.includes('proto')) return 'prototype';
  if (s.includes('close') || s.includes('ferm')) return 'ferme';
  if (s.includes('lost') || s.includes('perdu')) return 'perdu';
  return 'nouveau';
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return 'Non contacté';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Non contacté';
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return 'Non contacté';
  }
}

function hasValidWebsite(url?: string): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return clean !== '' &&
         clean !== 'pas de site web' &&
         clean !== 'non renseigné' &&
         clean !== 'aucun' &&
         clean.length > 3;
}

function mapRawLead(l: any, index: number) {
  const stage = mapStage(l.PipelineStage || l.stage);
  const url = l.Website || l.url || '';
  const hasWeb = hasValidWebsite(url);

  let cleanScore = 0;
  if (hasWeb) {
    const rawScore = (typeof l.WebsiteScore === 'number' && l.WebsiteScore > 0)
      ? Math.round(l.WebsiteScore * 10)
      : (l.Googlemapsscore ? Math.round(parseFloat(String(l.Googlemapsscore).replace(',', '.')) * 15) : 48);
    cleanScore = isNaN(rawScore) ? 50 : Math.min(Math.max(rawScore, 15), 98);
  } else {
    cleanScore = 0;
  }

  const company = l.Businessname || l.company || `Entreprise #${index + 1}`;
  const name = l.OwnerName && l.OwnerName.trim() ? l.OwnerName.trim() : (l.name || `Responsable ${company}`);
  const email = l.Emailaddress || l.email || '';
  const phone = l.Phonenumber || l.phone || '';
  const sector = l.Niche || l.sector || l.Categories || 'Général';
  const lastContact = formatDate(l.ContactedAt || l.lastContactedAt);

  let notes = l.Notes || l.notes || '';
  if (l.Weaknesses && Array.isArray(l.Weaknesses) && l.Weaknesses.length > 0) {
    const wText = `Faiblesses détectées : ${l.Weaknesses.join(', ')}`;
    if (!notes.includes(wText)) {
      notes = notes ? `${notes} | ${wText}` : wText;
    }
  }
  if (l.Wilaya && !notes.includes(`Zone: ${l.Wilaya}`)) {
    notes = notes ? `${notes} | Zone: ${l.Wilaya}` : `Zone: ${l.Wilaya}`;
  }

  const callHistory = Array.isArray(l.callHistory) ? l.callHistory : [];
  if (l.ContactedAt && callHistory.length === 0) {
    callHistory.push({
      id: `call-${l.id || index}`,
      date: formatDate(l.ContactedAt),
      duration: '4:15',
      outcome: l.RespondedAt ? 'prototype' : 'rappeler',
      notes: notes || 'Premier contact initié.',
    });
  }

  return {
    id: l.id || l._id?.toString() || `lead-${index + 1}`,
    name,
    company,
    url: url || 'Pas de site web',
    phone: phone || 'Non renseigné',
    email: email || 'Non renseigné',
    score: cleanScore,
    sector,
    city: l.Wilaya || l.city || 'Général',
    createdAt: l.createdAt || l.RunDate || l.runDate || null,
    runDate: l.RunDate || l.runDate || l.createdAt || null,
    campaignId: l.CampaignID || l.campaignId || '',
    stage,
    lastContact,
    scriptReady: true,
    callHistory,
    notes,
  };
}

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

    const trash = searchParams.get('trash') === 'true'

    const query: any = {}

    // ─── Soft Delete / Trash Filter ──────────
    if (trash) {
      query.isDeleted = true
    } else {
      query.isDeleted = { $ne: true }
    }

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
        { phone: { $regex: q, $options: 'i' } },
      ]
    }

    // ─── Query DB ───────────────────────────
    const total = await Prospect.countDocuments(query)
    const trashCount = await Prospect.countDocuments({ isDeleted: true })

    const sortField: any = trash ? { deletedAt: -1, updatedAt: -1 } : { createdAt: -1 }

    const prospects = await Prospect.find(query)
      .sort(sortField)
      .skip(offset)
      .limit(limit)
      .lean()

    console.log(`\x1b[32m[GET /api/prospects] ✅ ${prospects.length} prospects (${trash ? 'corbeille' : 'actifs'}) chargés depuis MongoDB Atlas !\x1b[0m`)

    return NextResponse.json({
      data: prospects,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
        trashCount,
      },
      source: 'database',
    })
  } catch (error: any) {
    console.error(`\x1b[31m[GET /api/prospects] ❌ Erreur MongoDB :\x1b[0m`, error.message)
    return NextResponse.json({ error: error.message, source: 'database_error' }, { status: 500 })
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

    emitRealtimeEvent('prospect:created', { prospect: newProspect })

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