import { Variants } from 'framer-motion';

export const SHADOW_VARIANTS: Record<string, Variants> = {
  container: {
    animate: { transition: { staggerChildren: 0.1 } }
  },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  }
};
