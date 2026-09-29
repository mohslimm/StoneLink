import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Prospect from '@/models/Prospect';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const prospect = await Prospect.findById(id);
    if (!prospect) {
      return NextResponse.json({ error: 'Prospect introuvable' }, { status: 404 });
    }
    return NextResponse.json(prospect);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import fs from 'fs';
import path from 'path';

function updateLocalLead(id: string, body: any) {
  try {
    const allLeadsPath = path.join(process.cwd(), 'data', 'all_leads.json');
    if (fs.existsSync(allLeadsPath)) {
      const leads = JSON.parse(fs.readFileSync(allLeadsPath, 'utf8'));
      const idx = leads.findIndex((l: any) => l.id === id || l._id === id);
      if (idx !== -1) {
        if (body.stage) {
          if (body.stage === 'recontacter') {
            leads[idx].PipelineStage = 'Recontact';
            leads[idx].ContactedAt = body.ContactedAt || new Date().toISOString();
          } else if (body.stage === 'contacte') {
            leads[idx].PipelineStage = 'Contacted';
            leads[idx].ContactedAt = body.ContactedAt || new Date().toISOString();
          } else if (body.stage === 'prototype') {
            leads[idx].PipelineStage = 'Prototype';
          } else if (body.stage === 'ferme') {
            leads[idx].PipelineStage = 'Closed';
          } else if (body.stage === 'perdu') {
            leads[idx].PipelineStage = 'Lost';
          } else {
            leads[idx].PipelineStage = 'New';
            leads[idx].ContactedAt = null;
          }
        }
        if (body.notes !== undefined) {
          leads[idx].Notes = body.notes;
        }
        fs.writeFileSync(allLeadsPath, JSON.stringify(leads, null, 2), 'utf8');
      }
    }
  } catch (e) {
    console.warn('Failed to update local all_leads.json:', e);
  }
}

function deleteLocalLead(id: string) {
  try {
    const allLeadsPath = path.join(process.cwd(), 'data', 'all_leads.json');
    if (fs.existsSync(allLeadsPath)) {
      const leads = JSON.parse(fs.readFileSync(allLeadsPath, 'utf8'));
      const initialLen = leads.length;
      const filtered = leads.filter((l: any) => l.id !== id && l._id !== id);
      if (filtered.length !== initialLen) {
        fs.writeFileSync(allLeadsPath, JSON.stringify(filtered, null, 2), 'utf8');
        console.log(`\x1b[32m[DELETE /api/prospects] ✅ Lead ${id} supprimé de data/all_leads.json (Local)\x1b[0m`);
      }
    }
  } catch (e: any) {
    console.warn('Failed to delete from all_leads.json:', e.message);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    await dbConnect();
    const col = (await import('mongoose')).default.connection.db!.collection('prospects');
    const prospect = await col.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      { $set: { ...body, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect introuvable dans la base' }, { status: 404 });
    }

    console.log(`\x1b[32m[PATCH /api/prospects/${id}] ✅ Mis à jour dans MongoDB Atlas (Cloud) : stage=${body.stage || 'inchangé'}\x1b[0m`);
    return NextResponse.json(prospect);
  } catch (error: any) {
    console.error(`\x1b[31m[PATCH /api/prospects/${id}] ❌ Erreur MongoDB :\x1b[0m`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const permanent = searchParams.get('permanent') === 'true';

  try {
    await dbConnect();
    const col = (await import('mongoose')).default.connection.db!.collection('prospects');

    if (permanent) {
      await col.deleteOne({ $or: [{ _id: id }, { id: id }] });
      console.log(`\x1b[32m[DELETE /api/prospects/${id}] ✅ Supprimé définitivement de MongoDB Atlas (Cloud)\x1b[0m`);
      return NextResponse.json({ message: 'Prospect supprimé définitivement de MongoDB' });
    } else {
      const now = new Date();
      await col.updateOne(
        { $or: [{ _id: id }, { id: id }] },
        { $set: { isDeleted: true, deletedAt: now, updatedAt: now } }
      );
      console.log(`\x1b[32m[DELETE /api/prospects/${id}] 🗑️ Déplacé vers la corbeille (Soft Delete)\x1b[0m`);
      return NextResponse.json({ message: 'Prospect déplacé dans la corbeille' });
    }
  } catch (error: any) {
    console.error(`\x1b[31m[DELETE /api/prospects/${id}] ❌ Erreur suppression MongoDB :\x1b[0m`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
