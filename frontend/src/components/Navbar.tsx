import React from 'react';

interface NavbarProps {
  onTryLiveClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onTryLiveClick }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#08080c]/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.9)]" />
          <span className="text-base sm:text-lg font-bold tracking-tight text-white font-sans">
            Memory Cliff
          </span>
        </div>

        {/* Minimal Small-Caps Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => scrollTo('section-audience')}
            className="text-[11px] font-mono uppercase tracking-[0.14em] text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Audience
          </button>
          <button 
            onClick={() => scrollTo('section-walkthrough')}
            className="text-[11px] font-mono uppercase tracking-[0.14em] text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Walkthrough
          </button>
          <button 
            onClick={() => scrollTo('section-workbench')}
            className="text-[11px] font-mono uppercase tracking-[0.14em] text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Workbench
          </button>
          <button 
            onClick={() => scrollTo('section-microscope')}
            className="text-[11px] font-mono uppercase tracking-[0.14em] text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Microscope
          </button>
          <button 
            onClick={() => scrollTo('section-surgery')}
            className="text-[11px] font-mono uppercase tracking-[0.14em] text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Surgery
          </button>
          <button 
            onClick={() => scrollTo('section-bdh')}
            className="text-[11px] font-mono uppercase tracking-[0.14em] text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            BDH
          </button>
        </nav>

        {/* Standout Single Accent Pill CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onTryLiveClick) onTryLiveClick();
              else scrollTo('section-workbench');
            }}
            className="group relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-mono text-[11px] uppercase font-semibold tracking-wider transition-all duration-200 shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] cursor-pointer active:scale-95"
          >
            <span>Try It Live</span>
            <span className="text-xs transition-transform group-hover:translate-x-0.5">&rarr;</span>
          </button>
        </div>

      </div>
    </header>
  );
};
