import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    text: "Une expérience incroyable. Le Docteur est un véritable artiste. Mes facettes en zircone ont totalement changé ma confiance en moi.",
    author: "Sarah B.",
    location: "Alger",
    rating: 5
  },
  {
    text: "Clinique de classe mondiale. Je recommande vivement pour les implants. Professionnalisme et propreté irréprochable.",
    author: "Karim L.",
    location: "Alger",
    rating: 5
  },
  {
    text: "L'accueil est chaleureux et les résultats sont au-delà de mes attentes. Le meilleur cabinet dentaire à Alger.",
    author: "Amine K.",
    location: "Blida",
    rating: 5
  }
];

const Testimonials = () => {
  return (
    <section className="py-32 bg-obsidian relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/20 blur-[150px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <h4 className="text-gold text-[10px] uppercase font-bold tracking-[0.5em] mb-4">Témoignages</h4>
            <h2 className="text-4xl md:text-5xl font-heading text-white leading-tight">
              Ce que nos <span className="italic text-gradient-gold">Patients</span> disent de nous
            </h2>
          </div>
          <div className="flex items-center gap-4 border border-gold/10 px-6 py-3 rounded-sm bg-white/5">
             <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-gold fill-gold" />)}
             </div>
             <span className="text-white text-xs font-bold uppercase tracking-widest">4.9/5 sur Google</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-10 bg-obsidian-soft border border-gold/5 hover:border-gold/20 transition-all duration-500 relative group"
            >
              <Quote className="text-gold/10 group-hover:text-gold/20 transition-colors absolute top-8 left-8" size={60} />
              
              <div className="relative z-10">
                <div className="flex gap-1 mb-8">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={12} className="text-gold fill-gold" />)}
                </div>
                
                <p className="text-gray-400 text-sm font-light leading-relaxed mb-10 italic">
                  "{t.text}"
                </p>
                
                <div className="flex items-center gap-4 border-t border-gold/5 pt-8">
                   <div className="w-10 h-10 bg-gold/10 flex items-center justify-center rounded-full text-gold font-heading font-bold uppercase">
                      {t.author[0]}
                   </div>
                   <div>
                      <p className="text-white text-[10px] font-bold uppercase tracking-widest">{t.author}</p>
                      <p className="text-gray-600 text-[9px] uppercase tracking-[0.2em]">{t.location}</p>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
