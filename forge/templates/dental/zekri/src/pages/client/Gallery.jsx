import React from 'react';
import { motion } from 'framer-motion';
import BeforeAfterSlider from '../../components/ui/BeforeAfterSlider';

const galleryCases = [
  { id: 1, title: 'Restauration Zircone', type: 'Esthétique', before: '/cases/case1_before.png', after: '/cases/case1_after.png' },
  { id: 2, title: 'Inlay-Core & Couronne', type: 'Prothèse', before: '/cases/case2_before.png', after: '/cases/case2_after.png' },
  { id: 3, title: 'Hollywood Smile', type: 'Total Transformation', before: '/cases/case3_before.png', after: '/cases/case3_after.png' },
];

const Gallery = () => {
  return (
    <div className="bg-obsidian min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-24">
           <h4 className="text-gold text-[10px] uppercase font-bold tracking-[0.5em] mb-6">Galerie des Sourires</h4>
           <h1 className="text-5xl md:text-6xl font-heading text-white leading-tight mb-8">Résultats <span className="italic text-gradient-gold">Concrets</span></h1>
           <p className="text-gray-400 text-sm font-light leading-relaxed">
             Témoignez de la transformation. Chaque cas est unique et traité avec la précision d'une pièce d'orfèvrerie.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
          {galleryCases.map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="mb-6 flex justify-between items-end border-b border-gold/10 pb-4">
                 <div>
                    <h3 className="text-white font-heading text-xl">{item.title}</h3>
                    <p className="text-gold text-[9px] uppercase tracking-widest mt-1 font-bold">{item.type}</p>
                 </div>
                 <span className="text-gray-500 text-[9px] uppercase tracking-widest">Case Study #{item.id}</span>
              </div>
              <BeforeAfterSlider 
                beforeImage={item.before}
                afterImage={item.after}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA section */}
      <section className="mt-32 pt-24 border-t border-gold/5">
        <div className="max-w-4xl mx-auto text-center px-6">
           <h2 className="text-3xl font-heading text-white mb-8">Votre transformation commence ici</h2>
           <button className="bg-gold text-obsidian px-10 py-4 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-gold-hover transition-all">
              Prendre rendez-vous
           </button>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
