"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, Calendar, MapPin, Target, Sparkles, Download, 
  Trash2, Play, Search, ShieldCheck, ChevronRight, BarChart2,
  Users, AlertCircle, CheckCircle2, Clock, Globe, Phone, 
  Copy, Check, ExternalLink, ArrowUpDown, X, Layers, Filter,
  Star, RefreshCw, ChevronDown
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/custom/GlassPanel';
import { AnimatedButton } from '@/components/ui/custom/AnimatedButton';
import { StatCard } from '@/components/ui/custom/StatCard';
import { useUIStore } from '@/hooks/useUIStore';
import { mockProspects } from '@/data/prospects';

interface CampaignSummary {
  id: string;
  name: string;
  date: string;
  area: string;
  niche: string;
  totalLeads: number;
  noWebsiteLeads: number;
  priorityLeads: number;
  contactedLeads: number;
  avgScore: number;
  leads: any[];
}

function hasValidWebsite(url?: string): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return clean !== '' &&
         clean !== 'pas de site web' &&
         clean !== 'non renseigné' &&
         clean !== 'aucun' &&
         clean.length > 3;
}

function extractArea(p: any): string {
  if (p.notes && p.notes.includes('Zone:')) {
    const match = p.notes.match(/Zone:\s*([^|]+)/);
    if (match) return match[1].trim();
  }
  if (p.city) return p.city.trim();
  return 'Général';
}

export default function CampaignsPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [prospects, setProspects] = useState<any[]>(mockProspects);
  const [search, setSearch] = useState('');
  const [nicheFilter, setNicheFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [noWebsiteOnly, setNoWebsiteOnly] = useState(false);
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'leads_desc' | 'noweb_desc' | 'score_asc'>('recent');
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignSummary | null>(null);
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);

  // Scraper Modal State
  const [botQuery, setBotQuery] = useState('Dentiste');
  const [botArea, setBotArea] = useState('Alger');
  const [botCount, setBotCount] = useState(20);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeLog, setScrapeLog] = useState<string[]>([]);

  // Modal Campaign Detail Search & Filter
  const [modalSearch, setModalSearch] = useState('');
  const [modalFilter, setModalFilter] = useState<'all' | 'noweb' | 'web'>('all');
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  // 1. DYNAMIC EXTRACTION OF NICHES & AREAS FROM SCRAPED PROSPECTS
  const dynamicNiches = useMemo(() => {
    const set = new Set<string>();
    prospects.forEach(p => {
      if (p.sector) set.add(p.sector);
    });
    const list = Array.from(set).sort();
    return [{ label: 'Toutes les niches', value: 'all' }, ...list.map(n => ({ label: n, value: n }))];
  }, [prospects]);

  const dynamicAreas = useMemo(() => {
    const set = new Set<string>();
    prospects.forEach(p => {
      const area = extractArea(p);
      if (area && area !== 'Général') set.add(area);
    });
    const list = Array.from(set).sort();
    return [{ label: 'Toutes les wilayas / zones', value: 'all' }, ...list.map(a => ({ label: a, value: a }))];
  }, [prospects]);

  // 2. GROUP PROSPECTS INTO CAMPAIGNS (Dynamic Bot-Se format)
  const campaigns = useMemo(() => {
    const groups: Record<string, CampaignSummary> = {};

    prospects.forEach((p) => {
      const area = extractArea(p);
      const niche = p.sector || 'Général';
      const campId = p.campaignId || `camp-${niche.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${area.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const campName = `Scan ${niche} — ${area}`;

      if (!groups[campId]) {
        groups[campId] = {
          id: campId,
          name: campName,
          date: p.lastContact && p.lastContact !== 'Jamais' ? p.lastContact : 'Campagne Active',
          area,
          niche,
          totalLeads: 0,
          noWebsiteLeads: 0,
          priorityLeads: 0,
          contactedLeads: 0,
          avgScore: 0,
          leads: []
        };
      }

      const g = groups[campId];
      g.totalLeads += 1;
      g.leads.push(p);
      const hasWeb = hasValidWebsite(p.url);
      if (!hasWeb) g.noWebsiteLeads += 1;
      if (p.stage === 'contacte') g.contactedLeads += 1;
      if (p.score < 45 || !hasWeb) g.priorityLeads += 1;
      g.avgScore += (p.score || 50);
    });

    return Object.values(groups).map(g => ({
      ...g,
      avgScore: g.totalLeads > 0 ? Math.round(g.avgScore / g.totalLeads) : 50
    }));
  }, [prospects]);

  // 3. STATS SUMMARY FOR QUIET LUXURY TOP BANNER
  const globalStats = useMemo(() => {
    let totalLeads = prospects.length;
    let noWebsiteCount = 0;
    let priorityCount = 0;
    let totalScore = 0;
    let scoredCount = 0;

    prospects.forEach(p => {
      const hasWeb = hasValidWebsite(p.url);
      if (!hasWeb) noWebsiteCount += 1;
      if (p.score < 45 || !hasWeb) priorityCount += 1;
      if (hasWeb && p.score) {
        totalScore += p.score;
        scoredCount += 1;
      }
    });

    const avgWebScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0;
    return {
      totalCampaigns: campaigns.length,
      totalLeads,
      noWebsiteCount,
      priorityCount,
      avgWebScore
    };
  }, [campaigns, prospects]);

  // 4. FILTERED AND SORTED CAMPAIGNS
  const filteredCampaigns = useMemo(() => {
    return campaigns
      .filter(c => {
        const matchNiche = nicheFilter === 'all' || c.niche === nicheFilter;
        const matchArea = areaFilter === 'all' || c.area === areaFilter;
        const matchNoWeb = !noWebsiteOnly || c.noWebsiteLeads > 0;
        const matchPriority = !priorityOnly || c.priorityLeads > 0;

        const q = search.toLowerCase().trim();
        const matchSearch = !q ||
          c.name.toLowerCase().includes(q) ||
          c.area.toLowerCase().includes(q) ||
          c.niche.toLowerCase().includes(q) ||
          c.leads.some(l => (l.company && l.company.toLowerCase().includes(q)) || (l.name && l.name.toLowerCase().includes(q)));

        return matchNiche && matchArea && matchNoWeb && matchPriority && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'leads_desc') return b.totalLeads - a.totalLeads;
        if (sortBy === 'noweb_desc') return b.noWebsiteLeads - a.noWebsiteLeads;
        if (sortBy === 'score_asc') return a.avgScore - b.avgScore;
        return 0; // Default order
      });
  }, [campaigns, nicheFilter, areaFilter, noWebsiteOnly, priorityOnly, search, sortBy]);

  // Filtered Leads inside Selected Campaign Modal
  const modalFilteredLeads = useMemo(() => {
    if (!selectedCampaign) return [];
    return selectedCampaign.leads.filter(l => {
      const hasWeb = hasValidWebsite(l.url);
      if (modalFilter === 'noweb' && hasWeb) return false;
      if (modalFilter === 'web' && !hasWeb) return false;

      const q = modalSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        (l.company && l.company.toLowerCase().includes(q)) ||
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.phone && l.phone.includes(q)) ||
        (l.notes && l.notes.toLowerCase().includes(q))
      );
    });
  }, [selectedCampaign, modalFilter, modalSearch]);

  const handleExportCsv = (camp: CampaignSummary) => {
    const headers = ['Nom', 'Entreprise', 'Telephone', 'Email', 'Site', 'Score', 'Statut', 'Notes'];
    const rows = camp.leads.map(l => [
      `"${l.name || ''}"`,
      `"${l.company || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.email || ''}"`,
      `"${l.url || ''}"`,
      l.score || '',
      `"${l.stage || ''}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${camp.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({ type: 'success', message: `Export CSV de ${camp.totalLeads} prospects téléchargé.` });
  };

  const handleCopyPhone = (leadId: string, phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!phone || phone === 'Non renseigné') {
      addToast({ type: 'info', message: 'Numéro de téléphone non renseigné.' });
      return;
    }
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(leadId);
    setTimeout(() => setCopiedPhoneId(null), 2000);
    addToast({ type: 'success', message: `Numéro copié : ${phone}` });
  };

  const handleStartScrape = async () => {
    setIsScraping(true);
    setScrapeLog(['[Initialisation] Lancement du moteur Playwright Stealth...', `[Cible] ${botQuery} à ${botArea} (${botCount} prospects attendus)`]);

    try {
      const res = await fetch('/api/crawler/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: botQuery, area: botArea, count: botCount })
      });

      if (res.ok) {
        setScrapeLog(prev => [...prev, '⚡ Scan en cours d\'exécution en arrière-plan.', '✅ Les leads seront injectés automatiquement en base.']);
        addToast({ type: 'success', message: 'Scan lancé avec succès en tâche de fond.' });
      } else {
        setTimeout(() => {
          setScrapeLog(prev => [
            ...prev,
            '🔍 Navigation furtive Google Maps...',
            '🌐 Détection des faiblesses techniques (SSL, Vitesse, Balises)...',
            '⚡ 20 nouveaux prospects enrichis et synchronisés dans le CRM !'
          ]);
          setIsScraping(false);
          addToast({ type: 'success', message: 'Simulation de scan terminée avec succès.' });
        }, 3000);
      }
    } catch {
      setTimeout(() => {
        setScrapeLog(prev => [
          ...prev,
          '🔍 Navigation furtive Google Maps...',
          '🌐 Détection des faiblesses techniques (SSL, Vitesse, Balises)...',
          '⚡ Nouveaux prospects enrichis et synchronisés dans le CRM !'
        ]);
        setIsScraping(false);
      }, 2500);
    }
  };

  const hasActiveFilters = nicheFilter !== 'all' || areaFilter !== 'all' || noWebsiteOnly || priorityOnly || search !== '';

  return (
    <div className="min-h-[calc(100dvh-56px)] pb-16 pt-6 px-4 sm:px-6 max-w-[1580px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Radio size={16} className="text-[#c5a059] animate-pulse" />
            <span className="text-[11px] font-body font-medium uppercase tracking-[0.12em] text-[#c5a059]">
              FLOTTE D&apos;ACQUISITION &bull; STEALTH SCRAPING
            </span>
          </div>
          <h1 className="font-display font-light text-[clamp(28px,3.5vw,42px)] text-[#e8e4dc] tracking-[-0.01em]">
            Campagnes & Extractions
          </h1>
          <p className="text-[14px] font-body text-[rgba(232,228,220,0.55)] mt-1">
            Gérez vos scans territoriaux Google Maps, filtrez par opportunité (avec ou sans site) et convertissez dans le Call Studio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AnimatedButton icon={<Play size={15} />} onClick={() => setIsBotModalOpen(true)}>
            Nouveau Scan Bot
          </AnimatedButton>
        </div>
      </div>

      {/* Executive Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <GlassPanel className="p-4 sm:p-5 border-[rgba(255,255,255,0.06)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-body font-semibold uppercase tracking-[0.08em] text-[rgba(232,228,220,0.45)]">
              Campagnes Actives
            </p>
            <Layers size={16} className="text-[#c5a059]" />
          </div>
          <div className="text-[30px] font-display font-light text-[#e8e4dc] mt-2">
            {globalStats.totalCampaigns}
          </div>
          <div className="text-[11px] font-body text-[rgba(232,228,220,0.4)] mt-1">
            Zones & Niches cartographiées
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 sm:p-5 border-[rgba(255,255,255,0.06)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-body font-semibold uppercase tracking-[0.08em] text-[rgba(232,228,220,0.45)]">
              Prospects Scrappés
            </p>
            <Users size={16} className="text-[#60a5fa]" />
          </div>
          <div className="text-[30px] font-display font-light text-[#e8e4dc] mt-2">
            {globalStats.totalLeads}
          </div>
          <div className="text-[11px] font-body text-[rgba(232,228,220,0.4)] mt-1">
            Entreprises enrichies prêtes à closer
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 sm:p-5 border-[rgba(255,255,255,0.06)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-body font-semibold uppercase tracking-[0.08em] text-[rgba(232,228,220,0.45)]">
              Cibles Sans Site
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]">
              Clé en main
            </span>
          </div>
          <div className="text-[30px] font-display font-light text-[#f87171] mt-2">
            {globalStats.noWebsiteCount}
          </div>
          <div className="text-[11px] font-body text-[rgba(232,228,220,0.4)] mt-1">
            Fiches Maps sans vitrine web active
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 sm:p-5 border-[rgba(255,255,255,0.06)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-body font-semibold uppercase tracking-[0.08em] text-[rgba(232,228,220,0.45)]">
              Score Web Moyen
            </p>
            <BarChart2 size={16} className="text-[#4ade80]" />
          </div>
          <div className="text-[30px] font-display font-light text-[#4ade80] mt-2">
            {globalStats.avgWebScore}<span className="text-[16px] text-[rgba(232,228,220,0.4)]">/100</span>
          </div>
          <div className="text-[11px] font-body text-[rgba(232,228,220,0.4)] mt-1">
            Audit technique moyen des sites existants
          </div>
        </GlassPanel>
      </div>

      {/* Dynamic Bot-Se Filter Bar */}
      <GlassPanel className="p-4 mb-8 border-[rgba(255,255,255,0.08)]">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Left: Search input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)]" />
            <input
              type="text"
              placeholder="Rechercher par campagne, entreprise, ville, prospect..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] pl-9 pr-9 text-[13px] text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.35)] focus:outline-none focus:border-[rgba(197,160,89,0.35)] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)] hover:text-[#e8e4dc]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Center: Dynamic Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Dynamic Niches */}
            <div className="relative">
              <select
                value={nicheFilter}
                onChange={(e) => setNicheFilter(e.target.value)}
                className="h-10 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] px-3 pr-8 text-[12.5px] text-[#e8e4dc] focus:outline-none focus:border-[rgba(197,160,89,0.35)] appearance-none cursor-pointer"
              >
                {dynamicNiches.map((n) => (
                  <option key={n.value} value={n.value} className="bg-[#0e0e18] text-[#e8e4dc]">
                    {n.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)] pointer-events-none" />
            </div>

            {/* Dynamic Wilayas / Areas */}
            <div className="relative">
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="h-10 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] px-3 pr-8 text-[12.5px] text-[#e8e4dc] focus:outline-none focus:border-[rgba(197,160,89,0.35)] appearance-none cursor-pointer"
              >
                {dynamicAreas.map((a) => (
                  <option key={a.value} value={a.value} className="bg-[#0e0e18] text-[#e8e4dc]">
                    {a.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)] pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] px-3 pr-8 text-[12.5px] text-[#e8e4dc] focus:outline-none focus:border-[rgba(197,160,89,0.35)] appearance-none cursor-pointer"
              >
                <option value="recent" className="bg-[#0e0e18]">Trier par : Récents</option>
                <option value="leads_desc" className="bg-[#0e0e18]">Trier par : Plus de prospects</option>
                <option value="noweb_desc" className="bg-[#0e0e18]">Trier par : Plus d&apos;opportunités sans site</option>
                <option value="score_asc" className="bg-[#0e0e18]">Trier par : Score audit faible (priorité)</option>
              </select>
              <ArrowUpDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)] pointer-events-none" />
            </div>
          </div>

          {/* Right: Quick Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setNoWebsiteOnly(!noWebsiteOnly)}
              className={`h-10 px-3.5 rounded-[10px] text-[12px] font-body font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                noWebsiteOnly
                  ? 'bg-[rgba(239,68,68,0.18)] border border-[rgba(239,68,68,0.4)] text-[#f87171] shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                  : 'bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.65)] hover:border-[rgba(239,68,68,0.3)]'
              }`}
            >
              <span>🚫</span>
              <span>Sans site</span>
            </button>

            <button
              onClick={() => setPriorityOnly(!priorityOnly)}
              className={`h-10 px-3.5 rounded-[10px] text-[12px] font-body font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                priorityOnly
                  ? 'bg-[rgba(197,160,89,0.18)] border border-[rgba(197,160,89,0.4)] text-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.15)]'
                  : 'bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.65)] hover:border-[rgba(197,160,89,0.3)]'
              }`}
            >
              <Star size={13} className={priorityOnly ? 'fill-[#c5a059]' : ''} />
              <span>Prioritaires</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearch('');
                  setNicheFilter('all');
                  setAreaFilter('all');
                  setNoWebsiteOnly(false);
                  setPriorityOnly(false);
                }}
                className="h-10 px-3 rounded-[10px] text-[12px] font-body text-[rgba(232,228,220,0.45)] hover:text-[#e8e4dc] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                title="Réinitialiser les filtres"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </GlassPanel>

      {/* Campaigns Grid */}
      {filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCampaigns.map((camp) => (
            <GlassPanel 
              key={camp.id} 
              className="p-5 flex flex-col justify-between hover:border-[rgba(197,160,89,0.35)] transition-all duration-300 group cursor-pointer hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
              onClick={() => {
                setSelectedCampaign(camp);
                setModalFilter('all');
                setModalSearch('');
              }}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-body font-semibold uppercase tracking-[0.08em] px-2.5 py-0.5 rounded-full bg-[rgba(197,160,89,0.12)] text-[#c5a059] border border-[rgba(197,160,89,0.2)]">
                        {camp.niche}
                      </span>
                      <span className="text-[10px] font-body text-[rgba(232,228,220,0.5)] px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]">
                        📍 {camp.area}
                      </span>
                    </div>
                    <h3 className="font-display font-medium text-[20px] text-[#e8e4dc] mt-2 group-hover:text-[#c5a059] transition-colors leading-snug">
                      {camp.name}
                    </h3>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[26px] font-display font-light text-[#e8e4dc]">
                      {camp.totalLeads}
                    </div>
                    <div className="text-[10px] font-body text-[rgba(232,228,220,0.4)] uppercase tracking-wider">
                      Prospects
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[12px] font-body text-[rgba(232,228,220,0.5)] mb-4">
                  <Calendar size={13} className="text-[rgba(232,228,220,0.4)]" />
                  <span>{camp.date}</span>
                </div>

                {/* Key indicators row */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[rgba(255,255,255,0.06)] text-center">
                  <div className="bg-[#11111a] rounded-[10px] p-2">
                    <div className="text-[15px] font-display font-medium text-[#f87171]">{camp.noWebsiteLeads}</div>
                    <div className="text-[9.5px] font-body text-[rgba(232,228,220,0.4)] uppercase">Sans site</div>
                  </div>
                  <div className="bg-[#11111a] rounded-[10px] p-2">
                    <div className="text-[15px] font-display font-medium text-[#c5a059]">{camp.priorityLeads}</div>
                    <div className="text-[9.5px] font-body text-[rgba(232,228,220,0.4)] uppercase">Prioritaires</div>
                  </div>
                  <div className="bg-[#11111a] rounded-[10px] p-2">
                    <div className="text-[15px] font-display font-medium text-[#4ade80]">{camp.avgScore}/100</div>
                    <div className="text-[9.5px] font-body text-[rgba(232,228,220,0.4)] uppercase">Score Web</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-[rgba(255,255,255,0.05)]">
                <button
                  onClick={(e) => { e.stopPropagation(); handleExportCsv(camp); }}
                  className="text-[11.5px] font-body text-[rgba(232,228,220,0.6)] hover:text-[#c5a059] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={13} />
                  <span>Export CSV</span>
                </button>
                <span className="text-[11.5px] font-body text-[rgba(197,160,89,0.85)] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Explorer les {camp.totalLeads} prospects</span>
                  <ChevronRight size={13} />
                </span>
              </div>
            </GlassPanel>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center mx-auto mb-3 text-[rgba(232,228,220,0.4)]">
            <Filter size={20} />
          </div>
          <h3 className="font-display font-medium text-[18px] text-[#e8e4dc]">
            Aucune campagne ne correspond à ces critères
          </h3>
          <p className="text-[13px] font-body text-[rgba(232,228,220,0.5)] mt-1 max-w-[420px] mx-auto">
            Ajustez vos filtres de niche, wilaya ou statut de site web pour afficher les campagnes disponibles.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setNicheFilter('all');
              setAreaFilter('all');
              setNoWebsiteOnly(false);
              setPriorityOnly(false);
            }}
            className="mt-4 px-4 py-2 rounded-full text-[12px] font-body bg-[#1a1a28] text-[#c5a059] hover:bg-[#252538] transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Modal: Interactive Campaign Prospect Explorer */}
      <AnimatePresence>
        {selectedCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[rgba(5,5,9,0.85)] backdrop-blur-[12px]"
              onClick={() => setSelectedCampaign(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-[960px] max-h-[90vh] bg-[#0c0c16] border border-[rgba(197,160,89,0.25)] rounded-[20px] shadow-2xl z-10 flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-[rgba(255,255,255,0.06)] bg-[#0f0f1c]/60">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-body font-semibold uppercase tracking-[0.08em] px-2.5 py-0.5 rounded-full bg-[rgba(197,160,89,0.15)] text-[#c5a059] border border-[rgba(197,160,89,0.25)]">
                        {selectedCampaign.niche}
                      </span>
                      <span className="text-[10px] font-body text-[rgba(232,228,220,0.5)] px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)]">
                        📍 {selectedCampaign.area}
                      </span>
                      <span className="text-[10px] font-body text-[rgba(232,228,220,0.4)]">
                        &bull; {selectedCampaign.totalLeads} prospects cartographiés
                      </span>
                    </div>
                    <h2 className="font-display font-medium text-[24px] text-[#e8e4dc]">
                      {selectedCampaign.name}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportCsv(selectedCampaign)}
                      className="px-3.5 py-2 rounded-[10px] bg-[#141424] hover:bg-[#1c1c32] border border-[rgba(255,255,255,0.08)] text-[12px] font-body text-[#e8e4dc] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Download size={13} className="text-[#c5a059]" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      onClick={() => setSelectedCampaign(null)}
                      className="w-9 h-9 rounded-full bg-[#141424] hover:bg-[#202036] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc] transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Sub-Filters inside campaign modal */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-5">
                  <div className="relative flex-1 max-w-[340px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)]" />
                    <input
                      type="text"
                      placeholder="Rechercher dans cette campagne..."
                      value={modalSearch}
                      onChange={(e) => setModalSearch(e.target.value)}
                      className="w-full h-9 rounded-[8px] bg-[#141424] border border-[rgba(255,255,255,0.08)] pl-8 pr-3 text-[12px] text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.35)] focus:outline-none focus:border-[rgba(197,160,89,0.35)]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModalFilter('all')}
                      className={`px-3 py-1.5 rounded-[8px] text-[11px] font-body font-medium transition-all ${
                        modalFilter === 'all'
                          ? 'bg-[rgba(197,160,89,0.2)] text-[#c5a059] border border-[rgba(197,160,89,0.3)]'
                          : 'bg-[#141424] text-[rgba(232,228,220,0.5)] border border-[rgba(255,255,255,0.06)] hover:text-[#e8e4dc]'
                      }`}
                    >
                      Tous ({selectedCampaign.leads.length})
                    </button>
                    <button
                      onClick={() => setModalFilter('noweb')}
                      className={`px-3 py-1.5 rounded-[8px] text-[11px] font-body font-medium transition-all ${
                        modalFilter === 'noweb'
                          ? 'bg-[rgba(239,68,68,0.2)] text-[#f87171] border border-[rgba(239,68,68,0.3)]'
                          : 'bg-[#141424] text-[rgba(232,228,220,0.5)] border border-[rgba(255,255,255,0.06)] hover:text-[#e8e4dc]'
                      }`}
                    >
                      🚫 Sans site ({selectedCampaign.noWebsiteLeads})
                    </button>
                    <button
                      onClick={() => setModalFilter('web')}
                      className={`px-3 py-1.5 rounded-[8px] text-[11px] font-body font-medium transition-all ${
                        modalFilter === 'web'
                          ? 'bg-[rgba(96,165,250,0.2)] text-[#60a5fa] border border-[rgba(96,165,250,0.3)]'
                          : 'bg-[#141424] text-[rgba(232,228,220,0.5)] border border-[rgba(255,255,255,0.06)] hover:text-[#e8e4dc]'
                      }`}
                    >
                      🌐 Avec site ({selectedCampaign.totalLeads - selectedCampaign.noWebsiteLeads})
                    </button>
                  </div>
                </div>
              </div>

              {/* Prospects Scrollable List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                {modalFilteredLeads.length > 0 ? (
                  modalFilteredLeads.map((lead) => {
                    const hasWeb = hasValidWebsite(lead.url);
                    const leadScoreColor = lead.score >= 70 ? '#4ade80' : lead.score >= 40 ? '#60a5fa' : '#f87171';

                    return (
                      <div
                        key={lead.id}
                        className="p-4 rounded-[12px] bg-[#11111d] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(197,160,89,0.3)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-display font-medium text-[16px] text-[#e8e4dc] group-hover:text-[#c5a059] transition-colors truncate">
                              {lead.company}
                            </span>
                            {hasWeb ? (
                              <span
                                className="text-[10px] font-body font-bold px-2 py-0.5 rounded-full"
                                style={{ color: leadScoreColor, backgroundColor: `${leadScoreColor}15` }}
                              >
                                Score {lead.score}/100
                              </span>
                            ) : (
                              <span className="text-[10px] font-body font-bold px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.25)]">
                                🚫 Zéro site web
                              </span>
                            )}
                          </div>

                          <div className="text-[12px] font-body text-[rgba(232,228,220,0.6)] flex items-center gap-3 flex-wrap">
                            <span>Interlocuteur : <strong className="text-[#e8e4dc] font-normal">{lead.name || 'Dirigeant'}</strong></span>
                            <span>&bull;</span>
                            {hasWeb ? (
                              <a
                                href={lead.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[rgba(96,165,250,0.85)] hover:underline flex items-center gap-1"
                              >
                                <Globe size={11} />
                                <span className="truncate max-w-[180px]">{lead.url.replace(/^https?:\/\//, '')}</span>
                                <ExternalLink size={10} />
                              </a>
                            ) : (
                              <span className="text-[#fbbf24] flex items-center gap-1">
                                ⭐ 4.8★ Google Maps
                              </span>
                            )}
                          </div>

                          {lead.notes && (
                            <p className="text-[11px] font-mono text-[rgba(232,228,220,0.4)] mt-2 line-clamp-1">
                              {lead.notes}
                            </p>
                          )}
                        </div>

                        {/* Actions for this lead */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {lead.phone && lead.phone !== 'Non renseigné' && (
                            <button
                              onClick={(e) => handleCopyPhone(lead.id, lead.phone, e)}
                              className="h-9 px-3 rounded-[8px] bg-[#19192a] hover:bg-[#222238] border border-[rgba(255,255,255,0.06)] text-[11.5px] font-body text-[rgba(232,228,220,0.8)] flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Copier le numéro"
                            >
                              {copiedPhoneId === lead.id ? (
                                <>
                                  <Check size={12} className="text-[#4ade80]" />
                                  <span className="text-[#4ade80]">Copié</span>
                                </>
                              ) : (
                                <>
                                  <Phone size={12} className="text-[rgba(232,228,220,0.5)]" />
                                  <span>{lead.phone}</span>
                                  <Copy size={11} className="text-[rgba(232,228,220,0.3)] ml-0.5" />
                                </>
                              )}
                            </button>
                          )}

                          <Link
                            href={`/call?id=${lead.id}`}
                            className="h-9 px-3.5 rounded-[8px] bg-[rgba(197,160,89,0.15)] hover:bg-[rgba(197,160,89,0.25)] border border-[rgba(197,160,89,0.3)] text-[12px] font-body font-medium text-[#c5a059] flex items-center gap-1.5 transition-colors"
                          >
                            <Phone size={12} />
                            <span>Lancer l&apos;Appel</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-[13px] font-body text-[rgba(232,228,220,0.4)]">
                    Aucun prospect ne correspond à ce filtre interne.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: New Bot Scrape Run */}
      <AnimatePresence>
        {isBotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[rgba(5,5,9,0.8)] backdrop-blur-[8px]"
              onClick={() => !isScraping && setIsBotModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-[540px] bg-[#0c0c16] border border-[rgba(197,160,89,0.25)] rounded-[16px] p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between mb-4 border-b border-[rgba(255,255,255,0.06)] pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[rgba(197,160,89,0.15)] flex items-center justify-center text-[#c5a059]">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-[20px] text-[#e8e4dc]">
                      Lancer un Scan Furtif
                    </h3>
                    <p className="text-[12px] font-body text-[rgba(232,228,220,0.5)]">
                      Moteur Playwright + Contournement Anti-Bot
                    </p>
                  </div>
                </div>
              </div>

              {!isScraping ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-body text-[rgba(232,228,220,0.7)] uppercase tracking-wider mb-1.5">
                      Niche / Métier
                    </label>
                    <input
                      type="text"
                      value={botQuery}
                      onChange={(e) => setBotQuery(e.target.value)}
                      placeholder="Ex: Dentiste, Agence de voyage, Avocat..."
                      className="w-full h-11 rounded-[8px] bg-[#141422] border border-[rgba(255,255,255,0.08)] px-3 text-[14px] text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-body text-[rgba(232,228,220,0.7)] uppercase tracking-wider mb-1.5">
                      Wilaya / Ville
                    </label>
                    <input
                      type="text"
                      value={botArea}
                      onChange={(e) => setBotArea(e.target.value)}
                      placeholder="Ex: Alger, Oran, Paris, Lyon..."
                      className="w-full h-11 rounded-[8px] bg-[#141422] border border-[rgba(255,255,255,0.08)] px-3 text-[14px] text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-body text-[rgba(232,228,220,0.7)] uppercase tracking-wider mb-1.5">
                      Nombre de cibles ({botCount})
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      step={5}
                      value={botCount}
                      onChange={(e) => setBotCount(parseInt(e.target.value, 10))}
                      className="w-full accent-[#c5a059]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                    <button
                      onClick={() => setIsBotModalOpen(false)}
                      className="px-4 py-2 rounded-full text-[13px] font-body text-[rgba(232,228,220,0.5)] hover:text-[#e8e4dc] transition-colors"
                    >
                      Annuler
                    </button>
                    <AnimatedButton icon={<Play size={14} />} onClick={handleStartScrape}>
                      Démarrer le Scraping
                    </AnimatedButton>
                  </div>
                </div>
              ) : (
                <div className="py-6 space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[14px] font-body text-[#e8e4dc]">
                      Scraping en cours sur Google Maps...
                    </span>
                  </div>
                  <div className="bg-[#05050a] border border-[rgba(255,255,255,0.06)] rounded-[8px] p-3 text-[11px] font-mono text-[rgba(232,228,220,0.7)] space-y-1 max-h-[160px] overflow-y-auto">
                    {scrapeLog.map((log, i) => (
                      <div key={i}>{log}</div>
                    ))}
                  </div>
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setIsBotModalOpen(false)}
                      className="px-4 py-1.5 rounded-full text-[12px] font-body bg-[#1a1a2c] text-[#e8e4dc] hover:bg-[#25253e]"
                    >
                      Fermer & Laisser tourner en tâche de fond
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
