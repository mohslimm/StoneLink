import React, { useState, useRef, useEffect } from 'react';

const BeforeAfterSlider = ({ beforeImage, afterImage, beforeLabel = "Avant", afterLabel = "Après" }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (e) => {
    if (!isDragging && e.type !== 'mousemove' && e.type !== 'touchmove') return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const clientX = e.pageX || (e.touches && e.touches[0].pageX);
    if (!clientX) return;
    
    const x = clientX - containerRect.left;
    const position = (x / containerRect.width) * 100;
    
    if (position >= 0 && position <= 100) {
      setSliderPosition(position);
    }
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[4/3] md:aspect-[16/10] lg:aspect-[16/9] overflow-hidden rounded-sm cursor-ew-resize select-none border border-gold/10 group bg-obsidian-soft shadow-2xl"
      onMouseMove={handleMove}
      onMouseDown={handleMouseDown}
      onTouchMove={handleMove}
      onTouchStart={handleMouseDown}
    >
      {/* After Image (The "Good" one) */}
      <img 
        src={afterImage} 
        alt="After" 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* Before Image (Clipped) */}
      <div 
        className="absolute inset-0 w-full h-full z-10"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img 
          src={beforeImage} 
          alt="Before" 
          className="absolute inset-0 w-full h-full object-cover grayscale-[0.3] transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Slider Handle Divider */}
      <div 
        className="absolute inset-y-0 z-20 w-[1px] bg-gold/50 pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-obsidian/80 backdrop-blur-md border border-gold/50 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          <div className="flex gap-1.5 flex-col items-center rotate-90">
             <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Luxury Overlay Tags */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <span className="bg-obsidian/40 backdrop-blur-xl border border-white/5 text-white/60 text-[10px] uppercase font-bold tracking-[0.3em] px-4 py-1.5">
          {beforeLabel}
        </span>
      </div>
      <div className="absolute top-6 right-6 z-30 pointer-events-none">
        <span className="bg-gold/10 backdrop-blur-xl border border-gold/30 text-gold text-[10px] uppercase font-bold tracking-[0.3em] px-4 py-1.5">
          {afterLabel}
        </span>
      </div>

      {/* Treatment Label Footer */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-obsidian/90 to-transparent z-30 flex items-center px-8">
         <p className="text-[10px] text-gray-400 uppercase tracking-[0.4em] font-medium">Traitement: <span className="text-white italic">Facettes Zircone</span></p>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
