import { useState, useCallback, useMemo } from 'react';
import { useStoneStore } from '@/stores/useStoneStore';
import { vaultService } from './vault.service';

export const useVault = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { aiAssets, activeProspect } = useStoneStore();
  
  const currentAssets = useMemo(() => 
    activeProspect ? aiAssets[activeProspect.id] : null,
    [aiAssets, activeProspect]
  );

  const handleExport = useCallback(async () => {
    if (!activeProspect) return;
    setIsExporting(true);
    try {
      await vaultService.exportAssets(activeProspect.id, activeProspect.companyName);
    } finally {
      setIsExporting(false);
    }
  }, [activeProspect]);

  const handleShare = useCallback(async () => {
    if (!activeProspect) return;
    return await vaultService.shareAssets(activeProspect.id);
  }, [activeProspect]);

  return {
    activeProspect,
    currentAssets,
    isExporting,
    handleExport,
    handleShare
  };
};
