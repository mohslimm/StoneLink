export interface AnalyticsModuleProps {
  // Define props if needed
}

export type AIReportStatus = 'idle' | 'generating' | 'ready';

export interface AnalyticsState {
  aiReportStatus: AIReportStatus;
  report: string | null;
}
