import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clinicConfig } from '../../data/config';
import ClinicLogo from '../../components/ui/ClinicLogo';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate luxury authentication delay
    setTimeout(() => {
      navigate('/admin');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 blur-[150px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold/5 blur-[150px] translate-y-1/2 -translate-x-1/2 rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-obsidian-soft border border-gold/10 p-10 md:p-12 rounded-sm shadow-2xl relative z-10"
      >
        <div className="text-center mb-12">
          <div className="w-20 h-20 flex items-center justify-center bg-gold/10 rounded-sm border border-gold/20 mx-auto mb-6">
            <ClinicLogo size={44} className="text-gold" />
          </div>
          <h1 className="text-xl font-heading text-white tracking-[0.3em] uppercase">Private Access</h1>
          <p className="text-[9px] text-gray-500 uppercase tracking-[0.4em] mt-3 italic">Administration {clinicConfig.fullName}</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold transition-colors" size={18} />
            <input 
              required
              type="text" 
              placeholder="IDENTIFIANT"
              className="w-full bg-obsidian border border-gold/10 p-5 pl-12 text-[10px] text-white tracking-widest outline-none focus:border-gold/50 transition-all placeholder:text-gray-700"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold transition-colors" size={18} />
            <input 
              required
              type="password" 
              placeholder="MOT DE PASSE"
              className="w-full bg-obsidian border border-gold/10 p-5 pl-12 text-[10px] text-white tracking-widest outline-none focus:border-gold/50 transition-all placeholder:text-gray-700"
            />
          </div>

          <button 
            disabled={loading}
            className="bg-gold text-obsidian py-5 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold-hover transition-all shadow-xl flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Authentification...</span>
            ) : (
              <>
                Accéder au Panel
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-gold/5 flex items-center justify-center gap-4 text-gray-700">
           <ShieldCheck size={14} />
           <span className="text-[8px] uppercase tracking-widest">Connexion Sécurisée & Chiffrée</span>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
