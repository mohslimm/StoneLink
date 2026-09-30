import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export function SplashScreen({ finishLoading }) {
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(finishLoading, 500)
          return 100
        }
        return prev + 1
      })
    }, 20)
    return () => clearInterval(interval)
  }, [finishLoading])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ y: '-100%', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
      className="fixed inset-0 z-[9999] bg-[#0A0A0F] flex flex-col items-center justify-center"
    >
      <div className="relative overflow-hidden">
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="flex flex-col items-center"
        >
          <span className="font-display text-4xl md:text-6xl font-bold text-white tracking-tighter mb-4">
            PARFAIT <span className="text-[#006233]">VOYAGE</span>
          </span>
          <div className="flex items-center gap-4">
            <div className="w-48 h-px bg-white/10 relative overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-[#C9A96E]"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="font-mono text-sm text-[#C9A96E] w-12">{percent}%</span>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-12 text-center"
      >
        <p className="text-white/30 text-xs font-body tracking-[0.3em] uppercase mb-2">
          Expérience Voyage Premium
        </p>
        <p className="text-white/20 text-[10px] font-arabic">
          رحلة أحلامك تبدأ هنا
        </p>
      </motion.div>
    </motion.div>
  )
}
