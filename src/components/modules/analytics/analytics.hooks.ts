import { useState, useCallback, useMemo } from 'react';
import { useStoneStore } from '@/stores/useStoneStore';
import { analyticsService } from './analytics.service';
import type { AIReportStatus } from './AnalyticsModule.types';

export const useAnalytics = () => {
  const { getStats } = useStoneStore();
  const stats = getStats();
  
  const [aiReportStatus, setAiReportStatus] = useState<AIReportStatus>('idle');
  const [report, setReport] = useState<string[] | null>(null);

  const generateReport = useCallback(async () => {
    setAiReportStatus('generating');
    try {
      const data = await analyticsService.generateWeeklyReport();
      setReport(data.insights);
      setAiReportStatus('ready');
    } catch (err) {
      setAiReportStatus('idle');
      console.error('Failed to generate report:', err);
    }
  }, []);

  const winRate = useMemo(() => {
    return stats.totalProspects > 0 
      ? Math.round((stats.closedWonThisMonth / stats.totalProspects) * 100) 
      : 0;
  }, [stats.totalProspects, stats.closedWonThisMonth]);

  return {
    stats,
    winRate,
    aiReportStatus,
    report,
    generateReport
  };
};
