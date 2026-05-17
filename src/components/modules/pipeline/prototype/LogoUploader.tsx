// ─────────────────────────────────────────────────────────────────
// STONELINK PIPELINE — LogoUploader.tsx
// Zone d'upload avec preview du logo
// ─────────────────────────────────────────────────────────────────
'use client'

import { useState, useCallback, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────

interface LogoUploaderProps {
  onLogoChange: (file: File | null, base64: string | null, mimeType: string | null) => void
  currentFile?: File | null
  currentPreviewUrl?: string | null
}

// ─── Constants ────────────────────────────────────────────────────

const MAX_FILE_SIZE_BYTES = 2_000_000 // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'] as const
type AllowedMimeType = typeof ALLOWED_TYPES[number]

// ─── Component ────────────────────────────────────────────────────

export const LogoUploader = memo(({ onLogoChange, currentFile, currentPreviewUrl }: LogoUploaderProps) => {
  const inputRef       = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging]   = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [previewUrl, setPreviewUrl]   = useState<string | null>(currentPreviewUrl ?? null)

  const processFile = useCallback((file: File) => {
    setError(null)

    if (!ALLOWED_TYPES.includes(file.type as AllowedMimeType)) {
      setError('Format non supporté. Utilisez PNG, JPG, SVG ou WebP.')
      return
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('Fichier trop lourd (max 2 Mo).')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Extraire la partie base64
      const base64 = result.split(',')[1] ?? null
      onLogoChange(file, base64, file.type)
    }
    reader.readAsDataURL(file)
  }, [onLogoChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handleRemove = useCallback(() => {
    setPreviewUrl(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
    onLogoChange(null, null, null)
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
  }, [onLogoChange, previewUrl])

  if (previewUrl || currentFile) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex items-center gap-3 p-3 rounded-xl"
        style={{ background: 'rgba(197,160,89,0.06)', border: '1px solid rgba(197,160,89,0.2)' }}
      >
        <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl ?? ''}
            alt="Logo aperçu"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-[#f0ede8] truncate">
            {currentFile?.name ?? 'Logo uploadé'}
          </div>
          <div className="text-[10px] text-[rgba(240,237,232,0.4)] mt-0.5">
            {currentFile ? `${(currentFile.size / 1024).toFixed(0)} Ko` : 'Image chargée'}
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/10 text-[rgba(240,237,232,0.4)] hover:text-red-400 transition-colors shrink-0"
          aria-label="Supprimer le logo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    )
  }

  return (
    <div>
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        animate={{
          borderColor: isDragging ? 'rgba(197,160,89,0.6)' : 'rgba(255,255,255,0.1)',
          background:  isDragging ? 'rgba(197,160,89,0.05)' : 'rgba(255,255,255,0.02)',
        }}
        className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl cursor-pointer border-dashed border transition-all"
        style={{ borderWidth: '1.5px' }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: isDragging ? 'rgba(197,160,89,0.12)' : 'rgba(255,255,255,0.04)' }}>
          {isDragging
            ? <Upload className="w-4 h-4 text-[#c5a059]" />
            : <ImageIcon className="w-4 h-4 text-[rgba(240,237,232,0.35)]" />
          }
        </div>
        <div className="text-center">
          <div className="text-[12px] font-semibold text-[rgba(240,237,232,0.6)]">
            {isDragging ? 'Déposer le logo ici' : 'Glisser le logo ou cliquer'}
          </div>
          <div className="text-[10px] text-[rgba(240,237,232,0.3)] mt-0.5">
            PNG · JPG · SVG · WebP — max 2 Mo
          </div>
        </div>
      </motion.div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleChange}
        className="hidden"
        aria-label="Upload logo"
      />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 text-[11px] text-red-400 flex items-center gap-1.5"
          >
            <span>⚠</span> {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

LogoUploader.displayName = 'LogoUploader'
