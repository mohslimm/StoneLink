'use client';

import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, CheckCircle2, Download, FileText, Send, Loader2, 
  Clock, Calendar, ArrowRight, Activity, PenTool 
} from 'lucide-react';

import type { Prospect } from '@/types/pipeline';

const VARIANTS = {
  container: { animate: { transition: { staggerChildren: 0.1 } } },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  }
};

const TIMELINE_STEPS = [
  { id: 'brief', label: 'Brief & Stratégie', status: 'completed' },
  { id: 'design', label: 'Design UX/UI', status: 'completed' },
  { id: 'dev', label: 'Développement', status: 'current' },
  { id: 'tests', label: 'QA & Tests', status: 'upcoming' },
  { id: 'live', label: 'Déploiement', status: 'upcoming' },
];

interface SerializedVaultFile {
  _id?: string;
  id: string;
  name: string;
  type: 'proposal' | 'contract' | 'invoice' | 'audit' | 'other';
  url: string;
  uploadDate: string;
  viewed: boolean;
  viewedAt?: string;
}

interface SerializedVault {
  _id?: string;
  prospectId: string;
  files: SerializedVaultFile[];
  passwordHash?: string;
}

export function VaultClient({ prospect, vault }: { prospect: Prospect; vault: SerializedVault }) {

  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{sender: 'agency' | 'client', text: string, time: string}[]>([
    { sender: 'agency', text: `Bienvenue dans votre espace sécurisé. L'équipe est sur le développement de votre nouvelle infrastructure.`, time: '10:00' }
  ]);
  
  const [signed, setSigned] = useState(false);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    // Determine if already signed via a hypothetical activity log
    if (prospect?.activities?.some(a => a.type === 'note_added' && a.description.includes('Contrat signé'))) {
      setSigned(true);
    }
  }, [prospect]);

  if (!prospect) {
    return (
      <div className="min-h-screen bg-[--bg-void] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#c5a059]" />
      </div>
    );
  }

  const handleSign = async () => {
    setSigning(true);
    try {
      await fetch('/api/tracking/vault/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectId: prospect.id })
      });
      setSigned(true);
      alert("Le certificat de signature PDF a été généré et envoyé par email.");
    } catch (e) {
      console.error(e);
    } finally {
      setSigning(false);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setChat([...chat, { sender: 'client', text: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setMessage('');
    setTimeout(() => {
      setChat(prev => [...prev, { sender: 'agency', text: 'Message bien reçu. Notre équipe technique va regarder cela.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 2000);
  };

  const oldLighthouse = prospect.lighthouseScore || 45;
  const newLighthouse = 98;
  const estimatedGain = (prospect.estimatedLoss || 15000) * 1.5; // projected +50%

  return (
    <div className="min-h-screen bg-[#060610] text-[#f0ede8] font-sans overflow-x-hidden selection:bg-[#c5a059] selection:text-black">
      {/* Navbar */}
      <nav className="h-20 border-b border-white/5 bg-[#060610]/80 backdrop-blur-md flex items-center px-8 justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#8c733f] flex items-center justify-center font-serif font-bold text-black text-xl">
            S
          </div>
          <span className="font-serif text-xl tracking-wider font-bold">STONELINK VAULT</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <Lock className="w-4 h-4" /> Espace Sécurisé — {prospect.companyName}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <motion.div variants={VARIANTS.container} initial="initial" animate="animate" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COL: Dashboard & Timeline */}
          <div className="lg:col-span-2 space-y-8">
            
            <motion.div variants={VARIANTS.item} className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
              <h1 className="text-3xl font-serif mb-2">Bienvenue, {prospect.contactName}</h1>
              <p className="text-white/40 mb-8">Suivez l'avancement de votre projet et accédez à vos livrables exclusifs.</p>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#c5a059] font-bold uppercase tracking-widest">Progression Globale</span>
                  <span className="text-white font-mono">60%</span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '60%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-[#c5a059] to-[#e8c77a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4 relative">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/5 -z-10" />
                {TIMELINE_STEPS.map((step, idx) => (
                  <div key={step.id} className="text-center">
                    <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-3 text-xs
                      ${step.status === 'completed' ? 'bg-[#c5a059] text-black shadow-[0_0_15px_rgba(197,160,89,0.4)]' : 
                        step.status === 'current' ? 'bg-black border-2 border-[#c5a059] text-[#c5a059]' : 
                        'bg-black border border-white/10 text-white/30'}
                    `}>
                      {step.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div className={`text-[10px] uppercase tracking-widest font-bold ${step.status === 'upcoming' ? 'text-white/30' : 'text-white/80'}`}>
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ROI AVANT / APRÈS */}
            <motion.div variants={VARIANTS.item} className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
              <h2 className="text-xl font-serif mb-6 flex items-center gap-2"><Activity className="text-[#c5a059]" /> Impact Projeté (ROI)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Score */}
                <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest mb-4">Performance Technique</div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-sm text-red-400 line-through decoration-red-500/50 mb-1">Avant: {oldLighthouse}/100</div>
                      <div className="text-4xl font-serif text-[#22c55e]">98<span className="text-xl text-[#22c55e]/50">/100</span></div>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-[#22c55e] flex items-center justify-center text-[#22c55e] font-bold">
                      A+
                    </div>
                  </div>
                </div>

                {/* Revenus */}
                <div className="bg-gradient-to-br from-[#c5a059]/10 to-transparent rounded-2xl p-6 border border-[#c5a059]/30">
                  <div className="text-[10px] text-[#c5a059] uppercase tracking-widest mb-4">Gains Projetés (Mensuel)</div>
                  <div className="text-sm text-white/40 mb-1">Potentiel débloqué</div>
                  <div className="text-4xl font-serif text-white tabular-nums">+{estimatedGain.toLocaleString('fr-FR')} €</div>
                  
                  {/* Fake SVG Graph */}
                  <svg className="w-full h-12 mt-4 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M0,25 Q20,25 30,15 T60,10 T100,5" fill="none" stroke="rgba(197,160,89,0.3)" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M0,30 Q20,30 30,20 T60,5 T100,0" fill="none" stroke="#c5a059" strokeWidth="3" />
                    <circle cx="100" cy="0" r="3" fill="#c5a059" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Fichiers Livrables */}
            <motion.div variants={VARIANTS.item} className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
              <h2 className="text-xl font-serif mb-6">Livrables du Projet</h2>
              <div className="space-y-3">
                {vault?.files && vault.files.length > 0 ? (
                  vault.files.map((file, i) => (
                    <div key={file.id || i} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[#c5a059]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm text-white font-medium">{file.name}</div>
                          <div className="text-xs text-white/40 capitalize">{file.type} • {file.uploadDate ? new Date(file.uploadDate).toLocaleDateString('fr-FR') : 'Date inconnue'}</div>
                        </div>
                      </div>
                      {file.url ? (
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors" title="Télécharger">
                          <Download className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-xs text-[#c5a059] bg-[#c5a059]/10 border border-[#c5a059]/20 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">En cours</span>
                      )}
                    </div>
                  ))
                ) : (
                  [
                    { name: 'Architecture_Design_System.pdf', size: '2.4 MB', type: 'Design', ready: true },
                    { name: 'Wireframes_V1.fig', size: '14 MB', type: 'Design', ready: true },
                    { name: 'Code_Source_Frontend.zip', size: '—', type: 'Dev', ready: false },
                    { name: 'Documentation_API.md', size: '—', type: 'Docs', ready: false }
                  ].map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[#c5a059]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm text-white font-medium">{file.name}</div>
                          <div className="text-xs text-white/40">{file.type} • {file.size}</div>
                        </div>
                      </div>
                      {file.ready ? (
                        <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors" title="Télécharger">
                          <Download className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-[#c5a059] bg-[#c5a059]/10 border border-[#c5a059]/20 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">En cours</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>

          </div>

          {/* RIGHT COL: Signature & Chat */}
          <div className="space-y-8">
            
            {/* Signature Block */}
            <motion.div variants={VARIANTS.item} className="bg-gradient-to-br from-[#14142a] to-black border border-white/10 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059] blur-[80px] opacity-10" />
              <h2 className="text-xl font-serif mb-4 flex items-center gap-2"><PenTool className="text-[#c5a059] w-5 h-5" /> Contrat & Accord</h2>
              
              {!signed ? (
                <>
                  <p className="text-sm text-white/60 mb-6">Le contrat d'infrastructure digitale est prêt pour signature électronique certifiée.</p>
                  <div className="p-4 bg-black/50 border border-white/5 rounded-xl mb-6">
                    <div className="flex justify-between text-xs text-white/40 mb-2"><span>Document</span><span>Taille</span></div>
                    <div className="flex items-center gap-2 text-sm text-white">
                      <FileText className="w-4 h-4 text-[#c5a059]" /> Contrat_Prestation_StoneLink.pdf
                    </div>
                  </div>
                  <button 
                    onClick={handleSign}
                    disabled={signing}
                    className="w-full py-4 rounded-xl font-bold uppercase tracking-wider text-[#1A1200] transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #B8924A, #c5a059)' }}
                  >
                    {signing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Signer le contrat'}
                  </button>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="text-lg font-serif text-white mb-1">Contrat Signé</div>
                  <div className="text-xs text-white/40 mb-6">Certificat cryptographique sécurisé.</div>
                  <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Télécharger le PDF
                  </button>
                </div>
              )}
            </motion.div>

            {/* Messaging */}
            <motion.div variants={VARIANTS.item} className="bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col h-[400px]">
              <div className="p-6 border-b border-white/5">
                <h2 className="text-lg font-serif">Messagerie Projet</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chat.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.sender === 'client' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.sender === 'client' ? 'bg-[#c5a059] text-black rounded-tr-sm' : 'bg-white/5 border border-white/10 text-white rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-white/30 mt-1">{msg.time}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-white/5">
                <form onSubmit={sendMessage} className="relative">
                  <input 
                    type="text" 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Écrivez un message..." 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c5a059]/50 transition-colors"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#c5a059] rounded-lg flex items-center justify-center text-black">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
