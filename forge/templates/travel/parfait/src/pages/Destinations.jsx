import { motion } from 'framer-motion'
import { FilterBar } from '../components/destination/FilterBar'
import { DestinationGrid } from '../components/destination/DestinationGrid'
import { useFilters } from '../hooks/useFilters'
import { clipPathReveal, fadeInUp } from '../animations/variants'

export default function Destinations() {
  const { filters, updateFilter, resetFilters, filtered } = useFilters()

  return (
    <div className="bg-[#FAF7F2] pt-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#006233] to-[#004d27] py-20">
        <div className="container-custom text-center">
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-[#C9A96E] text-sm font-semibold uppercase tracking-widest font-body mb-3"
          >
            Découvrez le monde
          </motion.p>
          <motion.h1
            variants={clipPathReveal}
            initial="hidden"
            animate="visible"
            className="font-display text-5xl md:text-6xl font-bold text-white mb-4"
          >
            Toutes nos Destinations
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="text-white/70 font-body text-lg max-w-lg mx-auto"
          >
            {filtered.length} destinations disponibles — depuis Alger, Oran, Constantine et Annaba.
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-12">
        <FilterBar filters={filters} updateFilter={updateFilter} />

        <div className="flex items-center justify-between mb-6">
          <p className="text-[#0A0A0F]/60 text-sm font-body">
            <span className="font-semibold text-[#0A0A0F]">{filtered.length}</span> destinations trouvées
          </p>
          {(filters.category !== 'Tous' || filters.departure !== 'Tous' || filters.search) && (
            <button
              onClick={resetFilters}
              className="text-sm text-[#D21034] hover:text-[#a8001f] font-medium font-body transition-colors"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>

        <DestinationGrid destinations={filtered} />
      </div>
    </div>
  )
}
