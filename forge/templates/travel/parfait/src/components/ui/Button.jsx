import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useMagneticButton } from '../../animations/effects'

const variants = {
  primary: 'bg-[#006233] text-white hover:bg-[#007a3f] shadow-premium',
  secondary: 'bg-[#D21034] text-white hover:bg-[#e8193e]',
  gold: 'bg-gradient-to-r from-[#C9A96E] to-[#a8834a] text-white hover:opacity-90',
  ghost: 'bg-transparent border border-[#006233] text-[#006233] hover:bg-[#006233] hover:text-white',
  'ghost-white': 'bg-transparent border border-white text-white hover:bg-white hover:text-[#006233]',
  dark: 'bg-[#0A0A0F] text-white hover:bg-[#12121a]',
}

const sizes = {
  sm:  'px-4 py-2 text-sm',
  md:  'px-6 py-3 text-base',
  lg:  'px-8 py-4 text-lg',
  xl:  'px-10 py-5 text-xl',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  magnetic = false,
  onClick,
  type = 'button',
  disabled = false,
  ...props
}) {
  const ref = useRef(null)
  const { x, y } = magnetic
    ? useMagneticButton(ref)
    : { x: 0, y: 0 }

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      animate={{ x, y }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`
        relative inline-flex items-center justify-center gap-2
        font-body font-medium rounded-xl
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  )
}
