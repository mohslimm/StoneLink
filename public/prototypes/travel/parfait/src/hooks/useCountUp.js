import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { useCountUp as baseCountUp } from '../animations/effects'

// Wraps useCountUp with automatic inView detection
export function useCountUp(target, duration = 2, threshold = 0.5) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: `-${Math.floor((1 - threshold) * 100)}px` })
  const count = baseCountUp(target, isInView, duration)
  return { ref, count, isInView }
}
