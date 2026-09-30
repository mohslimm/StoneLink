import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CopilotSettings from '@/models/CopilotSettings';
import Prospect from '@/models/Prospect';
import { emitRealtimeEvent } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    let settings = await CopilotSettings.findById('copilot_config').lean();
    if (!settings) {
      settings = await CopilotSettings.create({
        _id: 'copilot_config',
        activeFocus: 'Agence de voyage',
        autoAnalyzeDaily: true,
      });
    }

    // Get distinct niches present in prospects to offer smart dropdown suggestions
    const existingNiches = await Prospect.distinct('niche', { isDeleted: { $ne: true } });
    const cleanNiches = (existingNiches || [])
      .filter((n: string) => Boolean(n && n.trim() && n !== 'Général'))
      .slice(0, 15);

    return NextResponse.json({
      success: true,
      activeFocus: settings.activeFocus || 'Agence de voyage',
      availableNiches: Array.from(new Set(['Agence de voyage', ...cleanNiches])),
      lastBriefingAt: settings.lastBriefingAt || null,
    });
  } catch (error: any) {
    console.error('[GET /api/copilot/focus] Error:', error.message);
    return NextResponse.json(
      { success: false, activeFocus: 'Agence de voyage', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { activeFocus } = body;

    if (!activeFocus || typeof activeFocus !== 'string' || !activeFocus.trim()) {
      return NextResponse.json(
        { error: 'activeFocus est requis' },
        { status: 400 }
      );
    }

    const cleanFocus = activeFocus.trim();

    const updated = await CopilotSettings.findByIdAndUpdate(
      'copilot_config',
      {
        activeFocus: cleanFocus,
        // Invalidate cached briefing so the new focus triggers a fresh analysis
        cachedBriefing: null,
      },
      { upsert: true, new: true }
    );

    // Notify all connected teammates via SSE
    try {
      emitRealtimeEvent('copilot:focus_updated', { activeFocus: cleanFocus });
    } catch {}

    return NextResponse.json({
      success: true,
      activeFocus: updated.activeFocus,
      message: `Focus d'agence mis à jour : ${cleanFocus}`,
    });
  } catch (error: any) {
    console.error('[POST /api/copilot/focus] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
