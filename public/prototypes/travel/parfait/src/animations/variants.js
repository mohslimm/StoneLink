// ═══════════════════════════════════════════════
//   PARFAIT VOYAGES — Framer Motion Variants
// ═══════════════════════════════════════════════

// ─── Basic Fade Variants ───────────────────────

export const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

export const fadeInDown = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

export const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

export const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

// ─── Scale ────────────────────────────────────

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
  },
}

// ─── Stagger ──────────────────────────────────

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

// ─── Card & Button ────────────────────────────

export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.04,
    y: -8,
    transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] },
  },
}

export const buttonTap = {
  tap: { scale: 0.95 },
}

// ─── Page Transitions ─────────────────────────

export const pageTransition = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
}

// ─── Clip Path Reveal ─────────────────────────

export const clipPathReveal = {
  hidden: { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
  visible: {
    clipPath: 'inset(0 0% 0 0)',
    opacity: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
}

// ─── Stepper slide ────────────────────────────

export const stepForward = {
  hidden:  { opacity: 0, x: 80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeInOut' } },
  exit:    { opacity: 0, x: -80, transition: { duration: 0.3, ease: 'easeInOut' } },
}

export const stepBackward = {
  hidden:  { opacity: 0, x: -80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeInOut' } },
  exit:    { opacity: 0, x: 80, transition: { duration: 0.3, ease: 'easeInOut' } },
}

// ─── Overlay slide ────────────────────────────

export const overlaySlideUp = {
  hidden:  { y: '100%' },
  visible: { y: '0%', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit:    { y: '100%', transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

// ─── Drawer (mobile nav) ──────────────────────

export const drawerVariant = {
  hidden:  { opacity: 0, y: -20, scaleY: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scaleY: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -20,
    scaleY: 0.95,
    transition: { duration: 0.25 },
  },
}

// ─── Modal ────────────────────────────────────

export const modalBackdrop = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}

export const modalContent = {
  hidden:  { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 20,
    transition: { duration: 0.25 },
  },
}

// ─── Spring configs ───────────────────────────

export const springBounce = {
  type: 'spring',
  stiffness: 280,
  damping: 18,
}

export const springSmooth = {
  type: 'spring',
  stiffness: 120,
  damping: 20,
}
