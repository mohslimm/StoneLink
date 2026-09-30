import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, ShieldCheck, Sparkles, Quote, Award, UserCheck, Microscope } from 'lucide-react';
import BeforeAfterSlider from '../../components/ui/BeforeAfterSlider';
import ServicesGrid from '../../components/sections/ServicesGrid';
import WhatsAppButton from '../../components/ui/WhatsAppButton';
import Testimonials from '../../components/sections/Testimonials';
import { clinicConfig } from '../../data/config';

const TeamSection = () => (
  <section className="py-24 bg-obsidian relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-20">
        <h4 className="text-gold text-[10px] uppercase font-bold tracking-[0.5em] mb-4">L'Elite Médicale</h4>
        <h2 className="text-4xl md:text-5xl font-heading text-white">Nos <span className="italic text-gradient-gold">Praticiens</span></h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {[
          { 
            name: clinicConfig.owner.name, 
            role: clinicConfig.owner.role, 
            bio: 'Expert en implantologie and esthétique dentaire avec plus de 15 ans d\'expérience.',
            spec: ['Implantologie', 'Facettes Zircone'],
            img: clinicConfig.owner.img
          },
          { 
            name: 'Dr. Nadia Ben', 
            role: 'Spécialiste Orthodontie', 
            bio: 'Dédiée à la correction de l\'alignement dentaire pour des sourires parfaits.',
            spec: ['Invisalign', 'Orthodontie Enfant'],
            img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400'
          }
        ].map((doc, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
            className="group relative"
          >
             <div className="flex flex-col md:flex-row gap-8 items-center bg-obsidian-soft p-8 border border-gold/5 group-hover:border-gold/20 transition-all duration-500">
                <div className="w-40 h-40 shrink-0 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 rounded-sm">
                   <img src={doc.img} alt={doc.name} className="w-full h-full object-cover" />
                </div>
                <div>
                   <h3 className="text-xl font-heading text-white mb-1">{doc.name}</h3>
                   <p className="text-gold text-[10px] uppercase font-bold tracking-widest mb-4">{doc.role}</p>
                   <p className="text-gray-500 text-xs font-light leading-relaxed mb-6">{doc.bio}</p>
                   <div className="flex flex-wrap gap-2">
                      {doc.spec.map(s => <span key={s} className="text-[8px] bg-white/5 text-gray-400 px-2 py-1 rounded-sm uppercase tracking-widest">{s}</span>)}
                   </div>
                </div>
             </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Home = () => {
  return (
    <div className="bg-obsidian">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 scale-105"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian/40 to-obsidian"></div>
        
        <div className="absolute inset-0 pointer-events-none">
           {[...Array(6)].map((_, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0 }}
               animate={{ 
                 opacity: [0.1, 0.3, 0.1], 
                 y: [0, -100, 0],
                 x: [0, Math.random() * 50, 0]
               }}
               transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
               className="absolute w-1 h-1 bg-gold rounded-full"
               style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
             />
           ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center gap-3 mb-8">
               <span className="w-12 h-[1px] bg-gold"></span>
               <h2 className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.5em]">L'Art du Sourire de Luxe</h2>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-medium text-white mb-8 leading-[1.1] tracking-tight">
              L'Excellence <br />
              <span className="text-gradient-gold italic">Dentaire</span> <br />
              à Alger
            </h1>
            <p className="max-w-xl text-gray-400 text-sm md:text-lg mb-12 font-light tracking-wide leading-relaxed">
              Découvrez la synergie parfaite entre technologie de pointe et esthétique raffinée. Spécialiste des facettes en Zircone et de l'implantologie haut de gamme.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <button className="w-full sm:w-auto bg-gold text-obsidian px-10 py-5 rounded-sm text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-hover transition-all duration-500 shadow-xl flex items-center justify-center gap-3 group">
                Réserver une Consultation
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="hidden lg:block relative"
          >
             <img 
               src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80" 
               className="w-full h-[600px] object-cover rounded-sm grayscale-[0.2] hover:grayscale-0 transition-all duration-700 shadow-2xl border border-gold/10 p-2"
               alt="Clinic"
             />
          </motion.div>
        </div>
      </section>

      {/* Before/After Section */}
      <section className="py-32 bg-obsidian relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h4 className="text-gold text-[10px] uppercase font-bold tracking-[0.5em] mb-6">Transformations Réelles</h4>
            <h2 className="text-4xl md:text-6xl font-heading font-medium text-white mb-8">La Magie de la <span className="italic text-gradient-gold">Zircone</span></h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <BeforeAfterSlider 
              beforeImage="/before2.webp"
              afterImage="/after2.webp"
            />
          </div>
        </div>
      </section>

      <ServicesGrid />
      <TeamSection />
      <Testimonials />

      <section className="py-32 bg-obsidian relative">
         <div className="max-w-4xl mx-auto px-6 text-center border border-gold/20 p-20 rounded-sm bg-gradient-to-b from-gold/5 to-transparent">
            <h2 className="text-4xl font-heading text-white mb-8 leading-tight">Prêt à Transformer votre Sourire ?</h2>
            <button className="bg-gold text-obsidian px-12 py-5 rounded-sm text-xs font-bold uppercase tracking-[0.3em] hover:bg-gold-hover transition-all duration-500 shadow-xl">
               Fixer un rendez-vous
            </button>
         </div>
      </section>

      <WhatsAppButton />
    </div>
  );
};

export default Home;
