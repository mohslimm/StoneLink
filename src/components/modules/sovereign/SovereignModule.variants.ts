import { Variants } from 'framer-motion';

export const SOVEREIGN_VARIANTS: Record<string, Variants> = {
  container: {
    animate: { transition: { staggerChildren: 0.1 } }
  },
  item: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  }
};
