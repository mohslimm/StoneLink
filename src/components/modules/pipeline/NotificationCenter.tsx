import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/stores/notificationStore';
import { Bell, CheckCircle, AlertTriangle, Info, Flame, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const NotificationCenter = memo(({ isOpen, onClose, onAction }: { isOpen: boolean, onClose: () => void, onAction: (id: string, tab: any) => void }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] bg-black/20"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
            className="fixed top-20 right-6 z-[150] w-96 max-h-[80vh] bg-[#0a0a14] border border-white/10 shadow-2xl rounded-3xl overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-white" />
                <h3 className="font-bold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-[#c5a059] text-black text-[10px] font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button 
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-widest flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Tout lire
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Aucune notification pour le moment.
                </div>
              ) : (
                notifications.map((notif) => {
                  const Icon = notif.type === 'success' ? CheckCircle :
                               notif.type === 'error' ? AlertTriangle :
                               notif.type === 'hot_lead' ? Flame :
                               notif.type === 'warning' ? AlertTriangle : Info;
                               
                  const color = notif.type === 'success' ? 'text-emerald-400' :
                                notif.type === 'error' ? 'text-rose-400' :
                                notif.type === 'hot_lead' ? 'text-orange-400' :
                                notif.type === 'warning' ? 'text-amber-400' : 'text-blue-400';

                  return (
                    <div 
                      key={notif.id}
                      onClick={() => !notif.read && markAsRead(notif.id)}
                      className={cn(
                        "p-4 rounded-2xl transition-colors cursor-pointer group flex gap-3",
                        notif.read ? "hover:bg-white/5 opacity-60" : "bg-white/[0.03] hover:bg-white/[0.06] border border-white/5"
                      )}
                    >
                      <div className={cn("mt-1", color)}><Icon className="w-4 h-4" /></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={cn("text-sm font-bold", notif.read ? "text-slate-300" : "text-white")}>{notif.title}</h4>
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{notif.message}</p>
                        {notif.cta && notif.prospectId && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notif.id);
                              onAction(notif.prospectId!, notif.cta!.actionType);
                              onClose();
                            }}
                            className="mt-3 px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase tracking-widest font-bold rounded-lg transition-colors border border-white/10"
                          >
                            {notif.cta.label}
                          </button>
                        )}
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-[#c5a059] self-center shrink-0 shadow-[0_0_8px_rgba(197,160,89,0.5)]" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

NotificationCenter.displayName = 'NotificationCenter';
