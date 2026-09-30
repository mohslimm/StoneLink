import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Stethoscope, 
  CalendarCheck, 
  Image as ImageIcon, 
  Home, 
  LogOut,
  ChevronRight,
  Mail
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { clinicConfig } from '../../data/config';
import ClinicLogo from '../ui/ClinicLogo';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Tableau de bord', path: '/admin', icon: LayoutDashboard, disabled: false },
    { name: 'Gestion Services', path: '/admin/services', icon: Stethoscope, disabled: false },
    { name: 'Rendez-vous', path: '/admin/appointments', icon: CalendarCheck, disabled: false },
    { name: 'Messagerie', path: '/admin/messages', icon: Mail, disabled: false },
    { name: 'Galerie Photos', path: '/admin/gallery', icon: ImageIcon, disabled: false },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed lg:sticky top-0 left-0 h-screen bg-[#0A0B10] border-r border-gold/10 flex flex-col z-[70] transition-transform duration-300 w-64 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Admin Branding */}
        <div className="p-8 border-b border-gold/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-gold/10 rounded-sm border border-gold/20">
              <ClinicLogo size={18} className="text-gold" />
            </div>
            <div>
              <h1 className="text-sm font-heading font-bold tracking-widest text-white leading-none uppercase">{clinicConfig.name}</h1>
              <p className="text-[8px] tracking-[0.2em] text-gold uppercase mt-1">Admin Panel</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gold p-2 hover:bg-gold/10 rounded-sm transition-colors"
          >
            <ChevronRight className="rotate-180" size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-grow py-8 px-4 flex flex-col gap-2 font-medium overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.disabled ? '#' : item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between p-4 rounded-sm transition-all duration-300 group ${
                  isActive 
                    ? 'bg-gold/10 text-gold border-l-2 border-gold' 
                    : item.disabled 
                      ? 'opacity-30 cursor-not-allowed text-gray-600' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={18} />
                  <span className="text-[10px] uppercase tracking-widest font-bold">{item.name}</span>
                </div>
                {!item.disabled && isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-6 mt-auto border-t border-gold/5 flex flex-col gap-4">
          <Link 
            to="/"
            className="flex items-center gap-4 text-gray-500 hover:text-white transition-colors text-[10px] uppercase tracking-widest p-2 font-bold"
          >
            <Home size={18} />
            <span>Site Public</span>
          </Link>
          <button 
            className="flex items-center gap-4 text-red-500/70 hover:text-red-500 transition-colors text-[10px] uppercase tracking-widest p-2 font-bold"
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>

        <div className="p-4 text-center border-t border-gold/5">
           <p className="text-[8px] text-gray-700 uppercase tracking-widest">Version MVP 1.0.8</p>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
