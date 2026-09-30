import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Trash2, Mail, Search, Info, X, User, MessageSquare, Sparkles, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MessagesManager = () => {
  const { messages, deleteMessage } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMsg, setSelectedMsg] = useState(null);

  const filteredMessages = messages.filter(msg => 
    msg.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    msg.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-8 md:pt-16 pb-20 px-6 md:px-10 max-w-full min-h-screen relative">
      {/* Message Content Modal */}
      <AnimatePresence>
        {selectedMsg && (
          <div 
            onClick={() => setSelectedMsg(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md cursor-default"
          >
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               onClick={(e) => {
                 e.stopPropagation();
               }}
               className="bg-obsidian-soft border border-gold/20 w-full max-w-2xl rounded-sm shadow-3xl overflow-hidden relative cursor-default"
             >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <MessageSquare size={120} className="text-gold" />
                </div>
                
                <div className="p-8 border-b border-gold/10 flex justify-between items-start">
                   <div>
                      <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">Message de Client</span>
                      <h3 className="text-3xl font-heading text-white">{selectedMsg.subject}</h3>
                      <p className="text-gray-500 text-xs mt-2 flex items-center gap-2">
                        <User size={12} className="text-gold" /> {selectedMsg.name}
                      </p>
                   </div>
                   <button 
                     onClick={() => setSelectedMsg(null)}
                     className="text-gray-500 hover:text-white transition-colors p-2 bg-white/5 rounded-full cursor-pointer z-50"
                   >
                      <X size={20} />
                   </button>
                </div>

                <div className="p-6 md:p-10 text-left">
                   <div className="flex flex-col gap-6 mb-12">
                      <div className="flex flex-col gap-2">
                         <span className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Email du Patient</span>
                         <p className="text-white text-sm flex items-center gap-3">
                            <Mail size={14} className="text-gold" /> {selectedMsg.email}
                         </p>
                      </div>
                      <div className="flex flex-col gap-2">
                         <span className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Reçu le</span>
                         <p className="text-white text-[11px] font-light italic">
                           {new Date(selectedMsg.date).toLocaleString()}
                         </p>
                      </div>
                   </div>

                   <div className="p-8 bg-obsidian border border-gold/5 rounded-sm">
                      <div className="flex items-center gap-2 mb-4 border-b border-gold/10 pb-3">
                         <Info size={14} className="text-gold" />
                         <span className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Contenu du Message</span>
                      </div>
                      <div className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap font-light italic">
                         "{selectedMsg.message}"
                      </div>
                   </div>
                </div>

                <div className="p-8 bg-obsidian flex justify-between items-center border-t border-gold/10">
                   <button 
                     onClick={() => {
                        deleteMessage(selectedMsg.id);
                        setSelectedMsg(null);
                     }}
                     className="text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/10 px-6 py-2 transition-all rounded-sm cursor-pointer"
                   >
                      Supprimer definitivement
                   </button>
                   <a 
                     href={`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.subject}`}
                     className="bg-gold text-obsidian px-8 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gold-hover transition-all rounded-sm flex items-center gap-2 cursor-pointer"
                   >
                      <Send size={12} /> Répondre par Email
                   </a>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-white uppercase tracking-tight">Messagerie <span className="text-gold">Admin</span></h2>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-medium">Consultez les demandes générales et de contact</p>
        </div>
        
        <div className="bg-gold/5 border border-gold/10 px-6 py-2 rounded-sm flex items-center gap-4">
           <Sparkles size={14} className="text-gold animate-pulse" />
           <span className="text-white text-[10px] font-bold uppercase tracking-widest">
             {messages.length} Messages non lus
           </span>
        </div>
      </div>

      <div className="mb-8">
         <div className="relative max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Rechercher par nom, sujet ou email..." 
              className="w-full bg-obsidian-soft border border-gold/10 p-4 pl-12 text-xs text-white outline-none focus:border-gold transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="bg-obsidian-soft border border-gold/10 rounded-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-gold/5 bg-white/5">
              <th className="px-6 py-4">Expéditeur</th>
              <th className="px-6 py-4">Sujet du Message</th>
              <th className="px-6 py-4">Date de réception</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-xs text-gray-300">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={msg.id} 
                  onClick={() => setSelectedMsg(msg)}
                  className="border-b border-gold/5 hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                       <span className="text-white font-medium mb-1">{msg.name}</span>
                       <span className="text-gray-500 text-[10px]">{msg.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
                       <span className="text-gray-300 font-light">{msg.subject}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-gray-500 italic">
                    {new Date(msg.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           deleteMessage(msg.id);
                         }}
                         className="text-gray-700 hover:text-red-500 transition-colors p-2"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-20 text-center text-gray-600 italic text-sm tracking-widest uppercase">
                   Aucun message reçu pour le moment...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MessagesManager;
