import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Prospect from '@/models/Prospect';
import { emitRealtimeEvent } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { actionProposal } = body;

    if (!actionProposal || !actionProposal.prospectId) {
      return NextResponse.json(
        { error: "Proposition d'action invalide" },
        { status: 400 }
      );
    }

    const { prospectId, actionType, targetStage, note } = actionProposal;

    const prospect = await Prospect.findById(prospectId);
    if (!prospect) {
      return NextResponse.json(
        { error: `Prospect introuvable (ID: ${prospectId})` },
        { status: 404 }
      );
    }

    const updateFields: any = { updatedAt: new Date() };

    // 1. Stage update
    if (targetStage) {
      updateFields.stage = targetStage;
      if (['contacte', 'recontacter', 'prototype', 'ferme'].includes(targetStage)) {
        updateFields.lastContactedAt = new Date();
      }
    }

    // 2. Note update
    if (note && typeof note === 'string' && note.trim()) {
      const existingNotes = typeof prospect.notes === 'string' ? prospect.notes : '';
      const formattedNote = `[Copilot IA ${new Date().toLocaleDateString('fr-FR')}] : ${note.trim()}`;
      updateFields.notes = existingNotes
        ? `${existingNotes}\n${formattedNote}`
        : formattedNote;
    }

    // 3. Activity logging
    const newActivity = {
      id: `act_${Date.now()}`,
      type: 'copilot_action',
      description: actionProposal.summary || `Action Copilot IA appliquée (${actionType})`,
      timestamp: new Date(),
      status: 'completed',
    };

    const updatedProspect = await Prospect.findByIdAndUpdate(
      prospectId,
      {
        $set: updateFields,
        $push: { activities: newActivity },
      },
      { new: true }
    );

    // 4. Emit SSE Event so CRM, Kanban & Cockpit instantly refresh for all users
    try {
      emitRealtimeEvent('prospect:updated', {
        id: prospectId,
        changes: updateFields,
        prospect: updatedProspect,
      });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: `Action validée : ${updatedProspect.companyName} mis à jour.`,
      prospect: updatedProspect,
    });
  } catch (error: any) {
    console.error('[POST /api/copilot/action] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
