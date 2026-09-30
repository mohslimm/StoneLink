import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDA } from '../../utils/formatDA'
import { Badge, StarBadge } from '../ui/Badge'

export function DestinationCard({ destination }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [hovered, setHovered] = useState(false)

  const d = destination

  return (
    <Link to={`/destinations/${d.id}`} className="block">
      <motion.article
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative rounded-3xl overflow-hidden bg-white shadow-card group"
        style={{
          boxShadow: hovered
            ? '0 20px 60px rgba(0,98,51,0.15), 0 4px 16px rgba(0,0,0,0.06)'
            : '0 4px 24px rgba(0,0,0,0.08)',
          transition: 'box-shadow 0.3s ease',
        }}
        data-cursor="image"
      >
        {/* Image container */}
        <div className="relative h-56 overflow-hidden">
          {/* Skeleton */}
          {!imageLoaded && <div className="skeleton absolute inset-0" />}

          <motion.img
            src={d.image}
            alt={`${d.name}, ${d.country}`}
            onLoad={() => setImageLoaded(true)}
            className="w-full h-full object-cover"
            style={{ opacity: imageLoaded ? 1 : 0 }}
            animate={{ scale: hovered ? 1.1 : 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />

          {/* Gradient overlay — slides up on hover */}
          <motion.div
            className="absolute inset-0 img-overlay"
            animate={{ y: hovered ? '0%' : '60%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />

          {/* Left accent border */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 bg-[#C9A96E] rounded-r-full"
            animate={{ width: hovered ? 3 : 0 }}
            transition={{ duration: 0.25 }}
          />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            {d.badge ? (
              <motion.div animate={{ scale: hovered ? 1.05 : 1 }}>
                <Badge color={d.badgeColor}>{d.badge}</Badge>
              </motion.div>
            ) : (
              <div />
            )}
            <StarBadge rating={d.rating} />
          </div>

          {/* Price badge — spring pop on hover */}
          <motion.div
            className="absolute bottom-3 left-3"
            initial={{ scale: 0 }}
            animate={{ scale: imageLoaded ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.2 }}
          >
            <span className="price-badge text-xs font-mono">
              à partir de {formatDA(d.price)}
            </span>
          </motion.div>

          {/* Discover button */}
          <motion.div
            className="absolute bottom-3 right-3"
            animate={{ y: hovered ? 0 : 20, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="inline-flex items-center gap-1 bg-white text-[#006233] text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              Découvrir
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </span>
          </motion.div>
        </div>

        {/* Card body */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-display font-semibold text-[#0A0A0F] text-xl leading-tight">
                {d.name}
              </h3>
              <p className="text-[#0A0A0F]/50 text-sm font-body">
                {d.country} • {d.duration}j • {d.airline}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-[#FAF7F2] rounded-xl px-2 py-1 flex-shrink-0">
              <svg className="w-3 h-3 text-[#C9A96E] fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="text-xs font-semibold font-mono text-[#0A0A0F]">{d.rating}</span>
              <span className="text-xs text-[#0A0A0F]/40 font-body">({d.reviews})</span>
            </div>
          </div>

          <p className="text-sm text-[#0A0A0F]/60 font-body line-clamp-2 leading-relaxed">
            {d.description}
          </p>

          {/* Departures */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {d.departures.map((dep) => (
              <span
                key={dep}
                className="text-xs font-mono bg-[#006233]/8 text-[#006233] px-2 py-0.5 rounded-full font-medium"
              >
                {dep}
              </span>
            ))}
            <span className="text-xs text-[#0A0A0F]/40 font-body ml-auto">
              {d.durationLabel}
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}
