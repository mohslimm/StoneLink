import { Variants } from 'framer-motion';

export const TERMINAL_VARIANTS: Record<string, Variants> = {
  container: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.4 } 
    }
  },
  line: {
    initial: { opacity: 0, x: -10 },
    animate: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.2 } 
    }
  }
};
