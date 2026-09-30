import { forwardRef } from 'react'
import { motion } from 'framer-motion'

export const Input = forwardRef(function Input(
  { label, error, icon: Icon, className = '', ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-[#0A0A0F]/70 font-body">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9A96E]">
            <Icon size={18} />
          </span>
        )}
        <motion.input
          ref={ref}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`
            w-full rounded-xl border border-[#E8E2D9] bg-white
            px-4 py-3 font-body text-[#0A0A0F] placeholder:text-gray-400
            transition-all duration-200
            focus:outline-none focus:border-[#006233] focus:ring-2 focus:ring-[#006233]/10
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 font-body">{error}</p>
      )}
    </div>
  )
})
