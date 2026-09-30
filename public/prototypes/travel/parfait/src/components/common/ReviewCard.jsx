import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useTilt3D } from '../../animations/effects'

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-[#C9A96E] fill-current' : 'text-gray-300 fill-current'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export function ReviewCard({ review }) {
  const ref = useRef(null)
  const { style } = useTilt3D(ref, 8)

  return (
    <motion.div
      ref={ref}
      style={{ ...style, perspective: 1000 }}
      className="glass-card rounded-3xl p-6 shadow-card cursor-default select-none flex-shrink-0 w-80 md:w-auto"
      data-cursor="pointer"
    >
      {/* Quote mark */}
      <div className="text-[#C9A96E] text-5xl font-display leading-none mb-3 opacity-30">
        "
      </div>

      <p className="text-[#0A0A0F]/75 text-sm leading-relaxed font-body mb-5">
        {review.text}
      </p>

      <StarRating rating={review.rating} />

      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#E8E2D9]">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${review.avatar[0]}, ${review.avatar[1]})`,
          }}
        >
          {review.initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm text-[#0A0A0F] font-body truncate">
              {review.name}
            </p>
            {review.verified && (
              <svg className="w-4 h-4 text-[#006233] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            )}
          </div>
          <p className="text-xs text-[#0A0A0F]/50 font-body">
            {review.city} • {review.destination} • {review.date}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
