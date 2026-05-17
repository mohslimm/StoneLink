import { Variants } from 'framer-motion';

export const LAUNCH_CONTROL_VARIANTS: Record<string, Variants> = {
  container: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.6 } }
  },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  }
};
