import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clinicConfig } from '../../data/config';

const Services = () => {
  const { services } = useData();

  return (
    <div className="bg-obsidian min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-3xl mb-24">
          <motion.h4 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gold text-[10px] uppercase font-bold tracking-[0.5em] mb-6"
          >
            Nos Traitements
          </motion.h4>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-heading text-white leading-tight mb-8"
          >
            L'Art de la <br /> <span className="text-gradient-gold italic">Perfection</span> Dentaire
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg font-light leading-relaxed"
          >
            Découvrez notre gamme complète de soins dentaires haut de gamme. Chaque traitement est conçu pour allier santé durable et esthétique irréprochable.
          </motion.p>
        </div>

        {/* Services List */}
        <div className="grid grid-cols-1 gap-24">
          {services.map((service, idx) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className={`flex flex-col lg:flex-row gap-16 items-center ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
            >
              {/* Image side */}
              <div className="flex-1 w-full relative">
                <div className="absolute -inset-4 border border-gold/10 -z-10"></div>
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full aspect-[4/3] object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                />
              </div>

              {/* Text side */}
              <div className="flex-1 max-w-xl">
                <p className="text-gold font-bold text-[10px] uppercase tracking-[0.3em] mb-4">{service.category}</p>
                <h2 className="text-4xl font-heading text-white mb-6 leading-tight">{service.title}</h2>
                <p className="text-gold/60 text-xs font-bold uppercase tracking-[0.1em] mb-6">{service.ar}</p>
                <p className="text-gray-400 text-sm font-light leading-relaxed mb-10">
                  {service.desc || "Une approche personnalisée utilisant les meilleurs matériaux mondiaux pour garantir un résultat fonctionnel et esthétique de premier ordre."}
                </p>
                
                <div className="space-y-4 mb-12">
                   {["Technologie 3D", "Matériaux Biocompatibles", "Résultat Naturel"].map((feature) => (
                     <div key={feature} className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-gold" />
                        <span className="text-gray-300 text-xs uppercase tracking-widest">{feature}</span>
                     </div>
                   ))}
                </div>

                <div className="flex items-center gap-8">
                   <Link to="/contact" className="bg-gold text-obsidian px-8 py-4 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-gold-hover transition-all">
                      Réserver ce soin
                   </Link>
                   <span className="text-white font-heading text-lg italic border-b border-gold/30 pb-1">
                      À partir de {service.price}
                   </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trust Section */}
      <section className="mt-32 py-24 bg-obsidian-soft border-y border-gold/5">
         <div className="max-w-4xl mx-auto px-6 text-center">
            <h3 className="text-white text-2xl font-heading mb-8">Engagement Qualité {clinicConfig.name}</h3>
            <p className="text-gray-500 text-sm font-light leading-relaxed italic mb-0">
               "Nous ne nous contentons pas de soigner des dents ; nous sculptons des sourires qui changent des vies."
            </p>
         </div>
      </section>
    </div>
  );
};

export default Services;
