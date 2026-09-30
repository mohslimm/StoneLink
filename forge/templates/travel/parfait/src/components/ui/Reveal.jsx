import { motion, useInView, useAnimation } from 'framer-motion'
import { useRef, useEffect } from 'react'

export function Reveal({ children, width = 'w-full', delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const mainControls = useAnimation()
  const slideControls = useAnimation()

  useEffect(() => {
    if (isInView) {
      mainControls.start('visible')
      slideControls.start('visible')
    }
  }, [isInView, mainControls, slideControls])

  return (
    <div ref={ref} className={`relative overflow-hidden ${width}`}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: 0.5, delay: delay + 0.25 }}
      >
        {children}
      </motion.div>
      <motion.div
        variants={{
          hidden: { left: 0 },
          visible: { left: '100%' },
        }}
        initial="hidden"
        animate={slideControls}
        transition={{ duration: 0.5, ease: 'easeIn', delay }}
        className="absolute top-1 bottom-1 left-0 right-0 bg-[#006233] z-20"
      />
    </div>
  )
}
