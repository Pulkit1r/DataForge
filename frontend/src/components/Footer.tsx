import React from 'react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-white/[0.08] bg-[#060609] pt-16 pb-12 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Known Limitations & Epistemic Honesty Banner */}
        <div className="rounded-2xl border border-amber-900/40 bg-gradient-to-b from-[#141017] to-[#0c0a10] p-6 sm:p-8 space-y-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-amber-900/30 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold">
                Known Limitations & Epistemic Scope
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-400/80 bg-amber-950/60 border border-amber-800/40 px-2.5 py-0.5 rounded-full">
              Academic Transparency
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-300 leading-relaxed">
            
            {/* Limitation 1 */}
            <div className="space-y-2">
              <div className="font-mono text-amber-300 font-semibold flex items-center gap-1.5">
                <span>01.</span>
                <span>Toy Scale (d = 32)</span>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                This workbench fixes dimension <span className="font-mono text-gray-300">d = 32</span> to enable 
                instantaneous, sub-second PyTorch computation on interactive client requests. 
                In production linear attention and state-space models (e.g. Mamba2, RWKV-6), dimensions typically range from 
                <span className="font-mono text-gray-300"> d = 2,048</span> to <span className="font-mono text-gray-300">8,192</span>, 
                shifting the absolute threshold to higher sequence counts while preserving identical rank-collapse mathematics.
              </p>
            </div>

            {/* Limitation 2 */}
            <div className="space-y-2">
              <div className="font-mono text-amber-300 font-semibold flex items-center gap-1.5">
                <span>02.</span>
                <span>Mechanistic Analogue, Not BDH Weights</span>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Model B evaluates a faithful mathematical implementation of BDH's outer-product Hebbian rule 
                (<span className="font-mono text-gray-300">W_t = W_{'{t-1}'} + v_t k_t^T</span>) as detailed in arXiv:2509.26507. 
                It is an educational demonstration of associative superposition and does not utilize official proprietary BDH checkpoints or training datasets.
              </p>
            </div>

            {/* Limitation 3 */}
            <div className="space-y-2">
              <div className="font-mono text-amber-300 font-semibold flex items-center gap-1.5">
                <span>03.</span>
                <span>Synthetic Gaussian Key-Value Pairs</span>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Evaluations utilize normalized synthetic Gaussian vector representations. Natural language features 
                exhibit power-law frequency distributions, burstiness, and semantic clustering, which can alter empirical 
                cross-talk interference rates compared to independent random vectors.
              </p>
            </div>

          </div>
        </div>

        {/* Minimalist Dala Footer Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-white/[0.06] text-xs font-mono text-gray-500">
          
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500" />
              <span className="text-white font-semibold tracking-wider text-xs">THE MEMORY CLIFF</span>
              <span className="text-gray-600">·</span>
              <span className="text-[11px] text-gray-400">RESEARCH BENCHMARK</span>
            </div>
            <p className="text-[11px] text-gray-500">
              Interactive PyTorch investigation of fixed-size accumulator capacity bounds vs. KV cache expansion.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-[11px]">
            <a
              href="https://arxiv.org/abs/2509.26507"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-violet-300 transition-colors"
            >
              arXiv:2509.26507 (BDH) ↗
            </a>
            <a
              href="https://arxiv.org/abs/2412.06464"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-teal-300 transition-colors"
            >
              arXiv:2412.06464 (DeltaNet) ↗
            </a>
            <button
              onClick={scrollToTop}
              className="px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white border border-white/[0.08] transition-colors flex items-center gap-1"
            >
              <span>↑</span>
              <span>Back to Top</span>
            </button>
          </div>

        </div>

        <div className="text-center text-[10px] font-mono text-gray-600">
          Open Source MIT License · Built with PyTorch, FastAPI, React & Tailwind v4
        </div>

      </div>
    </footer>
  );
};
