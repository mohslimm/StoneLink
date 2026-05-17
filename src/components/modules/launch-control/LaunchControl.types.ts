import { LucideIcon } from 'lucide-react';

export type PhaseStatus = 'ready' | 'pending' | 'active' | 'completed';

export interface PhaseKPI {
  label: string;
  value: string;
  trend: string;
}

export interface LaunchPhase {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  status: PhaseStatus;
  objectives: string[];
  kpi: PhaseKPI;
}

export interface PhaseSidebarProps {
  phases: LaunchPhase[];
  activePhaseId: string;
  onPhaseSelect: (id: string) => void;
}

export interface MissionControlProps {
  phase: LaunchPhase;
}
