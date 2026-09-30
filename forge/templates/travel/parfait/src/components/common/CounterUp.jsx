import { motion } from 'framer-motion'
import { useCountUp } from '../../hooks/useCountUp'

export function CounterUp({ target, suffix = '', prefix = '', label, icon: Icon, duration = 2 }) {
  const { ref, count, isInView } = useCountUp(target, duration)

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      {Icon && (
        <motion.div
          animate={isInView ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#006233]/10 to-[#C9A96E]/10 flex items-center justify-center mb-4"
        >
          <Icon className="w-7 h-7 text-[#006233]" />
        </motion.div>
      )}
      <div className="font-mono text-4xl font-bold text-[#0A0A0F] tabular-nums">
        {prefix}{count.toLocaleString('fr-DZ')}{suffix}
      </div>
      <p className="text-[#0A0A0F]/60 text-sm font-body mt-2">{label}</p>
    </div>
  )
}
