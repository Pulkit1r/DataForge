interface MemorySliderProps {
  currentN: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}

export function MemorySlider({ currentN, onChange, disabled }: MemorySliderProps) {
  const isPastCapacity = currentN > 32;

  return (
    <div className="bg-gray-800/90 p-6 rounded-xl border border-gray-700/60 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
        <div>
          <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">Interactive Fact Load</span>
          <h2 className="text-xl font-bold text-gray-100">Number of Facts to Store & Recall</h2>
          <p className="text-xs text-gray-400 mt-1">
            Drag across the theoretical orthogonal capacity limit <span className="font-mono text-amber-400 font-semibold">(d = 32)</span> to witness memory collision interference.
          </p>
        </div>
        <div className="flex items-baseline gap-2 bg-gray-900/80 px-4 py-2 rounded-lg border border-gray-700/80">
          <span className="text-3xl font-extrabold text-cyan-300 font-mono">{currentN}</span>
          <span className="text-xs text-gray-400 font-medium">/ 96 facts</span>
        </div>
      </div>

      <div className="relative pt-6 pb-2">
        {/* Capacity Boundary Marker */}
        <div 
          className="absolute top-0 flex flex-col items-center -translate-x-1/2 pointer-events-none"
          style={{ left: `${((32 - 1) / (96 - 1)) * 100}%` }}
        >
          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/80">
            d = 32 (Capacity Limit)
          </span>
          <div className="w-0.5 h-3 bg-amber-400 mt-0.5"></div>
        </div>

        <input
          id="memory-slider"
          type="range"
          min="1"
          max="96"
          value={currentN}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          disabled={disabled}
          className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-50"
        />

        <div className="flex justify-between text-[11px] font-mono text-gray-500 mt-2">
          <span>1 (Under capacity)</span>
          <span className="text-amber-400/90 font-semibold">32 (Orthogonal Rank Ceiling)</span>
          <span>96 (Severe Collision)</span>
        </div>
      </div>

      {isPastCapacity && (
        <div className="text-xs text-amber-300/90 bg-amber-950/40 border border-amber-800/50 rounded-lg p-2.5 flex items-center gap-2">
          <span className="text-amber-400 text-sm">⚠</span>
          <span>
            <strong>Capacity Boundary Crossed:</strong> Stored facts ({currentN}) exceed key dimensionality (d = 32). In an additive matrix, non-orthogonal key cross-talk causes catastrophic retrieval interference.
          </span>
        </div>
      )}
    </div>
  );
}
