import { Variants } from 'framer-motion';

export const PIPELINE_VARIANTS: Record<string, Variants> = {
  container: {
    animate: { transition: { staggerChildren: 0.08 } }
  },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  },
  drawer: {
    initial: { x: '100%' },
    animate: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } },
    exit: { x: '100%', transition: { type: 'spring', damping: 25, stiffness: 200 } }
  }
};
