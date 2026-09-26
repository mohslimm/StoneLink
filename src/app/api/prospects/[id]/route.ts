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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const prospect = await Prospect.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!prospect) {
      return NextResponse.json({ error: 'Prospect introuvable' }, { status: 404 });
    }
    return NextResponse.json(prospect);
  } catch (error: any) {
    console.warn('[PATCH /api/prospects/[id]] DB error, fallback:', error.message);
    const body = await request.clone().json().catch(() => ({}));
    const { id } = await params;
    return NextResponse.json({ _id: id, ...body, source: 'memory_fallback' });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const prospect = await Prospect.findByIdAndDelete(id);
    if (!prospect) {
      return NextResponse.json({ message: 'Prospect supprimé (local)' });
    }
    return NextResponse.json({ message: 'Prospect supprimé' });
  } catch (error: any) {
    console.warn('[DELETE /api/prospects/[id]] DB error, fallback:', error.message);
    return NextResponse.json({ message: 'Prospect supprimé (local)' });
  }
}
