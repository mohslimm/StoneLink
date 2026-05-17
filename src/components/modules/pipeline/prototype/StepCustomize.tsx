// ─────────────────────────────────────────────────────────────────
// STONELINK PIPELINE — StepCustomize.tsx
// Wizard Étape 2 : Formulaire de personnalisation + Preview live
// ─────────────────────────────────────────────────────────────────
'use client'

import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ExternalLink, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import type { Prospect } from '@/types/pipeline'
import type { PrototypeCatalogItem } from './PrototypeCard'
import { LogoUploader } from './LogoUploader'
import { ColorPicker } from './ColorPicker'

// ─── Types ────────────────────────────────────────────────────────

export interface CustomizationForm {
  companyName:  string
  logoFile:     File | null
  logoBase64:   string | null
  logoMimeType: string | null
  primaryColor: string
  tagline:      string
  phone:        string
  email:        string
  address:      string
  ctaText:      string
}

interface StepCustomizeProps {
  prospect:  Prospect
  prototype: PrototypeCatalogItem
  form:      CustomizationForm
  onChange:  (updates: Partial<CustomizationForm>) => void
  onBack:    () => void
  onNext:    (previewUrl: string) => void
}

// ─── HTML Template Generator (client-side preview) ────────────────

const escapeHtml = (str: string): string =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')

const lightenHex = (hex: string, amount: number): string => {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.round(((num >> 16) & 255) + (255 - ((num >> 16) & 255)) * amount)
  const g = Math.round(((num >> 8) & 255) + (255 - ((num >> 8) & 255)) * amount)
  const b = Math.round((num & 255) + (255 - (num & 255)) * amount)
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

const generatePreviewHtml = (form: CustomizationForm, prototypeName: string): string => {
  const primary      = form.primaryColor || '#1B3A5C'
  const primaryLight = lightenHex(primary, 0.75)
  const primaryAlpha = `${primary}22`

  const logoSrc = form.logoBase64 && form.logoMimeType
    ? `data:${form.logoMimeType};base64,${form.logoBase64}`
    : '/assets/logo-placeholder.svg'

  const companyName = escapeHtml(form.companyName || 'Votre Entreprise')
  const tagline     = escapeHtml(form.tagline || 'Excellence & Expertise')
  const phone       = escapeHtml(form.phone || '+33 1 00 00 00 00')
  const email       = escapeHtml(form.email || 'contact@entreprise.fr')
  const address     = escapeHtml(form.address || '1 Rue Exemple, Paris')
  const ctaText     = escapeHtml(form.ctaText || 'Nous contacter')

  // Niche detection (simplified)
  const isTravel = prototypeName.toLowerCase().includes('travel') || prototypeName.toLowerCase().includes('voyage');
  const isDental = prototypeName.toLowerCase().includes('dental') || prototypeName.toLowerCase().includes('zekri');

  let nicheStyles = '';
  let nicheContent = '';

  if (isDental) {
    nicheStyles = `
      .hero { background: linear-gradient(135deg, var(--primary) 0%, ${lightenHex(primary, 0.2)} 100%); }
      .feature-icon { color: var(--primary); }
    `;
    nicheContent = `
      <div class="feature-card">
        <div class="feature-icon">🦷</div>
        <h3>Soins de Pointe</h3>
        <p>Équipements dernière génération pour votre confort et votre santé.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">👨‍⚕️</div>
        <h3>Équipe Experte</h3>
        <p>Des spécialistes passionnés par votre sourire.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📅</div>
        <h3>Booking Simple</h3>
        <p>Prenez rendez-vous en quelques clics via notre plateforme.</p>
      </div>
    `;
  } else if (isTravel) {
    nicheStyles = `
      .hero { background: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'); background-size: cover; background-position: center; position: relative; }
      .hero::before { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.4); z-index: 1; }
      .hero-content { position: relative; z-index: 2; }
      .feature-icon { color: #f59e0b; }
    `;
    nicheContent = `
      <div class="feature-card">
        <div class="feature-icon">✈️</div>
        <h3>Destinations Rêvées</h3>
        <p>Partez à la découverte des plus beaux endroits du monde.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🏨</div>
        <h3>Séjours de Luxe</h3>
        <p>Une sélection d'hôtels prestigieux pour un séjour inoubliable.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🌍</div>
        <h3>Circuit Privé</h3>
        <p>Des itinéraires personnalisés pour une expérience authentique.</p>
      </div>
    `;
  } else {
    nicheContent = `
      <div class="feature-card">
        <div class="feature-icon">⭐</div>
        <h3>Expertise Premium</h3>
        <p>Des années d'expérience pour vous offrir un service irréprochable.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🎯</div>
        <h3>Sur Mesure</h3>
        <p>Chaque client est unique. Nos solutions s'adaptent à vos besoins.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🛡️</div>
        <h3>Confiance</h3>
        <p>La transparence et l'intégrité au cœur de notre relation.</p>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${companyName}</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --primary: ${primary};
    --primary-light: ${primaryLight};
    --primary-alpha: ${primaryAlpha};
  }
  body { font-family: 'Outfit', sans-serif; background: #fff; color: #1e293b; overflow-x: hidden; }
  /* NAV */
  nav { background: var(--primary); padding: 16px 40px; display: flex; align-items: center; justify-content: space-between; }
  .nav-logo { display: flex; align-items: center; gap: 12px; }
  .nav-logo img { height: 36px; object-fit: contain; }
  .nav-logo-text { font-family: 'Cormorant Garamond', serif; font-size: 20px; color: #fff; font-weight: 600; }
  nav ul { display: flex; gap: 28px; list-style: none; }
  nav a { color: rgba(255,255,255,0.8); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
  nav a:hover { color: #fff; }
  /* HERO */
  .hero { padding: 100px 40px; text-align: center; color: #fff; }
  ${nicheStyles || `.hero { background: linear-gradient(135deg, var(--primary) 0%, ${lightenHex(primary, 0.2)} 100%); }`}
  .hero h1 { font-family: 'Cormorant Garamond', serif; font-size: 56px; font-weight: 600; line-height: 1.15; margin-bottom: 16px; }
  .hero p { font-size: 20px; opacity: 0.9; max-width: 600px; margin: 0 auto 40px; line-height: 1.6; }
  .cta-btn { display: inline-block; background: #fff; color: var(--primary); font-weight: 700; font-size: 15px; padding: 16px 44px; border-radius: 8px; text-decoration: none; transition: all 0.3s; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
  .cta-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.3); }
  /* FEATURES */
  .features { padding: 80px 40px; background: #f8fafc; }
  .features-title { text-align: center; font-family: 'Cormorant Garamond', serif; font-size: 42px; margin-bottom: 12px; color: #1e293b; }
  .features-sub { text-align: center; font-size: 16px; color: #64748b; margin-bottom: 56px; }
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; max-width: 1000px; margin: 0 auto; }
  .feature-card { background: #fff; border-radius: 16px; padding: 36px 24px; border: 1px solid #e2e8f0; text-align: center; transition: all 0.3s; }
  .feature-card:hover { transform: translateY(-5px); border-color: var(--primary-alpha); box-shadow: 0 10px 40px rgba(0,0,0,0.05); }
  .feature-icon { width: 64px; height: 64px; border-radius: 16px; background: var(--primary-alpha); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 32px; }
  .feature-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #1e293b; }
  .feature-card p { font-size: 14px; color: #64748b; line-height: 1.7; }
  /* CONTACT */
  .contact { padding: 80px 40px; text-align: center; }
  .contact-title { font-family: 'Cormorant Garamond', serif; font-size: 42px; margin-bottom: 48px; }
  .contact-grid { display: flex; justify-content: center; gap: 64px; flex-wrap: wrap; }
  .contact-item { display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .contact-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: var(--primary); }
  .contact-value { font-size: 17px; color: #1e293b; font-weight: 500; }
  /* FOOTER */
  footer { background: var(--primary); padding: 32px 40px; text-align: center; color: rgba(255,255,255,0.7); font-size: 14px; }
  footer strong { color: #fff; font-weight: 600; }
</style>
</head>
<body>

<nav>
  <div class="nav-logo">
    <img src="${logoSrc}" alt="Logo ${companyName}" onerror="this.style.display='none'" />
    <span class="nav-logo-text">${companyName}</span>
  </div>
  <ul>
    <li><a href="#">Accueil</a></li>
    <li><a href="#">Services</a></li>
    <li><a href="#">À propos</a></li>
    <li><a href="#contact" style="color:#fff;font-weight:600;">${ctaText}</a></li>
  </ul>
</nav>

<section class="hero">
  <div class="hero-content">
    <h1>${companyName}</h1>
    <p>${tagline}</p>
    <a href="#contact" class="cta-btn">${ctaText}</a>
  </div>
</section>

<section class="features">
  <h2 class="features-title">Notre Excellence</h2>
  <p class="features-sub">Une expertise dédiée à votre satisfaction et votre bien-être</p>
  <div class="features-grid">
    ${nicheContent}
  </div>
</section>

<section class="contact" id="contact">
  <h2 class="contact-title">Contactez-nous</h2>
  <div class="contact-grid">
    <div class="contact-item">
      <span class="contact-label">Téléphone</span>
      <span class="contact-value">${phone}</span>
    </div>
    <div class="contact-item">
      <span class="contact-label">Email</span>
      <span class="contact-value">${email}</span>
    </div>
    <div class="contact-item">
      <span class="contact-label">Adresse</span>
      <span class="contact-value">${address}</span>
    </div>
  </div>
</section>

<footer>
  <p>© ${new Date().getFullYear()} <strong>${companyName}</strong>. Tous droits réservés.</p>
  <p style="margin-top:8px;font-size:11px;opacity:0.6;">Propulsé par Stepping Stones Agency — Modèle : ${prototypeName}</p>
</footer>

</body>
</html>`
}

// ─── Field ────────────────────────────────────────────────────────

const Field = memo(({ label, required, children }: {
  label:    string
  required?: boolean
  children: React.ReactNode
}) => (
  <div>
    <div className="text-[10px] font-bold text-[#c5a059] uppercase tracking-widest mb-1.5">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </div>
    {children}
  </div>
))
Field.displayName = 'Field'

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-[#f0ede8] outline-none focus:border-[rgba(197,160,89,0.5)] transition-colors placeholder:text-[rgba(240,237,232,0.2)]'

// ─── Main Step ────────────────────────────────────────────────────

export const StepCustomize = memo(({
  prospect,
  prototype,
  form,
  onChange,
  onBack,
  onNext,
}: StepCustomizeProps) => {
  const iframeRef           = useRef<HTMLIFrameElement>(null)
  const [iframeSrc, setIframeSrc] = useState<string>('')
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced live preview
  const updatePreview = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const html = generatePreviewHtml(form, prototype.name)
      setIframeSrc(html)
    }, 600)
  }, [form, prototype.name])

  useEffect(() => {
    updatePreview()
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [updatePreview])

  // Sync iframe srcdoc
  useEffect(() => {
    if (iframeRef.current && iframeSrc) {
      iframeRef.current.srcdoc = iframeSrc
    }
  }, [iframeSrc])

  const handleGenerateFinal = useCallback(async () => {
    if (!form.companyName.trim()) {
      setGenError('Le nom de l\'entreprise est obligatoire.')
      return
    }
    setGenerating(true)
    setGenError(null)

    try {
      const response = await fetch('/api/prototypes/customize', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prototypeId: prototype.id,
          prospectId:  prospect.id,
          customizations: {
            COMPANY_NAME:  form.companyName,
            PRIMARY_COLOR: form.primaryColor,
            TAGLINE:       form.tagline || undefined,
            PHONE:         form.phone   || undefined,
            EMAIL:         form.email   || undefined,
            ADDRESS:       form.address || undefined,
            CTA_TEXT:      form.ctaText || undefined,
            logoBase64:    form.logoBase64   || undefined,
            logoMimeType:  form.logoMimeType || undefined,
          },
        }),
      })

      if (!response.ok) {
        const err = await response.json() as { error?: string }
        throw new Error(err.error ?? `Erreur ${response.status}`)
      }

      const data = await response.json() as { previewUrl: string }
      onNext(data.previewUrl)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Erreur lors de la génération.')
    } finally {
      setGenerating(false)
    }
  }, [form, prototype.id, prospect.id, onNext])

  const previewDataUrl = useMemo(() => {
    if (!iframeSrc) return null
    const blob = new Blob([iframeSrc], { type: 'text/html' })
    return URL.createObjectURL(blob)
  }, [iframeSrc])

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div>
        <div className="text-[10px] font-bold text-[#c5a059] uppercase tracking-widest mb-1">Étape 2 sur 3</div>
        <h3 className="font-display text-xl text-[#f0ede8]">Personnalisation</h3>
        <p className="text-[12px] text-[rgba(240,237,232,0.4)] mt-0.5">
          {prototype.name} · Aperçu en temps réel
        </p>
      </div>

      {/* Split layout */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* ── Left : Form ── */}
        <div className="w-[280px] shrink-0 overflow-y-auto space-y-4 pr-2">
          <Field label="Nom de l'entreprise" required>
            <input
              className={inputCls}
              value={form.companyName}
              onChange={(e) => onChange({ companyName: e.target.value })}
              placeholder={prospect.companyName}
              maxLength={100}
            />
          </Field>

          <Field label="Logo">
            <LogoUploader
              onLogoChange={(file, base64, mimeType) =>
                onChange({ logoFile: file, logoBase64: base64, logoMimeType: mimeType })
              }
              currentFile={form.logoFile}
            />
          </Field>

          <Field label="Couleur principale" required>
            <ColorPicker
              value={form.primaryColor}
              onChange={(hex) => onChange({ primaryColor: hex })}
            />
          </Field>

          <Field label="Tagline">
            <input
              className={inputCls}
              value={form.tagline}
              onChange={(e) => onChange({ tagline: e.target.value })}
              placeholder="L'excellence à votre service"
              maxLength={150}
            />
          </Field>

          <Field label="Téléphone">
            <input
              className={inputCls}
              value={form.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="+33 1 00 00 00 00"
              maxLength={25}
            />
          </Field>

          <Field label="Email">
            <input
              className={inputCls}
              type="email"
              value={form.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="contact@entreprise.fr"
              maxLength={100}
            />
          </Field>

          <Field label="Adresse">
            <input
              className={inputCls}
              value={form.address}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder="1 Rue Exemple, Paris"
              maxLength={150}
            />
          </Field>

          <Field label="Texte du CTA">
            <input
              className={inputCls}
              value={form.ctaText}
              onChange={(e) => onChange({ ctaText: e.target.value })}
              placeholder="Prendre rendez-vous"
              maxLength={50}
            />
          </Field>
        </div>

        {/* ── Right : Live Preview ── */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-bold text-[rgba(240,237,232,0.4)] uppercase tracking-wider">
                Prévisualisation en direct
              </span>
            </div>
            {previewDataUrl && (
              <a
                href={previewDataUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[10px] font-bold text-[rgba(197,160,89,0.6)] hover:text-[#c5a059] transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Plein écran
              </a>
            )}
          </div>

          <div className="flex-1 rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#f8fafc' }}>
            <iframe
              ref={iframeRef}
              title="Prévisualisation prototype"
              sandbox="allow-same-origin"
              className="w-full h-full"
              style={{ transform: 'scale(0.7)', transformOrigin: 'top left', width: '143%', height: '143%' }}
            />
          </div>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {genError && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-[12px] text-red-400">{genError}</span>
            <button onClick={() => setGenError(null)} className="ml-auto text-[10px] text-red-400/60 hover:text-red-400">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-3 border-t border-white/6 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider text-[rgba(240,237,232,0.4)] hover:text-[rgba(240,237,232,0.7)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour
        </button>

        <button
          onClick={handleGenerateFinal}
          disabled={generating || !form.companyName.trim()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: generating ? 'rgba(197,160,89,0.1)' : 'linear-gradient(135deg, #B8924A, #c5a059)',
            color:      generating ? '#c5a059' : '#1A1200',
            border:     generating ? '1px solid rgba(197,160,89,0.3)' : 'none',
          }}
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Générer et passer à l&apos;email
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
})

StepCustomize.displayName = 'StepCustomize'
