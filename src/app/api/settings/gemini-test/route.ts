import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

export async function GET() {
  const startTime = Date.now();
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "Clé GEMINI_API_KEY non configurée dans .env.local"
      }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });
    const result = await model.generateContent("Ping. Réponds uniquement: PONG");
    const responseText = result.response.text().trim();
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      model: 'gemini-3.8-flash',
      response: responseText,
      latencyMs,
      status: 'Opérationnel & Actif'
    });
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    return NextResponse.json({
      success: false,
      error: error?.message || 'Erreur lors du test de connexion Gemini',
      latencyMs
    }, { status: 500 });
  }
}
