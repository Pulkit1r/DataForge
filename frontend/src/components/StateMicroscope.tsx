import React, { useState, useEffect, useMemo, useRef } from 'react';

interface StateMicroscopeProps {
  stateMatrix?: number[][];
  stateSteps?: number[][][];
  nPairs: number;
}

export const StateMicroscope: React.FC<StateMicroscopeProps> = ({
  stateMatrix,
  stateSteps,
  nPairs,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number; val: number } | null>(null);
  const playIntervalRef = useRef<number | null>(null);

  // Initialize / reset step to final when new facts or steps arrive
  useEffect(() => {
    if (stateSteps && stateSteps.length > 0) {
      setCurrentStep(stateSteps.length - 1);
    } else {
      setCurrentStep(-1);
    }
    setIsPlaying(false);
  }, [stateSteps, nPairs]);

  // Autoplay loop
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = window.setInterval(() => {
        setCurrentStep((prev) => {
          if (!stateSteps || stateSteps.length === 0) return 0;
          if (prev >= stateSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 250);
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, stateSteps]);

  const activeMatrix = useMemo(() => {
    if (stateSteps && stateSteps.length > 0 && currentStep >= 0 && currentStep < stateSteps.length) {
      return stateSteps[currentStep];
    }
    return stateMatrix || null;
  }, [stateMatrix, stateSteps, currentStep]);

  // Compute live matrix statistics
  const stats = useMemo(() => {
    if (!activeMatrix || activeMatrix.length === 0) {
      return { frobenius: 0, maxAbs: 1, mean: 0, nonZeroPct: 0 };
    }
    let sumSq = 0;
    let maxAbs = 0.0001;
    let sum = 0;
    let nonZero = 0;
    const rows = activeMatrix.length;
    const cols = activeMatrix[0]?.length || 0;
    const total = rows * cols;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = activeMatrix[r][c];
        sumSq += v * v;
        const absV = Math.abs(v);
        if (absV > maxAbs) maxAbs = absV;
        if (absV > 1e-4) nonZero++;
        sum += v;
      }
    }

    return {
      frobenius: Math.sqrt(sumSq),
      maxAbs,
      mean: total > 0 ? sum / total : 0,
      nonZeroPct: total > 0 ? (nonZero / total) * 100 : 0,
    };
  }, [activeMatrix]);

  if (!stateMatrix && (!stateSteps || stateSteps.length === 0)) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-[#0e0e17]/90 p-8 text-center text-gray-400 font-mono text-xs">
        <div className="flex items-center justify-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
          <span>Awaiting live PyTorch accumulator state tensor...</span>
        </div>
      </div>
    );
  }

  const numSteps = stateSteps?.length || nPairs;
  const isFinal = currentStep === numSteps - 1;
  const matrixDim = activeMatrix?.length || 32;

  // Color mapper: Diverging Cyan (negative) -> Dark Base (near 0) -> Electric Violet (positive)
  const getCellColor = (val: number, maxAbs: number) => {
    const norm = Math.max(-1, Math.min(1, val / maxAbs)); // -1 to +1
    if (Math.abs(norm) < 0.02) {
      return '#12121c'; // Neutral baseline
    }
    if (norm > 0) {
      // Positive: interpolate towards #a855f7 / #8b5cf6
      const alpha = Math.min(1, 0.15 + 0.85 * Math.pow(norm, 0.85));
      return `rgba(139, 92, 246, ${alpha.toFixed(2)})`;
    } else {
      // Negative: interpolate towards Cyan #14b8a6
      const alpha = Math.min(1, 0.15 + 0.85 * Math.pow(Math.abs(norm), 0.85));
      return `rgba(20, 184, 166, ${alpha.toFixed(2)})`;
    }
  };

  return (
    <section id="section-microscope" className="scroll-mt-20">
      <div className="rounded-2xl border border-white/[0.07] bg-[#0e0e17]/90 p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b border-white/[0.06] pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 bg-violet-950/50 border border-violet-800/40 px-2.5 py-0.5 rounded-full">
                Track 07 · Mechanistic Inspection
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-violet-950/70 text-violet-300 border border-violet-700/60 shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                LIVE PYTORCH TENSOR
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              State Microscope: Inside the {matrixDim}×{matrixDim} Accumulator Matrix
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
              Model B updates its associative fast-weight memory via outer products:{' '}
              <span className="font-mono text-violet-300 font-medium">W_t = W_{'{t-1}'} + v_t k_t^T</span>.
              Watch the {matrixDim * matrixDim} float32 weights saturate as each fact is written.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-gray-400 bg-[#131320] border border-white/[0.06] px-3 py-1.5 rounded-xl self-start sm:self-auto">
            <span className="text-gray-500">Shape:</span>
            <span className="text-white font-semibold">{matrixDim} × {matrixDim}</span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-500">Weights:</span>
            <span className="text-violet-300 font-semibold">{matrixDim * matrixDim}</span>
          </div>
        </div>

        {/* Main Grid & Telemetry Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left / Center: Heatmap Visualization */}
          <div className="lg:col-span-7 flex flex-col items-center rounded-xl border border-white/[0.06] bg-[#131320]/60 p-5 space-y-4">
            
            <div className="w-full flex items-center justify-between text-[11px] font-mono text-gray-400 pb-2 border-b border-white/[0.04]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                <span>Memory Tensor <code className="text-violet-300">W_t ∈ ℝ^{'{32×32}'}</code></span>
              </span>
              <span className="text-gray-500 hidden sm:inline">
                Hover cells to inspect values
              </span>
            </div>

            {/* Matrix Container */}
            <div className="overflow-x-auto max-w-full p-2 flex justify-center">
              {activeMatrix && (
                <div 
                  className="grid gap-[2px] bg-[#0a0a10] border border-white/[0.08] p-2 rounded-lg shadow-inner"
                  style={{
                    gridTemplateColumns: `repeat(${matrixDim}, minmax(0, 1fr))`,
                    width: 'fit-content'
                  }}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  {activeMatrix.map((row, rIdx) =>
                    row.map((val, cIdx) => (
                      <div
                        key={`cell-${rIdx}-${cIdx}`}
                        className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-[1px] transition-all duration-75 cursor-crosshair hover:scale-150 hover:z-20 hover:ring-2 hover:ring-white hover:shadow-lg"
                        style={{ backgroundColor: getCellColor(val, stats.maxAbs) }}
                        onMouseEnter={() => setHoveredCell({ row: rIdx, col: cIdx, val })}
                      />
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Heatmap Legend */}
            <div className="w-full flex items-center justify-between font-mono text-[10px] text-gray-400 pt-2 border-t border-white/[0.04]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[1px] bg-teal-500" />
                <span>Negative (v &lt; 0)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[1px] bg-[#12121c] border border-white/20" />
                <span>Zero (0.0)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[1px] bg-violet-500" />
                <span>Positive (v &gt; 0)</span>
              </div>
            </div>

            {/* Live Hover Inspection Banner */}
            <div className="w-full min-h-[36px] flex items-center justify-center font-mono text-xs rounded-lg bg-black/40 border border-white/[0.04] px-4 py-2 text-gray-300">
              {hoveredCell ? (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <span>
                    Coordinate: <span className="text-violet-300 font-semibold">Row {hoveredCell.row}, Col {hoveredCell.col}</span>
                  </span>
                  <span className="text-gray-600">·</span>
                  <span>
                    Weight: <span className={`font-semibold ${hoveredCell.val >= 0 ? 'text-violet-400' : 'text-teal-400'}`}>{hoveredCell.val.toFixed(5)}</span>
                  </span>
                  <span className="text-gray-600">·</span>
                  <span className="text-gray-400 text-[11px]">
                    Relative: {((hoveredCell.val / stats.maxAbs) * 100).toFixed(0)}% max
                  </span>
                </div>
              ) : (
                <span className="text-gray-500 text-[11px]">
                  Hover over any synaptic cell in the matrix to inspect weight amplitude W_{'{ij}'}
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Step Scrubber & Mathematical Telemetry */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Playback & Step Controller */}
            <div className="rounded-xl border border-white/[0.06] bg-[#131320]/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400">
                  Step-by-Step Writing Scrubber
                </h4>
                <span className="text-xs font-mono font-semibold text-violet-300 bg-violet-950/60 border border-violet-800/40 px-2 py-0.5 rounded">
                  {isFinal ? `Final State (t = ${numSteps})` : `Step t = ${currentStep + 1} / ${numSteps}`}
                </span>
              </div>

              {/* Scrubber Range Slider */}
              <div className="space-y-1.5">
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, numSteps - 1)}
                  value={currentStep >= 0 ? currentStep : 0}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCurrentStep(parseInt(e.target.value, 10));
                  }}
                  className="w-full h-1.5 bg-[#0a0a10] rounded-lg appearance-none cursor-pointer accent-violet-500 hover:accent-violet-400 transition-all"
                />
                <div className="flex justify-between font-mono text-[10px] text-gray-500">
                  <span>t = 1 (First fact)</span>
                  <span className={currentStep === 31 ? 'text-amber-400 font-bold' : ''}>
                    t = 32 (Rank limit)
                  </span>
                  <span>t = {numSteps} (Current N)</span>
                </div>
              </div>

              {/* Scrubber Transport Controls */}
              <div className="flex items-center justify-between pt-1 gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStep(0);
                    }}
                    disabled={currentStep <= 0}
                    className="px-2.5 py-1.5 rounded-lg bg-[#0e0e17] border border-white/[0.08] text-gray-300 hover:text-white hover:border-violet-500/50 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs transition-colors"
                    title="Rewind to Step 1"
                  >
                    ⏮
                  </button>
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStep((prev) => Math.max(0, prev - 1));
                    }}
                    disabled={currentStep <= 0}
                    className="px-3 py-1.5 rounded-lg bg-[#0e0e17] border border-white/[0.08] text-gray-300 hover:text-white hover:border-violet-500/50 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs transition-colors"
                    title="Previous Step"
                  >
                    ◀ Prev
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-semibold shadow-lg shadow-violet-600/20 transition-all flex items-center gap-1"
                  >
                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                  </button>
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStep((prev) => Math.min(numSteps - 1, prev + 1));
                    }}
                    disabled={currentStep >= numSteps - 1}
                    className="px-3 py-1.5 rounded-lg bg-[#0e0e17] border border-white/[0.08] text-gray-300 hover:text-white hover:border-violet-500/50 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs transition-colors"
                    title="Next Step"
                  >
                    Next ▶
                  </button>
                </div>

                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStep(numSteps - 1);
                  }}
                  disabled={currentStep === numSteps - 1}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0e0e17] border border-white/[0.08] text-violet-400 hover:text-violet-300 hover:border-violet-500/50 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs transition-colors"
                  title="Fast forward to final accumulated state"
                >
                  Final ⏭
                </button>
              </div>
            </div>

            {/* Live Numerical Telemetry */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* Frobenius Norm */}
              <div className="rounded-xl border border-white/[0.06] bg-[#131320]/60 p-4 space-y-1">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                  Frobenius Norm ||W||_F
                </span>
                <div className="text-xl font-bold font-mono text-white flex items-baseline gap-1.5">
                  <span>{stats.frobenius.toFixed(3)}</span>
                  <span className="text-[10px] text-gray-500 font-normal">
                    ≈ √{(stats.frobenius * stats.frobenius).toFixed(1)}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight">
                  Grows as ~√t under orthogonal key inputs.
                </p>
              </div>

              {/* Peak Absolute Weight */}
              <div className="rounded-xl border border-white/[0.06] bg-[#131320]/60 p-4 space-y-1">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                  Peak Absolute Weight
                </span>
                <div className="text-xl font-bold font-mono text-violet-300 flex items-baseline gap-1.5">
                  <span>{stats.maxAbs.toFixed(4)}</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight">
                  Maximum single synaptic strength in tensor.
                </p>
              </div>

              {/* Effective Rank Capacity */}
              <div className="rounded-xl border border-white/[0.06] bg-[#131320]/60 p-4 space-y-1">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                  Max Theoretical Rank
                </span>
                <div className="text-xl font-bold font-mono text-amber-300 flex items-baseline gap-1.5">
                  <span>d = {matrixDim}</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight">
                  Upper bound on linearly independent key projections.
                </p>
              </div>

              {/* Constant Footprint */}
              <div className="rounded-xl border border-white/[0.06] bg-[#131320]/60 p-4 space-y-1">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                  Hardware Memory
                </span>
                <div className="text-xl font-bold font-mono text-emerald-400 flex items-baseline gap-1.5">
                  <span>4.0 KB</span>
                  <span className="text-[10px] text-gray-500 font-normal">O(1)</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight">
                  Constant 1,024 float32 values regardless of sequence length.
                </p>
              </div>
            </div>

            {/* Mechanistic Insight Callout */}
            <div className="rounded-xl border border-violet-800/30 bg-violet-950/20 p-4 text-xs text-gray-300 space-y-1.5">
              <div className="font-semibold text-violet-300 flex items-center gap-1.5">
                <span>💡 The Overwrite Mechanism</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Notice that as <span className="font-mono text-gray-300">t &gt; 32</span>, new facts do not expand the matrix. 
                Instead, each outer product <span className="font-mono text-violet-300">v_t ⊗ k_t</span> adds directly onto occupied synaptic coordinates, 
                introducing cross-talk interference that blurs previously stored facts.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

