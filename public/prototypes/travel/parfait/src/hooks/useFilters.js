import { useState, useCallback, useMemo } from 'react'
import { destinations } from '../data/destinations'

export function useFilters() {
  const [filters, setFilters] = useState({
    category: 'Tous',
    minPrice: 0,
    maxPrice: 1500000,
    departure: 'Tous',
    duration: 'Tous',
    search: '',
  })

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      category: 'Tous',
      minPrice: 0,
      maxPrice: 1500000,
      departure: 'Tous',
      duration: 'Tous',
      search: '',
    })
  }, [])

  const filtered = useMemo(() => {
    return destinations.filter((d) => {
      const matchCat    = filters.category === 'Tous' || d.category === filters.category
      const matchPrice  = d.price >= filters.minPrice && d.price <= filters.maxPrice
      const matchDep    = filters.departure === 'Tous' || d.departures.includes(filters.departure)
      const matchSearch = !filters.search || d.name.toLowerCase().includes(filters.search.toLowerCase()) || d.country.toLowerCase().includes(filters.search.toLowerCase())
      const matchDur    = filters.duration === 'Tous' || d.durationLabel === filters.duration
      return matchCat && matchPrice && matchDep && matchSearch && matchDur
    })
  }, [filters])

  return { filters, updateFilter, resetFilters, filtered }
}
