import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await dbConnect();
    const col = (await import('mongoose')).default.connection.db!.collection('prospects');

    const result = await col.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      { $set: { isDeleted: false, deletedAt: null, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Prospect introuvable dans la base' }, { status: 404 });
    }

    console.log(`\x1b[32m[POST /api/prospects/${id}/restore] 🔄 Prospect restauré avec succès depuis la corbeille !\x1b[0m`);
    return NextResponse.json({ message: 'Prospect restauré avec succès', data: result });
  } catch (error: any) {
    console.error(`\x1b[31m[POST /api/prospects/${id}/restore] ❌ Erreur restauration :\x1b[0m`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
