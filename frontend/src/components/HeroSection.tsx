import React from 'react';
import { VectorSphereCanvas } from './VectorSphereCanvas';

interface HeroSectionProps {
  onTryLiveClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onTryLiveClick }) => {
  const scrollToWorkbench = () => {
    if (onTryLiveClick) {
      onTryLiveClick();
    } else {
      const el = document.getElementById('section-workbench') || document.getElementById('fact-load-workbench');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-white/[0.06]">
      {/* Subtle Background Radial Glow */}
      <div className="absolute top-1/4 right-5 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-5 w-80 h-80 bg-indigo-900/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Typography, Hypothesis & CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 z-10">
            
            {/* 1. Oversized Headline */}
            <div className="space-y-2">
              <h1 className="text-[2.6rem] xs:text-[3.25rem] sm:text-6xl md:text-7xl lg:text-[4.85rem] font-black tracking-[-0.035em] leading-[0.95] text-white uppercase select-none">
                The Memory Cliff: <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-violet-400">
                  When Fixed-Size
                </span> <br />
                Accumulators <br />
                Collide.
              </h1>
            </div>

            {/* 3. One-line Supporting Subhead */}
            <p className="text-sm sm:text-base text-gray-300 max-w-xl font-normal leading-relaxed">
              Standard Transformers pay an <span className="font-mono text-white font-semibold">O(N)</span> memory penalty to maintain exact recall. 
              Additive fast-weights store memory in an <span className="font-mono text-white font-semibold">O(1)</span> state—until orthogonal rank exhaustion causes abrupt retrieval collapse at <span className="font-mono text-violet-400 font-semibold">d = 32</span>.
            </p>

            {/* High-Contrast Falsifiable Core Claim Card */}
            <div className="p-4 sm:p-5 rounded-xl border border-white/[0.09] bg-[#0e0e17]/85 backdrop-blur-md shadow-2xl space-y-3 max-w-xl">
              <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2">
                <span className="text-[10px] font-mono tracking-widest text-violet-400 uppercase font-bold">
                  Falsifiable Research Claim
                </span>
                <span className="text-[10px] font-mono text-gray-400">
                  Capacity Ceiling: d = 32
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-200 italic leading-relaxed">
                &ldquo;A fixed-size additive associative-memory state can process an arbitrarily long stream of facts without allocating a new slot per fact, but its exact-recall accuracy degrades once the number of stored facts exceeds the state's effective capacity, due to key-collision interference.&rdquo;
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] sm:text-[11px] font-mono text-gray-400">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                  State: <strong className="text-violet-300 font-semibold">W ∈ ℝ³²ˣ³²</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                  Size: <strong className="text-violet-300 font-semibold">1,024 floats (O(1))</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-violet-950/40 text-violet-300 border border-violet-800/40">
                  Substrate: <strong className="font-semibold">Live PyTorch</strong>
                </span>
              </div>
            </div>

            {/* 4. Single Accent-Pill CTA + Secondary Action */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={scrollToWorkbench}
                className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs uppercase font-bold tracking-wider transition-all duration-200 shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.7)] cursor-pointer active:scale-95"
              >
                <span>Try It Live</span>
                <span className="text-sm transition-transform group-hover:translate-y-0.5">&darr;</span>
              </button>

              <a
                href="/blog.pdf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.1] text-gray-300 hover:text-white font-mono text-xs uppercase font-medium tracking-wider transition-all"
              >
                <span>Concept Briefing (PDF)</span>
                <span className="text-xs">&nearr;</span>
              </a>
            </div>

          </div>

          {/* Right Column: 3D Vector Sphere Simulation Visual */}
          <div className="lg:col-span-5 flex justify-center items-center relative h-[360px] sm:h-[420px] lg:h-[480px]">
            <div className="w-full h-full max-w-[480px] max-h-[480px] relative rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0b0b13]/60 backdrop-blur shadow-2xl">
              
              {/* Canvas Particle Simulation */}
              <VectorSphereCanvas nVectors={36} className="w-full h-full" />

              {/* In-Canvas Explanatory Pill */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider text-violet-300 bg-violet-950/70 border border-violet-800/50 backdrop-blur">
                  Vector Space S³¹ ⊂ ℝ³²
                </span>
                <span className="text-[10px] font-mono text-gray-400 bg-black/50 px-2 py-0.5 rounded border border-white/[0.05]">
                  Fibonacci Sphere Lattice
                </span>
              </div>

              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-[#08080c] via-[#08080c]/85 to-transparent pointer-events-none">
                <p className="text-[11px] font-mono text-gray-400 text-center leading-tight">
                  Dispersed near-orthogonal keys (<span className="text-violet-300">N ≤ 32</span>). As fact count climbs, non-zero dot products produce visible collision filaments.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
