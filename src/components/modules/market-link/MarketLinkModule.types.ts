export interface AuditScore {
  performance: number;
  seo: number;
  mobile: number;
}

export interface AuditResult {
  lighthouseScore: number;
  scores: AuditScore;
  auditSummary: string;
  estimatedLoss: number;
}

export interface MarketLinkModuleProps {
  // Add props if needed in the future
}
