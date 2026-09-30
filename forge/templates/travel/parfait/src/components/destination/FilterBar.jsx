import { motion } from 'framer-motion'
import { categories, departureCities, durations } from '../../data/destinations'

const PRICE_RANGES = [
  { label: 'Tous budgets', min: 0, max: 1500000 },
  { label: 'Court séjour (120K–350K)', min: 120000, max: 350000 },
  { label: 'Moyen séjour (350K–750K)', min: 350000, max: 750000 },
  { label: 'Long séjour (750K+)', min: 750000, max: 1500000 },
]

function Chip({ label, active, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium font-body transition-all duration-200 whitespace-nowrap
        ${active
          ? 'bg-[#006233] text-white shadow-md'
          : 'bg-white text-[#0A0A0F]/60 border border-[#E8E2D9] hover:border-[#006233] hover:text-[#006233]'
        }
      `}
      data-cursor="pointer"
    >
      {label}
    </motion.button>
  )
}

export function FilterBar({ filters, updateFilter }) {
  return (
    <div className="bg-[#FAF7F2] rounded-3xl p-6 shadow-card space-y-5 mb-8">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#006233]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          placeholder="Rechercher une destination..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E8E2D9] bg-white text-sm font-body focus:outline-none focus:border-[#006233] focus:ring-2 focus:ring-[#006233]/10"
        />
      </div>

      {/* Categories */}
      <div>
        <p className="text-xs font-semibold text-[#0A0A0F]/40 uppercase tracking-wider mb-3 font-body">
          Catégorie
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              active={filters.category === cat}
              onClick={() => updateFilter('category', cat)}
            />
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-xs font-semibold text-[#0A0A0F]/40 uppercase tracking-wider mb-3 font-body">
          Budget
        </p>
        <div className="flex flex-wrap gap-2">
          {PRICE_RANGES.map((range) => (
            <Chip
              key={range.label}
              label={range.label}
              active={filters.minPrice === range.min && filters.maxPrice === range.max}
              onClick={() => {
                updateFilter('minPrice', range.min)
                updateFilter('maxPrice', range.max)
              }}
            />
          ))}
        </div>
      </div>

      {/* Departure + Duration */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <p className="text-xs font-semibold text-[#0A0A0F]/40 uppercase tracking-wider mb-3 font-body">
            Aéroport de départ
          </p>
          <div className="flex flex-wrap gap-2">
            {departureCities.map((city) => (
              <Chip
                key={city}
                label={city}
                active={filters.departure === city}
                onClick={() => updateFilter('departure', city)}
              />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-[#0A0A0F]/40 uppercase tracking-wider mb-3 font-body">
            Durée
          </p>
          <div className="flex flex-wrap gap-2">
            {durations.map((dur) => (
              <Chip
                key={dur}
                label={dur}
                active={filters.duration === dur}
                onClick={() => updateFilter('duration', dur)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
