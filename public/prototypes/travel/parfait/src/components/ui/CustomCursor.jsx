import { useEffect, useRef, useState } from 'react'
import { motion, useSpring } from 'framer-motion'

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [isPointer, setIsPointer] = useState(false)
  const [isImage, setIsImage] = useState(false)
  const [isHidden, setIsHidden] = useState(false)

  const springConfig = { stiffness: 100, damping: 18, mass: 0.8 }
  const ringX = useSpring(-100, springConfig)
  const ringY = useSpring(-100, springConfig)

  useEffect(() => {
    const handleMove = (e) => {
      const { clientX: x, clientY: y } = e
      setPos({ x, y })
      ringX.set(x)
      ringY.set(y)

      const el = document.elementFromPoint(x, y)
      if (!el) return

      const cursorAttr = el.closest('[data-cursor]')?.dataset.cursor
      setIsPointer(
        cursorAttr === 'pointer' ||
        el.closest('button, a, [role="button"], input, select, textarea') !== null
      )
      setIsImage(cursorAttr === 'image' || el.closest('[data-cursor="image"]') !== null)
    }

    const handleLeave = () => setIsHidden(true)
    const handleEnter = () => setIsHidden(false)

    window.addEventListener('mousemove', handleMove)
    document.documentElement.addEventListener('mouseleave', handleLeave)
    document.documentElement.addEventListener('mouseenter', handleEnter)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.documentElement.removeEventListener('mouseleave', handleLeave)
      document.documentElement.removeEventListener('mouseenter', handleEnter)
    }
  }, [ringX, ringY])

  if (isHidden) return null

  return (
    <>
      {/* Dot — instant follow */}
      <div
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: pos.x,
          top: pos.y,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#006233',
          transform: 'translate(-50%, -50%)',
          transition: 'opacity 0.2s',
          opacity: isHidden ? 0 : 1,
        }}
      />

      {/* Ring — spring follow */}
      <motion.div
        className="fixed pointer-events-none z-[9998] flex items-center justify-center"
        style={{
          left: ringX,
          top: ringY,
          width: isImage ? 72 : isPointer ? 52 : 36,
          height: isImage ? 72 : isPointer ? 52 : 36,
          borderRadius: '50%',
          border: '1.5px solid #006233',
          transform: 'translate(-50%, -50%)',
          opacity: isPointer ? 0.5 : 0.6,
          mixBlendMode: isPointer ? 'difference' : 'normal',
          backgroundColor: isImage ? 'rgba(0,98,51,0.15)' : 'transparent',
          transition: 'width 0.25s ease, height 0.25s ease, opacity 0.25s ease',
        }}
      >
        {isImage && (
          <span className="text-[9px] font-medium text-white tracking-widest uppercase">
            Voir
          </span>
        )}
      </motion.div>
    </>
  )
}
