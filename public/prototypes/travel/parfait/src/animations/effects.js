// ═══════════════════════════════════════════════
//   PARFAIT VOYAGES — Animation Effects
// ═══════════════════════════════════════════════
import { useEffect, useRef, useState, useCallback } from 'react'
import {
  useMotionValue,
  useTransform,
  animate,
  useSpring,
} from 'framer-motion'

// ─── Magnetic Button ──────────────────────────
// Attracts cursor toward center within 80px radius
export function useMagneticButton(ref) {
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width  / 2
      const cy = rect.top  + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      const radius = 80

      if (dist < radius) {
        const strength = (1 - dist / radius) * 0.4
        setPos({ x: dx * strength, y: dy * strength })
      } else {
        setPos({ x: 0, y: 0 })
      }
    }

    const handleMouseLeave = () => setPos({ x: 0, y: 0 })

    window.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [ref])

  return pos
}

// ─── 3D Tilt ──────────────────────────────────
// Returns { rotateX, rotateY, style } to apply to the element
export function useTilt3D(ref, maxDeg = 12) {
  const rotateX = useSpring(0, { stiffness: 150, damping: 20 })
  const rotateY = useSpring(0, { stiffness: 150, damping: 20 })
  const glare   = useSpring(0, { stiffness: 100, damping: 20 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width  - 0.5
      const y = (e.clientY - rect.top)  / rect.height - 0.5

      rotateY.set(x * maxDeg * 2)
      rotateX.set(-y * maxDeg * 2)
      glare.set(Math.sqrt(x * x + y * y))
    }

    const handleMouseLeave = () => {
      rotateX.set(0)
      rotateY.set(0)
      glare.set(0)
    }

    el.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [ref, maxDeg, rotateX, rotateY, glare])

  const style = {
    rotateX,
    rotateY,
    transformPerspective: 1000,
  }

  return { rotateX, rotateY, glare, style }
}

// ─── Text Scramble (Matrix effect) ────────────
// Returns displayText that scrambles before settling on `text`
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*'

export function useTextScramble(text, trigger = true) {
  const [displayText, setDisplayText] = useState(text)
  const frameRef = useRef(null)

  const scramble = useCallback(() => {
    let iteration = 0
    const length  = text.length
    clearInterval(frameRef.current)

    frameRef.current = setInterval(() => {
      setDisplayText(
        text.split('').map((char, i) => {
          if (char === ' ') return ' '
          if (i < iteration) return text[i]
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        }).join('')
      )
      iteration += 0.5
      if (iteration >= length) {
        clearInterval(frameRef.current)
        setDisplayText(text)
      }
    }, 30)
  }, [text])

  useEffect(() => {
    if (trigger) scramble()
    return () => clearInterval(frameRef.current)
  }, [trigger, scramble])

  return { displayText, scramble }
}

// ─── Parallax ─────────────────────────────────
// Returns a motion value offset based on scrollY
export function useParallax(scrollY, value) {
  // value: negative = moves up slower, positive = moves up faster
  const output = useTransform(scrollY, [0, 1000], [0, value])
  return output
}

// ─── Count Up ─────────────────────────────────
// Animates 0 → target when inView is true
export function useCountUp(target, inView, duration = 2) {
  const motionValue = useMotionValue(0)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return

    const controls = animate(motionValue, target, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.floor(v)),
    })

    return controls.stop
  }, [inView, target, duration, motionValue])

  return display
}
