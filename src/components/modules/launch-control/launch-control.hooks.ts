import { useState, useCallback } from 'react';
import { useStoneStore } from '@/stores/useStoneStore';
import { launchControlService } from './launch-control.service';

export const useLaunchControl = () => {
  const [activePhaseId, setActivePhaseId] = useState('p0');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    seedSystemData, 
    purgeSystem, 
    globalStatus, 
    setGlobalStatus 
  } = useStoneStore();

  const handleSeed = useCallback(async () => {
    setIsProcessing(true);
    setGlobalStatus('scanning');
    try {
      seedSystemData();
      setGlobalStatus('ready');
    } catch (err) {
      setGlobalStatus('idle');
    } finally {
      setIsProcessing(false);
    }
  }, [seedSystemData, setGlobalStatus]);

  const handlePurge = useCallback(async () => {
    setIsProcessing(true);
    try {
      await launchControlService.purgeSystem();
      purgeSystem();
      setGlobalStatus('idle');
    } finally {
      setIsProcessing(false);
    }
  }, [purgeSystem, setGlobalStatus]);

  return {
    activePhaseId,
    setActivePhaseId,
    isProcessing,
    globalStatus,
    handleSeed,
    handlePurge
  };
};
