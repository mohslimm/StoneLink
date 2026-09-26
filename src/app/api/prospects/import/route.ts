import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Prospect from '@/models/Prospect';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawLeads = Array.isArray(body) ? body : (body.leads || body.prospects || []);

    if (!Array.isArray(rawLeads) || rawLeads.length === 0) {
      return NextResponse.json({ error: 'Aucun lead fourni' }, { status: 400 });
    }

    const sanitizedLeads = rawLeads.map((item: any, idx: number) => {
      const companyName = (item.companyName || item.Businessname || item.name || `Lead #${idx + 1}`).trim();
      const contactName = (item.contactName || item.contact || `Responsable ${companyName}`).trim();
      const email = (item.email || item.Emailaddress || `contact@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'lead'}.com`).trim();
      const phone = (item.phone || item.Phonenumber || '').trim();
      const website = (item.website || item.Website || item.url || '').trim();
      const score = Number(item.score || item['Mobile Score'] || item.lighthouseScore) || Math.floor(Math.random() * (75 - 35) + 35);
      const niche = (item.niche || item.sector || 'Général').trim();
      const city = item.city || 'Paris';
      const country = item.country || 'FR';

      return {
        companyName,
        contactName,
        email,
        phone,
        website,
        niche,
        city,
        country,
        stage: item.stage || 'new',
        priority: item.priority || 'cold',
        estimatedDealValue: item.estimatedDealValue || 3500,
        notes: item.notes ? [{ id: `n-${Date.now()}-${idx}`, content: item.notes, author: 'Bot-Search', timestamp: new Date() }] : [],
        activities: [
          {
            id: `act-import-${Date.now()}-${idx}`,
            type: 'prospect_created',
            description: `Importé via Bot-Search CSV`,
            timestamp: new Date().toISOString(),
          }
        ],
        createdAt: new Date(),
      };
    });

    try {
      await dbConnect();

      // Find existing emails to deduplicate
      const emails = sanitizedLeads.map(l => l.email).filter(Boolean);
      const existing = await Prospect.find({ email: { $in: emails } }).select('email');
      const existingEmailSet = new Set(existing.map(e => e.email));

      const toInsert = sanitizedLeads.filter(l => !existingEmailSet.has(l.email));
      let inserted: any[] = [];

      if (toInsert.length > 0) {
        inserted = await Prospect.insertMany(toInsert);
      }

      return NextResponse.json({
        success: true,
        importedCount: inserted.length,
        duplicateCount: sanitizedLeads.length - toInsert.length,
        data: inserted,
        source: 'database',
      });
    } catch (dbError: any) {
      console.warn('[POST /api/prospects/import] DB offline, serving memory fallback:', dbError.message);
      const memoryLeads = sanitizedLeads.map((l, i) => ({
        ...l,
        _id: `local_csv_${Date.now()}_${i}`,
        id: `local_csv_${Date.now()}_${i}`,
      }));

      return NextResponse.json({
        success: true,
        importedCount: memoryLeads.length,
        duplicateCount: 0,
        data: memoryLeads,
        source: 'memory_fallback',
      });
    }
  } catch (error: any) {
    console.error('[POST /api/prospects/import]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
