import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PrototypeItem {
  id: string;
  name: string;
  sector: string;
  icon: string;
  prototypeUrl: string;
  flyerUrl?: string;
  description: string;
  defaultMessage: string;
  isBuiltin?: boolean;
  createdAt?: string;
}

export const DEFAULT_PROTOTYPES: PrototypeItem[] = [
  {
    id: 'travel_parfait_voyage',
    name: 'Parfait Voyage (Algérie)',
    sector: 'Agence de voyage',
    icon: '✈️',
    prototypeUrl: 'https://parfait-voyage.vercel.app/',
    flyerUrl: 'https://flyer-parfait-voyage.vercel.app/',
    description: 'Plateforme haute performance conçue pour les agences de voyage et Omra en Algérie. 100% accessible en faible connexion.',
    defaultMessage: `Salam alaykoum,

Ravi de notre échange téléphonique ! Comme promis, voici le prototype de plateforme conçu spécialement pour les agences de voyage en Algérie :
👉 https://parfait-voyage.vercel.app/

Ce qui fait toute la différence : nous avons poussé l'accessibilité à 100 %.

Que votre client soit à Alger ou au fin fond du Sahara, même avec une toute petite connexion, il peut parcourir vos offres et réserver chez vous — sans bug, sans blocage, sans page qui n'en finit pas de charger.

Un client qui abandonne parce que le site rame, c'est une réservation perdue. Avec notre architecture, ce problème disparaît : où qu'il soit, chaque client peut réserver chez vous. C'est ça, la vraie force de ce que nous proposons.

Et en seulement 48 h, toute la plateforme passe à vos couleurs : votre logo, vos offres Omra et été, le numéro officiel de votre agence.

Pour aller plus loin, voici nos 3 formules selon la taille de votre agence :
✈️ One-Page : idéale pour l'Omra et le Sud
✈️ Agence Pro : site complet + tableau de bord de gestion sur smartphone
✈️ Sur-mesure : plateforme complète avec système de réservation en ligne

Tout est détaillé ici, avec des tarifs de lancement réservés à nos premiers clients partenaires :
👉 https://flyer-parfait-voyage.vercel.app/

Jetez-y un œil dès maintenant et dites-moi ce que vous en pensez. Je suis certain que vous verrez tout de suite ce que ça peut changer pour votre agence 🌍`,
    isBuiltin: true,
  },
  {
    id: 'car_rental_prestige',
    name: 'AutoLoc Prestige',
    sector: 'Location de voitures',
    icon: '🚗',
    prototypeUrl: 'https://autoloc-prestige.vercel.app/',
    flyerUrl: 'https://flyer-autoloc.vercel.app/',
    description: 'Système de réservation de véhicules en ligne avec catalogue flotte, tarification par jour et réservation instantanée sur WhatsApp.',
    defaultMessage: `Salam alaykoum,

Ravi de notre échange ! Comme convenu, voici le prototype de plateforme conçu spécialement pour les agences de location de voitures en Algérie :
👉 https://autoloc-prestige.vercel.app/

Pourquoi c'est un game-changer pour votre agence :
🚗 Vos clients découvrent votre flotte complète avec photos HD, options et tarifs transparents.
📲 Réservation directe en 2 clics avec envoi automatique sur votre numéro WhatsApp officiel.
⚡ Site ultra-rapide optimisé pour smartphone : aucune perte de client à cause d'un site qui rame.

En 48h, nous intégrons vos véhicules réels, vos conditions et vos coordonnées officielles.

N'hésitez pas à tester le prototype et dites-moi quand nous pouvons adapter votre flotte 🚀🔑`,
    isBuiltin: true,
  },
  {
    id: 'dental_zekri',
    name: 'Zekri Clinic (Cabinet Dentaire)',
    sector: 'Clinique & Dentaire',
    icon: '🦷',
    prototypeUrl: 'https://zekri-clinic.vercel.app/',
    flyerUrl: 'https://flyer-dentaire.vercel.app/',
    description: 'Vitrine médicale épurée, rassurante et ultra-rapide avec prise de rendez-vous en ligne et présentation des soins spécialisés.',
    defaultMessage: `Salam alaykoum Docteur,

Ravi de notre échange ! Comme convenu, voici le prototype de plateforme conçu spécialement pour les cabinets et cliniques dentaires d'excellence :
👉 https://zekri-clinic.vercel.app/

Une vitrine moderne, rassurante et ultra-rapide permettant à vos patients de découvrir vos actes (implantologie, esthétique, orthodontie) et de solliciter une consultation en toute simplicité.

En 48h, nous adaptons l'ensemble de la charte visuelle, de vos spécialités et de votre équipe médicale.

Je reste à votre entière disposition pour échanger 🦷✨`,
    isBuiltin: true,
  },
  {
    id: 'real_estate_immopro',
    name: 'ImmoPro Algérie',
    sector: 'Immobilier & Promotion',
    icon: '🏢',
    prototypeUrl: 'https://immopro-algerie.vercel.app/',
    flyerUrl: 'https://flyer-immopro.vercel.app/',
    description: 'Portail immobilier moderne avec recherche par wilaya, fiches biens détaillées, visites virtuelles et formulaires de contact direct.',
    defaultMessage: `Salam alaykoum,

Ravi de notre échange ! Comme promis, voici le prototype conçu spécialement pour les agences immobilières et promoteurs en Algérie :
👉 https://immopro-algerie.vercel.app/

Les points forts pour valoriser votre portefeuille :
🏢 Présentation prestigieuse de vos biens (ventes, locations, promotions neuves).
📍 Filtres par wilaya, surface et budget avec fiches détaillées haute résolution.
📲 Prise de contact et demande de visite instantanée directement sur smartphone.

Nous personnalisons l'ensemble de votre catalogue en 48h.

Jetez un œil et dites-moi ce que vous en pensez 🏢✨`,
    isBuiltin: true,
  },
  {
    id: 'restaurant_gourmet',
    name: 'Gourmet Lounge',
    sector: 'Restaurant & Café',
    icon: '🍽️',
    prototypeUrl: 'https://gourmet-lounge.vercel.app/',
    flyerUrl: 'https://flyer-gourmet.vercel.app/',
    description: 'Menu digital interactif avec photos appétissantes, réservation de table et commande directe sans commission.',
    defaultMessage: `Salam alaykoum,

Ravi de notre échange ! Voici le prototype de plateforme conçu pour les restaurants, salons de thé et traiteurs de standing :
👉 https://gourmet-lounge.vercel.app/

Une expérience visuelle gourmande qui met en valeur votre carte, vos spécialités du chef et permet la réservation de table en 3 clics.

Nous intégrons votre menu complet et vos photos sous 48h.

Bonne découverte et à très vite 🍽️✨`,
    isBuiltin: true,
  },
  {
    id: 'ecommerce_express',
    name: 'Boutique Express',
    sector: 'E-Commerce & Retail',
    icon: '🛒',
    prototypeUrl: 'https://boutique-express.vercel.app/',
    flyerUrl: 'https://flyer-boutique.vercel.app/',
    description: 'Boutique en ligne fluide avec paiement à la livraison (COD) par wilaya et validation automatique par WhatsApp.',
    defaultMessage: `Salam alaykoum,

Ravi de notre échange ! Comme promis, voici le prototype de boutique en ligne optimisé pour le marché algérien :
👉 https://boutique-express.vercel.app/

Spécialement pensé pour le e-commerce local :
🛒 Commande express en 1 clic avec sélection de la wilaya et livraison à domicile (COD).
⚡ Chargement instantané même avec des connexions mobiles limitées.
📲 Notification et confirmation automatique des commandes par WhatsApp.

Nous pouvons connecter vos produits réels sous 48h.

À votre disposition pour lancer votre boutique 🚀📦`,
    isBuiltin: true,
  }
];

export interface PrototypesState {
  prototypes: PrototypeItem[];
  selectedPrototypeId: string;
  
  // Actions
  setSelectedPrototypeId: (id: string) => void;
  addPrototype: (item: Omit<PrototypeItem, 'id' | 'isBuiltin' | 'createdAt'>) => PrototypeItem;
  updatePrototype: (id: string, updates: Partial<PrototypeItem>) => void;
  deletePrototype: (id: string) => void;
  resetToDefaults: () => void;
  getActivePrototype: () => PrototypeItem;
  getPrototypeById: (id: string) => PrototypeItem | undefined;
}

export const usePrototypesStore = create<PrototypesState>()(
  persist(
    (set, get) => ({
      prototypes: DEFAULT_PROTOTYPES,
      selectedPrototypeId: 'travel_parfait_voyage',

      setSelectedPrototypeId: (id: string) => {
        set({ selectedPrototypeId: id });
      },

      addPrototype: (item) => {
        const newId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const newItem: PrototypeItem = {
          ...item,
          id: newId,
          isBuiltin: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          prototypes: [newItem, ...state.prototypes],
          selectedPrototypeId: newId,
        }));

        return newItem;
      },

      updatePrototype: (id: string, updates: Partial<PrototypeItem>) => {
        set((state) => ({
          prototypes: state.prototypes.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      deletePrototype: (id: string) => {
        set((state) => {
          const filtered = state.prototypes.filter((p) => p.id !== id);
          const nextSelected = state.selectedPrototypeId === id
            ? (filtered[0]?.id || DEFAULT_PROTOTYPES[0].id)
            : state.selectedPrototypeId;

          return {
            prototypes: filtered.length > 0 ? filtered : DEFAULT_PROTOTYPES,
            selectedPrototypeId: nextSelected,
          };
        });
      },

      resetToDefaults: () => {
        set({
          prototypes: DEFAULT_PROTOTYPES,
          selectedPrototypeId: DEFAULT_PROTOTYPES[0].id,
        });
      },

      getActivePrototype: () => {
        const { prototypes, selectedPrototypeId } = get();
        return prototypes.find((p) => p.id === selectedPrototypeId) || prototypes[0] || DEFAULT_PROTOTYPES[0];
      },

      getPrototypeById: (id: string) => {
        return get().prototypes.find((p) => p.id === id);
      },
    }),
    {
      name: 'stonelink-custom-prototypes-store',
    }
  )
);
