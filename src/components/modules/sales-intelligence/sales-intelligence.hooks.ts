import { useState, useCallback, useEffect } from 'react';
import { useStoneStore } from '@/stores/useStoneStore';
import { salesIntelService } from './sales-intelligence.service';
import { SalesIntelStep } from './SalesIntelModule.types';

const LOADING_MESSAGES = [
  "Analyse du profil prospect...",
  "Personnalisation de l'identité visuelle...",
  "Rédaction du script commercial...",
  "Consolidation du package...",
  "Application des tokens Quiet Luxury..."
];

export const useSalesIntel = () => {
  const { activeProspect, setAIAssets, aiAssets } = useStoneStore();
  const [step, setStep] = useState<SalesIntelStep>(activeProspect ? 1 : 0);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const currentAssets = activeProspect ? aiAssets[activeProspect.id] : null;

  // Sync step with assets
  useEffect(() => {
    if (currentAssets && step < 3) {
      setStep(3);
    } else if (!activeProspect) {
      setStep(0);
    } else if (activeProspect && !currentAssets && step === 0) {
      setStep(1);
    }
  }, [currentAssets, activeProspect, step]);

  const generatePackage = useCallback(async () => {
    if (!activeProspect) return;
    
    setStep(2);
    setError(null);
    
    let idx = 0;
    const iv = setInterval(() => {
      setLoadingMsg(LOADING_MESSAGES[idx % LOADING_MESSAGES.length]);
      idx++;
    }, 2000);

    try {
      const data = await salesIntelService.generatePackage(activeProspect, setLoadingMsg);
      setAIAssets(activeProspect.id, data);
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Erreur de génération.");
      setStep(1);
    } finally {
      clearInterval(iv);
    }
  }, [activeProspect, setAIAssets]);

  return {
    activeProspect,
    currentAssets,
    step,
    setStep,
    loadingMsg,
    error,
    generatePackage
  };
};
