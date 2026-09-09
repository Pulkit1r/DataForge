import React, { useState } from 'react';

export const BDHSection: React.FC = () => {
  const [viewMode, setViewMode] = useState<'biological' | 'matrix'>('biological');

  return (
    <section id="section-bdh" className="scroll-mt-20">
      <div className="rounded-2xl border border-white/[0.07] bg-[#0e0e17]/90 p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-8">
        
        {/* Section Header & Framing Switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/[0.06] pb-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 bg-violet-950/50 border border-violet-800/40 px-2.5 py-0.5 rounded-full">
                Track 09 · Theoretical Foundations
              </span>
              <span className="text-[10px] font-mono text-gray-400 bg-white/[0.04] border border-white/[0.06] px-2.5 py-0.5 rounded-full">
                Dual Framing
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              The BDH Connection: Fast Weights as Biological Synaptic Plasticity
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
              Bridging the gap between cortical neurobiology and linear attention: 
              how the Hebbian fast-weight hypothesis explains both mammalian memory retention and modern sub-quadratic attention failure modes.
            </p>
          </div>

          {/* Interactive View Mode Toggle */}
          <div className="flex items-center bg-[#131320] p-1 rounded-xl border border-white/[0.08] self-start sm:self-auto shrink-0">
            <button
              onClick={() => setViewMode('biological')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'biological'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20 font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>🧠</span>
              <span>Biological (BDH)</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'matrix'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20 font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>💻</span>
              <span>Matrix Fast-Weight</span>
            </button>
          </div>
        </div>

        {/* Dynamic Mathematical Equation Card */}
        <div className="rounded-xl border border-white/[0.08] bg-[#131320]/70 p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-gray-300 font-semibold">
                {viewMode === 'biological'
                  ? 'Primary BDH Synaptic Accumulation Update'
                  : 'Linear Attention Associative Write Rule'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-violet-300 bg-violet-950/60 border border-violet-800/40 px-2.5 py-0.5 rounded-full">
              arXiv:2509.26507
            </span>
          </div>

          {/* Equation Display Box */}
          <div className="py-6 px-4 text-center rounded-xl bg-[#0a0a10] border border-white/[0.06] shadow-inner">
            <div className="font-mono text-lg sm:text-2xl font-bold tracking-wider text-white">
              {viewMode === 'biological' ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
                  <span>
                    W<sub>t</sub> = W<sub>t-1</sub> + &eta; &middot; (y<sub>post</sub> &otimes; x<sub>pre</sub>)
                  </span>
                  <span className="text-gray-600 hidden sm:inline">|</span>
                  <span className="text-sm sm:text-base text-gray-400 font-normal">
                    Readout: y<sub>post</sub> = W &middot; x<sub>pre</sub>
                  </span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
                  <span>
                    S<sub>t</sub> = S<sub>t-1</sub> + v<sub>t</sub> &otimes; k<sub>t</sub><sup>T</sup>
                  </span>
                  <span className="text-gray-600 hidden sm:inline">|</span>
                  <span className="text-sm sm:text-base text-gray-400 font-normal">
                    Readout: y = S &middot; q
                  </span>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto leading-relaxed">
            {viewMode === 'biological'
              ? 'Correlation-based Hebbian synaptic weight adjustment: pre- and post-synaptic activations strengthen shared connections additively with zero subtractive error feedback.'
              : 'Continuous outer-product write into a constant d×d fast-weight recurrent state matrix, providing O(1) inference memory at the cost of rank saturation.'}
          </p>
        </div>

        {/* Dual Scholarly Analysis Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Hebbian Plasticity */}
          <div className="rounded-xl border border-violet-500/30 bg-[#131320]/60 p-6 space-y-3.5 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-violet-400 font-semibold flex items-center gap-1.5">
                  <span>⚡</span> Hebbian Plasticity & Additive Memory
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-950/60 text-violet-300 border border-violet-800/40">
                  Model B
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                How BDH Relies on Outer-Product Superposition
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                In <em className="text-gray-300">The Dragon Hatchling</em> (arXiv:2509.26507), standard softmax attention is discarded in favor of biological synaptic memory. 
                Instead of storing tokens into an unbounded buffer, activations write directly into synaptic fast weights via outer products. 
                Our <strong className="text-violet-300">Fixed Memory (Additive)</strong> model implements this exact Hebbian accumulator in PyTorch.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#0a0a10] border border-white/[0.04] text-[11px] font-mono text-gray-400 leading-normal">
              <span className="text-violet-300 font-semibold">Takeaway:</span> Memory footprint stays strictly constant at <code className="text-white">O(d²)</code>, but capacity is hard-bounded by matrix dimension <code className="text-amber-400">d = 32</code>.
            </div>
          </div>

          {/* Card 2: Why DeltaNet is NOT BDH */}
          <div className="rounded-xl border border-teal-500/30 bg-[#131320]/60 p-6 space-y-3.5 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold flex items-center gap-1.5">
                  <span>🛡</span> Architectural Boundary
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-950/60 text-teal-300 border border-teal-800/40">
                  Model C Contrast
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                Why DeltaNet is NOT the BDH Stand-In
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Yang et al. (2024, arXiv:2412.06464) proved that additive associative states suffer catastrophic collision when sequence load exceeds state rank. 
                DeltaNet mitigates this by inserting a <strong className="text-teal-300">subtractive error-correcting delta rule</strong>:{' '}
                <code className="text-teal-300 font-mono">W_t = W_{'{t-1}'} + β(v_t - W_{'{t-1}'}k_t)k_t^T</code>.
                Because BDH models pure biological Hebbian wiring without negative error back-projection, equating DeltaNet with BDH would be scientifically inaccurate.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#0a0a10] border border-white/[0.04] text-[11px] font-mono text-gray-400 leading-normal">
              <span className="text-teal-300 font-semibold">Scientific Boundary:</span> DeltaNet is included strictly as a corrective engineering benchmark, highlighting the algorithmic cost of biological fidelity.
            </div>
          </div>

        </div>

        {/* Primary Academic Bibliography */}
        <div className="rounded-xl border border-white/[0.06] bg-[#131320]/40 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-400 font-semibold">
              Primary Academic Literature
            </span>
            <span className="text-[11px] font-mono text-gray-500">
              4 Foundational Papers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            {/* Citation 1 */}
            <div className="p-3.5 rounded-lg bg-[#0a0a10] border border-white/[0.05] space-y-1.5 hover:border-violet-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono text-violet-400 text-[11px] font-semibold">arXiv:2509.26507</span>
                <span className="text-[10px] font-mono text-gray-500">BDH Architecture</span>
              </div>
              <div className="font-semibold text-white">The Dragon Hatchling</div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Reformulates transformer self-attention as biological synaptic memory, introducing the additive Hebbian fast-weight framework.
              </p>
            </div>

            {/* Citation 2 */}
            <div className="p-3.5 rounded-lg bg-[#0a0a10] border border-white/[0.05] space-y-1.5 hover:border-teal-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono text-teal-400 text-[11px] font-semibold">arXiv:2412.06464</span>
                <span className="text-[10px] font-mono text-gray-500">Delta Rule Fix</span>
              </div>
              <div className="font-semibold text-white">Gated Delta Networks (DeltaNet)</div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Yang, Kautz, & Hatamizadeh document associative state saturation in linear recurrence and prove Householder delta updates restore capacity.
              </p>
            </div>

            {/* Citation 3 */}
            <div className="p-3.5 rounded-lg bg-[#0a0a10] border border-white/[0.05] space-y-1.5 hover:border-amber-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono text-amber-400 text-[11px] font-semibold">arXiv:2402.18668</span>
                <span className="text-[10px] font-mono text-gray-500">Linear Recall Bounds</span>
              </div>
              <div className="font-semibold text-white">Simple Linear Attention ("Based")</div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Arora et al. analyze the fundamental capacity tradeoff between exact associative recall and hardware-bounded recurrent throughput.
              </p>
            </div>

            {/* Citation 4 */}
            <div className="p-3.5 rounded-lg bg-[#0a0a10] border border-white/[0.05] space-y-1.5 hover:border-indigo-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono text-indigo-400 text-[11px] font-semibold">arXiv:2605.11196</span>
                <span className="text-[10px] font-mono text-gray-500">Collapse Dynamics</span>
              </div>
              <div className="font-semibold text-white">Variational Linear Attention</div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Provides mathematical proofs for the associative cliff: why retrieval error scales hyperbolically once stored facts exceed state rank d.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

