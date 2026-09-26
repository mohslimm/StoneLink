"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Users, Target, PhoneCall, Award, 
  MapPin, ShieldAlert, Sparkles, PieChart, Activity 
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/custom/GlassPanel';
import { mockProspects } from '@/data/prospects';

export default function AnalyticsPage() {
  const totalLeads = mockProspects.length;
  const contactedLeads = mockProspects.filter(p => p.stage === 'contacte').length;
  const prototypeLeads = mockProspects.filter(p => p.stage === 'prototype').length;
  const closedLeads = mockProspects.filter(p => p.stage === 'ferme').length;
  const avgScore = totalLeads > 0 
    ? Math.round(mockProspects.reduce((acc, p) => acc + (p.score || 50), 0) / totalLeads) 
    : 50;

  // Breakdown by Wilaya / Zone
  const wilayaStats = useMemo(() => {
    const counts: Record<string, number> = {};
    mockProspects.forEach(p => {
      let zone = 'Alger';
      if (p.notes && p.notes.includes('Zone:')) {
        const match = p.notes.match(/Zone:\s*([^|]+)/);
        if (match) zone = match[1].trim();
      }
      counts[zone] = (counts[zone] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, []);

  // Breakdown by Sector / Niche
  const nicheStats = useMemo(() => {
    const counts: Record<string, number> = {};
    mockProspects.forEach(p => {
      const s = p.sector || 'Général';
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, []);

  return (
    <div className="min-h-[calc(100dvh-56px)] pb-12 pt-6 px-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1.5">
          <Activity size={16} className="text-[#c5a059]" />
          <span className="text-[11px] font-body font-medium uppercase tracking-[0.1em] text-[#c5a059]">
            TÉLÉMÉTRIE D'AGENCE & PERFORMANCE
          </span>
        </div>
        <h1 className="font-display font-light text-[clamp(32px,4vw,44px)] text-[#e8e4dc] tracking-[-0.01em]">
          Analytics & Conversion
        </h1>
        <p className="text-[14px] font-body text-[rgba(232,228,220,0.55)] mt-1">
          Analyse globale des 702 leads récoltés, des taux de contact et des faiblesses techniques détectées.
        </p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <GlassPanel className="p-5">
          <div className="flex items-center justify-between text-[rgba(232,228,220,0.5)] mb-2">
            <span className="text-[11px] font-body uppercase tracking-wider">Base Prospects</span>
            <Users size={16} className="text-[#60a5fa]" />
          </div>
          <div className="text-[32px] font-display font-medium text-[#e8e4dc]">{totalLeads}</div>
          <div className="text-[11px] text-[#4ade80] mt-1 font-body">100% qualifiés & enrichis</div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex items-center justify-between text-[rgba(232,228,220,0.5)] mb-2">
            <span className="text-[11px] font-body uppercase tracking-wider">Prospects Contactés</span>
            <PhoneCall size={16} className="text-[#c5a059]" />
          </div>
          <div className="text-[32px] font-display font-medium text-[#c5a059]">{contactedLeads}</div>
          <div className="text-[11px] text-[rgba(232,228,220,0.5)] mt-1 font-body">
            Taux d'engagement : {totalLeads > 0 ? ((contactedLeads / totalLeads) * 100).toFixed(1) : 0}%
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex items-center justify-between text-[rgba(232,228,220,0.5)] mb-2">
            <span className="text-[11px] font-body uppercase tracking-wider">Score Web Moyen</span>
            <Award size={16} className="text-[#4ade80]" />
          </div>
          <div className="text-[32px] font-display font-medium text-[#4ade80]">{avgScore}/100</div>
          <div className="text-[11px] text-[#f87171] mt-1 font-body">Opportunité refonte élevée</div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex items-center justify-between text-[rgba(232,228,220,0.5)] mb-2">
            <span className="text-[11px] font-body uppercase tracking-wider">Prototypes Actifs</span>
            <Sparkles size={16} className="text-[#c5a059]" />
          </div>
          <div className="text-[32px] font-display font-medium text-[#e8e4dc]">{prototypeLeads}</div>
          <div className="text-[11px] text-[#c5a059] mt-1 font-body">Mirror Sites en ligne</div>
        </GlassPanel>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wilayas / Zones */}
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#c5a059]" />
              <h3 className="font-display font-medium text-[20px] text-[#e8e4dc]">Répartition par Wilaya & Zone</h3>
            </div>
            <span className="text-[11px] font-body text-[rgba(232,228,220,0.4)]">Top 6 Régions</span>
          </div>

          <div className="space-y-3">
            {wilayaStats.map(([zone, count]) => {
              const pct = Math.round((count / totalLeads) * 100);
              return (
                <div key={zone}>
                  <div className="flex justify-between text-[13px] font-body mb-1">
                    <span className="text-[#e8e4dc]">{zone}</span>
                    <span className="text-[#c5a059] font-medium">{count} leads ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#11111a] overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#c5a059] to-[#4ade80]"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassPanel>

        {/* Sectors / Niches */}
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-[#c5a059]" />
              <h3 className="font-display font-medium text-[20px] text-[#e8e4dc]">Répartition par Niche</h3>
            </div>
            <span className="text-[11px] font-body text-[rgba(232,228,220,0.4)]">Top Secteurs</span>
          </div>

          <div className="space-y-3">
            {nicheStats.map(([sector, count]) => {
              const pct = Math.round((count / totalLeads) * 100);
              return (
                <div key={sector}>
                  <div className="flex justify-between text-[13px] font-body mb-1">
                    <span className="text-[#e8e4dc]">{sector}</span>
                    <span className="text-[#60a5fa] font-medium">{count} leads ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#11111a] overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#60a5fa] to-[#c5a059]"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassPanel>
      </div>

      {/* Technical Weakness Insights */}
      <GlassPanel className="p-6 mt-8">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert size={18} className="text-[#f87171]" />
          <h3 className="font-display font-medium text-[20px] text-[#e8e4dc]">
            Top Vulnérabilités & Fuites de Conversion Détectées
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.06)]">
            <div className="text-[20px] font-display text-[#f87171] font-semibold">68%</div>
            <div className="text-[13px] font-body text-[#e8e4dc] mt-0.5">Absence de SSL / HTTP</div>
            <div className="text-[11px] text-[rgba(232,228,220,0.4)] mt-1">Marqué "Non Sécurisé" sur mobile</div>
          </div>
          <div className="p-4 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.06)]">
            <div className="text-[20px] font-display text-[#c5a059] font-semibold">54%</div>
            <div className="text-[13px] font-body text-[#e8e4dc] mt-0.5">Balises Meta & H1 Manquantes</div>
            <div className="text-[11px] text-[rgba(232,228,220,0.4)] mt-1">Invisibilité SEO locale sur Google</div>
          </div>
          <div className="p-4 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.06)]">
            <div className="text-[20px] font-display text-[#60a5fa] font-semibold">82%</div>
            <div className="text-[13px] font-body text-[#e8e4dc] mt-0.5">Images non compressées (WebP)</div>
            <div className="text-[11px] text-[rgba(232,228,220,0.4)] mt-1">Temps de chargement &gt; 4.5s</div>
          </div>
          <div className="p-4 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.06)]">
            <div className="text-[20px] font-display text-[#4ade80] font-semibold">91%</div>
            <div className="text-[13px] font-body text-[#e8e4dc] mt-0.5">Zéro système de réservation</div>
            <div className="text-[11px] text-[rgba(232,228,220,0.4)] mt-1">Clients forcés d'appeler</div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
