import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Instagram, Globe, ChevronDown, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { clinicConfig } from '../../data/config';
import ClinicLogo from '../ui/ClinicLogo';

const Navbar = () => {
  const { lang, setLang, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled ? 'bg-obsidian/90 backdrop-blur-md py-4 border-b border-gold/10' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo Icon */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 flex items-center justify-center bg-gradient-to-tr from-gold/15 to-transparent rounded-sm border border-gold/20 group-hover:border-gold/40 transition-all duration-500 shadow-inner">
            <ClinicLogo size={24} className="text-gold group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-heading font-bold tracking-[0.2em] text-white leading-none uppercase group-hover:text-gold transition-colors duration-500">{clinicConfig.name}</h1>
            <p className="text-[9px] tracking-[0.4em] text-gold/60 uppercase mt-1.5">{clinicConfig.subName}</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[11px] tracking-[0.3em] uppercase font-bold transition-colors duration-300 relative group ${
                  location.pathname === link.path ? 'text-gold' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t(`nav_${link.name.toLowerCase()}`)}
                <span className={`absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full ${
                  location.pathname === link.path ? 'w-full' : ''
                }`}></span>
              </Link>
            ))}
          </div>
          
          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 text-gold border border-gold/20 px-3 py-1 text-[9px] font-bold uppercase tracking-widest hover:border-gold transition-all"
            >
              <Globe size={12} />
              {lang.toUpperCase()}
              <ChevronDown size={10} className={`transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full mt-2 right-0 bg-obsidian-soft border border-gold/10 p-1 min-w-[120px] shadow-2xl rounded-sm backdrop-blur-xl"
                >
                  <button
                    onClick={() => {
                      setLang('fr');
                      setIsLangOpen(false);
                    }}
                    className={`w-full flex justify-between items-center px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gold/10 transition-colors ${
                      lang === 'fr' ? 'text-gold' : 'text-gray-400'
                    }`}
                  >
                    Français
                    {lang === 'fr' && <div className="w-1 h-1 bg-gold rounded-full" />}
                  </button>
                  <button
                    onClick={() => {
                      setLang('ar');
                      setIsLangOpen(false);
                    }}
                    className={`w-full flex justify-between items-center px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gold/10 transition-colors ${
                      lang === 'ar' ? 'text-gold' : 'text-gray-400'
                    }`}
                  >
                    العربية
                    {lang === 'ar' && <div className="w-1 h-1 bg-gold rounded-full" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link 
            to="/reservation"
            className="border border-gold text-gold hover:bg-gold hover:text-obsidian px-6 py-2 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500"
          >
            {t('nav_reserve')}
          </Link>

          <Link 
            to="/admin"
            className="flex items-center gap-2 border border-gold/30 text-gold/70 hover:border-gold hover:text-gold px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500"
          >
            <LayoutDashboard size={14} />
            {t('nav_admin')}
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-gold p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 top-0 left-0 w-full h-screen bg-obsidian z-[60] flex flex-col items-center justify-center gap-8"
          >
            <button 
              className="absolute top-6 right-6 text-gold p-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={32} />
            </button>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl tracking-[0.3em] uppercase font-heading text-gray-300 hover:text-gold"
              >
                {t(`nav_${link.name.toLowerCase()}`)}
              </Link>
            ))}
            <Link 
              to="/reservation"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-4 bg-gold text-obsidian px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-widest"
            >
              {t('nav_reserve')}
            </Link>

            <Link 
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-4 flex items-center gap-2 border border-gold/20 text-gold/60 px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:border-gold/50"
            >
              <LayoutDashboard size={16} />
              {t('nav_admin')}
            </Link>
            <div className="flex flex-col items-center gap-4 mt-8 pt-8 border-t border-gold/10 w-48">
              <div className="flex gap-8">
                <button 
                  onClick={() => { setLang('fr'); setIsMobileMenuOpen(false); }}
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] ${lang === 'fr' ? 'text-gold' : 'text-gray-500'}`}
                >
                  FR
                </button>
                <div className="w-[1px] h-4 bg-gold/20" />
                <button 
                  onClick={() => { setLang('ar'); setIsMobileMenuOpen(false); }}
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] ${lang === 'ar' ? 'text-gold' : 'text-gray-500'}`}
                >
                  AR
                </button>
              </div>
            </div>

            <div className="flex gap-6 mt-12">
              <Instagram className="text-gold cursor-pointer" />
              <Phone className="text-gold cursor-pointer" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
