import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Calendar, Clock, ArrowRight, Sparkles, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';

const Reservation = () => {
  const { services, addAppointment } = useData();
  const { t, lang } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    patient: '',
    phone: '',
    date: '',
    time: '',
    service: services[0]?.title || '',
    motivation: t('res_motivation_1'),
    note: ''
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [showMotivationPicker, setShowMotivationPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedArea, setSelectedArea] = useState(null);
  
  const datePickerRef = useRef(null);
  const timePickerRef = useRef(null);
  const servicePickerRef = useRef(null);
  const motivationPickerRef = useRef(null);

  // Close drops when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) setShowDatePicker(false);
      if (timePickerRef.current && !timePickerRef.current.contains(event.target)) setShowTimePicker(false);
      if (servicePickerRef.current && !servicePickerRef.current.contains(event.target)) setShowServicePicker(false);
      if (motivationPickerRef.current && !motivationPickerRef.current.contains(event.target)) setShowMotivationPicker(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    addAppointment({ ...formData, status: 'En attente' });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const diagnosticZones = [
    { id: 'dent', label: t('res_zone_1'), icon: '🦷' },
    { id: 'douleur', label: t('res_zone_2'), icon: '⚡' },
    { id: 'esthétique', label: t('res_zone_3'), icon: '✨' },
    { id: 'manque', label: t('res_zone_4'), icon: '⚪' }
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const motivations = [
    t('res_motivation_1'),
    t('res_motivation_2'),
    t('res_motivation_3'),
    t('res_motivation_4')
  ];

  // Calendar Helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    
    return days;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', {
       day: 'numeric',
       month: 'long',
       year: 'numeric'
    });
  };

  const changeMonth = (offset) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  return (
    <div className="bg-obsidian min-h-screen pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h4 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gold text-[10px] uppercase font-bold tracking-[0.5em] mb-4"
          >
            {t('res_header')}
          </motion.h4>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-heading text-white mb-8"
          >
            {t('res_title').split(' ').slice(0, -1).join(' ')} <span className="italic text-gradient-gold">{t('res_title').split(' ').slice(-1)}</span>
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-obsidian-soft border border-gold/10 p-8 md:p-16 rounded-sm shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -trandlate-y-1/2 translate-x-1/2"></div>
          
          {submitted ? (
            <div className="h-96 flex flex-col items-center justify-center text-center">
               <div className="w-20 h-20 bg-gold/10 text-gold flex items-center justify-center rounded-full mb-8">
                  <Sparkles size={40} className="animate-pulse" />
               </div>
               <h2 className="text-2xl font-heading text-white mb-4">{t('res_success_title')}</h2>
               <p className="text-gray-400 text-sm font-light max-w-xs">{t('res_success_desc')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-10 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Patient Name */}
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] uppercase tracking-widest text-gold/60 font-bold">{t('res_label_name')}</label>
                  <input 
                    required 
                    type="text" 
                    placeholder={t('res_placeholder_name')}
                    className="bg-obsidian border border-gold/10 p-5 text-white text-sm focus:border-gold outline-none transition-all placeholder:text-gray-800 rounded-sm"
                    onChange={(e) => setFormData({...formData, patient: e.target.value})}
                  />
                </div>
                {/* Phone */}
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] uppercase tracking-widest text-gold/60 font-bold flex items-center gap-2">
                    <Phone size={12} /> {t('res_label_phone')}
                  </label>
                  <input 
                    required 
                    type="tel" 
                    placeholder="+213 --- -- -- --"
                    className="bg-obsidian border border-gold/10 p-5 text-white text-sm focus:border-gold outline-none transition-all placeholder:text-gray-800 rounded-sm"
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Custom Date Picker */}
                <div className="flex flex-col gap-3 relative" ref={datePickerRef}>
                  <label className="text-[10px] uppercase tracking-widest text-gold/60 font-bold flex items-center gap-2">
                    <Calendar size={12} /> {t('res_label_date')}
                  </label>
                  <div 
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="bg-obsidian border border-gold/10 p-5 text-white text-sm cursor-pointer flex justify-between items-center group hover:border-gold/30 transition-all rounded-sm"
                  >
                    <span className={formData.date ? 'text-white' : 'text-gray-700'}>
                      {formData.date ? formatDate(new Date(formData.date)) : 'Sélectionnez une date'}
                    </span>
                    <Calendar size={14} className="text-gold group-hover:scale-110 transition-transform" />
                  </div>

                  <AnimatePresence>
                    {showDatePicker && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-full bg-obsidian-soft border border-gold/20 p-6 z-50 shadow-3xl backdrop-blur-xl"
                      >
                         <div className="flex justify-between items-center mb-6">
                            <button type="button" onClick={() => changeMonth(-1)} className="text-gold p-1 hover:bg-gold/10 rounded-full transition-all"><ChevronLeft size={16}/></button>
                            <span className="text-white font-heading text-sm uppercase tracking-widest">
                               {currentMonth.toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', { month: 'long', year: 'numeric' })}
                            </span>
                            <button type="button" onClick={() => changeMonth(1)} className="text-gold p-1 hover:bg-gold/10 rounded-full transition-all"><ChevronRight size={16}/></button>
                         </div>
                         <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['D','L','M','M','J','V','S'].map(d => <span key={d} className="text-[9px] text-gray-600 font-bold">{d}</span>)}
                         </div>
                         <div className="grid grid-cols-7 gap-1 text-center">
                            {getDaysInMonth(currentMonth).map((day, i) => (
                               <div key={i} className="aspect-square flex items-center justify-center">
                                  {day && (
                                     <button
                                        type="button"
                                        onClick={() => {
                                          setFormData({...formData, date: day.toISOString()});
                                          setShowDatePicker(false);
                                        }}
                                        disabled={day < new Date().setHours(0,0,0,0)}
                                        className={`w-8 h-8 text-[10px] rounded-full transition-all flex items-center justify-center
                                          ${formData.date && new Date(formData.date).toDateString() === day.toDateString() 
                                            ? 'bg-gold text-obsidian font-bold' 
                                            : 'text-gray-400 hover:bg-gold/10 hover:text-gold'}
                                          ${day < new Date().setHours(0,0,0,0) ? 'opacity-10 cursor-not-allowed' : 'cursor-pointer'}`}
                                     >
                                        {day.getDate()}
                                     </button>
                                  )}
                               </div>
                            ))}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Custom Time Picker */}
                <div className="flex flex-col gap-3 relative" ref={timePickerRef}>
                  <label className="text-[10px] uppercase tracking-widest text-gold/60 font-bold flex items-center gap-2">
                    <Clock size={12} /> {t('res_label_time')}
                  </label>
                  <div 
                    onClick={() => setShowTimePicker(!showTimePicker)}
                    className="bg-obsidian border border-gold/10 p-5 text-white text-sm cursor-pointer flex justify-between items-center group hover:border-gold/30 transition-all rounded-sm"
                  >
                    <span className={formData.time ? 'text-white' : 'text-gray-700'}>
                      {formData.time || 'Sélectionnez un créneau'}
                    </span>
                    <Clock size={14} className="text-gold group-hover:scale-110 transition-transform" />
                  </div>

                  <AnimatePresence>
                    {showTimePicker && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-full bg-obsidian-soft border border-gold/20 p-6 z-50 shadow-3xl backdrop-blur-xl"
                      >
                         <div className="grid grid-cols-3 gap-3">
                            {timeSlots.map(time => (
                               <button
                                  key={time}
                                  type="button"
                                  onClick={() => {
                                     setFormData({...formData, time});
                                     setShowTimePicker(false);
                                  }}
                                  className={`py-3 text-[10px] tracking-widest transition-all rounded-sm border
                                    ${formData.time === time 
                                      ? 'bg-gold border-gold text-obsidian font-bold' 
                                      : 'border-gold/10 text-gray-400 hover:border-gold/30 hover:text-white'}`}
                               >
                                  {time}
                               </button>
                            ))}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Custom Treatment Picker */}
                <div className="flex flex-col gap-3 relative" ref={servicePickerRef}>
                  <label className="text-[10px] uppercase tracking-widest text-gold/60 font-bold">{t('res_label_service')}</label>
                  <div 
                    onClick={() => setShowServicePicker(!showServicePicker)}
                    className="bg-obsidian border border-gold/10 p-5 text-white text-sm cursor-pointer flex justify-between items-center group hover:border-gold/30 transition-all rounded-sm"
                  >
                    <span className="text-white">{formData.service}</span>
                    <ArrowRight size={14} className={`text-gold transition-transform duration-300 ${showServicePicker ? 'rotate-90' : 'rotate-0'}`} />
                  </div>
                  <AnimatePresence>
                    {showServicePicker && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-full bg-obsidian-soft border border-gold/20 z-50 shadow-3xl backdrop-blur-xl overflow-hidden"
                      >
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                          {services.map(s => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setFormData({...formData, service: s.title});
                                setShowServicePicker(false);
                              }}
                              className={`w-full text-left p-4 text-xs tracking-widest transition-all border-b border-white/5
                                ${formData.service === s.title ? 'bg-gold text-obsidian font-bold' : 'text-gray-400 hover:bg-gold/10 hover:text-white'}`}
                            >
                              {s.title}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Custom Motivation Picker */}
                <div className="flex flex-col gap-3 relative" ref={motivationPickerRef}>
                  <label className="text-[10px] uppercase tracking-widest text-gold/60 font-bold">{t('res_label_motivation')}</label>
                  <div 
                    onClick={() => setShowMotivationPicker(!showMotivationPicker)}
                    className="bg-obsidian border border-gold/10 p-5 text-white text-sm cursor-pointer flex justify-between items-center group hover:border-gold/30 transition-all rounded-sm"
                  >
                    <span className="text-white">{formData.motivation}</span>
                    <ArrowRight size={14} className={`text-gold transition-transform duration-300 ${showMotivationPicker ? 'rotate-90' : 'rotate-0'}`} />
                  </div>
                  <AnimatePresence>
                    {showMotivationPicker && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-full bg-obsidian-soft border border-gold/20 z-50 shadow-3xl backdrop-blur-xl overflow-hidden"
                      >
                         {motivations.map(m => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => {
                                setFormData({...formData, motivation: m});
                                setShowMotivationPicker(false);
                              }}
                              className={`w-full text-left p-4 text-xs tracking-widest transition-all border-b border-white/5
                                ${formData.motivation === m ? 'bg-gold text-obsidian font-bold' : 'text-gray-400 hover:bg-gold/10 hover:text-white'}`}
                            >
                              {m}
                            </button>
                         ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <label className="text-[10px] uppercase tracking-widest text-gold/60 font-bold">{t('res_label_zone')}</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {diagnosticZones.map(area => {
                    const isSelected = selectedArea === area.id;
                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => {
                          setSelectedArea(area.id);
                          const cleanNote = formData.note.split('\n').filter(l => !l.startsWith('Zone:')).join('\n');
                          setFormData({...formData, note: `Zone: ${area.label}\n${cleanNote}`});
                        }}
                        className={`relative border p-6 flex flex-col items-center gap-3 transition-all group overflow-hidden rounded-sm ${
                          isSelected 
                            ? 'border-gold bg-gold/5 shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
                            : 'border-gold/10 bg-obsidian hover:border-gold/50'
                        }`}
                      >
                         {isSelected && (
                           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2 text-gold">
                             <Sparkles size={12} />
                           </motion.div>
                         )}
                         <span className={`text-3xl transition-transform duration-500 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                           {area.icon}
                         </span>
                         <span className={`text-[9px] uppercase tracking-widest font-bold transition-colors text-center ${
                           isSelected ? 'text-gold' : 'text-gray-500 group-hover:text-gold'
                         }`}>
                           {area.label}
                         </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] uppercase tracking-widest text-gold/60 font-bold">{t('res_label_notes')}</label>
                <textarea 
                  rows="4"
                  placeholder={t('res_placeholder_notes')}
                  value={formData.note}
                  className="bg-obsidian border border-gold/10 p-5 text-white text-sm focus:border-gold outline-none transition-all placeholder:text-gray-800 resize-none rounded-sm"
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                ></textarea>
              </div>

              <button className="bg-gold text-obsidian py-6 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-gold-hover transition-all shadow-[0_15px_40px_rgba(212,175,55,0.2)] flex items-center justify-center gap-3 group mt-4 rounded-sm">
                 {t('res_btn_send')}
                 <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Reservation;
