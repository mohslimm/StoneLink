import { Variants } from 'framer-motion';

export const VAULT_VARIANTS: Record<string, Variants> = {
  container: {
    animate: { transition: { staggerChildren: 0.1 } }
  },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  }
};
