import { useEffect } from 'react';
import { useStoneStore } from '@/stores/useStoneStore';

export function useReminderEngine() {
  const { prospects, addTerminalEvent, pushNotification, setProspectReminderAt } = useStoneStore();

  useEffect(() => {
    // Le "moteur" tourne en background : 60s (prod), timeout 10s (dev demo)
    // Ici configuré en interval de 10s pour faciliter les démos
    const interval = setInterval(() => {
      let triggered = false;

      prospects.forEach(prospect => {
        if (prospect.priority === 'hot' && prospect.stage === 'interested') {
          // Vérifier lastContact > 48h
          const lastContact = prospect.lastContactedAt ? new Date(prospect.lastContactedAt).getTime() : 0;
          const now = Date.now();
          const diffHours = (now - lastContact) / (1000 * 60 * 60);

          if (diffHours > 48) {
            // Anti-spam via lastReminderAt
            const lastReminder = prospect.lastReminderAt ? new Date(prospect.lastReminderAt).getTime() : 0;
            const diffReminderHours = (now - lastReminder) / (1000 * 60 * 60);

            if (diffReminderHours > 24) {
              const title = 'Relance Urgente';
              const message = `Le prospect HOT ${prospect.companyName} est bloqué en phase intéressé depuis plus de 48h.`;

              pushNotification({
                title,
                message,
                type: 'warning',
              });

              addTerminalEvent({
                type: 'alert',
                module: 'pipeline',
                message,
                prospectId: prospect.id,
              });

              setProspectReminderAt(prospect.id, new Date());
              triggered = true;
            }
          }
        }
      });

    }, 10000);

    return () => clearInterval(interval);
  }, [prospects, addTerminalEvent, pushNotification, setProspectReminderAt]);
}
