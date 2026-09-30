import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Trash2, Plus, Edit2, Calendar, Settings, Users, Clock, ArrowRight, ShieldCheck, FileText, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clinicConfig } from '../../data/config';

const AdminDashboard = () => {
  const { appointments, services, deleteAppointment } = useData();
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState(null);

  const stats = [
    { label: 'Demandes Totales', value: appointments.length, icon: Calendar, color: 'text-gold' },
    { label: 'Revenu Potentiel', value: `${(appointments.length * 45000).toLocaleString()} DA`, icon: Settings, color: 'text-green-400' },
    { label: 'Taux de Conversion', value: '85%', icon: Users, color: 'text-blue-400' },
  ];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulating advanced AI report generation
    setTimeout(() => {
       setIsGenerating(false);
       setToast({
         message: 'Rapport analytique généré avec succès.',
         type: 'success'
       });
       setTimeout(() => setToast(null), 4000);
    }, 2500);
  };

  const todayAppointments = appointments.slice(0, 3); // Mocking today's tasks

  return (
    <div className="pt-8 md:pt-16 pb-20 px-6 md:px-10 max-w-full min-h-screen relative">
      {/* Premium Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 30, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[100] bg-obsidian-soft border border-gold/30 px-8 py-4 rounded-sm shadow-[0_20px_50px_rgba(212,175,55,0.15)] flex items-center gap-4 backdrop-blur-xl"
          >
             <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center text-gold">
                <ShieldCheck size={18} />
             </div>
             <div>
                <p className="text-white text-[10px] font-bold uppercase tracking-widest">{toast.message}</p>
                <p className="text-gray-500 text-[8px] uppercase tracking-tight mt-0.5">Prêt pour téléchargement PDF</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-heading font-bold text-white uppercase tracking-tight">System <span className="text-gold">Overview</span></h2>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-medium">Gestion de la {clinicConfig.fullName}</p>
        </div>
        <div className="flex gap-4">
          <Link to="/" className="bg-white/5 text-white border border-white/10 px-6 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
            Site Public
          </Link>
          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className={`relative overflow-hidden ${isGenerating ? 'bg-gold/50' : 'bg-gradient-to-r from-gold to-gold-hover'} text-obsidian px-6 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 group shadow-xl`}
          >
            {isGenerating ? (
              <>
                <Sparkles size={12} className="animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <FileText size={12} className="group-hover:translate-y-[-1px] transition-transform" />
                Nouveau Rapport
              </>
            )}
            {isGenerating && (
              <motion.div 
                initial={{ left: '-100%' }}
                animate={{ left: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 bottom-0 w-1/3 bg-white/20 skew-x-12"
              />
            )}
          </button>
        </div>
      </div>
      
      {/* Stats & Agenda Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Main Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-obsidian-soft border border-gold/10 p-8 rounded-sm hover:border-gold/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <stat.icon size={48} className={stat.color} />
              </div>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2 font-bold">{stat.label}</p>
              <h4 className="text-3xl font-heading font-medium text-white">{stat.value}</h4>
            </motion.div>
          ))}
        </div>

        {/* Today's Agenda - Quick Look */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gold/5 border border-gold/10 p-8 rounded-sm"
        >
           <div className="flex justify-between items-center mb-8">
              <h4 className="text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                 <Clock size={14} className="text-gold" /> Agenda du Jour
              </h4>
              <span className="text-gold text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-gold/10 rounded-sm">En Direct</span>
           </div>
           
           <div className="space-y-6">
              {todayAppointments.map((app, i) => (
                 <div key={i} className="flex items-center justify-between p-3 border-b border-gold/5 hover:bg-white/5 transition-colors group">
                    <div>
                       <p className="text-white text-[11px] font-heading">{app.patient}</p>
                       <p className="text-gray-500 text-[9px] uppercase tracking-widest font-light">{app.time}</p>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gold/50 animate-pulse"></div>
                 </div>
              ))}
              <Link to="/admin/appointments" className="block text-center text-gold text-[9px] uppercase tracking-[0.3em] font-bold mt-8 hover:underline">Voir tout le planning</Link>
           </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Appointments Table */}
        <div className="lg:col-span-2 bg-obsidian-soft border border-gold/10 rounded-sm overflow-hidden">
          <div className="p-6 border-b border-gold/10 flex justify-between items-center bg-obsidian-soft">
            <h3 className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">Rendez-vous récents</h3>
            <button className="text-gold text-[10px] font-bold uppercase tracking-widest hover:underline">Gérer tout</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-gold/5">
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Date & Heure</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-300">
                {appointments.map((app) => (
                  <tr key={app.id} className="border-b border-gold/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{app.patient}</td>
                    <td className="px-6 py-4">{app.date} | {app.time}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-gold/10 text-gold rounded-sm text-[9px] uppercase font-bold">{app.service}</span></td>
                    <td className="px-6 py-4">
                       <span className={`w-2 h-2 rounded-full inline-block mr-2 ${app.status === 'Confirmé' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                       {app.status}
                    </td>
                    <td className="px-6 py-4">
                       <button onClick={() => deleteAppointment(app.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                         <Trash2 size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Motivation Chart Widget */}
        <div className="lg:col-span-1 bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 p-10 rounded-sm">
           <h4 className="text-gold text-[10px] font-bold uppercase tracking-widest mb-8">Motivation des Patients</h4>
           <div className="space-y-6">
              {[
                { label: 'Qualité Zircone', val: 65 },
                { label: 'Recommandation', val: 25 },
                { label: 'Galerie Photos', val: 10 }
              ].map(item => (
                <div key={item.label}>
                   <div className="flex justify-between text-[9px] uppercase tracking-widest mb-2 font-bold">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-gold">{item.val}%</span>
                   </div>
                   <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.val}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gold" 
                      />
                   </div>
                </div>
              ))}
           </div>
           <p className="text-gray-600 text-[9px] mt-12 italic border-l border-gold/20 pl-4 uppercase tracking-widest leading-relaxed">
              Algorithme prédictif basé sur 30 formulaires
           </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
