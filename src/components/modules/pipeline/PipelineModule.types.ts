export * from '@/types/pipeline';

export interface PipelineBoardProps {
  // Add specific props if needed
}

export interface ProspectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  prospectId: string | null;
}
