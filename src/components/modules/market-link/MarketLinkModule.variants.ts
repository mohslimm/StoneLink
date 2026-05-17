export const DURATION = {
  fast: 0.15,
  base: 0.3,
  slow: 0.6,
  cinematic: 1.2
};

export const EASE = {
  smooth: [0.22, 1, 0.36, 1],
  snap: [0.34, 1.56, 0.64, 1]
};

export const VARIANTS = {
  container: {
    animate: { 
      transition: { 
        staggerChildren: 0.08 
      } 
    }
  },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: DURATION.slow, 
        ease: EASE.smooth 
      } 
    }
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: DURATION.base } },
    exit: { opacity: 0, transition: { duration: DURATION.fast } }
  }
};
