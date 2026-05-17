import { memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore, type Notification } from '@/stores/notificationStore';
import { CheckCircle, AlertTriangle, Info, Flame, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const GlobalToasts = memo(({ onAction }: { onAction: (id: string, tab: any) => void }) => {
  const { toasts, dismissToast } = useNotificationStore();

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 w-[380px] max-w-[calc(100vw-48px)] pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard 
            key={toast.id} 
            toast={toast} 
            onDismiss={() => dismissToast(toast.id)} 
            onAction={onAction}
          />
        ))}
      </AnimatePresence>
    </div>
  );
});

GlobalToasts.displayName = 'GlobalToasts';

const ToastCard = ({ toast, onDismiss, onAction }: { toast: Notification, onDismiss: () => void, onAction: (id: string, tab: any) => void }) => {
  useEffect(() => {
    if (toast.autoDismiss) {
      const t = setTimeout(onDismiss, toast.autoDismiss);
      return () => clearTimeout(t);
    }
  }, [toast.autoDismiss, onDismiss]);

  const Icon = toast.type === 'success' ? CheckCircle :
               toast.type === 'error' ? AlertTriangle :
               toast.type === 'hot_lead' ? Flame :
               toast.type === 'warning' ? AlertTriangle : Info;

  const colorClass = toast.type === 'success' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                     toast.type === 'error' ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' :
                     toast.type === 'hot_lead' ? 'text-orange-400 border-orange-500/30 bg-orange-500/10' :
                     toast.type === 'warning' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                     'text-blue-400 border-blue-500/30 bg-blue-500/10';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={cn("pointer-events-auto rounded-2xl p-4 border shadow-xl backdrop-blur-md", colorClass, "bg-[#0a0a14]/90")}
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-xl bg-white/5", colorClass.split(' ')[0])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 pt-1">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-white text-sm">{toast.title}</h4>
            <button onClick={onDismiss} className="text-white/50 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-300 text-xs mt-1 leading-relaxed">{toast.message}</p>
          
          {toast.cta && toast.prospectId && (
            <button
              onClick={() => {
                onAction(toast.prospectId!, toast.cta!.actionType);
                onDismiss();
              }}
              className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] uppercase tracking-widest font-bold rounded-lg transition-colors w-full"
            >
              {toast.cta.label}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
