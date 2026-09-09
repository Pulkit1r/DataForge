import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { CurveData } from '../api';

interface AccuracyChartProps {
  curveData: CurveData | null;
  currentN: number;
}

export const AccuracyChart: React.FC<AccuracyChartProps> = ({ curveData, currentN }) => {
  const chartData = useMemo(() => {
    if (!curveData) return [];
    return curveData.n_values.map((n, i) => ({
      n,
      fullAttention: curveData.full_attention_accuracy[i] * 100,
      additiveFastWeight: curveData.additive_fast_weight_accuracy[i] * 100,
      deltanet: curveData.deltanet_accuracy[i] * 100,
    }));
  }, [curveData]);

  if (!curveData) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-[#0e0e17]/90 p-8 flex items-center justify-center text-gray-400">
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="w-4 h-4 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
          <span>Loading precomputed multi-seed capacity curves...</span>
        </div>
      </div>
    );
  }

  return (
    <section id="section-curve" className="scroll-mt-20">
      <div className="rounded-2xl border border-white/[0.07] bg-[#0e0e17]/90 p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b border-white/[0.06] pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 bg-violet-950/50 border border-violet-800/40 px-2.5 py-0.5 rounded-full">
                Track 06 · Multi-Seed Simulation
              </span>
              {/* Mandatory Persistent Precomputed Badge */}
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-950/70 text-amber-300 border border-amber-800/70 shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                PRECOMPUTED / MULTI-SEED SIMULATION
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Exact Retrieval Accuracy vs. Stored Fact Load (N)
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
              Averaged over 5 independent random seeds across <span className="font-mono text-gray-300">N ∈ [1, 96]</span>. 
              Notice the abrupt degradation as fact load crosses the orthogonal capacity limit <span className="font-mono text-amber-400 font-semibold">d = 32</span>.
            </p>
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div className="relative rounded-xl border border-white/[0.06] bg-[#131320]/60 p-4 sm:p-5">
          
          {/* Floating In-Chart Provenance Watermark */}
          <div className="absolute top-3 right-4 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 bg-black/60 border border-white/[0.06] px-2.5 py-1 rounded-full text-[10px] font-mono text-gray-400 backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>N ∈ [1, 96] · 5 SEEDS AVERAGED</span>
          </div>

          <div className="h-[340px] sm:h-[380px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 15, right: 25, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232338" vertical={false} />
                <XAxis
                  dataKey="n"
                  stroke="#6b7280"
                  tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}
                  label={{
                    value: 'Number of Stored Facts (N)',
                    position: 'insideBottom',
                    offset: -5,
                    fill: '#9ca3af',
                    fontSize: 11,
                    fontFamily: 'monospace',
                  }}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}
                  domain={[0, 100]}
                  label={{
                    value: 'Exact Recall (%)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 15,
                    fill: '#9ca3af',
                    fontSize: 11,
                    fontFamily: 'monospace',
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0e0e17',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    color: '#f3f4f6',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                  }}
                  itemStyle={{ fontSize: '11px' }}
                  labelStyle={{ color: '#c4b5fd', fontWeight: 'bold', marginBottom: '4px' }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, undefined]}
                  labelFormatter={(label) => `Fact Load: N = ${label} (Capacity d = 32)`}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: '16px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />

                {/* Capacity Limit Marker Line (d = 32) */}
                <ReferenceLine
                  x={32}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: 'Capacity Limit d=32',
                    fill: '#f59e0b',
                    fontSize: 11,
                    fontFamily: 'monospace',
                    position: 'insideTopLeft',
                  }}
                />

                {/* Current Active Slider Line */}
                <ReferenceLine
                  x={currentN}
                  stroke="#8b5cf6"
                  strokeDasharray="2 2"
                  strokeWidth={1.5}
                  label={{
                    value: `Active N = ${currentN}`,
                    fill: '#a78bfa',
                    fontSize: 10,
                    fontFamily: 'monospace',
                    position: 'insideBottomRight',
                  }}
                />

                {/* Model 1: Full Attention Baseline */}
                <Line
                  type="monotone"
                  dataKey="fullAttention"
                  name="Full Attention (KV Cache Baseline)"
                  stroke="#f3f4f6"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: '#f3f4f6' }}
                  activeDot={{ r: 5 }}
                />

                {/* Model 2: Fixed Memory (Primary BDH Analogue) */}
                <Line
                  type="monotone"
                  dataKey="additiveFastWeight"
                  name="Fixed Memory (Additive / BDH Analogue)"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#8b5cf6' }}
                  activeDot={{ r: 6, fill: '#c4b5fd' }}
                />

                {/* Model 3: DeltaNet Contrast */}
                <Line
                  type="monotone"
                  dataKey="deltanet"
                  name="DeltaNet (Corrective Delta Rule Contrast)"
                  stroke="#2dd4bf"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 2.5, fill: '#2dd4bf' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3 Comparative Analysis Footnotes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          <div className="p-3.5 rounded-xl border border-white/[0.05] bg-[#131320]/60 space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-gray-300 block">
              Full Attention Line (White)
            </span>
            <p className="text-xs text-gray-400 leading-relaxed font-normal">
              Maintains steady 100% recall across all N by storing explicit keys and values, paying an unbounded <span className="font-mono text-gray-300">O(N·d)</span> memory cost.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-violet-900/40 bg-violet-950/20 space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-violet-300 block">
              Fixed Memory Line (Violet)
            </span>
            <p className="text-xs text-gray-400 leading-relaxed font-normal">
              High fidelity for <span className="font-mono text-violet-300">N ≤ 32</span> with zero per-fact storage growth. Drops toward zero past capacity due to key-collision cross-talk.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-teal-900/40 bg-teal-950/20 space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-teal-300 block">
              DeltaNet Line (Teal Dashed)
            </span>
            <p className="text-xs text-gray-400 leading-relaxed font-normal">
              Subtractive prediction error correction dampens cross-talk, sustaining higher retention past <span className="font-mono text-teal-300">d = 32</span> than uncorrected additive states.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
