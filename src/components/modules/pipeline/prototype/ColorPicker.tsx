// ─────────────────────────────────────────────────────────────────
// STONELINK PIPELINE — ColorPicker.tsx
// Sélecteur de couleur HEX avec prévisualisation
// ─────────────────────────────────────────────────────────────────
'use client'

import { useState, useCallback, memo } from 'react'
import { motion } from 'framer-motion'

// ─── Presets ──────────────────────────────────────────────────────

const COLOR_PRESETS = [
  { label: 'Navy',     hex: '#1B3A5C' },
  { label: 'Royal',    hex: '#1A237E' },
  { label: 'Cyan',     hex: '#0891B2' },
  { label: 'Teal',     hex: '#006064' },
  { label: 'Emerald',  hex: '#1B5E20' },
  { label: 'Burgundy', hex: '#92400E' },
  { label: 'Ruby',     hex: '#9B1B30' },
  { label: 'Plum',     hex: '#AD1457' },
  { label: 'Purple',   hex: '#7C3AED' },
  { label: 'Slate',    hex: '#334155' },
  { label: 'Gold',     hex: '#B8924A' },
  { label: 'Charcoal', hex: '#1e293b' },
]

// ─── Types ────────────────────────────────────────────────────────

interface ColorPickerProps {
  value:    string
  onChange: (hex: string) => void
  label?:   string
}

// ─── Validation ───────────────────────────────────────────────────

const isValidHex = (v: string): boolean => /^#[0-9A-Fa-f]{6}$/.test(v)

// ─── Component ────────────────────────────────────────────────────

export const ColorPicker = memo(({ value, onChange, label = 'Couleur principale' }: ColorPickerProps) => {
  const [inputVal, setInputVal] = useState(value)

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setInputVal(v)
    if (isValidHex(v)) onChange(v)
  }, [onChange])

  const handleNativeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value)
    onChange(e.target.value)
  }, [onChange])

  const handlePreset = useCallback((hex: string) => {
    setInputVal(hex)
    onChange(hex)
  }, [onChange])

  return (
    <div className="space-y-2.5">
      {/* Input row */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={isValidHex(inputVal) ? inputVal : '#000000'}
            onChange={handleNativeChange}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            aria-label={`Sélecteur couleur ${label}`}
          />
          <motion.div
            animate={{ background: isValidHex(inputVal) ? inputVal : '#000000' }}
            className="w-10 h-10 rounded-lg border border-white/15 flex items-center justify-center shrink-0 cursor-pointer"
            style={{ boxShadow: `0 0 16px ${isValidHex(inputVal) ? inputVal : '#000000'}60` }}
          >
            <div className="w-3 h-3 rounded-sm border border-white/30" />
          </motion.div>
        </div>

        <input
          type="text"
          value={inputVal}
          onChange={handleInputChange}
          maxLength={7}
          placeholder="#1B3A5C"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-[#f0ede8] font-mono outline-none focus:border-[rgba(197,160,89,0.5)] transition-colors uppercase"
          aria-label={`Valeur HEX ${label}`}
          style={{ letterSpacing: '0.08em' }}
        />
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5">
        {COLOR_PRESETS.map(({ hex, label: presetLabel }) => (
          <motion.button
            key={hex}
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePreset(hex)}
            title={`${presetLabel} — ${hex}`}
            aria-label={`${presetLabel} ${hex}`}
            className="w-6 h-6 rounded-md transition-shadow"
            style={{
              background:  hex,
              border:      value === hex ? '2px solid rgba(197,160,89,0.9)' : '1.5px solid rgba(255,255,255,0.12)',
              boxShadow:   value === hex ? `0 0 10px ${hex}80` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  )
})

ColorPicker.displayName = 'ColorPicker'
