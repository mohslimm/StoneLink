import { NextRequest, NextResponse } from 'next/server';
import { callGeminiResilient, SUPPORTED_GEMINI_MODELS } from '@/lib/gemini';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const searchParams = request.nextUrl.searchParams;
  const requestedModel = searchParams.get('model') || 'gemini-flash-latest';
  const strict = searchParams.get('strict') === 'true';

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "Clé GEMINI_API_KEY non configurée dans .env.local"
      }, { status: 400 });
    }

    if (strict) {
      // Direct single-model test without fallback
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: requestedModel });
      const result = await model.generateContent("Ping. Réponds uniquement: PONG");
      const responseText = result.response.text().trim();
      const latencyMs = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        model: requestedModel,
        fallbackUsed: false,
        response: responseText,
        latencyMs,
        status: 'Opérationnel & Actif'
      });
    }

    // Resilient test with automatic multi-tier fallback
    const result = await callGeminiResilient({
      prompt: "Ping. Réponds uniquement: PONG",
      preferredModel: requestedModel,
    });

    return NextResponse.json({
      success: true,
      model: result.modelUsed,
      requestedModel,
      fallbackUsed: result.fallbackUsed,
      note: result.fallbackUsed
        ? `Pic de charge temporaire détecté sur ${requestedModel} (Google 503). Le système a basculé automatiquement avec succès sur ${result.modelUsed}.`
        : 'Connexion directe optimale.',
      response: result.text.trim(),
      latencyMs: result.latencyMs,
      status: 'Opérationnel & Actif',
      availableModels: SUPPORTED_GEMINI_MODELS
    });
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    const is503 = error?.message?.includes('503') || error?.message?.includes('high demand') || error?.message?.includes('Spikes in demand');
    
    return NextResponse.json({
      success: false,
      isDemandSpike: is503,
      error: is503
        ? "Pic d'affluence mondial temporaire sur les serveurs Google (503 Service Unavailable). Réessayez dans quelques secondes ou basculez sur Gemini 3.7 Flash."
        : (error?.message || 'Erreur lors du test de connexion Gemini'),
      rawError: error?.message,
      latencyMs
    }, { status: 500 });
  }
}
