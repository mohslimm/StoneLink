"use client";
import { useUIStore } from '@/hooks/useUIStore';
import { GlassPanel } from './GlassPanel';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-[380px]">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <GlassPanel variant="elevated" className="p-4 flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                {toast.type === 'success' && <CheckCircle size={18} className="text-[#4ade80]" />}
                {toast.type === 'error' && <AlertCircle size={18} className="text-[#f87171]" />}
                {toast.type === 'info' && <Info size={18} className="text-[#60a5fa]" />}
              </div>
              <p className="text-[13px] font-body text-[#e8e4dc] flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-[rgba(232,228,220,0.55)] hover:text-[#e8e4dc] transition-colors"
              >
                <X size={14} />
              </button>
            </GlassPanel>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

