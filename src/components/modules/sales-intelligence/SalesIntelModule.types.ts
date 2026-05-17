import { AIAssets } from '@/stores/useStoneStore';

export interface SalesIntelModuleProps {
  // Add props if needed in the future
}

export type SalesIntelStep = 0 | 1 | 2 | 3; // 0: Select, 1: Ready, 2: Loading, 3: Results

export interface SalesIntelState {
  step: SalesIntelStep;
  loadingMsg: string;
  activeTab: string;
  copied: boolean;
  error: string | null;
}
