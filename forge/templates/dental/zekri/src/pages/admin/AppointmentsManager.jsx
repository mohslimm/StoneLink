import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Trash2, CheckCircle, Clock, Search, Filter, Calendar, UserCheck, CheckCircle2, X, Phone, FileText, Info, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AppointmentsManager = () => {
  const { appointments, deleteAppointment, updateAppointment } = useData();
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = app.patient.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || app.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Confirmé': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'En attente': return 'bg-gold/10 text-gold border-gold/20 animate-pulse';
      case 'Terminé': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const cycleStatus = (id) => {
    const app = appointments.find(a => a.id === id);
    const statuses = ['En attente', 'Confirmé', 'Terminé'];
    const next = statuses[(statuses.indexOf(app.status) + 1) % statuses.length];
    updateAppointment(id, { ...app, status: next });
  };

  return (
    <div className="pt-8 md:pt-16 pb-20 px-6 md:px-10 max-w-full min-h-screen relative">
      {/* Patient Details Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div 
            onClick={() => setSelectedApp(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md cursor-default text-left"
          >
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               onClick={(e) => e.stopPropagation()}
               className="bg-obsidian-soft border border-gold/20 w-full max-w-2xl rounded-sm shadow-3xl overflow-hidden relative cursor-default"
             >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Sparkles size={120} className="text-gold" />
                </div>
                
                {/* Header */}
                <div className="p-8 border-b border-gold/10 flex justify-between items-start">
                   <div>
                      <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">Dossier Patient</span>
                      <h3 className="text-3xl font-heading text-white">{selectedApp.patient}</h3>
                      <div className={`inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-sm border text-[9px] uppercase font-bold ${getStatusStyle(selectedApp.status)}`}>
                         <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                         {selectedApp.status}
                      </div>
                   </div>
                   <button 
                     onClick={() => setSelectedApp(null)}
                     className="text-gray-500 hover:text-white transition-colors p-2 bg-white/5 rounded-full cursor-pointer z-50"
                   >
                      <X size={20} />
                   </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-10 text-left">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                         <div className="flex flex-col gap-2">
                            <span className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Contact</span>
                            <p className="text-white text-sm flex items-center gap-3">
                               <Phone size={14} className="text-gold" /> {selectedApp.phone || 'Non renseigné'}
                            </p>
                         </div>
                         <div className="flex flex-col gap-2">
                            <span className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Planification</span>
                            <p className="text-white text-sm flex items-center gap-3">
                               <Calendar size={14} className="text-gold" /> {selectedApp.date} | {selectedApp.time}
                            </p>
                         </div>
                      </div>
                      <div className="space-y-8">
                         <div className="flex flex-col gap-2">
                            <span className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Soin Souhaité</span>
                            <p className="text-white text-sm flex items-center gap-3 uppercase tracking-wider font-heading">
                               <Info size={14} className="text-gold" /> {selectedApp.service}
                            </p>
                         </div>
                         <div className="flex flex-col gap-2">
                            <span className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Motivation</span>
                            <p className="text-white text-sm italic font-light">
                               "{selectedApp.motivation || 'Client prospect'}"
                            </p>
                         </div>
                      </div>
                   </div>

                   <div className="mt-12 p-6 bg-obsidian border border-gold/5 rounded-sm">
                      <div className="flex items-center gap-2 mb-4 border-b border-gold/10 pb-3">
                         <FileText size={14} className="text-gold" />
                         <span className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Notes Cliniques & Diagnostic</span>
                      </div>
                      <div className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap font-light">
                         {selectedApp.note || 'Aucune note supplémentaire.'}
                      </div>
                   </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-obsidian flex justify-end gap-4 border-t border-gold/10">
                   <button 
                     onClick={() => {
                        deleteAppointment(selectedApp.id);
                        setSelectedApp(null);
                     }}
                     className="text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/10 px-6 py-2 transition-all rounded-sm cursor-pointer"
                   >
                      Supprimer le Dossier
                   </button>
                   <button 
                     onClick={() => cycleStatus(selectedApp.id)}
                     className="bg-gold text-obsidian px-8 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gold-hover transition-all rounded-sm shadow-lg shadow-gold/10 cursor-pointer"
                   >
                      Mettre à jour le Status
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-heading font-bold text-white uppercase tracking-tight">Gestion des <span className="text-gold">Rendez-vous</span></h2>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-medium">Suivez et validez les demandes de consultation</p>
        </div>
        
        <div className="flex flex-wrap bg-obsidian-soft border border-gold/10 p-1 rounded-sm gap-1">
           {['All', 'Confirmé', 'En attente', 'Terminé'].map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-2 text-[9px] uppercase tracking-widest font-bold transition-all rounded-sm ${
                 filter === f ? 'bg-gold text-obsidian' : 'text-gray-500 hover:text-white hover:bg-white/5'
               }`}
             >
               {f === 'All' ? 'Tous' : f}
             </button>
           ))}
        </div>
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-grow max-w-md w-full">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Rechercher par nom de patient..." 
              className="w-full bg-obsidian-soft border border-gold/10 p-4 pl-12 text-xs text-white outline-none focus:border-gold transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-4 text-gray-500 text-[10px] uppercase tracking-widest font-bold ml-auto">
             <span className="text-gold">{filteredAppointments.length}</span> Dossiers Trouvés
         </div>
      </div>

      <div className="bg-obsidian-soft border border-gold/10 rounded-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-gold/5 bg-white/5">
              <th className="px-6 py-4">Patient & Motivation</th>
              <th className="px-6 py-4">Planning & Service</th>
              <th className="px-6 py-4">Status & Action</th>
              <th className="px-6 py-4 text-right">Supprimer</th>
            </tr>
          </thead>
          <tbody className="text-xs text-gray-300">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((app, i) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={app.id} 
                  onClick={() => setSelectedApp(app)}
                  className="border-b border-gold/5 hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-6 font-medium text-white text-sm">
                    {app.patient}
                    <p className="text-[9px] text-gold/60 uppercase tracking-widest font-light mt-1 flex items-center gap-2">
                       <UserCheck size={10} /> {app.motivation || 'Client Prospect'}
                    </p>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 text-gray-300 text-[11px] font-bold">
                         <Calendar size={12} className="text-gold" /> {app.date} | {app.time}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-light mt-1">
                        Soin: {app.service}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         cycleStatus(app.id);
                       }}
                       title="Cliquer pour changer le status"
                       className={`px-4 py-2 rounded-sm text-[9px] uppercase font-bold border transition-all flex items-center gap-2 ${getStatusStyle(app.status)}`}
                    >
                       <span className={`w-1.5 h-1.5 rounded-full ${app.status === 'Terminé' ? 'bg-green-400' : 'bg-current'}`}></span>
                       {app.status}
                    </button>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAppointment(app.id);
                      }}
                      className="text-gray-700 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-20 text-center text-gray-600 italic text-sm tracking-widest uppercase">
                   Aucun dossier correspondant...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentsManager;
