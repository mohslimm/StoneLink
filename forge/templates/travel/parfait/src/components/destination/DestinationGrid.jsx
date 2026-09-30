import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '../../animations/variants'
import { DestinationCard } from './DestinationCard'
import { SkeletonCard } from '../ui/SkeletonCard'

export function DestinationGrid({ destinations, loading = false, horizontal = false }) {
  if (loading) {
    return (
      <div className={horizontal
        ? 'snap-container'
        : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
      }>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={horizontal ? 'snap-item' : ''}>
            <SkeletonCard />
          </div>
        ))}
      </div>
    )
  }

  if (destinations.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🌍</div>
        <h3 className="font-display text-2xl text-[#0A0A0F] mb-2">Aucune destination trouvée</h3>
        <p className="text-[#0A0A0F]/60 font-body">Modifiez vos filtres pour découvrir plus d'offres.</p>
      </div>
    )
  }

  if (horizontal) {
    return (
      <div className="snap-container">
        {destinations.map((d) => (
          <div key={d.id} className="snap-item">
            <DestinationCard destination={d} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {destinations.map((d) => (
        <motion.div key={d.id} variants={staggerItem}>
          <DestinationCard destination={d} />
        </motion.div>
      ))}
    </motion.div>
  )
}
