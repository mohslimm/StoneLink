import { NextResponse } from 'next/server';
import { PROTOTYPE_CATALOG } from './catalog';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const niche = searchParams.get('niche');

  let prototypes = PROTOTYPE_CATALOG;

  if (niche && niche !== 'all') {
    prototypes = prototypes.filter(
      (p) => p.niche.toLowerCase() === niche.toLowerCase()
    );
  }

  return NextResponse.json({
    prototypes,
    count: prototypes.length,
  });
}