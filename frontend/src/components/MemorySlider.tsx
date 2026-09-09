import React from 'react';

interface MemorySliderProps {
  currentN: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}

export const MemorySlider: React.FC<MemorySliderProps> = ({ currentN, onChange, disabled }) => {
  const isPastCapacity = currentN > 32;

  const presets = [
    { n: 8, label: 'N = 8 (Under Capacity)' },
    { n: 32, label: 'N = 32 (Orthogonal Ceiling)' },
    { n: 48, label: 'N = 48 (Degradation Zone)' },
    { n: 96, label: 'N = 96 (Saturated Collision)' },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0e0e17]/90 p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/[0.06] pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 bg-violet-950/50 border border-violet-800/40 px-2.5 py-0.5 rounded-full">
              Track 03 · Continuous Parameter · Free Sandbox
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
              Live PyTorch Control
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Interactive Fact Load Parameter (N)
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl leading-relaxed">
            Drag across the theoretical orthogonal capacity limit <span className="font-mono text-amber-400 font-semibold">(d = 32)</span> to witness tensor saturation and key collision interference.
          </p>
        </div>

        {/* Big Counter Badge */}
        <div className="flex items-baseline gap-2 bg-[#131320] px-5 py-2.5 rounded-xl border border-white/[0.08] shadow-inner">
          <span className="text-3xl sm:text-4xl font-extrabold text-violet-300 font-mono tracking-tight">
            {currentN}
          </span>
          <span className="text-xs text-gray-400 font-mono">/ 96 facts</span>
        </div>
      </div>

      {/* Slider Track with Capacity Boundary Pin */}
      <div className="relative pt-8 pb-3 px-1">
        {/* Capacity Boundary Marker (d = 32) */}
        <div
          className="absolute top-0 flex flex-col items-center -translate-x-1/2 pointer-events-none z-10"
          style={{ left: `${((32 - 1) / (96 - 1)) * 100}%` }}
        >
          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/90 px-2 py-0.5 rounded border border-amber-800/80 shadow-md">
            d = 32 (Rank Ceiling)
          </span>
          <div className="w-0.5 h-4 bg-amber-400 mt-0.5 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
        </div>

        {/* The Range Input */}
        <input
          id="memory-slider"
          type="range"
          min="1"
          max="96"
          value={currentN}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          disabled={disabled}
          className="w-full h-3.5 bg-[#1a1a2c] rounded-lg appearance-none cursor-pointer accent-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        />

        {/* Milestone Labels */}
        <div className="flex justify-between text-[11px] font-mono text-gray-400 mt-2 px-0.5">
          <span>1 (Under Capacity)</span>
          <span className="text-amber-400/90 font-semibold">32 (Orthogonal Limit)</span>
          <span>96 (Severe Collision)</span>
        </div>
      </div>

      {/* Quick Jump Presets */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mr-1">
          Quick Presets:
        </span>
        {presets.map((p) => (
          <button
            key={p.n}
            onClick={() => onChange(p.n)}
            disabled={disabled}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              currentN === p.n
                ? 'bg-violet-950/80 border border-violet-500 text-violet-200 shadow-[0_0_10px_rgba(139,92,246,0.2)]'
                : 'bg-[#131320] border border-white/[0.06] text-gray-400 hover:text-gray-200 hover:border-white/[0.12]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Capacity Warning Banner */}
      {isPastCapacity && (
        <div className="text-xs text-amber-300/90 bg-amber-950/30 border border-amber-800/50 rounded-xl p-3.5 flex items-center gap-3 animate-in fade-in duration-200">
          <span className="text-amber-400 text-base font-bold">⚠</span>
          <div className="leading-relaxed">
            <strong className="text-amber-300">Orthogonal Capacity Ceiling Crossed (N = {currentN} &gt; d = 32):</strong> In a fixed matrix state, storing more than 32 unit vectors forces linear dependence. Mutual vector projections generate catastrophic destructive cross-talk during readout ($y = W q$).
          </div>
        </div>
      )}

    </div>
  );
};
