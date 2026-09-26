"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Phone, Sparkles, Loader2, ArrowRight, PhoneOff } from 'lucide-react';
import { StatCard } from '@/components/ui/custom/StatCard';
import { AnimatedButton } from '@/components/ui/custom/AnimatedButton';
import { GlassPanel } from '@/components/ui/custom/GlassPanel';
import { GoldShimmerDivider } from '@/components/ui/custom/GoldShimmerDivider';
import { mockProspects, weeklyTrend, conversionTrend, rdvTrend } from '@/data/prospects';
import { useUIStore } from '@/hooks/useUIStore';

/* ─── Particle Canvas ─── */
function ObsidianCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 30 : 60;
    const CONNECTION_DIST = isMobile ? 100 : 150;

    let w = canvas.offsetWidth;
    let h = canvas.offsetHeight;
    canvas.width = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    interface Particle {
      x: number; y: number; vx: number; vy: number; r: number;
    }

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: 1 + Math.random(),
    }));

    let animId: number;
    let shimmerLine = { a: -1, b: -1, progress: 0, active: false };
    let shimmerTimer = 0;

    function draw() {
      ctx!.clearRect(0, 0, w, h);

      // Update particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      });

      // Draw connections
      shimmerTimer++;
      if (shimmerTimer > 120 && !shimmerLine.active) {
        shimmerLine.active = true;
        shimmerLine.progress = 0;
        const a = Math.floor(Math.random() * particles.length);
        let b = Math.floor(Math.random() * particles.length);
        while (b === a) b = Math.floor(Math.random() * particles.length);
        shimmerLine.a = a;
        shimmerLine.b = b;
        shimmerTimer = 0;
      }

      for (let i = 0; i < particles.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < particles.length && connections < 3; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            let opacity = (1 - dist / CONNECTION_DIST) * 0.3;
            if (shimmerLine.active && ((i === shimmerLine.a && j === shimmerLine.b) || (i === shimmerLine.b && j === shimmerLine.a))) {
              opacity = Math.max(opacity, shimmerLine.progress * 0.6);
            }
            ctx!.beginPath();
            ctx!.strokeStyle = `rgba(197, 160, 89, ${opacity})`;
            ctx!.lineWidth = 0.5;
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.stroke();
            connections++;
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = 'rgba(197, 160, 89, 0.6)';
        ctx!.fill();
      });

      // Update shimmer
      if (shimmerLine.active) {
        shimmerLine.progress += 0.015;
        if (shimmerLine.progress >= 1) {
          shimmerLine.active = false;
          shimmerLine.progress = 0;
        }
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}

/* ─── Hero Section ─── */
function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      <ObsidianCanvas />
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 items-center">
          {/* Left */}
          <div>
            <motion.h1
              className="font-display font-light text-[clamp(40px,5vw,64px)] leading-[1.1] tracking-[-0.02em] text-[#e8e4dc]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
              Votre<br />
              <em className="italic">cockpit</em> de vente
            </motion.h1>
            <motion.p
              className="text-[18px] font-body text-[rgba(232,228,220,0.55)] max-w-[480px] mt-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            >
              Prospection intelligente. Scripts IA en temps reel. Closage sans friction.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="mt-8"
            >
              <Link href="/call">
                <AnimatedButton icon={<Phone size={16} />}>
                  Lancer un appel
                </AnimatedButton>
              </Link>
            </motion.div>
          </div>

          {/* Right — Stat Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="APPELS REALISES" value="142" sparklineData={weeklyTrend} index={0} />
            <StatCard label="TAUX DE CONVERSION" value="23.4%" sparklineData={conversionTrend} index={1} />
            <StatCard label="RDV PRIS" value="33" sparklineData={rdvTrend} index={2} />
            <StatCard label="PROTOTYPE EN ATTENTE" value="8" index={3} hasIndicator />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Lead Pipeline Section ─── */
function LeadPipelineSection() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [score, setScore] = useState(0);
  const { addToast } = useUIStore();

  const handleAnalyze = useCallback(() => {
    if (!url.trim()) return;
    setLoading(true);
    setAnalyzed(false);
    setTimeout(() => {
      setLoading(false);
      setAnalyzed(true);
      setScore(72);
      addToast({ type: 'success', message: 'Analyse complete — Script genere' });
    }, 2500);
  }, [url, addToast]);

  const isSuccess = score >= 70;
  const scoreColor = score >= 70 ? '#4ade80' : score >= 40 ? '#60a5fa' : '#f87171';

  return (
    <section className="bg-[#050509] py-16 md:py-24 px-6">
      <div className="max-w-[720px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[11px] font-body font-medium uppercase tracking-[0.1em] text-[#c5a059]">PIPELINE</p>
          <h2 className="font-display font-light text-[clamp(32px,4vw,48px)] text-[#e8e4dc] mt-2 tracking-[-0.01em]">
            Nouveau lead
          </h2>
          <p className="text-[15px] font-body text-[rgba(232,228,220,0.55)] mt-3 max-w-[560px]">
            Entrez l&apos;URL du site web de votre prospect. Notre IA analyse sa performance et genere un script de vente sur mesure.
          </p>
        </motion.div>

        {/* URL Input */}
        <motion.div
          className="mt-8 relative"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative flex items-center">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              disabled={loading}
              placeholder="https://exemple.fr"
              className={`w-full h-14 rounded-full bg-[#11111a] border pl-6 pr-[130px] font-body text-[18px] text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.30)] transition-all duration-200 focus:outline-none focus:border-[rgba(197,160,89,0.25)] focus:shadow-[0_0_20px_rgba(197,160,89,0.15)] ${
                analyzed && isSuccess ? 'border-[#4ade80]' : analyzed ? 'border-[#f87171]' : 'border-[rgba(255,255,255,0.06)]'
              } ${loading ? 'animate-pulse border-[rgba(197,160,89,0.25)]' : ''}`}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !url.trim()}
              className="absolute right-1.5 top-1.5 h-11 px-5 rounded-full bg-[#c5a059] text-[#0a0a12] font-body font-semibold text-[14px] flex items-center gap-2 hover:bg-[#d4b06a] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              <span className="hidden sm:inline">{loading ? 'Analyse...' : 'Analyser'}</span>
            </button>
          </div>
        </motion.div>

        {/* Analysis Results */}
        <AnimatePresence>
          {analyzed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <GlassPanel className="p-6 mt-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.30)]">
                    L:
                  </span>
                  <motion.span
                    className="text-[36px] font-body font-normal tracking-[-0.02em]"
                    style={{ color: scoreColor }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {score}/100
                  </motion.span>
                </div>

                {/* Score bar */}
                <div className="w-full h-1.5 rounded-full bg-[#11111a] mt-3 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: scoreColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>

                <p className="text-[13px] font-body text-[rgba(232,228,220,0.55)] mt-4 italic leading-relaxed">
                  &ldquo;Bonjour, c&apos;est Jean de Stepping Stones. J&apos;ai analyse votre site ce matin — votre score Lighthouse est de {score}, ce qui represente un manque a gagner significatif...&rdquo;
                  <span className="text-[#c5a059] not-italic ml-1 cursor-pointer hover:underline">Voir le script</span>
                </p>

                <div className="mt-4">
                  <Link href="/call">
                    <AnimatedButton icon={<Phone size={16} />}>
                      Lancer l&apos;appel
                    </AnimatedButton>
                  </Link>
                </div>
              </GlassPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ─── Quick Launch Section ─── */
function QuickLaunchSection() {
  const readyProspects = useMemo(() => mockProspects.filter((p) => p.scriptReady).slice(0, 5), []);

  return (
    <section className="bg-[#0a0a12] py-16 md:py-24 px-6">
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[#c5a059]">
            APPELS PRETS
          </p>
          <h2 className="font-display font-normal text-[32px] text-[#e8e4dc] mt-2">
            Passer a l&apos;action
          </h2>
        </motion.div>

        <div className="max-w-[720px] mx-auto mt-8 flex flex-col gap-3">
          {readyProspects.length > 0 ? (
            readyProspects.map((prospect, i) => (
              <motion.div
                key={prospect.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassPanel className="p-4 flex items-center justify-between gap-4 hover:border-[rgba(255,255,255,0.10)] transition-colors">
                  <div className="min-w-0">
                    <p className="text-[15px] font-body font-medium text-[#e8e4dc] truncate">
                      {prospect.name}
                    </p>
                    <p className="text-[13px] font-body text-[rgba(232,228,220,0.30)] truncate">
                      {prospect.url}
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                    <span
                      className="text-[11px] font-body font-medium px-2 py-0.5 rounded-full"
                      style={{
                        color: prospect.score >= 70 ? '#4ade80' : prospect.score >= 40 ? '#60a5fa' : '#f87171',
                        backgroundColor: prospect.score >= 70 ? 'rgba(74,222,128,0.10)' : prospect.score >= 40 ? 'rgba(96,165,250,0.10)' : 'rgba(248,113,113,0.10)',
                      }}
                    >
                      L: {prospect.score}
                    </span>
                    <span className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[#4ade80]">
                      Script IA pret
                    </span>
                  </div>
                  <Link href="/call">
                    <motion.button
                      className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-body font-medium border border-[rgba(255,255,255,0.10)] text-[#e8e4dc] hover:bg-[#c5a059] hover:text-[#0a0a12] hover:border-[#c5a059] transition-colors cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Phone size={14} />
                      <span className="hidden sm:inline">Appeler</span>
                    </motion.button>
                  </Link>
                </GlassPanel>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <PhoneOff size={32} className="mx-auto text-[rgba(232,228,220,0.30)]" />
              <p className="text-[15px] font-body text-[rgba(232,228,220,0.30)] mt-3">
                Aucun lead pret. Analysez un site web pour commencer.
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            href="/crm"
            className="inline-flex items-center gap-1.5 text-[13px] font-body text-[#c5a059] hover:underline"
          >
            Voir tous les prospects
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="bg-[#050509]">
      <GoldShimmerDivider />
      <div className="px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[13px] font-body text-[rgba(232,228,220,0.30)]">StoneLink</span>
          <span className="text-[11px] font-body text-[rgba(232,228,220,0.30)] ml-2">
            par Stepping Stones Agency
          </span>
        </div>
        <div className="flex gap-6">
          <span className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.30)] hover:text-[rgba(232,228,220,0.55)] cursor-pointer transition-colors">
            Mentions legales
          </span>
          <span className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.30)] hover:text-[rgba(232,228,220,0.55)] cursor-pointer transition-colors">
            Confidentialite
          </span>
          <span className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.30)] hover:text-[rgba(232,228,220,0.55)] cursor-pointer transition-colors">
            Support
          </span>
        </div>
        <span className="text-[11px] font-body text-[rgba(232,228,220,0.30)]">v1.2.0</span>
      </div>
    </footer>
  );
}

/* ─── Home Page ─── */
export default function Home() {
  return (
    <div>
      <HeroSection />
      <LeadPipelineSection />
      <QuickLaunchSection />
      <Footer />
    </div>
  );
}
