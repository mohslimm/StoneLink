import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useLocation } from 'framer-motion'
import { pageTransition } from '../../animations/variants'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

function ProgressBar({ isNavigating }) {
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isNavigating) {
      setVisible(true)
      setWidth(85)
    } else {
      setWidth(100)
      const t = setTimeout(() => {
        setVisible(false)
        setWidth(0)
      }, 400)
      return () => clearTimeout(t)
    }
  }, [isNavigating])

  if (!visible) return null

  return (
    <motion.div
      className="progress-bar"
      animate={{ width: `${width}%` }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    />
  )
}

export function PageWrapper({ children }) {
  const location = useLocation()

  return (
    <>
      <ProgressBar isNavigating={false} />
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          variants={pageTransition}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="min-h-screen"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  )
}
