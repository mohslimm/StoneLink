import { Variants } from 'framer-motion';

export const MIRROR_VARIANTS: Record<string, Variants> = {
  container: {
    animate: { 
      transition: { staggerChildren: 0.1 } 
    }
  },
  item: {
    initial: { opacity: 0, y: 24 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
    }
  },
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  modal: {
    initial: { scale: 0.9, y: 20 },
    animate: { scale: 1, y: 0 }
  }
};
