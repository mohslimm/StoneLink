import { NextResponse } from 'next/server';
import { USER_PROFILES } from '@/data/profiles';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const cleanUser = String(username || '').trim().toLowerCase() as 'slim' | 'lpiks';

    if (cleanUser !== 'slim' && cleanUser !== 'lpiks') {
      return NextResponse.json(
        { success: false, error: 'Identifiant invalide. Utilisateurs autorisés: slim ou lpiks' },
        { status: 401 }
      );
    }

    if (password !== 'StoneLink2026!' && password !== 'stonelink2026!') {
      return NextResponse.json(
        { success: false, error: 'Mot de passe incorrect.' },
        { status: 401 }
      );
    }

    const profile = USER_PROFILES[cleanUser];

    return NextResponse.json({
      success: true,
      user: {
        username: profile.username,
        name: profile.name,
        role: profile.role,
        email: profile.email,
        stats: profile.stats,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'authentification' },
      { status: 500 }
    );
  }
}
