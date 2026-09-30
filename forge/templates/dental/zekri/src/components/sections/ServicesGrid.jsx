import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Zap, Smile } from 'lucide-react';

const services = [
  { 
    id: 1, 
    title: 'Facettes & Zircone', 
    desc: 'Restauration esthétique de haute précision pour un sourire éclatant et naturel.',
    ar: 'قشور السيراميك والزركون',
    icon: Sparkles
  },
  { 
    id: 2, 
    title: 'Implants Dentaires', 
    desc: 'L\'excellence chirurgicale pour remplacer vos dents avec une stabilité durable.',
    ar: 'زراعة الأسنان',
    icon: Shield
  },
  { 
    id: 3, 
    title: 'Blanchiment Laser', 
    desc: 'Technologie de pointe pour des résultats immédiats et une blancheur éclatante.',
    ar: 'تبييض الأسنان بالليزر',
    icon: Zap
  },
  { 
    id: 4, 
    title: 'Soins Esthétiques', 
    desc: 'Harmonisation du sourire et corrections morphologiques personnalisées.',
    ar: 'تجميل الأسنان',
    icon: Smile
  }
];

const ServicesGrid = () => {
  return (
    <section className="py-24 bg-obsidian relative overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h4 className="text-gold text-[10px] uppercase font-bold tracking-[0.4em] mb-4">Nos Spécialités</h4>
            <h2 className="text-3xl md:text-5xl font-heading font-medium text-white leading-tight">
              Des Solutions <span className="italic text-gradient-gold">Sur Mesure</span> <br /> pour Votre Excellence
            </h2>
          </div>
          <p className="text-gray-500 text-sm max-w-sm mb-2 font-light">
            Une expertise multidisciplinaire alliant art dentaire et technologies de pointe pour des résultats exceptionnels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group p-8 bg-obsidian-soft border border-gold/10 hover:border-gold/30 transition-all duration-500 rounded-sm relative"
            >
              <div className="w-12 h-12 bg-gold/5 flex items-center justify-center rounded-sm mb-8 group-hover:bg-gold/20 transition-colors">
                <service.icon className="text-gold w-6 h-6" />
              </div>
              
              <h3 className="text-white font-heading text-xl mb-3 tracking-wide">{service.title}</h3>
              <p className="text-gold/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">{service.ar}</p>
              <p className="text-gray-400 text-xs leading-relaxed font-light mb-6">
                {service.desc}
              </p>
              
              <div className="pt-6 border-t border-gold/5 overflow-hidden">
                <button className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white hover:text-gold transition-colors font-bold group/btn">
                  En Savoir Plus
                  <div className="w-4 h-[1px] bg-gold group-hover/btn:w-8 transition-all"></div>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
