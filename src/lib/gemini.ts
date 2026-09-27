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
  purpose?: 'calls' | 'contracts' | 'general';
}

export interface CallGeminiResult {
  text: string;
  modelUsed: string;
  fallbackUsed: boolean;
  latencyMs: number;
  keyPurpose?: string;
}

/**
 * Helper to mask API keys in logs for security.
 */
function maskKey(key: string): string {
  if (!key || key.length < 8) return '***';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

/**
 * Resolves API keys in priority order based on the requested operational purpose.
 * Segregates quotas (Calls vs Contracts vs General) while providing automatic failover.
 */
function getApiKeysForPurpose(purpose?: 'calls' | 'contracts' | 'general'): string[] {
  const callsKey = process.env.GEMINI_API_KEY_CALLS?.trim();
  const contractsKey = process.env.GEMINI_API_KEY_CONTRACTS?.trim();
  const agencyKey = process.env.GEMINI_API_KEY_AGENCY?.trim();
  const defaultKey = process.env.GEMINI_API_KEY?.trim();

  let ordered: (string | undefined)[] = [];

  if (purpose === 'calls') {
    // 1. Abdelhadi's call key -> 2. Agency master -> 3. Default fallback -> 4. Contracts key
    ordered = [callsKey, agencyKey, defaultKey, contractsKey];
  } else if (purpose === 'contracts') {
    // 1. Mohamed's contract key -> 2. Agency master -> 3. Default fallback -> 4. Calls key
    ordered = [contractsKey, agencyKey, defaultKey, callsKey];
  } else {
    // General: Agency master -> Default -> Calls -> Contracts
    ordered = [agencyKey, defaultKey, callsKey, contractsKey];
  }

  // Filter out falsy/empty keys and deduplicate
  const uniqueKeys = Array.from(new Set(ordered.filter((k): k is string => Boolean(k && k.length > 5))));
  return uniqueKeys;
}

/**
 * Robust caller with dual resilience: Multi-Key Quota Cascade + Multi-Tier Model Fallback.
 * Prevents 503 (High Demand Spikes), 429 (Rate Limits) and Quota exhaustion from breaking sales operations.
 */
export async function callGeminiResilient(options: CallGeminiOptions): Promise<CallGeminiResult> {
  const keys = getApiKeysForPurpose(options.purpose);
  if (keys.length === 0) {
    throw new Error('Aucune clé GEMINI_API_KEY configurée dans l\'environnement.');
  }

  const preferred = options.preferredModel || 'gemini-3.8-flash';
  const modelQueue = [
    preferred,
    ...FALLBACK_CASCADE.filter((m) => m !== preferred),
  ];

  const startTime = Date.now();
  let lastError: any = null;

  // Outer loop: Try keys in priority order
  for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
    const currentApiKey = keys[keyIdx];
    const genAI = new GoogleGenerativeAI(currentApiKey);

    // Inner loop: Try model cascade on current key
    for (let modelIdx = 0; modelIdx < modelQueue.length; modelIdx++) {
      const currentModelName = modelQueue[modelIdx];
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
          fallbackUsed: currentModelName !== preferred || keyIdx > 0,
          latencyMs,
          keyPurpose: options.purpose || 'general',
        };
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || '';
        const isQuotaOrAuth =
          msg.includes('429') ||
          msg.includes('quota') ||
          msg.includes('Quota exceeded') ||
          msg.includes('ResourceExhausted') ||
          msg.includes('API_KEY_INVALID') ||
          msg.includes('403') ||
          msg.includes('401');

        const is503orSpike =
          msg.includes('503') ||
          msg.includes('high demand') ||
          msg.includes('Spikes in demand') ||
          msg.includes('Service Unavailable');

        console.warn(
          `[Gemini Client] Erreur sur clé (${maskKey(currentApiKey)}, rôle: ${options.purpose || 'general'}) / modèle ${currentModelName} : ${isQuotaOrAuth ? 'Quota/Rate Limit (429)' : is503orSpike ? 'Pic 503' : msg}. Basculement en cours...`
        );

        // If quota limit or bad key, immediately jump to the next API key in the pool!
        if (isQuotaOrAuth) {
          break; // Break inner model loop to try next API key
        }

        // If 503 spike, wait 500ms before trying the next fallback model on this key
        if (is503orSpike && modelIdx < modelQueue.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }
  }

  throw lastError || new Error('Toutes les clés API et modèles Gemini de secours ont échoué.');
}
