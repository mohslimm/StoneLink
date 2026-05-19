export interface SovereignResult {
  title: string;
  score: number;
  text: string;
  fullContent?: string;
  metadata?: {
    confidentiality: string;
    lastIndexed: string;
    author: string;
    vectorId: string;
    category: string;
  };
}

export interface StatRowProps {
  label: string;
  value: string;
}
