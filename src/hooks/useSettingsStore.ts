import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  activeFounder: 'abdelhadi' | 'mohamed';
  callingMethod: 'hybrid' | 'phonelink' | 'whatsapp';
  defaultCountryCode: '+213' | '+966' | '+33' | '+971';
  autoFormatNumbers: boolean;
  telegramWebhook: string;
  notifyOnScan: boolean;
  notifyOnPriorityLead: boolean;
  geminiModel: string;
  squareUsdRate: number;
  squareEurRate: number;
  customSalesPrompt: string;

  setActiveFounder: (founder: 'abdelhadi' | 'mohamed') => void;
  setCallingMethod: (method: 'hybrid' | 'phonelink' | 'whatsapp') => void;
  setDefaultCountryCode: (code: '+213' | '+966' | '+33' | '+971') => void;
  setAutoFormatNumbers: (val: boolean) => void;
  setTelegramWebhook: (url: string) => void;
  setNotifyOnScan: (val: boolean) => void;
  setNotifyOnPriorityLead: (val: boolean) => void;
  setGeminiModel: (model: string) => void;
  setSquareRates: (usd: number, eur: number) => void;
  setCustomSalesPrompt: (prompt: string) => void;
  formatPhoneNumber: (rawPhone: string) => { telUrl: string; waUrl: string; displayPhone: string };
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      activeFounder: 'abdelhadi',
      callingMethod: 'hybrid',
      defaultCountryCode: '+213',
      autoFormatNumbers: true,
      telegramWebhook: '',
      notifyOnScan: true,
      notifyOnPriorityLead: true,
      geminiModel: 'gemini-flash-latest',
      squareUsdRate: 250,
      squareEurRate: 270,
      customSalesPrompt: '',

      setActiveFounder: (founder) => set({ activeFounder: founder }),
      setCallingMethod: (method) => set({ callingMethod: method }),
      setDefaultCountryCode: (code) => set({ defaultCountryCode: code }),
      setAutoFormatNumbers: (val) => set({ autoFormatNumbers: val }),
      setTelegramWebhook: (url) => set({ telegramWebhook: url }),
      setNotifyOnScan: (val) => set({ notifyOnScan: val }),
      setNotifyOnPriorityLead: (val) => set({ notifyOnPriorityLead: val }),
      setGeminiModel: (model) => set({ geminiModel: model }),
      setSquareRates: (usd, eur) => set({ squareUsdRate: usd, squareEurRate: eur }),
      setCustomSalesPrompt: (prompt) => set({ customSalesPrompt: prompt }),

      formatPhoneNumber: (rawPhone: string) => {
        if (!rawPhone || rawPhone === 'Non renseigné' || rawPhone === 'N/A') {
          return { telUrl: '', waUrl: '', displayPhone: 'Non renseigné' };
        }

        const defaultPrefix = get().defaultCountryCode;
        let clean = rawPhone.replace(/[^\d+]/g, '');

        if (clean.startsWith('00')) {
          clean = '+' + clean.slice(2);
        } else if (clean.startsWith('0') && get().autoFormatNumbers) {
          clean = defaultPrefix + clean.slice(1);
        } else if (!clean.startsWith('+')) {
          clean = defaultPrefix + clean;
        }

        const numericOnly = clean.replace('+', '');
        return {
          telUrl: `tel:${clean}`,
          waUrl: `https://wa.me/${numericOnly}`,
          displayPhone: clean
        };
      },
    }),
    {
      name: 'stonelink-founders-settings',
    }
  )
);
