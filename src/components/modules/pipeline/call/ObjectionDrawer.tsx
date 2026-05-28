'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, MessageSquareReply } from 'lucide-react';
import type { ObjectionHandler } from '@/types/pipeline';

interface ObjectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  objections: ObjectionHandler[];
}

export const ObjectionDrawer = memo(({ isOpen, onClose, objections }: ObjectionDrawerProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[400px] bg-[var(--bg-surface)] border-l border-[var(--border-default)] shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-default)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--danger)]/10 flex items-center justify-center border border-[var(--danger)]/20">
                  <ShieldAlert className="w-5 h-5 text-[var(--danger)]" />
                </div>
                <div>
                  <h2 className="text-lg font-display text-[var(--text-primary)]">Objections</h2>
                  <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest">Réponses suggérées</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {objections?.map((obj, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-default)] hover:border-[var(--border-active)] transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--danger)]/10 text-[var(--danger)]">
                      {obj.label || obj.trigger}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-1">Réponse (Empathie + Pivot)</div>
                      <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                        {obj.response}
                      </p>
                    </div>
                    {obj.pivot && (
                      <div className="p-3 rounded-lg bg-[var(--gold-glow)] border border-[var(--border-gold)]">
                        <div className="text-[10px] uppercase tracking-widest text-[var(--gold-500)] mb-1">Question de relance</div>
                        <p className="text-sm text-[var(--gold-400)] font-bold">{obj.pivot}</p>
                      </div>
                    )}
                  </div>

                  <button className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-xs font-bold text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10">
                    <MessageSquareReply className="w-4 h-4" />
                    Utiliser cet argument
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

ObjectionDrawer.displayName = 'ObjectionDrawer';
