import { 
  ShieldCheck, 
  Zap, 
  Target, 
  Activity, 
  Database, 
  Rocket 
} from 'lucide-react';
import { LaunchPhase } from './LaunchControl.types';

export const PHASES: LaunchPhase[] = [
  {
    id: 'p0',
    number: 'P0',
    title: 'Pre-Launch Lock',
    description: 'Stabilisation du système, gel du code et alimentation de la base de données.',
    icon: ShieldCheck,
    status: 'ready',
    objectives: [
      'Vérification de l\'intégrité des types TS',
      'Gel de l\'architecture (Code Freeze)',
      'Injection du Seed Data stratégique',
      'Purge des logs de développement'
    ],
    kpi: {
      label: 'System Integrity',
      value: '100%',
      trend: 'stable'
    }
  },
  {
    id: 'p1',
    number: 'P1',
    title: 'Soft Launch',
    description: 'Premier contact avec les 25 leads qualifiés via Market Link.',
    icon: Zap,
    status: 'pending',
    objectives: [
      'Déclenchement des scans Market Link',
      'Validation de la détection d\'opportunités',
      'Génération des premiers assets IA',
      'Envoi du premier batch d\'emails'
    ],
    kpi: {
      label: 'Initial Open Rate',
      value: '45%',
      trend: 'up'
    }
  },
  {
    id: 'p2',
    number: 'P2',
    title: 'Mirror Expansion',
    description: 'Activation de l\'effet miroir sur les prospects engagés.',
    icon: Activity,
    status: 'pending',
    objectives: [
      'Déploiement des micro-sites Mirror',
      'Tracking des interactions en temps réel',
      'Affinage des scripts de vente personnalisés',
      'Activation du Shadow Intelligence'
    ],
    kpi: {
      label: 'Engagement Depth',
      value: '8.4m',
      trend: 'up'
    }
  },
  {
    id: 'p3',
    number: 'P3',
    title: 'Traffic Inbound',
    description: 'Accélération du funnel et montée en puissance des interactions.',
    icon: Target,
    status: 'pending',
    objectives: [
      'Automatisation des suivis (Reminders)',
      'Planification des premiers rendez-vous',
      'Validation du Pipeline Value',
      'Analyse des premiers feedbacks Mirror'
    ],
    kpi: {
      label: 'Meeting Conversion',
      value: '12%',
      trend: 'up'
    }
  },
  {
    id: 'p4',
    number: 'P4',
    title: 'Automated Conversion',
    description: 'Optimisation de la conversion et passage à l\'échelle.',
    icon: Database,
    status: 'pending',
    objectives: [
      'A/B Testing des assets IA',
      'Séquençage multi-canal (Email + Call)',
      'Injection de nouveaux leads massifs',
      'Optimisation des taux de clôture'
    ],
    kpi: {
      label: 'Closing Rate',
      value: '18%',
      trend: 'up'
    }
  },
  {
    id: 'p5',
    number: 'P5',
    title: 'Global Deployment',
    description: 'Passage en mode production totale et monitoring permanent.',
    icon: Rocket,
    status: 'pending',
    objectives: [
      'Monitoring H24 des performances',
      'Scaling de l\'infrastructure',
      'Reporting automatisé pour Mohamed',
      'Expansion sur de nouvelles niches'
    ],
    kpi: {
      label: 'MRR Contribution',
      value: '€250k+',
      trend: 'stable'
    }
  }
];
