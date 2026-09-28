import { NextResponse } from 'next/server';
import { USER_PROFILES } from '@/data/profiles';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (username === 'slim' || username === 'lpiks') {
    return NextResponse.json({
      success: true,
      profile: USER_PROFILES[username],
    });
  }

  return NextResponse.json({
    success: true,
    profiles: USER_PROFILES,
  });
}
