import { useState, useCallback } from 'react';
import { shadowService } from './shadow.service';
import type { ShadowSignal } from './ShadowModule.types';
import { useStoneStore } from '@/stores/useStoneStore';
import { useNotificationStore } from '@/stores/notificationStore';
import type { Prospect } from '@/types/pipeline';

// Helper de mapping premium pour associer chaque signal à un profil ultra-fidèle (Luxe Silencieux)
const mapSignalToProspect = (signal: ShadowSignal): Omit<Prospect, 'id' | 'createdAt' | 'notes' | 'emails' | 'activities' | 'agentHistory'> => {
  switch (signal.id) {
    case 1:
      return {
        companyName: "Riviera Hotels & Spas",
        contactName: "Jean-Marc Laurent",
        email: "jm.laurent@rivierahotels.com",
        phone: "+33 4 93 12 34 56",
        website: "https://rivierahotels.com",
        city: "Nice",
        country: "FR",
        niche: "travel",
        stage: "new",
        priority: "hot",
        lighthouseScore: 42,
        estimatedDealValue: 28000,
        estimatedLoss: 4500,
        aiScore: 98,
        aiAnalysis: "Signal d'intention d'achat fort détecté sur LinkedIn. Recherche active de partenaire pour refondre la plateforme de réservation globale afin de maximiser les performances de conversion."
      };
    case 2:
      return {
        companyName: "SmileTech Group",
        contactName: "Dr. Antoine Dufour",
        email: "a.dufour@smiletech-group.fr",
        phone: "+33 1 42 88 11 22",
        website: "https://smiletech-group.fr",
        city: "Paris",
        country: "FR",
        niche: "dental",
        stage: "new",
        priority: "hot",
        lighthouseScore: 58,
        estimatedDealValue: 35000,
        estimatedLoss: 6200,
        aiScore: 85,
        aiAnalysis: "Expansion et levée de fonds de Série A de 4.5M€ détectée sur TechCrunch. Opportunité d'implémenter une infrastructure de prise de rendez-vous et d'acquisition patient de pointe pour leur expansion européenne."
      };
    case 3:
      return {
        companyName: "Cabinet Avocats Martel",
        contactName: "Me. Sarah Koné",
        email: "s.kone@martel-associes.fr",
        phone: "+33 1 88 34 22 10",
        website: "https://martel-associes.fr",
        city: "Paris",
        country: "FR",
        niche: "law",
        stage: "new",
        priority: "warm",
        lighthouseScore: 65,
        estimatedDealValue: 18000,
        estimatedLoss: 2500,
        aiScore: 92,
        aiAnalysis: "Nomination de Me. Sarah Koné à la Direction de l'Innovation Digitale au sein du cabinet Martel & Associés. Intérêt pour la digitalisation des processus juridiques et d'accueil client."
      };
    case 4:
      return {
        companyName: "Luxe Conciergerie",
        contactName: "Sébastien Roche",
        email: "s.roche@luxe-conciergerie.com",
        phone: "+33 1 53 11 00 99",
        website: "https://luxe-conciergerie.com",
        city: "Monaco",
        country: "FR",
        niche: "travel",
        stage: "new",
        priority: "hot",
        lighthouseScore: 31,
        estimatedDealValue: 22000,
        estimatedLoss: 8000,
        aiScore: 78,
        aiAnalysis: "Plainte client et lenteur site critique détectée via Web Scan. Site internet lent et non-responsive causant des pertes immédiates de réservations luxe. Opportunité d'interception d'urgence."
      };
    default:
      return {
        companyName: signal.company,
        contactName: "Contact Principal",
        email: `contact@${signal.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        phone: "+33 1 00 00 00 00",
        website: `https://${signal.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        city: "Paris",
        country: "FR",
        niche: signal.type === "intent" ? "travel" : "saas",
        stage: "new",
        priority: "cold",
        lighthouseScore: 50,
        estimatedDealValue: 12000,
        estimatedLoss: 1500,
        aiScore: signal.confidence,
        aiAnalysis: signal.text
      };
  }
};

export const useShadow = () => {
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [isIntercepting, setIsIntercepting] = useState(false);
  const [engagingId, setEngagingId] = useState<number | null>(null);

  const { addProspect, addTerminalEvent } = useStoneStore();
  const { pushNotification: pushToast } = useNotificationStore();

  const handleEngage = useCallback(async (signal: ShadowSignal) => {
    setEngagingId(signal.id);
    try {
      // 1. Déclencher la simulation d'engagement IA (qui dispatche TERMINAL_LOG via eventBus)
      const success = await shadowService.engageWithSignal(signal);
      
      if (success) {
        // 2. Mapper le signal vers un prospect premium ultra-fidèle
        const prospectData = mapSignalToProspect(signal);
        
        // 3. Injecter le prospect de manière persistée dans le CRM
        const newProspect = addProspect(prospectData);
        
        // 4. Ajouter l'événement dans le flux de log du terminal
        addTerminalEvent({
          message: `SHADOW ENGINE : Prospect '${signal.company}' qualifié et injecté avec succès au CRM.`,
          type: 'success',
          module: 'shadow',
          prospectId: newProspect.id
        });
        
        // 5. Déclencher la notification Toast interactive de type hot_lead
        pushToast({
          type: 'hot_lead',
          title: 'Signal Qualifié & Injecté ✓',
          message: `Le prospect '${signal.company}' a été créé dans le Pipeline. Agent IA activé.`,
          prospectId: newProspect.id,
          cta: {
            label: 'Consulter dans le CRM',
            actionType: 'profile'
          },
          autoDismiss: 6000
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'engagement du signal:", error);
    } finally {
      setEngagingId(null);
    }
  }, [addProspect, addTerminalEvent, pushToast]);

  const handleIntercept = useCallback(async (target: string) => {
    setIsIntercepting(true);
    await shadowService.launchInterception(target);
    setTimeout(() => setIsIntercepting(false), 5000); // UI feedback duration
  }, []);

  return {
    activeFilter,
    setActiveFilter,
    isIntercepting,
    engagingId,
    handleEngage,
    handleIntercept
  };
};

