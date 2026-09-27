import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiModelOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  isDefault?: boolean;
}

export const SUPPORTED_GEMINI_MODELS: GeminiModelOption[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Google Gemini 3.8 Flash',
    badge: 'Recommandé (Dernier cri)',
    description: 'Intelligence de pointe pour argumentaires de vente complexes et clauses juridiques sur-mesure.',
    isDefault: true,
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Google Gemini 3.7 Flash',
    badge: 'Haute Disponibilité',
    description: 'Stabilité éprouvée et latence ultra-faible même lors des pics d\'affluence mondiaux.',
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Google Gemini 3.6 Flash',
    badge: 'Secours Rapide',
    description: 'Exécution véloce pour les cold calls directs et pitchs instantanés.',
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Google Gemini 3.5 Flash',
    badge: 'Repli Universel',
    description: 'Disponibilité continue en cas de saturation prolongée des nouveaux modèles.',
  },
];

export const FALLBACK_CASCADE = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
];

interface CallGeminiOptions {
  prompt: string;
  preferredModel?: string;
  generationConfig?: any;
  systemInstruction?: string;
}

export interface CallGeminiResult {
  text: string;
  modelUsed: string;
  fallbackUsed: boolean;
  latencyMs: number;
}

/**
 * Robust caller with auto-retry and multi-tier model fallback.
 * Prevents 503 (High Demand Spikes) and 429 errors from breaking sales operations.
 */
export async function callGeminiResilient(options: CallGeminiOptions): Promise<CallGeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY non configurée');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const preferred = options.preferredModel || 'gemini-3.8-flash';
  
  // Build priority order: preferred first, then remaining models from cascade
  const modelQueue = [
    preferred,
    ...FALLBACK_CASCADE.filter((m) => m !== preferred),
  ];

  const startTime = Date.now();
  let lastError: any = null;

  for (let i = 0; i < modelQueue.length; i++) {
    const currentModelName = modelQueue[i];
    try {
      const model = genAI.getGenerativeModel({
        model: currentModelName,
        generationConfig: options.generationConfig,
        systemInstruction: options.systemInstruction,
      });

      const result = await model.generateContent(options.prompt);
      const text = result.response.text();
      const latencyMs = Date.now() - startTime;

      return {
        text,
        modelUsed: currentModelName,
        fallbackUsed: currentModelName !== preferred,
        latencyMs,
      };
    } catch (err: any) {
      lastError = err;
      const is503orSpike =
        err?.message?.includes('503') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('Spikes in demand') ||
        err?.message?.includes('Service Unavailable') ||
        err?.message?.includes('429');

      console.warn(
        `[Gemini Client] Erreur sur ${currentModelName} (${is503orSpike ? 'Pic de charge Google 503' : err.message}). Tentative de basculement...`
      );

      // If it's a 503 spike on the primary, wait 600ms before trying the fallback
      if (is503orSpike && i < modelQueue.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }
  }

  throw lastError || new Error('Tous les modèles Gemini de secours ont échoué.');
}
