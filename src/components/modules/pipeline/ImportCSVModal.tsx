'use client'

import { useState, useCallback, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, FileText, AlertCircle, Check, ChevronRight } from 'lucide-react'
import { useStoneStore } from '@/stores/useStoneStore'
import type { NicheType, Country, Priority } from '@/types/pipeline'

type CsvStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'done'

interface ParsedRow {
  [key: string]: string
}

interface ImportResult {
  imported: number
  duplicates: number
  errors: Array<{ row: number; reason: string }>
}

const FIELD_OPTIONS = [
  { value: 'companyName',  label: 'Nom entreprise' },
  { value: 'contactName',  label: 'Contact' },
  { value: 'email',        label: 'Email' },
  { value: 'phone',        label: 'Téléphone' },
  { value: 'website',      label: 'Site web' },
  { value: 'city',         label: 'Ville' },
  { value: 'country',      label: 'Pays' },
  { value: 'niche',        label: 'Secteur' },
  { value: 'skip',         label: '— Ignorer —' },
]

function parseCsv(text: string): { headers: string[]; rows: ParsedRow[] } {
  const lines  = text.trim().split('\n')
  const headers = (lines[0] ?? '').split(',').map((h) => h.trim().replace(/"/g, ''))
  const rows: ParsedRow[] = lines.slice(1).map((line) => {
    const vals = line.split(',').map((v) => v.trim().replace(/"/g, ''))
    const row: ParsedRow = {}
    headers.forEach((h, i) => { row[h] = vals[i] ?? '' })
    return row
  })
  return { headers, rows }
}

interface ImportCSVModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ImportCSVModal = memo(({ isOpen, onClose }: ImportCSVModalProps) => {
  const importProspects = useStoneStore((s) => s.importProspects)
  const inputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<CsvStep>('upload')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows]       = useState<ParsedRow[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [progress, setProgress] = useState(0)
  const [result, setResult]   = useState<ImportResult | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const { headers: h, rows: r } = parseCsv(text)
      setHeaders(h)
      setRows(r)
      // Auto-mapping heuristique
      const autoMap: Record<string, string> = {}
      h.forEach((header) => {
        const lower = header.toLowerCase()
        if (lower.includes('nom') || lower.includes('company') || lower.includes('société'))
          autoMap[header] = 'companyName'
        else if (lower.includes('contact') || lower.includes('prenom') || lower.includes('prénom'))
          autoMap[header] = 'contactName'
        else if (lower.includes('email') || lower.includes('mail'))
          autoMap[header] = 'email'
        else if (lower.includes('tel') || lower.includes('phone'))
          autoMap[header] = 'phone'
        else if (lower.includes('site') || lower.includes('url') || lower.includes('web'))
          autoMap[header] = 'website'
        else if (lower.includes('ville') || lower.includes('city'))
          autoMap[header] = 'city'
        else if (lower.includes('pays') || lower.includes('country'))
          autoMap[header] = 'country'
        else if (lower.includes('niche') || lower.includes('secteur'))
          autoMap[header] = 'niche'
        else
          autoMap[header] = 'skip'
      })
      setMapping(autoMap)
      setStep('mapping')
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleImport = useCallback(async () => {
    setStep('importing')
    setProgress(0)

    const data = rows.map((row) => {
      const mapped: Record<string, string> = {}
      Object.entries(mapping).forEach(([csvCol, field]) => {
        if (field !== 'skip') mapped[field] = row[csvCol] ?? ''
      })
      return {
        companyName:  mapped.companyName  ?? 'Inconnu',
        contactName:  mapped.contactName  ?? '',
        email:        mapped.email        ?? '',
        phone:        mapped.phone        ?? '',
        website:      mapped.website      || undefined,
        city:         mapped.city         ?? '',
        country:      (mapped.country     ?? 'FR') as Country,
        niche:        (mapped.niche       ?? 'dental') as NicheType,
        stage:        'new' as const,
        priority:     'cold' as Priority,
      }
    })

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 20, 90))
    }, 200)

    await new Promise<void>((resolve) => setTimeout(resolve, 1200))
    clearInterval(interval)
    setProgress(100)

    const importResult = importProspects(data)
    setResult(importResult)
    setStep('done')
  }, [rows, mapping, importProspects])

  const reset = useCallback(() => {
    setStep('upload')
    setHeaders([])
    setRows([])
    setMapping({})
    setProgress(0)
    setResult(null)
    onClose()
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
          >
            <div
              className="w-full max-w-2xl rounded-2xl overflow-hidden"
              style={{
                background: '#0f0f20',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
                <div>
                  <h2 className="font-display text-xl text-[#f0ede8]">Importer des Leads</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {(['upload', 'mapping', 'preview', 'importing', 'done'] as CsvStep[]).map((s, i) => (
                      <div key={s} className="flex items-center gap-1">
                        <div
                          className="w-1.5 h-1.5 rounded-full transition-colors"
                          style={{
                            background: s === step
                              ? '#c5a059'
                              : (['upload', 'mapping', 'preview', 'importing', 'done'] as CsvStep[]).indexOf(s) <
                                (['upload', 'mapping', 'preview', 'importing', 'done'] as CsvStep[]).indexOf(step)
                              ? '#22c55e'
                              : 'rgba(255,255,255,0.15)',
                          }}
                        />
                        {i < 4 && <div className="w-4 h-px bg-white/10" />}
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-[rgba(240,237,232,0.5)] transition-colors" aria-label="Fermer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 min-h-[300px]">
                {/* STEP: UPLOAD */}
                {step === 'upload' && (
                  <div
                    className="flex flex-col items-center justify-center h-56 rounded-xl border-2 border-dashed transition-colors cursor-pointer"
                    style={{
                      borderColor: dragOver ? 'rgba(197,160,89,0.5)' : 'rgba(255,255,255,0.1)',
                      background: dragOver ? 'rgba(197,160,89,0.05)' : 'transparent',
                    }}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                  >
                    <Upload className="w-10 h-10 text-[rgba(240,237,232,0.2)] mb-3" />
                    <p className="text-[13px] text-[rgba(240,237,232,0.5)] mb-1">
                      Glissez votre fichier CSV ici
                    </p>
                    <p className="text-[11px] text-[rgba(240,237,232,0.25)]">ou cliquez pour sélectionner</p>
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                    />
                  </div>
                )}

                {/* STEP: MAPPING */}
                {step === 'mapping' && (
                  <div>
                    <p className="text-[12px] text-[rgba(240,237,232,0.4)] mb-4">
                      {rows.length} lignes détectées — associez les colonnes CSV aux champs du système.
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {headers.map((header) => (
                        <div key={header} className="flex items-center gap-3">
                          <div
                            className="flex-1 px-3 py-2 rounded-lg text-[12px] text-[rgba(240,237,232,0.6)]"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                          >
                            <FileText className="w-3 h-3 inline mr-1.5 opacity-50" />
                            {header}
                          </div>
                          <ChevronRight className="w-4 h-4 text-[rgba(240,237,232,0.2)] shrink-0" />
                          <select
                            className="flex-1 px-3 py-2 rounded-lg text-[12px] text-[#f0ede8] outline-none"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                            value={mapping[header] ?? 'skip'}
                            onChange={(e) => setMapping((m) => ({ ...m, [header]: e.target.value }))}
                          >
                            {FIELD_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value} style={{ background: '#0f0f20' }}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setStep('preview')}
                      className="mt-4 w-full py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-wider"
                      style={{ background: 'linear-gradient(135deg, #B8924A, #c5a059)', color: '#1A1200' }}
                    >
                      Prévisualiser les données →
                    </button>
                  </div>
                )}

                {/* STEP: PREVIEW */}
                {step === 'preview' && (
                  <div>
                    <p className="text-[12px] text-[rgba(240,237,232,0.4)] mb-4">
                      Aperçu des 5 premières lignes — vérifiez avant l'import.
                    </p>
                    <div className="overflow-x-auto rounded-lg border border-white/8">
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                            {Object.entries(mapping)
                              .filter(([, v]) => v !== 'skip')
                              .map(([col]) => (
                                <th key={col} className="px-3 py-2 text-left text-[rgba(240,237,232,0.4)] font-medium whitespace-nowrap">
                                  {col}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.slice(0, 5).map((row, i) => (
                            <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                              {Object.entries(mapping)
                                .filter(([, v]) => v !== 'skip')
                                .map(([col]) => (
                                  <td key={col} className="px-3 py-2 text-[rgba(240,237,232,0.7)] max-w-[120px] truncate">
                                    {row[col] || <span className="text-red-400/60 italic">vide</span>}
                                  </td>
                                ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button
                      onClick={handleImport}
                      className="mt-4 w-full py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-wider"
                      style={{ background: 'linear-gradient(135deg, #B8924A, #c5a059)', color: '#1A1200' }}
                    >
                      Importer {rows.length} prospects →
                    </button>
                  </div>
                )}

                {/* STEP: IMPORTING */}
                {step === 'importing' && (
                  <div className="flex flex-col items-center justify-center h-48">
                    <div className="w-full max-w-xs mb-6">
                      <div className="h-2 rounded-full overflow-hidden bg-white/8">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: 'linear-gradient(90deg, #B8924A, #c5a059)' }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-center text-[11px] text-[rgba(240,237,232,0.4)] mt-2">
                        Import en cours... {progress}%
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP: DONE */}
                {step === 'done' && result && (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(22,163,74,0.15)' }}>
                      <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="font-display text-xl text-[#f0ede8] mb-4">Import terminé</h3>
                    <div className="flex gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-400">{result.imported}</div>
                        <div className="text-[10px] text-[rgba(240,237,232,0.4)] uppercase tracking-wider">importés</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-400">{result.duplicates}</div>
                        <div className="text-[10px] text-[rgba(240,237,232,0.4)] uppercase tracking-wider">doublons</div>
                      </div>
                      {result.errors.length > 0 && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-400">{result.errors.length}</div>
                          <div className="text-[10px] text-[rgba(240,237,232,0.4)] uppercase tracking-wider">erreurs</div>
                        </div>
                      )}
                    </div>
                    {result.errors.length > 0 && (
                      <div className="mt-4 flex items-start gap-2 p-3 rounded-lg text-left" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-red-400">
                          {result.errors[0]?.reason}
                          {result.errors.length > 1 && ` (+${result.errors.length - 1} autres)`}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={reset}
                      className="mt-6 px-8 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-wider"
                      style={{ background: 'linear-gradient(135deg, #B8924A, #c5a059)', color: '#1A1200' }}
                    >
                      Fermer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
})

ImportCSVModal.displayName = 'ImportCSVModal'
