import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { springBounce } from '../../animations/variants'

const CITIES = [
  { code: 'ALG', label: 'Alger' },
  { code: 'ORN', label: 'Oran' },
  { code: 'CZL', label: 'Constantine' },
  { code: 'AAE', label: 'Annaba' },
]

export function SearchBar({ className = '' }) {
  const navigate = useNavigate()
  const [destination, setDestination] = useState('')
  const [departure, setDeparture] = useState('ALG')
  const [date, setDate] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (destination) params.set('search', destination)
    if (departure !== 'Tous') params.set('dep', departure)
    navigate(`/destinations?${params.toString()}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...springBounce, delay: 1.2 }}
      className={`glass rounded-3xl p-2 shadow-2xl ${className}`}
    >
      <form
        onSubmit={handleSearch}
        className="flex flex-col md:flex-row items-stretch md:items-center gap-2"
      >
        {/* Destination */}
        <div className="flex items-center gap-3 flex-1 px-4 py-3 bg-white/10 rounded-2xl">
          <svg className="w-5 h-5 text-[#C9A96E] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <div className="flex flex-col min-w-0">
            <span className="text-white/60 text-xs font-body">Destination</span>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Istanbul, Dubai, Paris..."
              className="bg-transparent text-white placeholder:text-white/40 text-sm font-body focus:outline-none w-full"
            />
          </div>
        </div>

        <div className="w-px h-8 bg-white/20 hidden md:block" />

        {/* Departure */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-2xl">
          <svg className="w-5 h-5 text-[#C9A96E] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
          <div className="flex flex-col">
            <span className="text-white/60 text-xs font-body">Départ depuis</span>
            <select
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              className="bg-transparent text-white text-sm font-body focus:outline-none cursor-pointer"
            >
              {CITIES.map((c) => (
                <option key={c.code} value={c.code} className="text-[#0A0A0F]">
                  {c.label} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-px h-8 bg-white/20 hidden md:block" />

        {/* Date */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-2xl">
          <svg className="w-5 h-5 text-[#C9A96E] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <div className="flex flex-col">
            <span className="text-white/60 text-xs font-body">Date de départ</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-white text-sm font-body focus:outline-none cursor-pointer"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Search button */}
        <motion.button
          type="submit"
          whileTap={{ scale: 0.96 }}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#006233] to-[#007a3f] text-white rounded-2xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          Rechercher
        </motion.button>
      </form>
    </motion.div>
  )
}
