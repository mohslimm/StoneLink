"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Globe, Sparkles, Trash2, Edit2, Check, ExternalLink, 
  RotateCcw, Link2, FileText, Layers, AlertCircle, CheckCircle2, ChevronRight
} from 'lucide-react';
import { usePrototypesStore, type PrototypeItem } from '@/hooks/usePrototypesStore';
import { useUIStore } from '@/hooks/useUIStore';
import { cn } from '@/lib/utils';

interface PrototypesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrototype?: (prototype: PrototypeItem) => void;
}

const PRESET_ICONS = ['✈️', '🚗', '🦷', '🏢', '🍽️', '🛒', '💼', '🏨', '🏋️', '💈', '🎓', '🍕', '🩺', '✨', '📱', '📦'];

export function PrototypesManagerModal({
  isOpen,
  onClose,
  onSelectPrototype,
}: PrototypesManagerModalProps) {
  const { 
    prototypes, 
    selectedPrototypeId, 
    setSelectedPrototypeId, 
    addPrototype, 
    updatePrototype, 
    deletePrototype, 
    resetToDefaults 
  } = usePrototypesStore();
  const { addToast } = useUIStore();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');
  const [icon, setIcon] = useState('🚗');
  const [prototypeUrl, setPrototypeUrl] = useState('');
  const [flyerUrl, setFlyerUrl] = useState('');
  const [description, setDescription] = useState('');
  const [defaultMessage, setDefaultMessage] = useState('');

  const resetForm = () => {
    setName('');
    setSector('');
    setIcon('🚗');
    setPrototypeUrl('');
    setFlyerUrl('');
    setDescription('');
    setDefaultMessage('');
    setIsAddingNew(false);
    setEditingId(null);
  };

  const handleStartEdit = (p: PrototypeItem) => {
    setEditingId(p.id);
    setName(p.name);
    setSector(p.sector);
    setIcon(p.icon);
    setPrototypeUrl(p.prototypeUrl);
    setFlyerUrl(p.flyerUrl || '');
    setDescription(p.description || '');
    setDefaultMessage(p.defaultMessage || '');
    setIsAddingNew(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !prototypeUrl.trim() || !sector.trim()) {
      addToast({ type: 'error', message: 'Veuillez renseigner au moins le nom, le secteur et l\'URL du prototype' });
      return;
    }

    // Auto-prefix URL with https:// if missing
    let cleanProto = prototypeUrl.trim();
    if (!cleanProto.startsWith('http://') && !cleanProto.startsWith('https://')) {
      cleanProto = `https://${cleanProto}`;
    }

    let cleanFlyer = flyerUrl.trim();
    if (cleanFlyer && !cleanFlyer.startsWith('http://') && !cleanFlyer.startsWith('https://')) {
      cleanFlyer = `https://${cleanFlyer}`;
    }

    if (editingId) {
      updatePrototype(editingId, {
        name: name.trim(),
        sector: sector.trim(),
        icon,
        prototypeUrl: cleanProto,
        flyerUrl: cleanFlyer || undefined,
        description: description.trim(),
        defaultMessage: defaultMessage.trim(),
      });
      addToast({ type: 'success', message: `Prototype « ${name} » mis à jour avec succès ✨` });
    } else {
      const added = addPrototype({
        name: name.trim(),
        sector: sector.trim(),
        icon,
        prototypeUrl: cleanProto,
        flyerUrl: cleanFlyer || undefined,
        description: description.trim() || `Prototype sur-mesure pour ${sector}`,
        defaultMessage: defaultMessage.trim() || `Salam alaykoum,\n\nVoici le prototype conçu pour votre activité :\n👉 ${cleanProto}\n\nN'hésitez pas à nous faire vos retours 🚀`,
      });
      addToast({ type: 'success', message: `Nouveau prototype « ${added.name} » ajouté au catalogue ! ✨` });
      if (onSelectPrototype) {
        onSelectPrototype(added);
      }
    }

    resetForm();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le prototype « ${name} » ?`)) {
      deletePrototype(id);
      addToast({ type: 'info', message: `Prototype « ${name} » supprimé` });
    }
  };

  const handleSelect = (p: PrototypeItem) => {
    setSelectedPrototypeId(p.id);
    if (onSelectPrototype) {
      onSelectPrototype(p);
    }
    addToast({ type: 'success', message: `Prototype actif : ${p.icon} ${p.name}` });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-[rgba(6,6,16,0.85)] backdrop-blur-[12px]" 
          onClick={onClose} 
        />

        {/* Modal Window */}
        <motion.div
          className="relative w-full max-w-[940px] max-h-[92vh] bg-[rgba(15,15,30,0.98)] border border-[rgba(197,160,89,0.35)] shadow-[0_24px_70px_rgba(0,0,0,0.85)] rounded-[18px] flex flex-col overflow-hidden backdrop-blur-[28px]"
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[rgba(255,255,255,0.08)] flex items-start justify-between gap-4 bg-[rgba(20,20,40,0.5)]">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono uppercase tracking-[0.1em] bg-[rgba(197,160,89,0.15)] text-[#c5a059] border border-[rgba(197,160,89,0.3)] flex items-center gap-1">
                  <Sparkles size={11} />
                  <span>Catalogue Multi-Niches</span>
                </span>
                <span className="text-[12px] font-body text-[rgba(232,228,220,0.55)]">
                  {prototypes.length} prototype{prototypes.length > 1 ? 's' : ''} configuré{prototypes.length > 1 ? 's' : ''}
                </span>
              </div>
              <h2 className="font-display text-[26px] sm:text-[30px] font-normal text-[#e8e4dc] mt-1 leading-tight">
                Gestion des Prototypes Démo & Niches
              </h2>
              <p className="text-[12.5px] font-body text-[rgba(232,228,220,0.5)] mt-0.5">
                Sélectionnez ou ajoutez de nouveaux prototypes pour vos campagnes WhatsApp et prospections ciblées.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.12)] text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Action Bar */}
          <div className="px-6 py-3 bg-[rgba(10,10,22,0.7)] border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between gap-3 flex-wrap text-[12px] font-body">
            <span className="text-[rgba(232,228,220,0.6)]">
              Cliquez sur un prototype pour l&apos;activer instantanément dans vos messages WhatsApp.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Voulez-vous restaurer les prototypes officiels par défaut ?')) {
                    resetToDefaults();
                    addToast({ type: 'info', message: 'Catalogue réinitialisé aux valeurs d\'origine' });
                  }
                }}
                className="px-2.5 py-1.5 rounded-[7px] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.55)] hover:text-[#e8e4dc] border border-[rgba(255,255,255,0.06)] flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
                title="Rétablir les modèles par défaut"
              >
                <RotateCcw size={12} />
                <span>Réinitialiser</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isAddingNew) {
                    resetForm();
                  } else {
                    resetForm();
                    setIsAddingNew(true);
                  }
                }}
                className="px-3 py-1.5 rounded-[8px] bg-gradient-to-r from-[#B8924A] via-[#c5a059] to-[#D4B57A] text-[#1A1200] font-body font-semibold text-[11.5px] flex items-center gap-1.5 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md"
              >
                <Plus size={13} />
                <span>{isAddingNew ? 'Voir le Catalogue' : 'Ajouter un Prototype'}</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            <AnimatePresence mode="wait">
              {isAddingNew ? (
                /* Add / Edit Form */
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleSave}
                  className="max-w-[640px] mx-auto space-y-4 p-5 rounded-[14px] bg-[#0d0d1a] border border-[rgba(197,160,89,0.3)] shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-3">
                    <h3 className="text-[17px] font-display font-medium text-[#e8e4dc] flex items-center gap-2">
                      <Sparkles size={16} className="text-[#c5a059]" />
                      <span>{editingId ? 'Modifier le Prototype' : 'Nouveau Prototype de Démo'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-[11.5px] text-[rgba(232,228,220,0.5)] hover:text-[#e8e4dc]"
                    >
                      Annuler
                    </button>
                  </div>

                  {/* Icon Selector + Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-[rgba(232,228,220,0.5)] mb-1.5">
                        Icône
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={icon}
                          onChange={(e) => setIcon(e.target.value)}
                          maxLength={3}
                          className="w-full h-10 rounded-[8px] bg-[#141424] border border-[rgba(255,255,255,0.08)] text-center text-[18px] focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>
                      <div className="flex gap-1 overflow-x-auto mt-1.5 py-0.5 scrollbar-none">
                        {PRESET_ICONS.slice(0, 8).map((ic) => (
                          <button
                            key={ic}
                            type="button"
                            onClick={() => setIcon(ic)}
                            className="w-6 h-6 rounded bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(197,160,89,0.2)] text-[12px] flex items-center justify-center shrink-0 cursor-pointer"
                          >
                            {ic}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="sm:col-span-9">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-[rgba(232,228,220,0.5)] mb-1.5">
                        Nom du Prototype *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: AutoLoc Prestige, ImmoPro Algérie..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full h-10 px-3.5 rounded-[8px] bg-[#141424] border border-[rgba(255,255,255,0.08)] text-[13px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>
                  </div>

                  {/* Sector / Niche */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[rgba(232,228,220,0.5)] mb-1.5">
                      Secteur d&apos;activité / Niche *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Location de voitures, Cabinet dentaire, Immobilier, Restaurant..."
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      required
                      className="w-full h-10 px-3.5 rounded-[8px] bg-[#141424] border border-[rgba(255,255,255,0.08)] text-[13px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  {/* Prototype URL & Flyer URL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-[#c5a059] mb-1.5 flex items-center gap-1">
                        <Link2 size={12} />
                        <span>Lien Prototype Démo *</span>
                      </label>
                      <input
                        type="text"
                        placeholder="https://mon-prototype.vercel.app/"
                        value={prototypeUrl}
                        onChange={(e) => setPrototypeUrl(e.target.value)}
                        required
                        className="w-full h-10 px-3 rounded-[8px] bg-[#141424] border border-[rgba(197,160,89,0.3)] text-[12.5px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-[rgba(232,228,220,0.5)] mb-1.5 flex items-center gap-1">
                        <FileText size={12} />
                        <span>Lien Flyer / Tarifs (Optionnel)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="https://flyer-mon-prototype.vercel.app/"
                        value={flyerUrl}
                        onChange={(e) => setFlyerUrl(e.target.value)}
                        className="w-full h-10 px-3 rounded-[8px] bg-[#141424] border border-[rgba(255,255,255,0.08)] text-[12.5px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[rgba(232,228,220,0.5)] mb-1.5">
                      Description du prototype
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Système de réservation de véhicules en ligne avec catalogue flotte..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-[8px] bg-[#141424] border border-[rgba(255,255,255,0.08)] text-[12.5px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  {/* Default Message Pitch */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[rgba(232,228,220,0.5)] mb-1.5">
                      Message WhatsApp type (L&apos;IA s&apos;en inspirera)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Salam alaykoum,\n\nRavi de notre échange ! Voici le prototype conçu pour votre activité..."
                      value={defaultMessage}
                      onChange={(e) => setDefaultMessage(e.target.value)}
                      className="w-full p-3 rounded-[8px] bg-[#141424] border border-[rgba(255,255,255,0.08)] text-[12px] font-body text-[#e8e4dc] leading-relaxed focus:outline-none focus:border-[#c5a059] resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 rounded-[8px] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.6)] text-[12px] transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-[8px] bg-gradient-to-r from-[#B8924A] via-[#c5a059] to-[#D4B57A] text-[#1A1200] font-body font-semibold text-[12.5px] flex items-center gap-1.5 shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
                    >
                      <Check size={14} />
                      <span>{editingId ? 'Mettre à jour' : 'Enregistrer le Prototype'}</span>
                    </button>
                  </div>
                </motion.form>
              ) : (
                /* Prototypes Cards Grid */
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {prototypes.map((p) => {
                    const isSelected = p.id === selectedPrototypeId;
                    return (
                      <div
                        key={p.id}
                        className={cn(
                          "p-4 rounded-[14px] border transition-all flex flex-col justify-between group relative cursor-pointer",
                          isSelected
                            ? "bg-[rgba(197,160,89,0.12)] border-[#c5a059] shadow-[0_8px_24px_rgba(197,160,89,0.15)] ring-1 ring-[#c5a059]"
                            : "bg-[#0d0d1c] border-[rgba(255,255,255,0.06)] hover:border-[rgba(197,160,89,0.3)] hover:bg-[#111124]"
                        )}
                        onClick={() => handleSelect(p)}
                      >
                        {/* Top info */}
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5">
                              <span className="w-10 h-10 rounded-[10px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[20px] shrink-0">
                                {p.icon}
                              </span>
                              <div>
                                <h4 className="text-[15px] font-body font-semibold text-[#e8e4dc] group-hover:text-[#c5a059] transition-colors">
                                  {p.name}
                                </h4>
                                <span className="text-[10.5px] font-body px-2 py-0.2 rounded-full bg-[rgba(197,160,89,0.12)] text-[#c5a059] border border-[rgba(197,160,89,0.25)]">
                                  {p.sector}
                                </span>
                              </div>
                            </div>

                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#c5a059] text-[#060610] font-bold flex items-center gap-1 shrink-0">
                                <CheckCircle2 size={11} />
                                <span>Actif</span>
                              </span>
                            )}
                          </div>

                          <p className="text-[12px] font-body text-[rgba(232,228,220,0.6)] leading-relaxed mt-1 line-clamp-2">
                            {p.description}
                          </p>
                        </div>

                        {/* Links & Action footer */}
                        <div className="mt-3.5 pt-3 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between gap-2 text-[11.5px] font-body" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <a
                              href={p.prototypeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#4ade80] hover:underline flex items-center gap-1 shrink-0 font-medium"
                              title="Tester le lien du prototype"
                            >
                              <span>Démo</span>
                              <ExternalLink size={11} />
                            </a>

                            {p.flyerUrl && (
                              <a
                                href={p.flyerUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc] hover:underline flex items-center gap-1 truncate"
                                title="Voir les tarifs et formules"
                              >
                                <span>Flyer</span>
                                <ExternalLink size={10} />
                              </a>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(p)}
                              className="w-7 h-7 rounded-md bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.1)] text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc] flex items-center justify-center transition-colors cursor-pointer"
                              title="Modifier"
                            >
                              <Edit2 size={12} />
                            </button>

                            {!p.isBuiltin && (
                              <button
                                type="button"
                                onClick={() => handleDelete(p.id, p.name)}
                                className="w-7 h-7 rounded-md bg-[rgba(239,68,68,0.1)] hover:bg-[rgba(239,68,68,0.2)] text-[#f87171] flex items-center justify-center transition-colors cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleSelect(p)}
                              className="px-2.5 py-1 rounded-[6px] bg-[rgba(197,160,89,0.15)] hover:bg-[rgba(197,160,89,0.25)] text-[#c5a059] text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <span>Sélectionner</span>
                              <ChevronRight size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-4 bg-[rgba(20,20,38,0.95)] border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between gap-3">
            <span className="text-[12px] font-body text-[rgba(232,228,220,0.5)]">
              Prototypes sauvegardés localement et compatibles avec l&apos;IA WhatsApp
            </span>
            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-[8px] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#e8e4dc] font-body text-[12.5px] transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
