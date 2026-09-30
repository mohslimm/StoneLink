import { useRef } from 'react'
import { useInView } from 'framer-motion'

// Returns a ref and boolean — use to trigger animations on scroll
export function useScrollAnimation(options = {}) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: options.once ?? true,
    margin: options.margin ?? '0px 0px -80px 0px',
    amount: options.amount ?? 0.2,
  })

  return { ref, isInView }
}
