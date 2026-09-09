import React from 'react';

export const AudienceSection: React.FC = () => {
  const objectives = [
    {
      num: '01',
      title: 'Predict the Orthogonal Capacity Cliff',
      desc: 'Predict before execution whether an associative query at fact load N in state dimension d = 32 falls into the linear retrieval regime (N ≤ 32) or suffers key-collision collapse (N > 32).',
      target: 'Target: First-Principle Intuition',
    },
    {
      num: '02',
      title: 'Audit Live vs. Precomputed Proofs',
      desc: 'Differentiate real-time in-browser PyTorch tensor forward passes (<20ms latency) from the 5-seed empirical capacity curves precomputed across N ∈ [1, 96].',
      target: 'Target: Empirical Provenance',
    },
    {
      num: '03',
      title: 'Dissect Subtractive Error Correction',
      desc: 'Differentiate additive Hebbian synaptic writes (W_t = W_{t-1} + v_t k_t^T) from DeltaNet error correction (W_t = W_{t-1} + β(v_t - W_{t-1} k_t)k_t^T) and trace why subtraction dampens interference.',
      target: 'Target: Architectural Rigor',
    },
  ];

  return (
    <section id="section-audience" className="scroll-mt-20">
      <div className="rounded-2xl border border-white/[0.07] bg-[#0e0e17]/90 p-6 sm:p-8 backdrop-blur-sm space-y-6 shadow-xl">
        
        {/* Header Block */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 bg-violet-950/50 border border-violet-800/40 px-2.5 py-0.5 rounded-full">
              Track 01 · Audience & Prerequisites
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Who this workbench is engineered for
          </h2>

          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-3xl">
            Designed for machine learning researchers, students, and engineers familiar with introductory linear algebra 
            (matrix-vector products, dot products, vector orthogonality: <span className="font-mono text-gray-300">u · v = 0</span>) and standard 
            Transformer self-attention Key-Value caching. No background in sub-quadratic SSMs or neurobiological Hebbian plasticity is assumed.
          </p>
        </div>

        {/* 3 Learning Objectives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {objectives.map((obj) => (
            <div 
              key={obj.num}
              className="flex flex-col justify-between p-5 rounded-xl border border-white/[0.05] bg-[#131320]/70 hover:border-violet-500/30 transition-colors space-y-4 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-violet-400 bg-violet-950/60 border border-violet-800/40 px-2 py-0.5 rounded">
                    {obj.num}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-violet-400 transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-gray-100 group-hover:text-white transition-colors">
                  {obj.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-normal">
                  {obj.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.04]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 bg-white/[0.03] border border-white/[0.05] px-2 py-0.5 rounded block w-fit">
                  {obj.target}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
