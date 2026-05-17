export interface ShadowSignal {
  id: number;
  time: string;
  company: string;
  title: string;
  text: string;
  source: string;
  type: string;
  confidence: number;
}

export interface FilterButtonProps {
  label: string;
  active?: boolean;
}

export interface TrendItemProps {
  label: string;
  trend: string;
  status: 'rising' | 'falling';
}
