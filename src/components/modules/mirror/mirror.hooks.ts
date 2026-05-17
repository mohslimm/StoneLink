import { useState, useEffect, useCallback, useMemo } from 'react';
import { useStoneStore } from '@/stores/useStoneStore';
import { mirrorService } from './mirror.service';

export const useMirror = () => {
  const { activeProspect } = useStoneStore();
  const [inactionCost, setInactionCost] = useState(0);
  const [showSimulation, setShowSimulation] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const monthlyLoss = activeProspect?.estimatedLoss || 0;
  const hourlyLoss = monthlyLoss / (30 * 24);
  const secondLoss = hourlyLoss / 3600;

  useEffect(() => {
    if (!activeProspect) return;
    
    const timer = setInterval(() => {
      setInactionCost(prev => prev + secondLoss);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeProspect, secondLoss]);

  const handleStartSimulation = useCallback(async () => {
    if (!activeProspect) return;
    setIsInitializing(true);
    try {
      await mirrorService.startSimulation(activeProspect.companyName);
      setShowSimulation(true);
    } finally {
      setIsInitializing(false);
    }
  }, [activeProspect]);

  const growthProjection = useMemo(() => {
    if (!activeProspect) return 0;
    return Math.round((100 - (activeProspect.lighthouseScore ?? 0)) * 3.4);
  }, [activeProspect]);

  const additionalRevenue = useMemo(() => {
    return monthlyLoss * 1.5;
  }, [monthlyLoss]);

  return {
    activeProspect,
    inactionCost,
    showSimulation,
    setShowSimulation,
    isInitializing,
    handleStartSimulation,
    growthProjection,
    additionalRevenue,
    hourlyLoss,
    monthlyLoss
  };
};
