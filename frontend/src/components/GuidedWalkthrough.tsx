import React, { useState } from 'react';

interface GuidedWalkthroughProps {
  currentN: number;
  onSelectN: (n: number) => void;
  isUnlocked: boolean;
  onUnlock: () => void;
}

interface StepInfo {
  stepNum: number;
  n: number;
  label: string;
  tag: string;
  regime: string;
  regimeBadgeColor: string;
  narration: string;
  stateRank: string;
  hebbianAccEst: string;
  kvCacheFloats: number;
}

const STEPS: StepInfo[] = [
  {
    stepNum: 1,
    n: 8,
    label: 'N = 8 · Under Capacity',
    tag: 'Orthogonal Regime (N ≪ d)',
    regime: 'Near-Zero Interference',
    regimeBadgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
    narration:
      'In this regime, 8 random Gaussian key vectors in ℝ³² remain mutually near-orthogonal (E[k_i · k_j] ≈ 0, variance 1/32). Linear readout y = W q retrieves target values with ~100% accuracy, matching Transformer KV cache fidelity with zero per-fact cache allocation overhead.',
    stateRank: 'Rank 8 / 32',
    hebbianAccEst: '100% Accuracy',
    kvCacheFloats: 2 * 8 * 32, // 512
  },
  {
    stepNum: 2,
    n: 32,
    label: 'N = 32 · Capacity Boundary',
    tag: 'Rank Ceiling (N = d)',
    regime: 'Critical Threshold',
    regimeBadgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
    narration:
      'The theoretical boundary of linear independence in ℝ³². The associative accumulator W reaches its maximal rank 32. Key vectors crowd the 31-sphere; subtle non-zero dot products cause cross-talk interference, beginning the transition into the memory cliff while Full Attention remains at 100%.',
    stateRank: 'Rank 32 / 32 (Ceiling)',
    hebbianAccEst: '~65% Accuracy',
    kvCacheFloats: 2 * 32 * 32, // 2,048
  },
  {
    stepNum: 3,
    n: 64,
    label: 'N = 64 · Severe Collision',
    tag: 'Collision Regime (N = 2d)',
    regime: 'Catastrophic Collapse',
    regimeBadgeColor: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
    narration:
      'By the Pigeonhole Principle, 64 vectors in ℝ³² are strictly linearly dependent. In an additive fast-weight state, superimposed outer products destructively collide. Linear readout y = W q returns an entangled superposition of unrelated facts, driving exact recall toward ~16% while Full Attention sustains 100% at linear O(N) memory cost.',
    stateRank: 'Rank 32 / 32 (Saturated)',
    hebbianAccEst: '~16% Accuracy',
    kvCacheFloats: 2 * 64 * 32, // 4,096
  },
];

export const GuidedWalkthrough: React.FC<GuidedWalkthroughProps> = ({
  currentN,
  onSelectN,
  isUnlocked,
  onUnlock,
}) => {
  // Derive current step from currentN if matches, else default to closest or step 1
  const activeStepIdx = STEPS.findIndex((s) => s.n === currentN);
  const [selectedIdx, setSelectedIdx] = useState<number>(activeStepIdx >= 0 ? activeStepIdx : 0);

  const activeStep = STEPS[selectedIdx] || STEPS[0];

  const handleStepSelect = (idx: number) => {
    setSelectedIdx(idx);
    onSelectN(STEPS[idx].n);
  };

  const handlePrev = () => {
    if (selectedIdx > 0) handleStepSelect(selectedIdx - 1);
  };

  const handleNext = () => {
    if (selectedIdx < STEPS.length - 1) handleStepSelect(selectedIdx + 1);
  };

  return (
    <section id="section-walkthrough" className="scroll-mt-20">
      <div className="rounded-2xl border border-white/[0.07] bg-[#0e0e17]/90 p-6 sm:p-8 backdrop-blur-sm space-y-6 shadow-xl">
        
        {/* Section Header & Stepper Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.06] pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 bg-violet-950/50 border border-violet-800/40 px-2.5 py-0.5 rounded-full">
                Track 02 · Stepped Protocol · Scripted Tour
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded">
                Guided Stepper
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Guided Capacity Walkthrough
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
              Step through three cardinal regimes to observe the onset of linear interference before unlocking the free exploration sandbox.
            </p>
          </div>

          {/* Stepper Buttons & Unlock Action */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center rounded-lg border border-white/[0.08] bg-[#131320] p-1">
              <button
                onClick={handlePrev}
                disabled={selectedIdx === 0}
                className="px-3 py-1.5 rounded text-xs font-mono font-medium text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.04] transition-colors"
                title="Previous Regime"
              >
                &larr; Prev
              </button>
              <span className="text-xs font-mono text-gray-400 px-2">
                {selectedIdx + 1} / {STEPS.length}
              </span>
              <button
                onClick={handleNext}
                disabled={selectedIdx === STEPS.length - 1}
                className="px-3 py-1.5 rounded text-xs font-mono font-medium text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.04] transition-colors"
                title="Next Regime"
              >
                Next &rarr;
              </button>
            </div>

            <button
              onClick={() => {
                onUnlock();
                const el = document.getElementById('section-workbench');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-4 py-2 rounded-full font-mono text-xs uppercase font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                isUnlocked
                  ? 'bg-violet-950/70 text-violet-300 border border-violet-700/60 hover:bg-violet-900'
                  : 'bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]'
              }`}
            >
              {isUnlocked ? 'Sandbox Unlocked ✓' : 'Unlock Free Sandbox →'}
            </button>
          </div>
        </div>

        {/* Step Tab Selector Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STEPS.map((s, idx) => {
            const isActive = idx === selectedIdx;
            return (
              <button
                key={s.stepNum}
                onClick={() => handleStepSelect(idx)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'border-violet-500/80 bg-violet-950/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                    : 'border-white/[0.06] bg-[#131320]/60 hover:border-white/[0.12] hover:bg-[#131320]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">
                    Step 0{s.stepNum}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${s.regimeBadgeColor}`}
                  >
                    N = {s.n}
                  </span>
                </div>
                <div className="font-semibold text-xs text-gray-100">{s.label}</div>
              </button>
            );
          })}
        </div>

        {/* Active Step Narration & Live Parameter Card */}
        <div className="rounded-xl border border-white/[0.08] bg-[#131320]/80 p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
              <h3 className="font-bold text-sm sm:text-base text-white">
                Regime Analysis: {activeStep.label}
              </h3>
            </div>
            <span className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${activeStep.regimeBadgeColor}`}>
              {activeStep.regime}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
            {activeStep.narration}
          </p>

          {/* Metric Indicators for Active Step */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.05]">
              <span className="block text-[10px] font-mono text-gray-400 uppercase">Fact Load (N)</span>
              <span className="text-base font-mono font-bold text-white">{activeStep.n} facts</span>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.05]">
              <span className="block text-[10px] font-mono text-gray-400 uppercase">State Rank</span>
              <span className="text-base font-mono font-bold text-violet-300">{activeStep.stateRank}</span>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.05]">
              <span className="block text-[10px] font-mono text-gray-400 uppercase">Additive Recall</span>
              <span className="text-base font-mono font-bold text-amber-300">{activeStep.hebbianAccEst}</span>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.05]">
              <span className="block text-[10px] font-mono text-gray-400 uppercase">Full Attn Cache</span>
              <span className="text-base font-mono font-bold text-gray-300">{activeStep.kvCacheFloats.toLocaleString()} floats</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
