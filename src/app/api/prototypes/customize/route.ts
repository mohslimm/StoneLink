import { NextResponse } from 'next/server';
import { PrototypeCustomizationSchema } from '@/lib/validators';
import { escapeHtml } from '@/lib/utils';
import type { PrototypeResolver } from '@/types/prototypes';

// --- PROTOTYPE RESOLVER DICTIONARY ---
// Mapping prototypeId -> slug path (extensible for future scaling)
const PROTOTYPE_RESOLVER: PrototypeResolver = {
  'dental-zekri': {
    slug: 'dental/zekri',
    niche: 'dental'
  },
  'travel-parfait': {
    slug: 'travel/parfait',
    niche: 'travel'
  },
  // ADD NEW PROTOTYPES HERE
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    
    // 1. Zod Validation (Production-grade)
    const result = PrototypeCustomizationSchema.safeParse(rawBody);
    
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: result.error.format() 
      }, { status: 400 });
    }

    const { prototypeId, prospectId, customizations } = result.data;

    console.log(`[Customize] Processing: ${prototypeId} for ${prospectId}`);

    // 2. Resolve Prototype Slug
    const resolverEntry = PROTOTYPE_RESOLVER[prototypeId];
    
    if (!resolverEntry) {
      return NextResponse.json({ error: `Prototype '${prototypeId}' not found in resolver.` }, { status: 404 });
    }

    const { slug } = resolverEntry;

    // 3. Sanitize and Map Tokens
    // We maintain backward compatibility while ensuring security
    const sanitizedCustomizations: Record<string, string> = {};
    Object.entries(customizations).forEach(([key, value]) => {
      sanitizedCustomizations[key] = escapeHtml(value);
    });

    // 4. Generate Dynamic Preview URL
    // Format: /prototypes/[slug]/index.html?prospect=[id]&[token]=[value]...
    const searchParams = new URLSearchParams();
    searchParams.append('prospect', prospectId);
    
    Object.entries(sanitizedCustomizations).forEach(([key, value]) => {
      searchParams.append(key.toLowerCase(), value); // tokens are usually passed as lower-case params
    });

    const previewPath = `/prototypes/${slug}/index.html?${searchParams.toString()}`;
    const previewUrl = `${BASE_URL}${previewPath}`;

    // 5. Simulate Generation Latency
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({ 
      previewUrl,
      generatedAt: new Date().toISOString(),
      status: 'success'
    });

  } catch (error) {
    console.error('[Customize API Error]', error);
    return NextResponse.json({ 
      error: 'Échec de la personnalisation du prototype',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
