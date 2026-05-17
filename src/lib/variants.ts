import { Variants } from 'framer-motion'

export const VARIANTS: Record<string, Variants> = {
  // Entrée de page
  pageEnter: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.3 } }
  },
  // Apparition de liste (stagger)
  listContainer: {
    animate: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } }
  },
  listItem: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  },
  // Card hover
  cardHover: {
    rest: { scale: 1, borderColor: 'var(--border-default)' },
    hover: { scale: 1.015, borderColor: 'var(--border-gold)', transition: { duration: 0.25 } }
  },
  // Loader pulse
  pulse: {
    animate: { opacity: [0.4, 1, 0.4], transition: { duration: 2, repeat: Infinity } }
  }
}

// Timing constants
export const DURATION = { fast: 0.15, base: 0.3, slow: 0.6, cinematic: 1.2 }
export const EASE = { smooth: [0.22, 1, 0.36, 1], snap: [0.34, 1.56, 0.64, 1] }
