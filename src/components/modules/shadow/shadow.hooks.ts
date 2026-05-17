import { useState, useCallback } from 'react';
import { shadowService } from './shadow.service';
import type { ShadowSignal } from './ShadowModule.types';

export const useShadow = () => {
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [isIntercepting, setIsIntercepting] = useState(false);

  const handleEngage = useCallback(async (signal: ShadowSignal) => {
    await shadowService.engageWithSignal(signal);
  }, []);

  const handleIntercept = useCallback(async (target: string) => {
    setIsIntercepting(true);
    await shadowService.launchInterception(target);
    setTimeout(() => setIsIntercepting(false), 5000); // UI feedback duration
  }, []);

  return {
    activeFilter,
    setActiveFilter,
    isIntercepting,
    handleEngage,
    handleIntercept
  };
};
