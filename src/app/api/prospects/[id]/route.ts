import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Prospect from '@/models/Prospect';

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
    return NextResponse.json({ error: error.message }, { status: 500 });
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
      return NextResponse.json({ error: 'Prospect introuvable' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Prospect supprimé' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
