import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, Mail, Instagram, Clock, Send, Facebook, Linkedin, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { clinicConfig } from '../../data/config';

const Contact = () => {
  const { t } = useLanguage();
  const { addMessage } = useData();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addMessage(formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="bg-obsidian min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          
          {/* Information Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h4 className="text-gold text-[10px] uppercase font-bold tracking-[0.5em] mb-6">{t('nav_contact')}</h4>
            <h1 className="text-5xl md:text-7xl font-heading text-white leading-tight mb-8">
              {t('contact_info_title').split(' ').slice(0, -1).join(' ')} <br /> 
              {t('contact_info_title').split(' ').slice(-1)} <span className="text-gradient-gold italic">{t('contact_info_clinic')}</span>
            </h1>
            <p className="text-gray-400 text-sm font-light leading-relaxed max-w-lg mb-12">
               {t('contact_info_desc')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-8 mt-16">
               <div className="flex gap-5 items-start">
                  <div className="w-10 h-10 border border-gold/20 flex items-center justify-center rounded-sm text-gold shrink-0">
                     <MapPin size={18} />
                  </div>
                  <div>
                     <h3 className="text-white text-[10px] font-bold uppercase tracking-widest mb-3">{t('contact_label_location')}</h3>
                     <p className="text-gray-400 text-xs font-light leading-relaxed">{t('contact_address')}</p>
                  </div>
               </div>

               <div className="flex gap-5 items-start">
                  <div className="w-10 h-10 border border-gold/20 flex items-center justify-center rounded-sm text-gold shrink-0">
                     <Phone size={18} />
                  </div>
                  <div>
                     <h3 className="text-white text-[10px] font-bold uppercase tracking-widest mb-3">{t('contact_label_phone')}</h3>
                     <p className="text-white text-lg font-heading tracking-wide">020 50 95 76</p>
                     <p className="text-gray-500 text-[9px] uppercase tracking-widest mt-1">Ligne Directe VIP</p>
                  </div>
               </div>

               <div className="flex gap-5 items-start">
                  <div className="w-10 h-10 border border-gold/20 flex items-center justify-center rounded-sm text-gold shrink-0">
                     <Mail size={18} />
                  </div>
                  <div>
                     <h3 className="text-white text-[10px] font-bold uppercase tracking-widest mb-3">{t('contact_label_email')}</h3>
                     <p className="text-gray-400 text-xs font-light">{clinicConfig.email}</p>
                  </div>
               </div>

               <div className="flex gap-5 items-start">
                  <div className="w-10 h-10 border border-gold/20 flex items-center justify-center rounded-sm text-gold shrink-0">
                     <Clock size={18} />
                  </div>
                  <div>
                     <h3 className="text-white text-[10px] font-bold uppercase tracking-widest mb-3">{t('contact_label_hours')}</h3>
                     <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] leading-loose">
                        {t('contact_hours_week')}: <span className="text-white">09h - 18h</span> <br />
                        {t('contact_hours_weekend')}: <span className="text-gold/50">{t('contact_hours_closed')}</span>
                     </p>
                  </div>
               </div>
            </div>

            <div className="mt-20 pt-12 border-t border-gold/10">
               <p className="text-gray-500 text-[9px] uppercase tracking-[0.4em] font-bold mb-8">{t('contact_socials')}</p>
               <div className="flex gap-6">
                  {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                    <a key={i} href="#" className="w-12 h-12 border border-gold/5 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold/30 transition-all duration-700">
                       <Icon size={20} />
                    </a>
                  ))}
               </div>
            </div>
          </motion.div>

          {/* Contact Form Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="p-10 border border-gold/10 bg-obsidian-soft relative overflow-hidden flex flex-col items-center justify-center min-h-[600px]"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
             
             {submitted ? (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="text-center"
               >
                  <div className="w-20 h-20 bg-gold/10 text-gold flex items-center justify-center rounded-full mb-8 mx-auto">
                     <Sparkles size={40} className="animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-heading text-white mb-4 uppercase tracking-widest">Message Envoyé</h2>
                  <p className="text-gray-500 text-xs font-light max-w-xs mx-auto leading-relaxed">
                     Votre message a été transmis directement à la direction. Nous reviendrons vers vous dans les plus brefs délais.
                  </p>
               </motion.div>
             ) : (
               <>
                <h3 className="text-white font-heading text-2xl mb-8 w-full">{t('contact_title')}</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t('contact_name')}</label>
                          <input 
                            required
                            type="text" 
                            placeholder={t('contact_placeholder_name')}
                            className="w-full bg-obsidian/50 border border-gold/10 px-4 py-4 text-white text-sm focus:border-gold/50 outline-none transition-colors rounded-sm"
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t('contact_email')}</label>
                          <input 
                            required
                            type="email" 
                            placeholder={t('contact_placeholder_email')}
                            className="w-full bg-obsidian/50 border border-gold/10 px-4 py-4 text-white text-sm focus:border-gold/50 outline-none transition-colors rounded-sm"
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t('contact_subject')}</label>
                      <input 
                        required
                        type="text" 
                        placeholder={t('contact_placeholder_subject')}
                        className="w-full bg-obsidian/50 border border-gold/10 px-4 py-4 text-white text-sm focus:border-gold/50 outline-none transition-colors rounded-sm"
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t('contact_message')}</label>
                      <textarea 
                        required
                        rows="5"
                        placeholder={t('contact_placeholder_message')}
                        className="w-full bg-obsidian/50 border border-gold/10 px-4 py-4 text-white text-sm focus:border-gold/50 outline-none transition-colors rounded-sm resize-none"
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                      ></textarea>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-gold text-obsidian px-10 py-5 rounded-sm text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-hover transition-all duration-500 shadow-xl flex items-center justify-center gap-3 group"
                    >
                      {t('contact_send')}
                      <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
                    </button>
                </form>
               </>
             )}
          </motion.div>
        </div>

        {/* Full-width Real Map */}
        <div className="mt-32 w-full h-[500px] bg-obsidian-soft border border-gold/10 relative overflow-hidden group">
           <iframe 
             src="https://www.google.com/maps?q=FRWX+HHJ,+Ouled+Yaïch&output=embed"
             className="w-full h-full border-0 grayscale invert contrast-[1.2] opacity-30 group-hover:opacity-60 transition-opacity duration-1000 pointer-events-none"
             allowFullScreen="" 
             loading="lazy"
             referrerPolicy="no-referrer-when-downgrade"
           ></iframe>
           
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                 <div className="w-16 h-16 bg-gold/10 text-gold flex items-center justify-center rounded-full mb-4 mx-auto border border-gold/20 backdrop-blur-sm">
                    <MapPin size={28} className="animate-bounce" />
                 </div>
                 <p className="text-white text-xs uppercase tracking-[0.5em] font-bold">Localiser la Clinique</p>
                 <a 
                   href="https://www.google.com/maps/search/?api=1&query=FRWX%2BHHJ%2C%20Ouled%20Yaïch"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="inline-block mt-6 pointer-events-auto border border-gold/30 text-gold px-8 py-3 text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-gold hover:text-obsidian transition-all backdrop-blur-sm"
                 >
                   Ouvrir Google Maps
                 </a>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
