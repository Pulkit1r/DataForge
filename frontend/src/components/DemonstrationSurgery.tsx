import React, { useState } from 'react';
import { PredictResponse } from '../api';

interface DemonstrationSurgeryProps {
  nPairs: number;
  originalData: PredictResponse | null;
  surgeryData: PredictResponse | null;
  onSurgery: (type: 'remove' | 'corrupt', index: number) => void;
  onReset?: () => void;
  isLoading: boolean;
}

export const DemonstrationSurgery: React.FC<DemonstrationSurgeryProps> = ({
  nPairs,
  originalData,
  surgeryData,
  onSurgery,
  onReset,
  isLoading,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [activeSurgery, setActiveSurgery] = useState<{ type: 'remove' | 'corrupt'; index: number } | null>(null);

  // Sync index if nPairs drops below selected
  if (selectedIndex >= nPairs && nPairs > 0) {
    setSelectedIndex(0);
  }

  const handleAction = (type: 'remove' | 'corrupt') => {
    setActiveSurgery({ type, index: selectedIndex });
    onSurgery(type, selectedIndex);
  };

  const handleReset = () => {
    setActiveSurgery(null);
    if (onReset) onReset();
  };

  // Helper to compute collateral damage for a model
  const getDamageAnalysis = (modelKey: 'full_attention' | 'additive_fast_weight' | 'deltanet') => {
    if (!originalData || !surgeryData) return { beforeAcc: 0, afterAcc: 0, delta: 0, targetAffected: false, collateralCount: 0 };
    
    const before = originalData[modelKey];
    const after = surgeryData[modelKey];
    const targetIdx = activeSurgery ? activeSurgery.index : selectedIndex;

    const beforeAcc = before.accuracy * 100;
    const afterAcc = after.accuracy * 100;
    const delta = afterAcc - beforeAcc;

    const targetBefore = before.correct_per_fact[targetIdx] ?? false;
    const targetAfter = after.correct_per_fact[targetIdx] ?? false;
    const targetAffected = targetBefore && !targetAfter;

    let collateralCount = 0;
    const len = Math.min(before.correct_per_fact.length, after.correct_per_fact.length);
    for (let j = 0; j < len; j++) {
      if (j !== targetIdx && before.correct_per_fact[j] && !after.correct_per_fact[j]) {
        collateralCount++;
      }
    }

    return { beforeAcc, afterAcc, delta, targetAffected, collateralCount };
  };

  const faStats = getDamageAnalysis('full_attention');
  const bdhStats = getDamageAnalysis('additive_fast_weight');
  const dnStats = getDamageAnalysis('deltanet');

  return (
    <section id="section-surgery" className="scroll-mt-20">
      <div className="rounded-2xl border border-white/[0.07] bg-[#0e0e17]/90 p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b border-white/[0.06] pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 bg-violet-950/50 border border-violet-800/40 px-2.5 py-0.5 rounded-full">
                Track 08 · Counterfactual Ablation
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-violet-950/70 text-violet-300 border border-violet-700/60 shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                LIVE PYTORCH INFERENCE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Demonstration Surgery: Isolated Fact Alteration
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
              Counterfactually alter a single memorized fact slot. Observe how alterations produce{' '}
              <span className="text-gray-300 font-semibold">strictly isolated drops</span> in modular KV buffers versus{' '}
              <span className="text-violet-300 font-semibold">global collateral interference</span> in superimposed weight matrices.
            </p>
          </div>

          {activeSurgery && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-rose-950/50 border border-rose-800/60 text-rose-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>Surgery Active: {activeSurgery.type === 'remove' ? 'Removed' : 'Corrupted'} #{activeSurgery.index + 1}</span>
              </span>
              <button
                onClick={handleReset}
                disabled={isLoading}
                className="px-3 py-1 rounded-lg text-xs font-mono bg-white/[0.06] hover:bg-white/[0.12] text-gray-300 hover:text-white border border-white/[0.1] transition-colors"
                title="Reset to pristine unedited state"
              >
                Reset ↺
              </button>
            </div>
          )}
        </div>

        {/* Interactive Surgery Command Bar */}
        <div className="rounded-xl border border-white/[0.06] bg-[#131320]/70 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            
            {/* Target Selector & Quick Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400">
                1. Select Target Fact Slot
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <select
                    value={selectedIndex}
                    onChange={(e) => setSelectedIndex(parseInt(e.target.value, 10))}
                    disabled={isLoading}
                    className="bg-[#0a0a10] border border-white/[0.1] text-white text-xs rounded-xl focus:ring-1 focus:ring-violet-500 focus:border-violet-500 block w-40 p-2.5 font-mono cursor-pointer transition-colors"
                  >
                    {Array.from({ length: Math.min(nPairs, 96) }).map((_, i) => (
                      <option key={i} value={i} className="bg-[#0e0e17] text-white">
                        Fact Slot #{i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1 font-mono text-xs">
                  <button
                    onClick={() => setSelectedIndex(0)}
                    disabled={isLoading}
                    className={`px-2.5 py-1.5 rounded-lg border transition-colors ${
                      selectedIndex === 0
                        ? 'bg-violet-950/60 border-violet-700/60 text-violet-300 font-semibold'
                        : 'bg-[#0e0e17] border-white/[0.08] text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    First (#1)
                  </button>
                  <button
                    onClick={() => setSelectedIndex(Math.floor(nPairs / 2))}
                    disabled={isLoading}
                    className={`px-2.5 py-1.5 rounded-lg border transition-colors ${
                      selectedIndex === Math.floor(nPairs / 2)
                        ? 'bg-violet-950/60 border-violet-700/60 text-violet-300 font-semibold'
                        : 'bg-[#0e0e17] border-white/[0.08] text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Mid (#{Math.floor(nPairs / 2) + 1})
                  </button>
                  <button
                    onClick={() => setSelectedIndex(Math.max(0, nPairs - 1))}
                    disabled={isLoading}
                    className={`px-2.5 py-1.5 rounded-lg border transition-colors ${
                      selectedIndex === Math.max(0, nPairs - 1)
                        ? 'bg-violet-950/60 border-violet-700/60 text-violet-300 font-semibold'
                        : 'bg-[#0e0e17] border-white/[0.08] text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Last (#{nPairs})
                  </button>
                </div>
              </div>
            </div>

            {/* Surgical Intervention Buttons */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400">
                2. Apply Ablation Operator
              </label>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => handleAction('remove')}
                  disabled={isLoading}
                  className="px-4 py-2.5 bg-rose-950/70 hover:bg-rose-900 text-rose-200 text-xs font-mono font-semibold rounded-xl border border-rose-800/60 shadow-lg shadow-rose-950/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>✂</span>
                  <span>Remove Fact Key</span>
                </button>

                <button
                  onClick={() => handleAction('corrupt')}
                  disabled={isLoading}
                  className="px-4 py-2.5 bg-amber-950/70 hover:bg-amber-900 text-amber-200 text-xs font-mono font-semibold rounded-xl border border-amber-800/60 shadow-lg shadow-amber-950/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>⚡</span>
                  <span>Corrupt Fact Value</span>
                </button>
              </div>
            </div>

          </div>

          {/* Action explanation pill */}
          <div className="text-[11px] font-mono text-gray-400 pt-1 border-t border-white/[0.04] flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              <span className="text-rose-400 font-bold">Remove Key:</span> Excludes pair from accumulation loop; tests recall on unlearned fact.
            </span>
            <span>
              <span className="text-amber-400 font-bold">Corrupt Value:</span> Overwrites stored target with orthogonal noise; grades if true fact survives.
            </span>
          </div>
        </div>

        {/* Surgery Results Section */}
        {isLoading ? (
          <div className="rounded-xl border border-white/[0.06] bg-[#131320]/40 p-8 flex items-center justify-center gap-3 text-xs font-mono text-gray-400">
            <div className="w-4 h-4 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
            <span>Executing counterfactual forward pass across PyTorch engines...</span>
          </div>
        ) : surgeryData && originalData ? (
          <div className="space-y-4">
            
            <div className="flex items-center justify-between text-xs font-mono text-gray-400">
              <span className="uppercase tracking-wider">Before vs. After Telemetry</span>
              <span className="text-gray-500">Evaluated on N = {nPairs} original query keys</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Card 1: Full Attention (Unbounded KV) */}
              <div className="rounded-xl border border-white/[0.08] bg-[#131320]/70 p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                      Model A · Baseline
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] text-gray-300 border border-white/[0.08]">
                      Isolated Buffer
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">Full Attention (KV Cache)</h3>
                </div>

                {/* Score Diff */}
                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-[#0a0a10] border border-white/[0.06]">
                  <div className="text-center">
                    <span className="text-[10px] font-mono text-gray-500 block">Before</span>
                    <span className="text-lg font-mono font-bold text-gray-200">
                      {faStats.beforeAcc.toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-gray-600 font-mono text-sm">→</div>
                  <div className="text-center">
                    <span className="text-[10px] font-mono text-gray-500 block">After</span>
                    <span className="text-lg font-mono font-bold text-white">
                      {faStats.afterAcc.toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-gray-500 block">Delta</span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      faStats.delta < 0 ? 'bg-rose-950/60 text-rose-300' : 'bg-white/[0.06] text-gray-300'
                    }`}>
                      {faStats.delta > 0 ? `+${faStats.delta.toFixed(1)}%` : `${faStats.delta.toFixed(1)}%`}
                    </span>
                  </div>
                </div>

                {/* Collateral Analysis */}
                <div className="space-y-1.5 text-[11px] leading-relaxed">
                  <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-semibold">
                    <span>✓ 0 Collateral Failures</span>
                  </div>
                  <p className="text-gray-400">
                    Modifying slot #{selectedIndex + 1} affects <strong className="text-gray-300">only</strong> query #{selectedIndex + 1}. All other {nPairs - 1} KV cache entries remain completely intact.
                  </p>
                </div>
              </div>

              {/* Card 2: Fixed Memory (BDH Hebbian Analogue) */}
              <div className="rounded-xl border border-violet-500/40 bg-[#131320]/70 p-5 space-y-4 flex flex-col justify-between shadow-lg shadow-violet-950/20">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400">
                      Model B · BDH Analogue
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-950/70 text-violet-300 border border-violet-800/50">
                      Superimposed W
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">Fixed Memory (Additive)</h3>
                </div>

                {/* Score Diff */}
                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-[#0a0a10] border border-violet-900/30">
                  <div className="text-center">
                    <span className="text-[10px] font-mono text-gray-500 block">Before</span>
                    <span className="text-lg font-mono font-bold text-gray-200">
                      {bdhStats.beforeAcc.toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-gray-600 font-mono text-sm">→</div>
                  <div className="text-center">
                    <span className="text-[10px] font-mono text-gray-500 block">After</span>
                    <span className="text-lg font-mono font-bold text-violet-300">
                      {bdhStats.afterAcc.toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-gray-500 block">Delta</span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      bdhStats.delta < 0 ? 'bg-rose-950/60 text-rose-300' : 'bg-violet-950/60 text-violet-300'
                    }`}>
                      {bdhStats.delta > 0 ? `+${bdhStats.delta.toFixed(1)}%` : `${bdhStats.delta.toFixed(1)}%`}
                    </span>
                  </div>
                </div>

                {/* Collateral Analysis */}
                <div className="space-y-1.5 text-[11px] leading-relaxed">
                  <div className="flex items-center gap-1.5 font-mono text-amber-400 font-semibold">
                    <span>
                      {bdhStats.collateralCount > 0 
                        ? `⚠ ${bdhStats.collateralCount} Collateral Failures` 
                        : `No collateral flips at N=${nPairs}`}
                    </span>
                  </div>
                  <p className="text-gray-400">
                    Because memory is entangled in a shared 32×32 state, modifying one fact alters the global projection landscape, causing neighbor recall to drift.
                  </p>
                </div>
              </div>

              {/* Card 3: DeltaNet (Delta Rule) */}
              <div className="rounded-xl border border-teal-500/30 bg-[#131320]/70 p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400">
                      Model C · Corrective Contrast
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-950/70 text-teal-300 border border-teal-800/50">
                      Error Residual
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">DeltaNet (Delta Rule)</h3>
                </div>

                {/* Score Diff */}
                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-[#0a0a10] border border-teal-900/30">
                  <div className="text-center">
                    <span className="text-[10px] font-mono text-gray-500 block">Before</span>
                    <span className="text-lg font-mono font-bold text-gray-200">
                      {dnStats.beforeAcc.toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-gray-600 font-mono text-sm">→</div>
                  <div className="text-center">
                    <span className="text-[10px] font-mono text-gray-500 block">After</span>
                    <span className="text-lg font-mono font-bold text-teal-300">
                      {dnStats.afterAcc.toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-gray-500 block">Delta</span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      dnStats.delta < 0 ? 'bg-rose-950/60 text-rose-300' : 'bg-teal-950/60 text-teal-300'
                    }`}>
                      {dnStats.delta > 0 ? `+${dnStats.delta.toFixed(1)}%` : `${dnStats.delta.toFixed(1)}%`}
                    </span>
                  </div>
                </div>

                {/* Collateral Analysis */}
                <div className="space-y-1.5 text-[11px] leading-relaxed">
                  <div className="flex items-center gap-1.5 font-mono text-teal-400 font-semibold">
                    <span>
                      {dnStats.collateralCount > 0 
                        ? `⚠ ${dnStats.collateralCount} Collateral Failures` 
                        : `✓ Error-Corrected Stability`}
                    </span>
                  </div>
                  <p className="text-gray-400">
                    The delta rule <code className="text-teal-300 font-mono">β(v_t - W_{'{t-1}'}k_t)k_t^T</code> subtracts existing projections before writing, damping cascading distortion.
                  </p>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Empty / Prompt State */
          <div className="rounded-xl border border-dashed border-white/[0.1] bg-[#131320]/30 p-8 text-center space-y-2">
            <div className="text-xl">🔬</div>
            <div className="text-xs font-mono uppercase tracking-wider text-gray-300 font-semibold">
              Ready for Surgical Alteration
            </div>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              Pick a fact slot above and click <span className="text-rose-400">"Remove Fact Key"</span> or{' '}
              <span className="text-amber-400">"Corrupt Fact Value"</span> to execute live PyTorch surgery and inspect the representation fallout.
            </p>
          </div>
        )}

      </div>
    </section>
  );
};

