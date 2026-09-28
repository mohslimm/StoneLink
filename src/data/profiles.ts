export interface UserCallRecord {
  id: string;
  prospectId: string;
  prospectName: string;
  company: string;
  date: string;
  duration: string;
  outcome: 'rdv' | 'prototype' | 'rappeler' | 'perdu';
  score: number;
  notes: string;
  transcript: Array<{ role: 'agent' | 'prospect'; text: string; timestamp: string }>;
}

export interface UserTextRecord {
  id: string;
  prospectId: string;
  prospectName: string;
  channel: 'sms' | 'email' | 'note';
  content: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'opened' | 'replied';
}

export interface UserProgressRecord {
  id: string;
  prospectId: string;
  prospectName: string;
  company: string;
  previousStage: 'nouveau' | 'contacte' | 'prototype' | 'ferme';
  newStage: 'nouveau' | 'contacte' | 'prototype' | 'ferme' | 'perdu';
  changedAt: string;
  reason: string;
  dealValue: number;
}

export interface UserProfile {
  id: string;
  username: 'slim' | 'lpiks';
  name: string;
  email: string;
  role: 'Senior Agency Director' | 'Lead Outreach Specialist';
  passwordHash: string; // Plain reference: "StoneLink2026!" (Bcrypt Hash: $2a$12$e8Y5M5i9vA/ZqP7o.E...)
  avatar: string;
  stats: {
    totalCalls: number;
    totalTexts: number;
    closedDeals: number;
    totalRevenue: number;
  };
  calls: UserCallRecord[];
  texts: UserTextRecord[];
  progress: UserProgressRecord[];
}

export const USER_PROFILES: Record<'slim' | 'lpiks', UserProfile> = {
  slim: {
    id: 'usr-slim-001',
    username: 'slim',
    name: 'Mohamed Slimani',
    email: 'slim@steppingstones.agency',
    role: 'Senior Agency Director',
    passwordHash: '$2a$12$e8Y5M5i9vA/ZqP7o.E8X5Ou.X5kRzQ1Gk9z0Q5mZ5W5k9z0Q5mZ5W', // Password: "StoneLink2026!"
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    stats: {
      totalCalls: 48,
      totalTexts: 92,
      closedDeals: 12,
      totalRevenue: 42500,
    },
    calls: [
      {
        id: 'call-slim-101',
        prospectId: 'lead-dz-01',
        prospectName: 'Dr. Karim Benali',
        company: 'Clinique Dentaire Al Shifa',
        date: '2026-09-27 14:30',
        duration: '04:45',
        outcome: 'prototype',
        score: 94,
        notes: 'Le praticien était réticent au début sur le coût du site, mais a accepté la démonstration de la maquette personnalisée sans engagement.',
        transcript: [
          { role: 'agent', text: 'Bonjour Dr. Benali, Mohamed Slimani à l\'appareil de Stepping Stones Agency. Je vous appelle car nous avons audité le site de votre clinique.', timestamp: '14:30:05' },
          { role: 'prospect', text: 'Bonjour. Écoutez, nous avons déjà un prestataire web à Alger.', timestamp: '14:30:18' },
          { role: 'agent', text: 'Je comprends parfaitement. Le plus simple est que je vous partage notre maquette interactive sans engagement pour que vous jugiez sur pièce.', timestamp: '14:30:32' },
          { role: 'prospect', text: 'D\'accord, envoyez-moi le lien sur WhatsApp ou par email.', timestamp: '14:30:45' },
        ],
      },
      {
        id: 'call-slim-102',
        prospectId: 'lead-dz-02',
        prospectName: 'Yassine Khelil',
        company: 'Cabinet Juridique Khelil & Associés',
        date: '2026-09-26 11:15',
        duration: '06:20',
        outcome: 'rdv',
        score: 98,
        notes: 'RDV signé pour la refonte complète du portail juridique. Proposition d\'accompagnement à 3 500 € valide.',
        transcript: [
          { role: 'agent', text: 'Maître Khelil, votre score de conversion mobile actuel fait perdre environ 400€/mois en leads qualifiés.', timestamp: '11:15:10' },
          { role: 'prospect', text: 'C\'est très précis. Quand pouvons-nous nous rencontrer pour signer le contrat ?', timestamp: '11:18:22' },
          { role: 'agent', text: 'Demain à 10h via notre espace sécurisé Vault.', timestamp: '11:18:40' },
        ],
      },
    ],
    texts: [
      {
        id: 'txt-slim-201',
        prospectId: 'lead-dz-01',
        prospectName: 'Dr. Karim Benali',
        channel: 'sms',
        content: 'Bonjour Dr. Benali, votre prototype interactif de la Clinique Al Shifa est prêt : https://stonelink.agency/mirror/lead-dz-01. Cordialement, Mohamed.',
        sentAt: '2026-09-27 15:00',
        status: 'opened',
      },
      {
        id: 'txt-slim-202',
        prospectId: 'lead-dz-02',
        prospectName: 'Yassine Khelil',
        channel: 'email',
        content: 'Objet: Proposition de contrat Vault & Maquette interactive - Cabinet Khelil\n\nMaître,\nSuite à notre échange, veuillez trouver ci-joint l\'accès au contrat.',
        sentAt: '2026-09-26 11:30',
        status: 'replied',
      },
    ],
    progress: [
      {
        id: 'prog-slim-301',
        prospectId: 'lead-dz-01',
        prospectName: 'Dr. Karim Benali',
        company: 'Clinique Dentaire Al Shifa',
        previousStage: 'nouveau',
        newStage: 'prototype',
        changedAt: '2026-09-27 14:35',
        reason: 'Prototype interactif généré et envoyé suite à l\'appel de prospection.',
        dealValue: 2800,
      },
      {
        id: 'prog-slim-302',
        prospectId: 'lead-dz-02',
        prospectName: 'Yassine Khelil',
        company: 'Cabinet Juridique Khelil & Associés',
        previousStage: 'prototype',
        newStage: 'ferme',
        changedAt: '2026-09-26 11:20',
        reason: 'Contrat signé dans le Vault Stepping Stones.',
        dealValue: 3500,
      },
    ],
  },
  lpiks: {
    id: 'usr-lpiks-002',
    username: 'lpiks',
    name: 'Abdelhadi Hammaz',
    email: 'abdelhadi@steppingstones.agency',
    role: 'Lead Outreach Specialist',
    passwordHash: '$2a$12$e8Y5M5i9vA/ZqP7o.E8X5Ou.X5kRzQ1Gk9z0Q5mZ5W5k9z0Q5mZ5W', // Password: "StoneLink2026!"
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    stats: {
      totalCalls: 62,
      totalTexts: 110,
      closedDeals: 9,
      totalRevenue: 31000,
    },
    calls: [
      {
        id: 'call-lpiks-101',
        prospectId: 'lead-dz-03',
        prospectName: 'Amine Hamdi',
        company: 'Hôtel Les Zibans Biskra',
        date: '2026-09-27 16:40',
        duration: '03:50',
        outcome: 'prototype',
        score: 88,
        notes: 'Présentation de la maquette de réservation directe sans commission OTA. Intérêt très vivement exprimé par le gérant.',
        transcript: [
          { role: 'agent', text: 'Bonjour M. Hamdi, Abdelhadi de l\'équipe StoneLink. Nous avons analysé le temps de chargement de votre moteur de réservation.', timestamp: '16:40:02' },
          { role: 'prospect', text: 'Oui, Booking nous prend 18% de commission et notre site actuel est très lent.', timestamp: '16:40:25' },
          { role: 'agent', text: 'C\'est exact. Notre système permet de multiplier vos réservations directes par 2. Je vous envoie le prototype.', timestamp: '16:40:50' },
        ],
      },
      {
        id: 'call-lpiks-102',
        prospectId: 'lead-dz-04',
        prospectName: 'Sami Mansouri',
        company: 'TransLogistics Algérie',
        date: '2026-09-25 09:30',
        duration: '05:10',
        outcome: 'rappeler',
        score: 76,
        notes: 'Rappeler vendredi à 14h après la réunion du conseil d\'administration.',
        transcript: [
          { role: 'agent', text: 'Bonjour M. Mansouri, nous souhaitons vous présenter l\'interface de suiveur de flotte.', timestamp: '09:30:10' },
          { role: 'prospect', text: 'Rappelez-moi vendredi après 14h, nous sommes en audit interne.', timestamp: '09:31:00' },
        ],
      },
    ],
    texts: [
      {
        id: 'txt-lpiks-201',
        prospectId: 'lead-dz-03',
        prospectName: 'Amine Hamdi',
        channel: 'email',
        content: 'Objet: Solution de réservation directe sans commission - Hôtel Les Zibans\n\nBonjour M. Hamdi,\nDécouvrez votre prototype personnalisé ici : https://stonelink.agency/mirror/lead-dz-03',
        sentAt: '2026-09-27 16:50',
        status: 'delivered',
      },
      {
        id: 'txt-lpiks-202',
        prospectId: 'lead-dz-04',
        prospectName: 'Sami Mansouri',
        channel: 'sms',
        content: 'Bonjour M. Mansouri, rappel programmé pour vendredi 14h pour l\'audit TransLogistics.',
        sentAt: '2026-09-25 09:35',
        status: 'sent',
      },
    ],
    progress: [
      {
        id: 'prog-lpiks-301',
        prospectId: 'lead-dz-03',
        prospectName: 'Amine Hamdi',
        company: 'Hôtel Les Zibans Biskra',
        previousStage: 'contacte',
        newStage: 'prototype',
        changedAt: '2026-09-27 16:45',
        reason: 'Envoi du prototype de réservation directe autonome.',
        dealValue: 4200,
      },
      {
        id: 'prog-lpiks-302',
        prospectId: 'lead-dz-04',
        prospectName: 'Sami Mansouri',
        company: 'TransLogistics Algérie',
        previousStage: 'nouveau',
        newStage: 'contacte',
        changedAt: '2026-09-25 09:32',
        reason: 'Appel effectué, relance planifiée au vendredi 14h.',
        dealValue: 5000,
      },
    ],
  },
};
