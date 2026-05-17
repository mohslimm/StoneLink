import type { Metadata } from 'next'
import { PipelineBoard } from '@/components/modules/pipeline/PipelineBoard'

export const metadata: Metadata = { 
  title: 'Pipeline — StoneLink Sales OS',
  description: 'Suivi de prospection avec IA — Kanban, scripts d\'appel et prototypes automatisés.',
}

export default function PipelinePage() {
  return <PipelineBoard />
}
