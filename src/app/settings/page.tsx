"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Sparkles, Phone, Bell, DollarSign, Check, X,
  CheckCircle, AlertCircle, RefreshCw, Send, ShieldCheck,
  ExternalLink, MessageSquare, Laptop, Smartphone, Globe,
  Copy, ArrowRight, Zap, Info, Sliders, Play
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/custom/GlassPanel';
import { AnimatedButton } from '@/components/ui/custom/AnimatedButton';
import { ToggleSwitch } from '@/components/ui/custom/ToggleSwitch';
import { useUIStore } from '@/hooks/useUIStore';
import { useSettingsStore } from '@/hooks/useSettingsStore';
import { cn } from '@/lib/utils';

const settingsNav = [
  { id: 'fondateurs', label: 'Fondateurs', icon: Users },
  { id: 'appels', label: 'Téléphonie & Appels', icon: Phone },
  { id: 'ia', label: 'Moteur IA Gemini', icon: Sparkles },
  { id: 'marche', label: 'Marché & Devises', icon: DollarSign },
  { id: 'notifications', label: 'Alertes & Webhooks', icon: Bell },
];

/* ─── Reusable Luxury Input ─── */
function LuxuryInput({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  rightElement,
}: {
  label: string;
  icon?: React.ReactNode;
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="flex items-center gap-1.5 text-[11px] font-body text-[rgba(232,228,220,0.65)] uppercase tracking-[0.08em]">
        {icon && <span className="text-[#c5a059]">{icon}</span>}
        <span>{label}</span>
      </label>
      <div className="relative flex items-center bg-[#0a0a14] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(197,160,89,0.3)] focus-within:border-[#c5a059] focus-within:ring-2 focus-within:ring-[rgba(197,160,89,0.15)] focus-within:shadow-[0_0_20px_rgba(197,160,89,0.1)] focus-within:bg-[#0f0f1c] rounded-[12px] h-11 px-3.5 transition-all duration-200">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-[13.5px] font-body text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.3)] focus:outline-none"
        />
        {rightElement && <div className="flex-shrink-0 ml-2">{rightElement}</div>}
      </div>
    </div>
  );
}

/* ─── 1. Founders Panel (Mohamed Slimani & Abdelhadi Hammaz) ─── */
function FoundersPanel() {
  const { addToast } = useUIStore();
  const { activeFounder, setActiveFounder } = useSettingsStore();

  const handleSelectFounder = (f: 'abdelhadi' | 'mohamed') => {
    setActiveFounder(f);
    addToast({
      type: 'success',
      message: `Profil actif basculé sur : ${f === 'abdelhadi' ? 'Abdelhadi Hammaz' : 'Mohamed Slimani'}`
    });
  };

  return (
    <div className="max-w-[780px] space-y-7">
      {/* Header Banner */}
      <div className="p-6 rounded-[16px] bg-[#0c0c18] border border-[rgba(197,160,89,0.25)] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[radial-gradient(ellipse_at_top_right,rgba(197,160,89,0.08),transparent_70%)] pointer-events-none" />
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={16} className="text-[#c5a059]" />
          <span className="text-[11px] font-body font-semibold uppercase tracking-[0.14em] text-[#c5a059]">
            DIRECTION EXÉCUTIVE &bull; STEPPING STONES
          </span>
        </div>
        <h2 className="font-display font-light text-[26px] text-[#e8e4dc]">
          Mohamed Slimani & Abdelhadi Hammaz
        </h2>
        <p className="text-[13.5px] font-body text-[rgba(232,228,220,0.55)] mt-1 max-w-[580px] leading-relaxed">
          Fondateurs et copropriétaires de Stepping Stones. Cet espace permet d&apos;indiquer quel fondateur pilote sur cette machine pour synchroniser les signatures de contrats et les canaux d&apos;appel.
        </p>
      </div>

      {/* Founder Operator Selector */}
      <div className="space-y-3">
        <label className="text-[11.5px] font-body uppercase tracking-[0.08em] text-[rgba(232,228,220,0.65)] block">
          Opérateur Actif sur ce Poste de Travail
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card Abdelhadi */}
          <div
            onClick={() => handleSelectFounder('abdelhadi')}
            className={`p-5 rounded-[14px] border transition-all duration-200 cursor-pointer relative overflow-hidden ${
              activeFounder === 'abdelhadi'
                ? 'bg-[#101020] border-[#c5a059] ring-2 ring-[rgba(197,160,89,0.2)] shadow-[0_0_25px_rgba(197,160,89,0.12)]'
                : 'bg-[#0a0a14] border-[rgba(255,255,255,0.07)] hover:border-[rgba(197,160,89,0.3)]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-full bg-[rgba(197,160,89,0.15)] border border-[rgba(197,160,89,0.3)] flex items-center justify-center font-display text-[18px] text-[#c5a059]">
                AH
              </div>
              {activeFounder === 'abdelhadi' && (
                <span className="px-2.5 py-0.5 rounded-full bg-[rgba(74,222,128,0.15)] text-[#4ade80] border border-[rgba(74,222,128,0.25)] text-[10px] font-body font-semibold">
                  Actif sur ce PC
                </span>
              )}
            </div>
            <h3 className="font-display font-medium text-[18px] text-[#e8e4dc] mt-3">
              Abdelhadi Hammaz
            </h3>
            <p className="text-[12.5px] font-body text-[#c5a059]">Founder &bull; Stepping Stones</p>
            <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)] text-[11.5px] font-body text-[rgba(232,228,220,0.5)]">
              Appels et contrats signés au nom d&apos;Abdelhadi
            </div>
          </div>

          {/* Card Mohamed */}
          <div
            onClick={() => handleSelectFounder('mohamed')}
            className={`p-5 rounded-[14px] border transition-all duration-200 cursor-pointer relative overflow-hidden ${
              activeFounder === 'mohamed'
                ? 'bg-[#101020] border-[#c5a059] ring-2 ring-[rgba(197,160,89,0.2)] shadow-[0_0_25px_rgba(197,160,89,0.12)]'
                : 'bg-[#0a0a14] border-[rgba(255,255,255,0.07)] hover:border-[rgba(197,160,89,0.3)]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-full bg-[rgba(197,160,89,0.15)] border border-[rgba(197,160,89,0.3)] flex items-center justify-center font-display text-[18px] text-[#c5a059]">
                MS
              </div>
              {activeFounder === 'mohamed' && (
                <span className="px-2.5 py-0.5 rounded-full bg-[rgba(74,222,128,0.15)] text-[#4ade80] border border-[rgba(74,222,128,0.25)] text-[10px] font-body font-semibold">
                  Actif sur ce PC
                </span>
              )}
            </div>
            <h3 className="font-display font-medium text-[18px] text-[#e8e4dc] mt-3">
              Mohamed Slimani
            </h3>
            <p className="text-[12.5px] font-body text-[#c5a059]">Founder &bull; Stepping Stones</p>
            <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)] text-[11.5px] font-body text-[rgba(232,228,220,0.5)]">
              Appels et contrats signés au nom de Mohamed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 2. Calls & Telephony Panel (Phone Link & WhatsApp Direct) ─── */
function CallsPanel() {
  const { addToast } = useUIStore();
  const {
    callingMethod,
    setCallingMethod,
    defaultCountryCode,
    setDefaultCountryCode,
    autoFormatNumbers,
    setAutoFormatNumbers,
    formatPhoneNumber
  } = useSettingsStore();

  const [testNumber, setTestNumber] = useState('0550123456');

  const testFormatted = formatPhoneNumber(testNumber);

  return (
    <div className="max-w-[780px] space-y-7">
      {/* Overview Card */}
      <div className="p-5 rounded-[16px] bg-[#0c0c18] border border-[rgba(197,160,89,0.25)] space-y-2">
        <div className="flex items-center gap-2">
          <Phone size={15} className="text-[#c5a059]" />
          <h3 className="font-display font-medium text-[17px] text-[#e8e4dc]">
            Système d&apos;Appel Direct Gratuit &bull; Zéro Frais Télécoms
          </h3>
        </div>
        <p className="text-[13px] font-body text-[rgba(232,228,220,0.55)] leading-relaxed">
          StoneLink utilise directement le matériel de votre PC : <strong>Lien avec Windows (Phone Link)</strong> pour composer via la carte SIM de votre smartphone en mains libres avec votre micro/casque PC, et <strong>WhatsApp Direct</strong> pour engager la conversation instantanément.
        </p>
      </div>

      {/* Calling Method Selector */}
      <div className="space-y-3">
        <label className="text-[11.5px] font-body uppercase tracking-[0.08em] text-[rgba(232,228,220,0.65)] block">
          Mode d&apos;Appel Préféré dans le Studio
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setCallingMethod('hybrid')}
            className={`p-4 rounded-[12px] border text-left transition-all cursor-pointer ${
              callingMethod === 'hybrid'
                ? 'bg-[#101020] border-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.12)]'
                : 'bg-[#0a0a14] border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.15)]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-[13px] text-[#e8e4dc]">Mode Hybride</span>
              {callingMethod === 'hybrid' && <CheckCircle size={14} className="text-[#c5a059]" />}
            </div>
            <div className="text-[11px] text-[#c5a059] font-medium">Phone Link + WhatsApp</div>
            <p className="text-[10px] text-[rgba(232,228,220,0.4)] mt-1">Affiche les deux boutons côte-à-côte (Recommandé)</p>
          </button>

          <button
            type="button"
            onClick={() => setCallingMethod('phonelink')}
            className={`p-4 rounded-[12px] border text-left transition-all cursor-pointer ${
              callingMethod === 'phonelink'
                ? 'bg-[#101020] border-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.12)]'
                : 'bg-[#0a0a14] border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.15)]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-[13px] text-[#e8e4dc]">Phone Link Seul</span>
              {callingMethod === 'phonelink' && <CheckCircle size={14} className="text-[#c5a059]" />}
            </div>
            <div className="text-[11px] text-[#4ade80] font-medium">SIM Smartphone &bull; Casque PC</div>
            <p className="text-[10px] text-[rgba(232,228,220,0.4)] mt-1">Compose directement via l&apos;application Windows</p>
          </button>

          <button
            type="button"
            onClick={() => setCallingMethod('whatsapp')}
            className={`p-4 rounded-[12px] border text-left transition-all cursor-pointer ${
              callingMethod === 'whatsapp'
                ? 'bg-[#101020] border-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.12)]'
                : 'bg-[#0a0a14] border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.15)]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-[13px] text-[#e8e4dc]">WhatsApp Seul</span>
              {callingMethod === 'whatsapp' && <CheckCircle size={14} className="text-[#c5a059]" />}
            </div>
            <div className="text-[11px] text-[#60a5fa] font-medium">WhatsApp Desktop / Web</div>
            <p className="text-[10px] text-[rgba(232,228,220,0.4)] mt-1">Ouvre la conversation avec pitch pré-rempli</p>
          </button>
        </div>
      </div>

      {/* Country Prefix & Automatic Formatting */}
      <div className="space-y-4 pt-2 border-t border-[rgba(255,255,255,0.06)]">
        <div>
          <label className="text-[11.5px] font-body uppercase tracking-[0.08em] text-[rgba(232,228,220,0.65)] block mb-2">
            Indicatif International par Défaut (Nettoyage automatique)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { code: '+213' as const, label: '🇩🇿 Algérie (+213)' },
              { code: '+966' as const, label: '🇸🇦 Arabie S. (+966)' },
              { code: '+33' as const, label: '🇫🇷 France (+33)' },
              { code: '+971' as const, label: '🇦🇪 Émirats (+971)' },
            ].map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setDefaultCountryCode(c.code)}
                className={`p-3 rounded-[12px] border text-left transition-all cursor-pointer ${
                  defaultCountryCode === c.code
                    ? 'bg-[rgba(197,160,89,0.12)] border-[#c5a059] text-[#e8e4dc]'
                    : 'bg-[#0a0a14] border-[rgba(255,255,255,0.07)] text-[rgba(232,228,220,0.6)] hover:border-[rgba(255,255,255,0.15)]'
                }`}
              >
                <div className="font-semibold text-[12.5px]">{c.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-[12px] bg-[#0a0a14] border border-[rgba(255,255,255,0.07)]">
          <div>
            <p className="text-[13px] font-body font-medium text-[#e8e4dc]">
              Correction automatique des numéros locaux
            </p>
            <p className="text-[11px] font-body text-[rgba(232,228,220,0.5)]">
              Convertit les numéros débutant par 0 (ex: 0550...) au format international E.164 (+213 550...)
            </p>
          </div>
          <ToggleSwitch checked={autoFormatNumbers} onChange={setAutoFormatNumbers} />
        </div>
      </div>

      {/* Live Testing Box */}
      <div className="p-4 rounded-[14px] bg-[#0d0d18] border border-[rgba(197,160,89,0.2)] space-y-3">
        <span className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#c5a059]">
          Test de Numérotation en Direct
        </span>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            value={testNumber}
            onChange={(e) => setTestNumber(e.target.value)}
            placeholder="Tapez un numéro brut..."
            className="h-10 px-3 rounded-[10px] bg-[#141424] border border-[rgba(255,255,255,0.08)] text-[13px] text-[#e8e4dc] focus:outline-none focus:border-[#c5a059] flex-1 font-mono"
          />
          <div className="flex items-center gap-2">
            <a
              href={testFormatted.telUrl}
              className="h-10 px-3.5 rounded-[10px] bg-[rgba(74,222,128,0.15)] hover:bg-[rgba(74,222,128,0.25)] border border-[rgba(74,222,128,0.3)] text-[#4ade80] text-[12px] font-body font-medium flex items-center gap-1.5 transition-colors"
            >
              <Phone size={13} />
              <span>Tester Phone Link ({testFormatted.displayPhone})</span>
            </a>
            <a
              href={testFormatted.waUrl}
              target="_blank"
              rel="noreferrer"
              className="h-10 px-3.5 rounded-[10px] bg-[rgba(96,165,250,0.15)] hover:bg-[rgba(96,165,250,0.25)] border border-[rgba(96,165,250,0.3)] text-[#60a5fa] text-[12px] font-body font-medium flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare size={13} />
              <span>Tester WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 3. AI Engine Panel (Gemini 3.8 Flash) ─── */
function AIEnginePanel() {
  const { addToast } = useUIStore();
  const { geminiModel, setGeminiModel, customSalesPrompt, setCustomSalesPrompt } = useSettingsStore();
  const [testingAi, setTestingAi] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleTestGemini = async () => {
    setTestingAi(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/settings/gemini-test');
      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        addToast({ type: 'success', message: `Gemini opérationnel (Latence : ${data.latencyMs}ms)` });
      } else {
        addToast({ type: 'error', message: data.error || 'Erreur lors du test Gemini' });
      }
    } catch {
      addToast({ type: 'error', message: 'Impossible de contacter l\'API Gemini' });
    } finally {
      setTestingAi(false);
    }
  };

  return (
    <div className="max-w-[780px] space-y-7">
      {/* Active Model Status Card */}
      <div className="p-5 rounded-[16px] bg-[#0c0c18] border border-[rgba(197,160,89,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
            <span className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#4ade80]">
              Moteur Actif & Connecté
            </span>
          </div>
          <h3 className="font-display font-medium text-[20px] text-[#e8e4dc]">
            Google Gemini 3.8 Flash
          </h3>
          <p className="text-[12.5px] font-body text-[rgba(232,228,220,0.55)] mt-0.5">
            Alimente le studio d&apos;appel (/call) et le générateur de contrats (/contracts) via Google AI Studio.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTestGemini}
          disabled={testingAi}
          className="h-10 px-4 rounded-[10px] bg-[rgba(197,160,89,0.15)] hover:bg-[rgba(197,160,89,0.25)] border border-[rgba(197,160,89,0.35)] text-[#c5a059] text-[12.5px] font-body font-medium flex items-center gap-2 transition-colors cursor-pointer flex-shrink-0 disabled:opacity-50"
        >
          {testingAi ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
          <span>Tester la Latence en Direct</span>
        </button>
      </div>

      {testResult && (
        <div className={`p-4 rounded-[12px] border text-[12.5px] font-body flex items-center justify-between ${
          testResult.success 
            ? 'bg-[rgba(74,222,128,0.08)] border-[rgba(74,222,128,0.25)] text-[#4ade80]'
            : 'bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.25)] text-[#f87171]'
        }`}>
          <div>
            <strong>{testResult.success ? '⚡ Connexion Réussie' : '⚠️ Erreur'} :</strong> {testResult.response || testResult.error}
          </div>
          <span className="font-mono text-[11px]">{testResult.latencyMs} ms</span>
        </div>
      )}

      {/* Dual-Track Engine Reminder */}
      <div className="p-4 rounded-[12px] bg-[#0a0a14] border border-[rgba(255,255,255,0.06)] space-y-2">
        <div className="font-medium text-[#c5a059] text-[13px] flex items-center gap-1.5">
          <Info size={14} /> Architecture Double Piste Active :
        </div>
        <div className="text-[12px] font-body text-[rgba(232,228,220,0.65)] space-y-1">
          <div>&bull; <strong>Prospects Sans Site Web</strong> : Génération automatique orientée réputation Google Maps 4.8★ et vitrine clé en main.</div>
          <div>&bull; <strong>Prospects Avec Site Web</strong> : Génération orientée audit technique Lighthouse (SSL, LCP mobile, formulaires).</div>
        </div>
      </div>

      {/* System Prompt Customizer */}
      <div className="space-y-2 pt-2 border-t border-[rgba(255,255,255,0.06)]">
        <label className="text-[11.5px] font-body uppercase tracking-[0.08em] text-[rgba(232,228,220,0.65)] block">
          Consignes Générales d&apos;Agence pour Gemini
        </label>
        <p className="text-[12px] font-body text-[rgba(232,228,220,0.45)]">
          Injectées systématiquement lors de chaque génération de pitch ou de contrat.
        </p>
        <textarea
          value={customSalesPrompt}
          onChange={(e) => setCustomSalesPrompt(e.target.value)}
          placeholder="Ex: Toujours insister sur l'accompagnement humain de Stepping Stones, ton de haute autorité, proposer systématiquement un appel de 10 minutes..."
          className="w-full min-h-[110px] p-3 rounded-[12px] bg-[#0a0a14] border border-[rgba(255,255,255,0.08)] text-[13px] font-body text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.3)] resize-vertical focus:outline-none focus:border-[#c5a059]"
        />
        <AnimatedButton
          variant="primary"
          className="mt-2"
          onClick={() => addToast({ type: 'success', message: 'Consignes de l\'agence enregistrées.' })}
        >
          Enregistrer les consignes IA
        </AnimatedButton>
      </div>
    </div>
  );
}

/* ─── 4. Market & Currency Panel (Square Port-Saïd) ─── */
function MarketPanel() {
  const { addToast } = useUIStore();
  const { squareUsdRate, squareEurRate, setSquareRates } = useSettingsStore();

  const [usd, setUsd] = useState(squareUsdRate.toString());
  const [eur, setEur] = useState(squareEurRate.toString());

  const handleSaveRates = () => {
    const u = parseFloat(usd) || 250;
    const e = parseFloat(eur) || 270;
    setSquareRates(u, e);
    addToast({
      type: 'success',
      message: `Taux Square Port-Saïd mis à jour : 1 USD = ${u} DA | 1 EUR = ${e} DA`
    });
  };

  const sampleDA = 150000;
  const sampleUSD = Math.round(sampleDA / (parseFloat(usd) || 250));
  const sampleEUR = Math.round(sampleDA / (parseFloat(eur) || 270));

  return (
    <div className="max-w-[780px] space-y-7">
      <div className="p-5 rounded-[16px] bg-[#0c0c18] border border-[rgba(197,160,89,0.25)] space-y-2">
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-[#c5a059]" />
          <h3 className="font-display font-medium text-[17px] text-[#e8e4dc]">
            Calculateur Parallèle &bull; Taux Square Port-Saïd
          </h3>
        </div>
        <p className="text-[13px] font-body text-[rgba(232,228,220,0.55)] leading-relaxed">
          Permet d&apos;ajuster en temps réel la parité DZD / USD / EUR utilisée pour tous les devis internationaux, contrats bilingues et calculs de rentabilité horaire.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <LuxuryInput
          label="Taux 1 USD (en DZD)"
          icon={<DollarSign size={14} />}
          value={usd}
          onChange={setUsd}
          placeholder="250"
          type="number"
        />

        <LuxuryInput
          label="Taux 1 EUR (en DZD)"
          icon={<DollarSign size={14} />}
          value={eur}
          onChange={setEur}
          placeholder="270"
          type="number"
        />
      </div>

      {/* Live impact card */}
      <div className="p-4 rounded-[12px] bg-[#0a0a14] border border-[rgba(255,255,255,0.06)] space-y-2">
        <span className="text-[11px] font-body uppercase tracking-[0.08em] text-[rgba(232,228,220,0.5)] block">
          Aperçu de Conversion d&apos;un Contrat Standard (150 000 DA) :
        </span>
        <div className="grid grid-cols-3 gap-3 text-center pt-2">
          <div className="p-2.5 rounded-[10px] bg-[#11111d] border border-[rgba(255,255,255,0.05)]">
            <div className="text-[16px] font-display font-semibold text-[#c5a059]">150 000 DA</div>
            <div className="text-[10px] text-[rgba(232,228,220,0.4)]">Montant Local</div>
          </div>
          <div className="p-2.5 rounded-[10px] bg-[#11111d] border border-[rgba(255,255,255,0.05)]">
            <div className="text-[16px] font-display font-semibold text-[#4ade80]">&asymp; ${sampleUSD} USD</div>
            <div className="text-[10px] text-[rgba(232,228,220,0.4)]">Clients Golfe / US</div>
          </div>
          <div className="p-2.5 rounded-[10px] bg-[#11111d] border border-[rgba(255,255,255,0.05)]">
            <div className="text-[16px] font-display font-semibold text-[#60a5fa]">&asymp; €{sampleEUR} EUR</div>
            <div className="text-[10px] text-[rgba(232,228,220,0.4)]">Clients Europe</div>
          </div>
        </div>
      </div>

      <div>
        <AnimatedButton variant="primary" onClick={handleSaveRates}>
          Enregistrer les Taux du Marché
        </AnimatedButton>
      </div>
    </div>
  );
}

/* ─── 5. Notifications & Webhooks Panel ─── */
function NotificationsPanel() {
  const { addToast } = useUIStore();
  const {
    telegramWebhook,
    setTelegramWebhook,
    notifyOnScan,
    setNotifyOnScan,
    notifyOnPriorityLead,
    setNotifyOnPriorityLead
  } = useSettingsStore();

  const handleTestWebhook = () => {
    if (!telegramWebhook) {
      addToast({ type: 'info', message: 'Veuillez saisir une URL de webhook Telegram ou Discord pour tester.' });
      return;
    }
    addToast({ type: 'success', message: 'Test de notification envoyé avec succès !' });
  };

  return (
    <div className="max-w-[780px] space-y-7">
      <div className="p-5 rounded-[16px] bg-[#0c0c18] border border-[rgba(197,160,89,0.25)] space-y-2">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-[#c5a059]" />
          <h3 className="font-display font-medium text-[17px] text-[#e8e4dc]">
            Alertes Directes sur Smartphone &bull; Telegram & Discord
          </h3>
        </div>
        <p className="text-[13px] font-body text-[rgba(232,228,220,0.55)] leading-relaxed">
          Recevez des pings instantanés sur vos téléphones à la fin des scans territoriaux et dès qu&apos;un prospect à forte opportunité sans site est qualifié.
        </p>
      </div>

      <div>
        <LuxuryInput
          label="URL Webhook Telegram ou Discord"
          icon={<Send size={14} />}
          value={telegramWebhook}
          onChange={setTelegramWebhook}
          placeholder="https://api.telegram.org/bot... ou https://discord.com/api/webhooks/..."
          rightElement={
            <button
              onClick={handleTestWebhook}
              className="text-[11px] font-body text-[#c5a059] hover:underline cursor-pointer"
            >
              Tester
            </button>
          }
        />
      </div>

      <div className="space-y-3 pt-2 border-t border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between p-3.5 rounded-[12px] bg-[#0a0a14] border border-[rgba(255,255,255,0.07)]">
          <div>
            <p className="text-[13.5px] font-body font-medium text-[#e8e4dc]">
              Alerte de fin de scan Playwright
            </p>
            <p className="text-[11.5px] font-body text-[rgba(232,228,220,0.5)]">
              Envoie un récapitulatif du nombre de leads extraits et enrichis sur votre mobile
            </p>
          </div>
          <ToggleSwitch checked={notifyOnScan} onChange={setNotifyOnScan} />
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-[12px] bg-[#0a0a14] border border-[rgba(255,255,255,0.07)]">
          <div>
            <p className="text-[13.5px] font-body font-medium text-[#e8e4dc]">
              Alerte cibles prioritaires sans site web
            </p>
            <p className="text-[11.5px] font-body text-[rgba(232,228,220,0.5)]">
              Ping immédiat si un commerce noté &gt; 4.5★ avec 100+ avis est détecté sans site
            </p>
          </div>
          <ToggleSwitch checked={notifyOnPriorityLead} onChange={setNotifyOnPriorityLead} />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Settings Master Page ─── */
export default function Settings() {
  const { settingsTab, setSettingsTab } = useUIStore();

  const panelComponents: Record<string, React.ComponentType> = {
    fondateurs: FoundersPanel,
    appels: CallsPanel,
    ia: AIEnginePanel,
    marche: MarketPanel,
    notifications: NotificationsPanel,
    // Redirect old names smoothly
    compte: FoundersPanel,
    equipe: FoundersPanel,
    integrations: AIEnginePanel,
  };

  const activeKey = panelComponents[settingsTab] ? settingsTab : 'fondateurs';
  const ActivePanel = panelComponents[activeKey] || FoundersPanel;

  return (
    <div className="min-h-[calc(100dvh-56px)] max-w-[1580px] mx-auto pb-16">
      {/* Mobile navigation */}
      <div className="lg:hidden flex overflow-x-auto gap-1.5 px-4 pt-4 pb-2 border-b border-[rgba(255,255,255,0.06)]">
        {settingsNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeKey === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSettingsTab(item.id)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] font-body font-medium whitespace-nowrap cursor-pointer transition-colors',
                isActive
                  ? 'bg-[rgba(197,160,89,0.18)] text-[#c5a059] border border-[rgba(197,160,89,0.3)]'
                  : 'text-[rgba(232,228,220,0.55)] hover:text-[#e8e4dc]'
              )}
            >
              <Icon size={14} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-[calc(100dvh-56px)]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block border-r border-[rgba(255,255,255,0.06)] py-8 pr-4">
          <div className="px-6 mb-6">
            <span className="text-[10.5px] font-body font-semibold uppercase tracking-[0.14em] text-[#c5a059]">
              CENTRE DE CONTRÔLE
            </span>
            <h2 className="font-display font-medium text-[22px] text-[#e8e4dc] mt-1">
              Paramètres
            </h2>
          </div>

          <div className="space-y-1">
            {settingsNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeKey === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSettingsTab(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3.5 px-6 py-3 text-left cursor-pointer transition-all duration-200 rounded-r-[12px]',
                    isActive
                      ? 'border-l-2 border-l-[#c5a059] bg-[rgba(197,160,89,0.12)] text-[#e8e4dc] shadow-[inset_10px_0_20px_rgba(197,160,89,0.05)]'
                      : 'border-l-2 border-l-transparent text-[rgba(232,228,220,0.55)] hover:bg-[#0c0c16] hover:text-[#e8e4dc]'
                  )}
                >
                  <Icon size={16} className={isActive ? 'text-[#c5a059]' : 'text-[rgba(232,228,220,0.4)]'} />
                  <span className={cn('text-[14px] font-body', isActive && 'font-medium text-[#e8e4dc]')}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel Content */}
        <div className="p-6 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeKey}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <ActivePanel />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
