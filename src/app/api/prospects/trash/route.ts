import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// DELETE /api/prospects/trash -> Vider définitivement la corbeille
export async function DELETE() {
  try {
    await dbConnect();
    const col = (await import('mongoose')).default.connection.db!.collection('prospects');

    const result = await col.deleteMany({ isDeleted: true });
    console.log(`\x1b[32m[DELETE /api/prospects/trash] 🧹 Corbeille vidée : ${result.deletedCount} prospects supprimés définitivement\x1b[0m`);

    return NextResponse.json({
      message: 'Corbeille vidée avec succès',
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error(`\x1b[31m[DELETE /api/prospects/trash] ❌ Erreur :\x1b[0m`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/prospects/trash -> Actions groupées (ex: restaurer tout)
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    await dbConnect();
    const col = (await import('mongoose')).default.connection.db!.collection('prospects');

    if (body.action === 'restore-all') {
      const result = await col.updateMany(
        { isDeleted: true },
        { $set: { isDeleted: false, deletedAt: null, updatedAt: new Date() } }
      );
      console.log(`\x1b[32m[POST /api/prospects/trash] 🔄 Tous les prospects restaurés : ${result.modifiedCount}\x1b[0m`);
      return NextResponse.json({
        message: 'Tous les prospects ont été restaurés',
        restoredCount: result.modifiedCount,
      });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error: any) {
    console.error(`\x1b[31m[POST /api/prospects/trash] ❌ Erreur :\x1b[0m`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
