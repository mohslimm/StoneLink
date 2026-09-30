import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Save, Eye, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BeforeAfterSlider from '../../components/ui/BeforeAfterSlider';

const initialGallery = [
  { 
    id: 1, 
    title: 'Restauration Zircone', 
    category: 'Esthétique', 
    before: 'https://images.unsplash.com/photo-1484659619207-9165d119dafe?auto=format&fit=crop&q=80', 
    after: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80' 
  },
  { 
    id: 2, 
    title: 'Blanchiment Premium', 
    category: 'Blanchiment', 
    before: 'https://images.unsplash.com/photo-1593054992451-24951bdf6992?auto=format&fit=crop&q=80', 
    after: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80' 
  },
];

const GalleryManager = () => {
  const [items, setItems] = useState(initialGallery);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({ 
    title: '', 
    category: 'Esthétique', 
    before: '', 
    after: '' 
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ title: '', category: 'Esthétique', before: '', after: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? { ...formData, id: i.id } : i));
    } else {
      setItems([...items, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="pt-8 md:pt-16 pb-20 px-6 md:px-10 max-w-full min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-white uppercase tracking-tight">Portfolio <span className="text-gold">Transformations</span></h2>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-medium">Gérez vos cas cliniques Avant / Après</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="bg-gold text-obsidian px-8 py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-gold-hover transition-all flex items-center gap-3 shadow-xl"
        >
          <Plus size={16} />
          Nouveau Cas Clinique
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {items.map((item) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-obsidian-soft border border-gold/10 overflow-hidden group rounded-sm shadow-xl"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-obsidian">
               <img 
                 src={item.after} 
                 alt={item.title} 
                 className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 opacity-60"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-obsidian to-transparent"></div>
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <div className="flex gap-2">
                     <button onClick={() => handleOpenModal(item)} className="bg-gold text-obsidian p-3 rounded-full hover:scale-110 transition-transform"><Edit2 size={16} /></button>
                     <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="bg-red-500 text-white p-3 rounded-full hover:scale-110 transition-transform"><Trash2 size={16} /></button>
                  </div>
               </div>
               <div className="absolute bottom-4 left-4">
                  <p className="text-gold text-[9px] uppercase tracking-widest font-bold mb-1">{item.category}</p>
                  <h3 className="text-sm font-heading font-medium tracking-wide text-white">{item.title}</h3>
               </div>
            </div>
            <div className="p-3 flex items-center justify-between text-[8px] uppercase tracking-widest text-gray-500 font-bold bg-white/5 border-t border-gold/5">
                <span>1 Before / 1 After</span>
                <Layout size={12} className="text-gold/50" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Advanced Admin Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto py-10 md:py-20">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-obsidian/98 backdrop-blur-md"
            ></motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-5xl bg-obsidian-soft border border-gold/10 rounded-sm shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col lg:flex-row min-h-[600px]"
            >
              {/* Preview Section - The "Wow" Factor */}
              <div className="w-full lg:w-3/5 bg-obsidian p-6 md:p-12 border-b lg:border-b-0 lg:border-r border-gold/10 flex flex-col">
                 <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-3">
                       <Eye size={18} className="text-gold" />
                       <h3 className="text-xs uppercase tracking-[0.4em] text-white font-bold">Aperçu interactif final</h3>
                    </div>
                    <span className="text-[9px] bg-gold/10 text-gold px-3 py-1 uppercase tracking-widest border border-gold/20">Version Client</span>
                 </div>
                 
                 <div className="flex-grow flex items-center justify-center">
                    {(formData.before && formData.after) ? (
                       <BeforeAfterSlider 
                         beforeImage={formData.before} 
                         afterImage={formData.after} 
                       />
                    ) : (
                       <div className="text-center p-20 border-2 border-dashed border-gold/5 rounded-sm w-full">
                          <ImageIcon size={48} className="text-gray-800 mx-auto mb-4" />
                          <p className="text-gray-700 text-[10px] uppercase tracking-widest font-bold">Veuillez renseigner les URLs <br /> pour générer l'aperçu</p>
                       </div>
                    )}
                 </div>

                 <p className="mt-8 text-center text-gray-500 text-[9px] uppercase tracking-[0.3em] font-medium italic">
                    "Faites glisser le curseur pour tester l'interaction utilisateur"
                 </p>
              </div>

              {/* Setting Section */}
              <div className="w-full lg:w-2/5 p-8 md:p-12 flex flex-col">
                 <div className="flex justify-between items-center mb-10">
                    <h2 className="text-xl font-heading text-white tracking-widest uppercase">Configuration</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
                 </div>

                 <form onSubmit={handleSubmit} className="flex flex-col gap-8 flex-grow">
                    <div className="space-y-6">
                       <div className="flex flex-col gap-2">
                          <label className="text-[9px] uppercase tracking-[0.3em] text-gold font-bold">Titre du Cas</label>
                          <input 
                            required
                            placeholder="Ex: Refonte Esthétique Zircone"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="bg-obsidian border border-gold/10 p-4 text-xs text-white focus:border-gold outline-none transition-all"
                          />
                       </div>

                       <div className="flex flex-col gap-2">
                          <label className="text-[9px] uppercase tracking-[0.3em] text-gold font-bold">URL Image AVANT (Before)</label>
                          <input 
                            required
                            placeholder="Lien HTTPS de l'état initial..."
                            value={formData.before}
                            onChange={(e) => setFormData({...formData, before: e.target.value})}
                            className="bg-obsidian border border-gold/10 p-4 text-xs text-white focus:border-gold outline-none transition-all placeholder:text-gray-800"
                          />
                       </div>

                       <div className="flex flex-col gap-2">
                          <label className="text-[9px] uppercase tracking-[0.3em] text-gold font-bold">URL Image APRÈS (After)</label>
                          <input 
                            required
                            placeholder="Lien HTTPS du résultat final..."
                            value={formData.after}
                            onChange={(e) => setFormData({...formData, after: e.target.value})}
                            className="bg-obsidian border border-gold/10 p-4 text-xs text-white focus:border-gold outline-none transition-all placeholder:text-gray-800"
                          />
                       </div>

                       <div className="flex flex-col gap-2">
                          <label className="text-[9px] uppercase tracking-[0.3em] text-gold font-bold">Catégorie</label>
                          <select 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            className="bg-obsidian border border-gold/10 p-4 text-xs text-white focus:border-gold outline-none transition-all"
                          >
                            <option>Esthétique</option>
                            <option>Chirurgie</option>
                            <option>Blanchiment</option>
                          </select>
                       </div>
                    </div>

                    <button className="bg-gold text-obsidian py-5 text-[10px] font-bold uppercase tracking-[0.4em] mt-auto hover:bg-gold-hover transition-all shadow-xl flex items-center justify-center gap-3">
                       <Save size={14} />
                       Publier les modifications
                    </button>
                 </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryManager;
