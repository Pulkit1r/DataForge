import React from 'react';
import { PredictResponse } from '../api';
import { FactGrid } from './FactGrid';

interface ThreePanelDemoProps {
  predictionData: PredictResponse | null;
  isLoading: boolean;
}

export const ThreePanelDemo: React.FC<ThreePanelDemoProps> = ({ predictionData, isLoading }) => {
  if (!predictionData) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-[#0e0e17]/90 p-8 flex items-center justify-center text-gray-400">
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="w-4 h-4 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
          <span>Executing live PyTorch forward pass...</span>
        </div>
      </div>
    );
  }

  const { full_attention, additive_fast_weight, deltanet, n_facts } = predictionData;

  return (
    <section id="section-comparison" className="scroll-mt-20">
      <div className="rounded-2xl border border-white/[0.07] bg-[#0e0e17]/90 p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b border-white/[0.06] pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 bg-violet-950/50 border border-violet-800/40 px-2.5 py-0.5 rounded-full">
                Track 05 · Three-Way Architectural Benchmark
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live PyTorch Inference (&lt;15ms)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Live Architecture Comparison (3 Models)
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
              Identical synthetic associative memory sequence evaluated in real time across an unbounded KV cache vs. fixed-size accumulator states.
            </p>
          </div>
        </div>

        {/* 3 Architecture Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* 1. Full Attention Baseline */}
          <div
            className={`rounded-xl border border-white/[0.08] bg-[#131320]/80 p-5 flex flex-col justify-between space-y-4 hover:border-white/[0.15] transition-all shadow-lg ${
              isLoading ? 'opacity-70' : ''
            }`}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start gap-2">
                <span className="px-2.5 py-0.5 bg-white/[0.04] text-gray-300 text-[10px] font-mono uppercase font-semibold rounded border border-white/[0.08]">
                  Ground-Truth Baseline
                </span>
                <span className="text-[10px] font-mono text-gray-400">
                  O(N·d) Dynamic Cache
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-0.5">
                  Full Attention (KV Cache)
                </h3>
                <p className="text-[11px] font-mono text-gray-400">
                  y = Softmax(q Kᵀ) V
                </p>
              </div>

              {/* Accuracy Big Stat */}
              <div className="p-3.5 rounded-lg bg-black/40 border border-white/[0.05] flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                    {(full_attention.accuracy * 100).toFixed(0)}%
                  </span>
                  <span className="block text-[10px] font-mono text-gray-400 uppercase">
                    Exact Match Accuracy
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                  100% Retained
                </span>
              </div>

              {/* Memory Metrics */}
              <div className="text-xs space-y-1 pt-1">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-gray-400">KV Cache Storage:</span>
                  <strong className="text-gray-200">
                    {full_attention.memory_footprint.toLocaleString()} floats
                  </strong>
                </div>
                <p className="text-[10px] text-gray-500 italic leading-snug">
                  Allocates 2 × N × d floats. Grows indefinitely with sequence length.
                </p>
              </div>
            </div>

            <FactGrid model={full_attention} nFacts={n_facts} />
          </div>

          {/* 2. Fixed Memory (Primary BDH Analogue) */}
          <div
            className={`rounded-xl border-2 border-violet-500/80 bg-[#131320]/95 p-5 flex flex-col justify-between space-y-4 shadow-[0_0_30px_rgba(139,92,246,0.16)] relative ${
              isLoading ? 'opacity-70' : ''
            }`}
          >
            {/* Top Standout Pill Banner */}
            <div className="absolute -top-3 left-4 px-2.5 py-0.5 bg-violet-600 text-white text-[10px] font-mono font-bold uppercase rounded-full shadow-lg tracking-wider">
              Primary Study Model · BDH Analogue
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-start gap-2">
                <span className="px-2.5 py-0.5 bg-violet-950/70 text-violet-300 text-[10px] font-mono uppercase font-semibold rounded border border-violet-800/60">
                  Fixed Memory (Hebbian)
                </span>
                <span className="text-[10px] font-mono text-violet-400 font-bold">
                  O(1) Constant State
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-0.5">
                  Fixed Memory (Additive)
                </h3>
                <p className="text-[11px] font-mono text-violet-300/90">
                  Wₜ = Wₜ₋₁ + vₜ kₜᵀ, y = W q
                </p>
              </div>

              {/* Accuracy Big Stat */}
              <div className="p-3.5 rounded-lg bg-black/50 border border-violet-900/40 flex items-baseline justify-between">
                <div>
                  <span
                    className={`text-3xl font-extrabold font-mono tracking-tight ${
                      additive_fast_weight.accuracy < 0.7 ? 'text-rose-400' : 'text-violet-300'
                    }`}
                  >
                    {(additive_fast_weight.accuracy * 100).toFixed(0)}%
                  </span>
                  <span className="block text-[10px] font-mono text-gray-400 uppercase">
                    Exact Match Accuracy
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    additive_fast_weight.accuracy < 0.7
                      ? 'text-rose-400 bg-rose-950/60 border-rose-800/60'
                      : 'text-violet-300 bg-violet-950/60 border-violet-800/60'
                  }`}
                >
                  {additive_fast_weight.accuracy < 0.7 ? 'Memory Cliff Collision' : 'High Fidelity'}
                </span>
              </div>

              {/* Memory Metrics */}
              <div className="text-xs space-y-1 pt-1">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-gray-400">Fast-Weight Matrix:</span>
                  <strong className="text-violet-300">
                    {additive_fast_weight.memory_footprint.toLocaleString()} floats
                  </strong>
                </div>
                <p className="text-[10px] text-gray-500 italic leading-snug">
                  Strictly constant 32 × 32 accumulator matrix. Zero allocation per fact.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <FactGrid model={additive_fast_weight} nFacts={n_facts} />
              <div className="text-[10px] font-mono text-gray-400 bg-black/40 p-2 rounded border border-white/[0.04] leading-tight">
                {additive_fast_weight.labeling}
              </div>
            </div>
          </div>

          {/* 3. DeltaNet (Corrective Delta Rule Contrast) */}
          <div
            className={`rounded-xl border border-teal-900/50 bg-[#131320]/80 p-5 flex flex-col justify-between space-y-4 hover:border-teal-700/50 transition-all shadow-lg ${
              isLoading ? 'opacity-70' : ''
            }`}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start gap-2">
                <span className="px-2.5 py-0.5 bg-teal-950/60 text-teal-300 text-[10px] font-mono uppercase font-semibold rounded border border-teal-800/60">
                  Delta Rule Contrast (Not BDH)
                </span>
                <span className="text-[10px] font-mono text-teal-400">
                  O(1) Error Subtractive
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-0.5">
                  DeltaNet (Delta Rule)
                </h3>
                <p className="text-[11px] font-mono text-teal-300/80">
                  Wₜ = Wₜ₋₁ + β(vₜ - Wₜ₋₁ kₜ)kₜᵀ
                </p>
              </div>

              {/* Accuracy Big Stat */}
              <div className="p-3.5 rounded-lg bg-black/40 border border-white/[0.05] flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-teal-300 font-mono tracking-tight">
                    {(deltanet.accuracy * 100).toFixed(0)}%
                  </span>
                  <span className="block text-[10px] font-mono text-gray-400 uppercase">
                    Exact Match Accuracy
                  </span>
                </div>
                <span className="text-[10px] font-mono text-teal-400 bg-teal-950/60 border border-teal-800/60 px-2 py-0.5 rounded">
                  Error Damped
                </span>
              </div>

              {/* Memory Metrics */}
              <div className="text-xs space-y-1 pt-1">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-gray-400">State Matrix Storage:</span>
                  <strong className="text-teal-300">
                    {deltanet.memory_footprint.toLocaleString()} floats
                  </strong>
                </div>
                <p className="text-[10px] text-gray-500 italic leading-snug">
                  Constant 32 × 32 matrix. Subtracts prediction error before binding.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <FactGrid model={deltanet} nFacts={n_facts} />
              <div className="text-[10px] font-mono text-gray-400 bg-black/40 p-2 rounded border border-white/[0.04] leading-tight">
                {deltanet.labeling}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
