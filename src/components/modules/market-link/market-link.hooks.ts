import { useState, useCallback } from 'react';
import { marketLinkService } from './market-link.service';
import type { AuditResult } from './MarketLinkModule.types';

/**
 * Hook for Market Link functionality
 */
export const useMarketLink = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [step, setStep] = useState(0); // 0: idle, 1: DNS, 2: Lighthouse, 3: Success
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAudit = useCallback(async (targetUrl?: string) => {
    const finalUrl = targetUrl || url;
    if (!finalUrl) return;

    setStatus('loading');
    setError(null);
    setResult(null);

    try {
      const auditResult = await marketLinkService.runAudit(finalUrl, (currentStep) => {
        setStep(currentStep);
      });
      
      setResult(auditResult);
      setStep(3);
      setStatus('success');
    } catch (err: any) {
      setError(err.message || "L'audit a échoué.");
      setStatus('error');
      setStep(0);
    }
  }, [url]);

  return {
    url,
    setUrl,
    status,
    step,
    result,
    error,
    runAudit
  };
};
