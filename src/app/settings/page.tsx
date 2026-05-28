"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Sparkles, Phone, Bell, Plug, Users, Pencil, Eye, EyeOff,
  RotateCcw, Database, Calendar, MessageSquare, UserPlus, ChevronRight,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/custom/GlassPanel';
import { AnimatedButton } from '@/components/ui/custom/AnimatedButton';
import { InputField } from '@/components/ui/custom/InputField';
import { ToggleSwitch } from '@/components/ui/custom/ToggleSwitch';
import { useUIStore } from '@/hooks/useUIStore';
import { cn } from '@/lib/utils';

const settingsNav = [
  { id: 'compte', label: 'Compte', icon: User },
  { id: 'ia', label: 'IA & Scripts', icon: Sparkles },
  { id: 'appels', label: 'Appels', icon: Phone },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'equipe', label: 'Equipe', icon: Users },
];

/* ─── Account Panel ─── */
function AccountPanel() {
  return (
    <div className="max-w-[640px]">
      <div className="flex items-start gap-5">
        <div className="w-20 h-20 rounded-full border-2 border-[rgba(255,255,255,0.10)] bg-[#11111a] flex items-center justify-center flex-shrink-0">
          <span className="font-display text-[32px] font-normal text-[#c5a059]">JD</span>
        </div>
        <div className="flex-1">
          <h3 className="font-display text-[32px] font-normal text-[#e8e4dc]">Jean Dupont</h3>
          <p className="text-[18px] font-body text-[rgba(232,228,220,0.55)]">Agent Commercial Senior</p>
        </div>
        <AnimatedButton variant="secondary" icon={<Pencil size={14} />} className="text-[13px] px-3 py-1.5">
          Modifier
        </AnimatedButton>
      </div>

      <div className="mt-8 space-y-4">
        <div>
          <label className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)] mb-2 block">
            Email
          </label>
          <InputField defaultValue="jean.dupont@steppingstones.fr" />
        </div>
        <div>
          <label className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)] mb-2 block">
            Telephone
          </label>
          <InputField defaultValue="+33 6 12 34 56 78" />
        </div>
        <div>
          <label className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)] mb-2 block">
            Langue
          </label>
          <select className="w-full h-11 px-4 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.06)] text-[15px] font-body text-[#e8e4dc] focus:outline-none focus:border-[rgba(197,160,89,0.25)] appearance-none cursor-pointer">
            <option>Francais</option>
            <option>English</option>
          </select>
        </div>
      </div>

      <AnimatedButton variant="primary" className="mt-6">
        Enregistrer les modifications
      </AnimatedButton>
    </div>
  );
}

/* ─── AI & Scripts Panel ─── */
function AIScriptsPanel() {
  const [showKey, setShowKey] = useState(false);
  const [fallbackEnabled, setFallbackEnabled] = useState(true);

  const defaultPrompt = `Vous etes un expert en vente B2B pour Stepping Stones Agency, une agence specialisee dans la creation de sites web premium.

Votre objectif : generer un script de vente telephonique en francais pour un prospect specifique.

FORMAT DE SORTIE (JSON strict) :
{
  "script": [
    { "phase": "ouverture", "contenu": "..." },
    { "phase": "revelation_audit", "contenu": "..." },
    { "phase": "pitch", "contenu": "..." },
    { "phase": "preuve_sociale", "contenu": "..." },
    { "phase": "transition", "contenu": "..." },
    { "phase": "cloture", "contenu": "..." }
  ],
  "objections": [...],
  "closes": [...]
}`;

  return (
    <div className="max-w-[640px] space-y-8">
      {/* API Key */}
      <div>
        <h3 className="text-[18px] font-body font-semibold text-[#e8e4dc]">Cle API Anthropic</h3>
        <p className="text-[13px] font-body text-[rgba(232,228,220,0.55)] mt-1">
          Votre cle d&apos;acces a l&apos;API Claude pour la generation de scripts.
        </p>
        <div className="mt-3 relative">
          <input
            type={showKey ? 'text' : 'password'}
            defaultValue="sk-ant-api03-xxxxxxxxxxxx"
            className="w-full h-11 px-4 pr-12 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.06)] text-[15px] font-body text-[#e8e4dc] focus:outline-none focus:border-[rgba(197,160,89,0.25)]"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.55)] hover:text-[#e8e4dc] transition-colors cursor-pointer"
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <span className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-body font-medium text-[#4ade80]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
          Connecte
        </span>
      </div>

      {/* Prompt Template */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-body font-semibold text-[#e8e4dc]">Template de prompt systeme</h3>
          <button className="inline-flex items-center gap-1.5 text-[13px] font-body text-[rgba(232,228,220,0.55)] hover:text-[#e8e4dc] transition-colors cursor-pointer">
            <RotateCcw size={12} />
            Reinitialiser
          </button>
        </div>
        <p className="text-[13px] font-body text-[rgba(232,228,220,0.55)] mt-1">
          Personnalisez les instructions donnees a l&apos;IA pour la generation de scripts.
        </p>
        <textarea
          defaultValue={defaultPrompt}
          className="w-full mt-3 min-h-[200px] p-4 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.06)] text-[13px] font-mono text-[#e8e4dc] leading-relaxed resize-vertical focus:outline-none focus:border-[rgba(197,160,89,0.25)]"
        />
        <AnimatedButton variant="primary" className="mt-3">
          Sauvegarder le template
        </AnimatedButton>
      </div>

      {/* Fallback */}
      <div>
        <h3 className="text-[18px] font-body font-semibold text-[#e8e4dc]">Script de secours</h3>
        <p className="text-[13px] font-body text-[rgba(232,228,220,0.55)] mt-1">
          Script statique utilise en cas de panne de l&apos;IA.
        </p>
        <div className="flex items-center gap-3 mt-3">
          <ToggleSwitch checked={fallbackEnabled} onChange={setFallbackEnabled} />
          <span className="text-[13px] font-body text-[#e8e4dc]">Activer le fallback automatique</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Calls Panel ─── */
function CallsPanel() {
  const [recordingEnabled, setRecordingEnabled] = useState(true);
  const [autoRecall, setAutoRecall] = useState(false);

  return (
    <div className="max-w-[640px] space-y-8">
      <div>
        <h3 className="text-[18px] font-body font-semibold text-[#e8e4dc]">Configuration VoIP</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)] mb-2 block">
              Twilio SID
            </label>
            <InputField placeholder="AC..." defaultValue="ACxxxxxxxxxxxxxxxx" />
          </div>
          <div>
            <label className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)] mb-2 block">
              Twilio Auth Token
            </label>
            <InputField type="password" defaultValue="xxxxxxxxxxxxxxxx" />
          </div>
          <div>
            <label className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)] mb-2 block">
              Numero d&apos;appel
            </label>
            <InputField placeholder="+33..." defaultValue="+33 1 23 45 67 89" />
          </div>
          <AnimatedButton variant="secondary">
            Tester la connexion
          </AnimatedButton>
        </div>
      </div>

      <div>
        <h3 className="text-[18px] font-body font-semibold text-[#e8e4dc]">Comportement des appels</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)] mb-2 block">
              Duree max d&apos;appel (minutes)
            </label>
            <InputField type="number" defaultValue="30" />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.06)]">
            <div>
              <p className="text-[15px] font-body font-medium text-[#e8e4dc]">Rappel automatique</p>
              <p className="text-[13px] font-body text-[rgba(232,228,220,0.55)]">Creer un rappel pour les prospects "a rappeler"</p>
            </div>
            <ToggleSwitch checked={autoRecall} onChange={setAutoRecall} />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-[15px] font-body font-medium text-[#e8e4dc]">Enregistrement des appels</p>
              <p className="text-[13px] font-body text-[rgba(232,228,220,0.55)]">Sauvegarder les appels pour analyse</p>
            </div>
            <ToggleSwitch checked={recordingEnabled} onChange={setRecordingEnabled} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Notifications Panel ─── */
function NotificationsPanel() {
  const [toggles, setToggles] = useState({
    nouveauLead: true,
    rappelSuivi: true,
    objectifQuotidien: false,
    majPipeline: true,
    erreurVoIP: true,
  });

  const items = [
    { key: 'nouveauLead' as const, label: 'Nouveau lead analyse', desc: 'Recevoir une notification quand une analyse est terminee' },
    { key: 'rappelSuivi' as const, label: 'Rappel de suivi', desc: 'Etre alerte des prospects a rappeler' },
    { key: 'objectifQuotidien' as const, label: 'Objectif quotidien atteint', desc: 'Notification quand vous atteignez votre quota d\'appels' },
    { key: 'majPipeline' as const, label: 'Mise a jour du pipeline', desc: 'Alerte quand un prospect change de statut' },
    { key: 'erreurVoIP' as const, label: 'Erreur de connexion VoIP', desc: 'Notification en cas de probleme de connexion' },
  ];

  return (
    <div className="max-w-[640px]">
      {items.map((item) => (
        <div key={item.key} className="flex items-center justify-between py-4 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <p className="text-[15px] font-body font-medium text-[#e8e4dc]">{item.label}</p>
            <p className="text-[13px] font-body text-[rgba(232,228,220,0.55)]">{item.desc}</p>
          </div>
          <ToggleSwitch
            checked={toggles[item.key]}
            onChange={(v) => setToggles((prev) => ({ ...prev, [item.key]: v }))}
          />
        </div>
      ))}
    </div>
  );
}

/* ─── Integrations Panel ─── */
function IntegrationsPanel() {
  const integrations = [
    { name: 'Twilio', desc: 'VoIP & Appels', icon: Phone, connected: true },
    { name: 'Claude 3.5 Haiku', desc: "Generation de scripts IA", icon: Sparkles, connected: true },
    { name: 'MongoDB Atlas', desc: 'Base de donnees', icon: Database, connected: true },
    { name: 'Google Calendar', desc: 'Planification de rendez-vous', icon: Calendar, connected: false },
    { name: 'Slack', desc: 'Notifications equipe', icon: MessageSquare, connected: false },
  ];

  return (
    <div className="max-w-[640px] space-y-3">
      {integrations.map((int) => {
        const Icon = int.icon;
        return (
          <GlassPanel key={int.name} className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-[10px] bg-[#11111a] flex items-center justify-center flex-shrink-0">
              <Icon size={18} className="text-[#c5a059]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-body font-medium text-[#e8e4dc]">{int.name}</p>
              <p className="text-[13px] font-body text-[rgba(232,228,220,0.55)]">{int.desc}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span
                className={`text-[11px] font-body font-medium px-2.5 py-1 rounded-full ${
                  int.connected
                    ? 'bg-[rgba(74,222,128,0.10)] text-[#4ade80]'
                    : 'bg-[rgba(255,255,255,0.06)] text-[rgba(232,228,220,0.30)]'
                }`}
              >
                {int.connected ? 'Connecte' : 'Non connecte'}
              </span>
              <AnimatedButton variant={int.connected ? 'secondary' : 'primary'} className="text-[13px] px-3 py-1.5">
                {int.connected ? 'Configurer' : 'Connecter'}
              </AnimatedButton>
            </div>
          </GlassPanel>
        );
      })}
    </div>
  );
}

/* ─── Team Panel ─── */
function TeamPanel() {
  const members = [
    { name: 'Jean Dupont', role: 'Agent Commercial Senior', online: true },
    { name: 'Marie Chen', role: 'Agent Commercial', online: true },
    { name: 'Pierre Lefebvre', role: 'Agent Commercial', online: false },
    { name: 'Sophie Bernard', role: 'Manager Commerciale', online: true },
  ];

  return (
    <div className="max-w-[640px]">
      <AnimatedButton variant="primary" icon={<UserPlus size={16} />}>
        Inviter un membre
      </AnimatedButton>

      <div className="mt-6 space-y-3">
        {members.map((member) => (
          <GlassPanel key={member.name} className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#11111a] flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-body font-medium text-[#c5a059]">
                {member.name.split(' ').map((n) => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-body font-medium text-[#e8e4dc]">{member.name}</p>
              <p className="text-[13px] font-body text-[rgba(232,228,220,0.55)]">{member.role}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`w-2 h-2 rounded-full ${member.online ? 'bg-[#4ade80]' : 'bg-[rgba(232,228,220,0.30)]'}`} />
              <span className="text-[11px] font-body text-[rgba(232,228,220,0.55)]">
                {member.online ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
            <button className="text-[rgba(232,228,220,0.55)] hover:text-[#e8e4dc] transition-colors cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}

/* ─── Settings Page ─── */
export default function Settings() {
  const { settingsTab, setSettingsTab } = useUIStore();

  const panelComponents: Record<string, React.ComponentType> = {
    compte: AccountPanel,
    ia: AIScriptsPanel,
    appels: CallsPanel,
    notifications: NotificationsPanel,
    integrations: IntegrationsPanel,
    equipe: TeamPanel,
  };

  const ActivePanel = panelComponents[settingsTab] || AccountPanel;

  return (
    <div className="min-h-[calc(100dvh-56px)]">
      {/* Mobile tabs */}
      <div className="lg:hidden flex overflow-x-auto gap-1 px-4 pt-4 pb-2 border-b border-[rgba(255,255,255,0.06)]">
        {settingsNav.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setSettingsTab(item.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-body font-medium whitespace-nowrap cursor-pointer transition-colors',
                settingsTab === item.id
                  ? 'bg-[rgba(197,160,89,0.15)] text-[#e8e4dc]'
                  : 'text-[rgba(232,228,220,0.55)] hover:text-[#e8e4dc]'
              )}
            >
              <Icon size={14} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] min-h-[calc(100dvh-56px)]">
        {/* Sidebar — desktop */}
        <div className="hidden lg:block border-r border-[rgba(255,255,255,0.06)] py-6">
          {settingsNav.map((item) => {
            const Icon = item.icon;
            const isActive = settingsTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSettingsTab(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-6 py-2.5 text-left cursor-pointer transition-colors duration-200',
                  isActive
                    ? 'border-l-2 border-l-[#c5a059] bg-[rgba(197,160,89,0.15)] text-[#e8e4dc]'
                    : 'border-l-2 border-l-transparent text-[rgba(232,228,220,0.55)] hover:bg-[#11111a] hover:text-[#e8e4dc]'
                )}
              >
                <Icon size={16} />
                <span className={cn('text-[15px] font-body', isActive && 'font-medium')}>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={settingsTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ActivePanel />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

