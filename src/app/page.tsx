"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Phone, Sparkles, Loader2, ArrowRight, PhoneOff, Lock, User, KeyRound,
  ShieldCheck, CheckCircle2, AlertCircle, LogOut, ArrowLeftRight, MessageSquare,
  TrendingUp, Clock, Check
} from 'lucide-react';
import { StatCard } from '@/components/ui/custom/StatCard';
import { AnimatedButton } from '@/components/ui/custom/AnimatedButton';
import { GlassPanel } from '@/components/ui/custom/GlassPanel';
import { GoldShimmerDivider } from '@/components/ui/custom/GoldShimmerDivider';
import { mockProspects, weeklyTrend, conversionTrend, rdvTrend } from '@/data/prospects';
import { USER_PROFILES } from '@/data/profiles';
import { useUIStore } from '@/hooks/useUIStore';
import { useAuthStore } from '@/hooks/useAuthStore';

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

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      });

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

      particles.forEach((p) => {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = 'rgba(197, 160, 89, 0.6)';
        ctx!.fill();
      });

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

/* ─── Direct Authentication Screen ─── */
function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { addToast } = useUIStore();

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Veuillez saisir votre nom d\'utilisateur et votre mot de passe.');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      const res = login(username, password);
      setLoading(false);
      if (res.success) {
        addToast({
          type: 'success',
          message: `Connexion réussie ! Bienvenue sur StoneLink.`,
        });
      } else {
        setError(res.error || 'Erreur d\'authentification.');
      }
    }, 600);
  };

  const handleQuickFill = (presetUser: 'slim' | 'lpiks') => {
    setUsername(presetUser);
    setPassword('StoneLink2026!');
    setError('');
  };

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-[#060610] px-4 py-12">
      <ObsidianCanvas />

      <div className="relative z-10 w-full max-w-[440px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Top Logo & Header */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[rgba(197,160,89,0.12)] border border-[rgba(197,160,89,0.3)] shadow-[0_0_30px_rgba(197,160,89,0.15)] mb-3">
              <img src="/logo-icon.png" alt="StoneLink" className="w-8 h-8 object-contain" />
            </div>
            <h1 className="font-display font-light text-[32px] text-[#e8e4dc] tracking-[-0.01em]">
              StoneLink <em className="italic text-[#c5a059]">Agency</em>
            </h1>
            <p className="text-[13px] font-body text-[rgba(232,228,220,0.5)] mt-1">
              Connexion Espace Exécutif & Prospection IA
            </p>
          </div>

          {/* Luxury Login Card */}
          <div className="p-7 rounded-[20px] bg-[#0a0a14] border border-[rgba(197,160,89,0.25)] shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-[24px]">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-body uppercase tracking-[0.08em] text-[rgba(232,228,220,0.65)]">
                  <User size={13} className="text-[#c5a059]" />
                  <span>Nom d&apos;utilisateur (Username)</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="slim ou lpiks"
                  autoComplete="username"
                  className="w-full h-12 px-4 rounded-[12px] bg-[#10101c] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(197,160,89,0.3)] focus:border-[#c5a059] focus:outline-none text-[14px] font-body text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.3)] transition-all"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-body uppercase tracking-[0.08em] text-[rgba(232,228,220,0.65)]">
                  <KeyRound size={13} className="text-[#c5a059]" />
                  <span>Mot de passe</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full h-12 px-4 rounded-[12px] bg-[#10101c] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(197,160,89,0.3)] focus:border-[#c5a059] focus:outline-none text-[14px] font-body text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.3)] transition-all font-mono"
                />
              </div>

              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-[10px] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#f87171] text-[12px] font-body flex items-center gap-2"
                  >
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-[12px] bg-gradient-to-r from-[#b8924a] via-[#c5a059] to-[#d4b57a] text-[#1a1200] font-body font-semibold text-[14px] flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-[0_0_20px_rgba(197,160,89,0.25)] cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Lock size={15} />
                )}
                <span>{loading ? 'Connexion en cours...' : 'Se connecter au Cockpit'}</span>
              </button>
            </form>

            {/* Quick Fill Preset Buttons */}
            <div className="mt-6 pt-5 border-t border-[rgba(255,255,255,0.07)] space-y-2.5">
              <span className="text-[10.5px] font-body uppercase tracking-[0.1em] text-[rgba(232,228,220,0.4)] block text-center">
                Connexion Rapide 1-Clic par Profil
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('slim')}
                  className="p-2.5 rounded-[10px] bg-[#121222] hover:bg-[#18182d] border border-[rgba(197,160,89,0.2)] text-left transition-all cursor-pointer group"
                >
                  <div className="text-[12px] font-display font-medium text-[#e8e4dc] group-hover:text-[#c5a059]">
                    slim
                  </div>
                  <div className="text-[10px] font-body text-[rgba(232,228,220,0.45)] truncate">
                    Mohamed Slimani
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('lpiks')}
                  className="p-2.5 rounded-[10px] bg-[#121222] hover:bg-[#18182d] border border-[rgba(197,160,89,0.2)] text-left transition-all cursor-pointer group"
                >
                  <div className="text-[12px] font-display font-medium text-[#e8e4dc] group-hover:text-[#c5a059]">
                    lpiks
                  </div>
                  <div className="text-[10px] font-body text-[rgba(232,228,220,0.45)] truncate">
                    Abdelhadi Hammaz
                  </div>
                </button>
              </div>
              <p className="text-[10.5px] font-body text-[rgba(232,228,220,0.35)] text-center pt-1">
                Mot de passe partagé : <code className="font-mono text-[#c5a059]">StoneLink2026!</code>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Hero Cockpit Section (When Authenticated) ─── */
function HeroSection() {
  const { currentUser, userProfile, logout, switchUser } = useAuthStore();

  const profile = userProfile || (currentUser ? USER_PROFILES[currentUser] : USER_PROFILES.slim);

  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      <ObsidianCanvas />
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 py-20">
        {/* User Active Profile Banner */}
        <div className="mb-8 p-4 rounded-[16px] bg-[#0c0c18] border border-[rgba(197,160,89,0.25)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[rgba(197,160,89,0.15)] border border-[rgba(197,160,89,0.3)] flex items-center justify-center font-display font-medium text-[16px] text-[#c5a059]">
              {profile.username === 'slim' ? 'MS' : 'AH'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-[18px] text-[#e8e4dc]">{profile.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-[rgba(74,222,128,0.15)] border border-[rgba(74,222,128,0.25)] text-[#4ade80] text-[10px] font-body font-semibold uppercase">
                  Session Active
                </span>
              </div>
              <p className="text-[12px] font-body text-[rgba(232,228,220,0.5)]">
                {profile.role} &bull; <span className="font-mono text-[#c5a059]">@{profile.username}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => switchUser(profile.username === 'slim' ? 'lpiks' : 'slim')}
              className="px-3.5 py-1.5 rounded-full bg-[rgba(197,160,89,0.12)] hover:bg-[rgba(197,160,89,0.2)] border border-[rgba(197,160,89,0.3)] text-[#c5a059] text-[12px] font-body flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeftRight size={13} />
              <span>Bascule vers {profile.username === 'slim' ? 'lpiks (Abdelhadi)' : 'slim (Mohamed)'}</span>
            </button>

            <button
              onClick={logout}
              className="px-3.5 py-1.5 rounded-full bg-[rgba(239,68,68,0.1)] hover:bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.25)] text-[#f87171] text-[12px] font-body flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut size={13} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

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
              Prospection intelligente. Scripts IA en temps réel. Closage sans friction.
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

          {/* Right — Stat Grid for Profile */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="APPELS EFFECTUÉS" value={String(profile.stats.totalCalls)} sparklineData={weeklyTrend} index={0} />
            <StatCard label="MESSAGES / OUTREACH" value={String(profile.stats.totalTexts)} sparklineData={conversionTrend} index={1} />
            <StatCard label="CONTRATS SIGNÉS" value={String(profile.stats.closedDeals)} sparklineData={rdvTrend} index={2} />
            <StatCard label="REVENU GÉNÉRÉ" value={`${profile.stats.totalRevenue.toLocaleString('fr-FR')} €`} index={3} hasIndicator />
          </div>
        </div>

        {/* Profile Specific Records Tables */}
        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[22px] text-[#e8e4dc]">
              Activité Récente de <span className="italic text-[#c5a059]">{profile.name}</span>
            </h3>
            <span className="text-[11px] font-mono text-[rgba(232,228,220,0.4)]">
              Tables Call, Text & Progress synchronisées
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Calls Record Card */}
            <GlassPanel className="p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,255,255,0.06)]">
                <span className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#c5a059] flex items-center gap-1.5">
                  <Phone size={13} /> Appels Récents ({profile.calls.length})
                </span>
              </div>
              <div className="space-y-2.5">
                {profile.calls.map((c) => (
                  <div key={c.id} className="p-3 rounded-[10px] bg-[#0a0a14] border border-[rgba(255,255,255,0.05)] text-[12.5px] font-body space-y-1">
                    <div className="flex items-center justify-between font-medium text-[#e8e4dc]">
                      <span className="truncate">{c.company}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(197,160,89,0.15)] text-[#c5a059]">
                        {c.duration}
                      </span>
                    </div>
                    <p className="text-[11px] text-[rgba(232,228,220,0.5)] line-clamp-2">{c.notes}</p>
                  </div>
                ))}
              </div>
            </GlassPanel>

            {/* Texts Record Card */}
            <GlassPanel className="p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,255,255,0.06)]">
                <span className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#60a5fa] flex items-center gap-1.5">
                  <MessageSquare size={13} /> Messages / Outreach ({profile.texts.length})
                </span>
              </div>
              <div className="space-y-2.5">
                {profile.texts.map((t) => (
                  <div key={t.id} className="p-3 rounded-[10px] bg-[#0a0a14] border border-[rgba(255,255,255,0.05)] text-[12.5px] font-body space-y-1">
                    <div className="flex items-center justify-between font-medium text-[#e8e4dc]">
                      <span className="truncate">{t.prospectName}</span>
                      <span className="text-[10px] uppercase font-mono text-[#4ade80]">{t.channel}</span>
                    </div>
                    <p className="text-[11px] text-[rgba(232,228,220,0.5)] line-clamp-2">{t.content}</p>
                  </div>
                ))}
              </div>
            </GlassPanel>

            {/* Progress Record Card */}
            <GlassPanel className="p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,255,255,0.06)]">
                <span className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#4ade80] flex items-center gap-1.5">
                  <TrendingUp size={13} /> Évolution CRM ({profile.progress.length})
                </span>
              </div>
              <div className="space-y-2.5">
                {profile.progress.map((p) => (
                  <div key={p.id} className="p-3 rounded-[10px] bg-[#0a0a14] border border-[rgba(255,255,255,0.05)] text-[12.5px] font-body space-y-1">
                    <div className="flex items-center justify-between font-medium text-[#e8e4dc]">
                      <span className="truncate">{p.company}</span>
                      <span className="text-[11px] font-mono text-[#4ade80]">+{p.dealValue} €</span>
                    </div>
                    <div className="text-[10.5px] font-mono text-[#c5a059]">
                      {p.previousStage} ➡️ {p.newStage}
                    </div>
                    <p className="text-[11px] text-[rgba(232,228,220,0.5)] line-clamp-1">{p.reason}</p>
                  </div>
                ))}
              </div>
            </GlassPanel>
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
      addToast({ type: 'success', message: 'Analyse complète — Script généré' });
    }, 2500);
  }, [url, addToast]);

  const [showScriptModal, setShowScriptModal] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);

  const fullPitch = `Bonjour, c'est Jean de Stepping Stones. J'ai analysé votre site ce matin (${url || 'votre site'}) — votre score technique Google est de ${score}/100. Pour une entreprise avec votre réputation, cela représente un manque à gagner significatif. Je peux vous envoyer gratuitement aujourd'hui une maquette fonctionnelle et modernisée de votre site pour que vous constatiez la différence par vous-même. Vous avez 2 minutes pour qu'on en discute ?`;

  const copyPitch = () => {
    navigator.clipboard.writeText(fullPitch);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const isSuccess = score >= 70;
  const scoreColor = score >= 70 ? '#4ade80' : score >= 40 ? '#60a5fa' : '#f87171';

  return (
    <section className="bg-[#050509] py-16 md:py-24 px-6 relative">
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
            Entrez l&apos;URL du site web de votre prospect. Notre IA analyse sa performance et génère un script de vente sur mesure.
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
                  &ldquo;Bonjour, c&apos;est Jean de Stepping Stones. J&apos;ai analysé votre site ce matin — votre score Lighthouse est de {score}...&rdquo;
                  <button
                    onClick={() => setShowScriptModal(true)}
                    className="text-[#c5a059] not-italic ml-1.5 font-medium hover:underline cursor-pointer inline-flex items-center"
                  >
                    Voir le script complet
                  </button>
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

        {/* Script Viewer Modal */}
        <AnimatePresence>
          {showScriptModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-[rgba(5,5,9,0.75)] backdrop-blur-[6px]"
                onClick={() => setShowScriptModal(false)}
              />
              <motion.div
                className="relative w-full max-w-[600px] p-6 rounded-[16px] bg-[rgba(17,17,26,0.98)] border border-[rgba(197,160,89,0.3)] shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-[20px]"
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
              >
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[rgba(255,255,255,0.08)]">
                  <div>
                    <span className="text-[10px] font-body uppercase tracking-[0.1em] text-[#c5a059] font-semibold">
                      Script de Vente IA
                    </span>
                    <h3 className="text-[18px] font-display text-[#e8e4dc]">
                      Accroche & Proposition Personnalisée
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowScriptModal(false)}
                    className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc] cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                <div className="p-4 rounded-[10px] bg-[rgba(10,10,18,0.7)] border border-[rgba(255,255,255,0.06)] text-[14px] font-body text-[#e8e4dc] leading-[1.8] whitespace-pre-line">
                  {fullPitch}
                </div>

                <div className="flex items-center justify-between mt-5 gap-3">
                  <button
                    onClick={copyPitch}
                    className="h-10 px-4 rounded-full border border-[rgba(255,255,255,0.12)] text-[13px] font-body text-[#e8e4dc] hover:border-[rgba(197,160,89,0.4)] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedPitch ? '✓ Copié !' : 'Copier le script'}
                  </button>
                  <Link href="/call">
                    <AnimatedButton icon={<Phone size={15} />}>
                      Lancer l&apos;appel dans le Studio
                    </AnimatedButton>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
            Mentions légales
          </span>
          <span className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.30)] hover:text-[rgba(232,228,220,0.55)] cursor-pointer transition-colors">
            Confidentialité
          </span>
          <span className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.30)] hover:text-[rgba(232,228,220,0.55)] cursor-pointer transition-colors">
            Support
          </span>
        </div>
        <span className="text-[11px] font-body text-[rgba(232,228,220,0.30)]">v1.3.0</span>
      </div>
    </footer>
  );
}

/* ─── Home Master Page ─── */
export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-[100dvh] bg-[#060610]" />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div>
      <HeroSection />
      <LeadPipelineSection />
      <Footer />
    </div>
  );
}
