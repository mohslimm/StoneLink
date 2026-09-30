import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Trash2, Plus, Edit2, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const ServicesManager = () => {
  const { services, addService, updateService, deleteService } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ title: '', ar: '', price: '', category: 'Esthétique' });

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData(service);
    } else {
      setEditingService(null);
      setFormData({ title: '', ar: '', price: '', category: 'Esthétique' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingService) {
      updateService(formData);
    } else {
      addService(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="pt-8 md:pt-16 pb-20 px-6 md:px-10 max-w-full min-h-screen">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-white uppercase tracking-tight">Gestion des <span className="text-gold">Services</span></h2>
          <div className="flex gap-4 mt-2">
            <Link to="/admin" className="text-gray-500 text-[10px] uppercase tracking-widest font-medium hover:text-gold transition-colors">← Dashboard</Link>
            <span className="text-gray-700">|</span>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest font-medium">Modifier vos offres</p>
          </div>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-gold text-obsidian px-4 md:px-6 py-3 rounded-sm text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-gold-hover transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Ajouter un Service</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      <div className="bg-obsidian-soft border border-gold/10 rounded-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-gold/5 bg-white/5">
              <th className="px-6 py-4">Service (FR/AR)</th>
              <th className="px-6 py-4">Catégorie</th>
              <th className="px-6 py-4">Prix Public</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-xs text-gray-300">
            {services.map((service) => (
              <tr key={service.id} className="border-b border-gold/5 hover:bg-white/5 transition-colors group">
                <td className="px-6 py-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-medium text-sm tracking-wide">{service.title}</span>
                    <span className="text-gold/60 text-[10px] uppercase tracking-wider font-bold">{service.ar}</span>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] uppercase tracking-widest text-gray-400">
                    {service.category}
                  </span>
                </td>
                <td className="px-6 py-6 font-heading text-white text-sm">{service.price}</td>
                <td className="px-6 py-6 text-right">
                  <div className="flex justify-end gap-4 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(service)} className="text-gold hover:text-white transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteService(service.id)} className="text-red-500 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal - Simulated Portal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-obsidian/90 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-obsidian-soft border border-gold/20 p-8 rounded-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-heading text-white tracking-wide">
                  {editingService ? 'Modifier le Service' : 'Nouveau Service'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Nom Français</label>
                  <input 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="bg-obsidian border border-gold/10 p-3 text-sm text-white focus:border-gold outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Nom Arabe</label>
                  <input 
                    required
                    value={formData.ar}
                    onChange={(e) => setFormData({...formData, ar: e.target.value})}
                    className="bg-obsidian border border-gold/10 p-3 text-sm text-white focus:border-gold outline-none transition-all text-right"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Prix (DZD)</label>
                    <input 
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="bg-obsidian border border-gold/10 p-3 text-sm text-white focus:border-gold outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Catégorie</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="bg-obsidian border border-gold/10 p-3 text-sm text-white focus:border-gold outline-none transition-all"
                    >
                      <option>Esthétique</option>
                      <option>Chirurgie</option>
                      <option>Préventif</option>
                    </select>
                  </div>
                </div>

                <button className="bg-gold text-obsidian py-4 text-xs font-bold uppercase tracking-[0.2em] mt-8 hover:bg-gold-hover transition-all flex items-center justify-center gap-2">
                  <Save size={16} />
                  Sauvegarder les modifications
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServicesManager;
