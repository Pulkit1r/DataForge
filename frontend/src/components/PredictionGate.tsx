import React, { useState } from 'react';

interface PredictionGateProps {
  currentN: number;
  actualAccuracy?: number;
  onCommitPrediction?: (bucket: string) => void;
}

type PredictionBucket = '~100%' | '~50%' | '~0-20%';

interface BucketOption {
  value: PredictionBucket;
  title: string;
  subtitle: string;
  expectedCondition: (n: number) => boolean;
}

const BUCKETS: BucketOption[] = [
  {
    value: '~100%',
    title: '~100% Accuracy',
    subtitle: 'Near-Perfect Linear Retrieval (Orthogonal Keys)',
    expectedCondition: (n: number) => n <= 32,
  },
  {
    value: '~50%',
    title: '~50% Accuracy',
    subtitle: 'Graceful Proportional Capacity Degradation',
    expectedCondition: () => false, // Non-linear cliff makes 50% an intuition trap past 32
  },
  {
    value: '~0-20%',
    title: '~0–20% Accuracy',
    subtitle: 'Catastrophic Key-Collision Interference',
    expectedCondition: (n: number) => n > 32,
  },
];

export const PredictionGate: React.FC<PredictionGateProps> = ({
  currentN,
  actualAccuracy,
  onCommitPrediction,
}) => {
  const [selectedBucket, setSelectedBucket] = useState<PredictionBucket | null>(null);
  const [committedBucket, setCommittedBucket] = useState<PredictionBucket | null>(null);

  const handleCommit = () => {
    if (!selectedBucket) return;
    setCommittedBucket(selectedBucket);
    if (onCommitPrediction) onCommitPrediction(selectedBucket);
  };

  const handleReset = () => {
    setCommittedBucket(null);
    setSelectedBucket(null);
  };

  const actualPercent = actualAccuracy !== undefined ? Math.round(actualAccuracy * 100) : null;
  const isPastCeiling = currentN > 32;

  return (
    <section id="section-prediction" className="scroll-mt-20">
      <div className="rounded-2xl border border-white/[0.07] bg-[#0e0e17]/90 p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.06] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 bg-violet-950/50 border border-violet-800/40 px-2.5 py-0.5 rounded-full">
                Track 04 · Cognitive Challenge · Gated Commitment
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                60-Second Gate
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Commit a Prediction Before Live Verification
            </h2>
          </div>

          {committedBucket && (
            <button
              onClick={handleReset}
              className="text-xs font-mono text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/[0.08] hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              Change Prediction &larr;
            </button>
          )}
        </div>

        {/* Prompt Question */}
        <div className="rounded-xl border border-violet-900/40 bg-violet-950/20 p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-medium">
            <span className="text-violet-400 font-bold font-mono mr-1.5">HYPOTHESIS QUESTION:</span>
            In a fixed memory matrix of dimension <span className="font-mono text-white font-semibold">d = 32</span> storing{' '}
            <span className="font-mono text-violet-300 font-bold">N = {currentN}</span> distinct facts, will exact-recall accuracy for the{' '}
            <strong className="text-violet-300 font-semibold">Fixed Memory (Additive)</strong> model be closer to ~100%, ~50%, or ~0–20%?
          </p>
        </div>

        {/* 3 Hypotheses Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {BUCKETS.map((b) => {
            const isSelected = selectedBucket === b.value;
            const isCommitted = committedBucket === b.value;

            return (
              <button
                key={b.value}
                onClick={() => {
                  if (!committedBucket) setSelectedBucket(b.value);
                }}
                disabled={!!committedBucket}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  isCommitted
                    ? 'border-violet-500 bg-violet-950/50 shadow-[0_0_20px_rgba(139,92,246,0.25)]'
                    : isSelected
                    ? 'border-violet-500/80 bg-violet-950/30 shadow-md'
                    : 'border-white/[0.06] bg-[#131320]/70 hover:border-white/[0.12] hover:bg-[#131320]'
                } ${committedBucket ? 'cursor-default' : ''}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-base font-extrabold text-white">
                    {b.title}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected || isCommitted
                        ? 'border-violet-400 bg-violet-600'
                        : 'border-gray-600 bg-transparent'
                    }`}
                  >
                    {(isSelected || isCommitted) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 leading-snug font-normal">
                  {b.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Commit Action or Revealed Results Card */}
        {!committedBucket ? (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleCommit}
              disabled={!selectedBucket}
              className="px-6 py-2.5 rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-mono text-xs uppercase font-bold tracking-wider transition-all duration-200 shadow-[0_0_20px_rgba(139,92,246,0.35)] cursor-pointer"
            >
              Commit Hypothesis & Reveal Live Tensor Result &rarr;
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-white/[0.08] bg-[#131320] p-5 sm:p-6 space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-violet-300">
                Empirical Verdict: Guess vs. Live Forward Pass
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                Substrate: Live PyTorch Forward Pass
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Your Hypothesis */}
              <div className="p-4 rounded-lg bg-black/40 border border-white/[0.05] space-y-1">
                <span className="text-[10px] font-mono uppercase text-gray-400">Your Committed Hypothesis</span>
                <div className="text-2xl font-mono font-black text-violet-300">{committedBucket}</div>
                <p className="text-[11px] text-gray-400 leading-snug">
                  {committedBucket === '~100%' && 'Predicted near-perfect orthogonal retrieval.'}
                  {committedBucket === '~50%' && 'Assumed linear / graceful capacity degradation.'}
                  {committedBucket === '~0-20%' && 'Anticipated severe collision cross-talk past capacity.'}
                </p>
              </div>

              {/* Live PyTorch Result */}
              <div className="p-4 rounded-lg bg-black/40 border border-white/[0.05] space-y-1">
                <span className="text-[10px] font-mono uppercase text-gray-400">Actual Live Recall (Additive Model)</span>
                <div className="text-2xl font-mono font-black text-amber-300">
                  {actualPercent !== null ? `${actualPercent}%` : 'Calculating...'}
                </div>
                <p className="text-[11px] text-gray-400 leading-snug">
                  Evaluated across {currentN} vector queries via <span className="font-mono text-gray-300">y = W q</span>.
                </p>
              </div>
            </div>

            {/* Pedagogical Takeaway */}
            <div className="text-xs text-gray-300 leading-relaxed pt-1">
              {!isPastCeiling ? (
                <span>
                  <strong className="text-emerald-400">Under Capacity:</strong> At N = {currentN} ≤ 32, random Gaussian unit vectors remain mutually near-orthogonal in ℝ³². The additive accumulator maintains high fidelity without needing an explicit KV cache.
                </span>
              ) : (
                <span>
                  <strong className="text-amber-400">The Memory Cliff:</strong> At N = {currentN} &gt; 32, linear independence is strictly exhausted in ℝ³². Mutual projections create destructive interference that drops recall non-linearly toward zero. Full Attention avoids this only by paying an unbounded <span className="font-mono text-white">O(N · d)</span> memory penalty.
                </span>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
