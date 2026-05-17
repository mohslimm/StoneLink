import { Variants } from 'framer-motion';

export const AGENT_VARIANTS: Record<string, Variants> = {
  container: {
    animate: { 
      transition: { staggerChildren: 0.08 } 
    }
  },
  item: {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.3 } 
    }
  },
  message: {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0 
    }
  }
};
