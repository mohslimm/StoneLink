'use client';

import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle, Target, Lightbulb } from 'lucide-react';
import type { CallScript } from '@/types/pipeline';

interface ScriptStepsProps {
  script: CallScript;
  activeStepIndex: number;
  onStepChange: (index: number) => void;
}

export const ScriptSteps = memo(({ script, activeStepIndex, onStepChange }: ScriptStepsProps) => {
  return (
    <div className="flex flex-col gap-4">
      {script.steps.map((step, index) => {
        const isActive = index === activeStepIndex;
        const isCompleted = index < activeStepIndex;

        return (
          <motion.div
            key={step.id || index}
            className="flex flex-col rounded-2xl border transition-all duration-300"
            style={{
              background: isActive ? 'var(--bg-elevated)' : 'var(--bg-surface)',
              borderColor: isActive ? 'var(--border-active)' : 'var(--border-default)',
              boxShadow: isActive ? '0 0 40px rgba(201,168,76,0.04)' : 'none',
            }}
            initial={false}
            animate={{ opacity: 1 }}
          >
            {/* Header / Trigger */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer select-none"
              onClick={() => onStepChange(index)}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm font-bold transition-colors"
                  style={{
                    background: isCompleted ? 'var(--success)' : isActive ? 'var(--gold-500)' : 'rgba(255,255,255,0.05)',
                    color: isCompleted || isActive ? '#000' : 'var(--text-secondary)',
                  }}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">{step.label || step.title}</h4>
                  <div className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mt-0.5">
                    {step.durationTarget || step.duration}s
                  </div>
                </div>
              </div>
              <div className="text-[var(--text-secondary)]">
                {isActive ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>

            {/* Content (Collapsible) */}
            <AnimatePresence initial={false}>
              {isActive && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 border-t border-[var(--border-default)] mt-2">
                    {/* Goal / Objective */}
                    {step.objective && (
                      <div className="flex items-start gap-2 mb-4 mt-4">
                        <Target className="w-4 h-4 text-[var(--warning)] shrink-0 mt-0.5" />
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-bold">
                          {step.objective}
                        </p>
                      </div>
                    )}

                    {/* Script Content */}
                    <div className="bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-default)] mb-4">
                      <p className="text-sm text-[var(--text-primary)] leading-relaxed font-body">
                        {step.script}
                      </p>
                    </div>

                    {/* Tips */}
                    {(step.tip || step.tips) && (
                      <div className="flex items-start gap-2 bg-[var(--gold-glow)] p-3 rounded-xl border border-[var(--border-gold)]">
                        <Lightbulb className="w-4 h-4 text-[var(--gold-500)] shrink-0 mt-0.5" />
                        <div className="text-xs text-[var(--gold-400)] leading-relaxed">
                          {step.tips ? (
                            <ul className="list-disc pl-4 space-y-1">
                              {step.tips.map((t: string, i: number) => <li key={i}>{t}</li>)}
                            </ul>
                          ) : (
                            step.tip
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action button to proceed */}
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (index < script.steps.length - 1) onStepChange(index + 1);
                        }}
                        className="px-4 py-2 bg-[var(--gold-500)] text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[var(--gold-400)] transition-colors"
                      >
                        {index < script.steps.length - 1 ? 'Suivant' : 'Terminer'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
});

ScriptSteps.displayName = 'ScriptSteps';
