import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clinicConfig } from '../../data/config';
import ClinicLogo from './ClinicLogo';

// Custom Easing (The Apple/Awwwards standard)
const customEase = [0.76, 0, 0.24, 1];

// Isolated Counter Component to prevent full re-renders of heavy SVGs
const TensionCounter = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const duration = 2200;

    const animateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      const easeOutExpo = 1 === progress / duration ? 1 : 1 - Math.pow(2, -10 * progress / duration);
      const currentCount = Math.floor(easeOutExpo * 100);
      
      if (currentCount <= 100 && progress < duration) {
        setCount(currentCount);
        requestAnimationFrame(animateCount);
      } else {
        setCount(100);
      }
    };
    
    requestAnimationFrame(animateCount);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 1 }}
      className="absolute bottom-10 right-12 text-gold font-mono flex flex-col items-end"
    >
      <span className="text-[10px] tracking-[0.2em] opacity-50 mb-1">INITIALIZING SECURE PROTOCOL</span>
      <div className="text-4xl font-light tracking-tighter flex items-baseline gap-1">
        {count.toString().padStart(3, '0')}
        <span className="text-sm opacity-50">%</span>
      </div>
    </motion.div>
  );
};

const SplashScreen = () => {

  return (
    <motion.div 
      exit={{ 
        opacity: 0, 
        scale: 1.05, 
        filter: "blur(20px)", // Cinematic fade out
        transition: { duration: 1.2, ease: customEase } 
      }}
      className="fixed inset-0 z-[1000] bg-[#030303] flex items-center justify-center overflow-hidden selection:bg-gold/30"
    >
      {/* Cinematic noise removed for massive performance gains, using a subtle gradient overlay instead */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent pointer-events-none mix-blend-screen" />

      {/* 3. The Grand Reveal Container */}
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{ duration: 1.2, ease: customEase }}
        className="relative z-10 flex flex-col items-center"
      >
        
        {/* Logo and Loop Container (Anchored together) */}
        <div className="relative flex items-center justify-center mb-6">
          
          {/* 2. The Ortho-Tech Alignment Loop (La Boucle de Précision) - Centered tightly on the teeth */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 1.2, duration: 1.5, ease: customEase }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] flex items-center justify-center pointer-events-none z-0"
          >
            {/* Core Ambient Glow */}
            <div className="absolute w-[120px] h-[120px] rounded-full bg-gold/20 blur-[40px]" />
            <svg width="200" height="200" viewBox="0 0 200 200" className="absolute inset-0 rotate-[-90deg]">
              <motion.circle cx="100" cy="100" r="85" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" strokeDasharray="2 8" fill="none" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="origin-center" />
              <motion.circle cx="100" cy="100" r="70" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray="440" initial={{ strokeDashoffset: 440 }} animate={{ strokeDashoffset: [440, 150, 150, 0] }} transition={{ duration: 3.5, ease: customEase, repeat: Infinity, repeatDelay: 1 }} style={{ filter: "drop-shadow(0 0 5px rgba(212,175,55,0.6))" }} />
              <motion.circle cx="100" cy="100" r="70" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" strokeDasharray="1 440" initial={{ strokeDashoffset: 440 }} animate={{ strokeDashoffset: [440, 0] }} transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 2 }} style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,1))" }} />
              <motion.circle cx="100" cy="100" r="55" stroke="rgba(212, 175, 55, 0.3)" strokeWidth="1.5" strokeDasharray="40 10" fill="none" initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1, rotate: -180 }} transition={{ duration: 4, ease: customEase, repeat: Infinity, repeatType: 'reverse' }} className="origin-center" />
            </svg>
          </motion.div>

          {/* Logo with Mask Reveal */}
          <div className="overflow-hidden relative z-10 p-4">
            <motion.div
              initial={{ y: "100%", rotate: 5, opacity: 0, filter: "blur(10px)" }}
              animate={{ y: "0%", rotate: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.4, duration: 1.2, ease: customEase }}
            >
              <ClinicLogo size={90} className="text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]" />
            </motion.div>
          </div>
        </div>

        {/* Agency Name Reveal */}
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ delay: 0.6, duration: 1.2, ease: customEase }}
            className="text-4xl md:text-5xl font-bold tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 uppercase"
          >
            {clinicConfig.name}
          </motion.h1>
        </div>

        {/* Tech/Sovereignty Status */}
        <div className="overflow-hidden mt-6 flex items-center gap-6">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 1.2, ease: customEase }}
            className="h-[1px] w-16 bg-gradient-to-r from-transparent to-gold/50 origin-right"
          />
          <motion.p
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ delay: 0.8, duration: 1, ease: customEase }}
            className="text-[10px] tracking-[0.5em] text-gold uppercase font-mono"
          >
            Architected by Stepping Stones
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 1.2, ease: customEase }}
            className="h-[1px] w-16 bg-gradient-to-l from-transparent to-gold/50 origin-left"
          />
        </div>
      </motion.div>

      {/* 4. The Tension Counter (Bottom Right) */}
      <TensionCounter />

    </motion.div>
  );
};

export default SplashScreen;