import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CurveData } from '../api';

interface AccuracyChartProps {
  curveData: CurveData | null;
  currentN: number;
}

export function AccuracyChart({ curveData, currentN }: AccuracyChartProps) {
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
      <div className="h-72 flex items-center justify-center text-gray-500 bg-gray-850 rounded-xl border border-gray-800">
        Loading capacity curves...
      </div>
    );
  }

  return (
    <div className="bg-gray-800/90 rounded-xl p-6 border border-gray-700/60 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-gray-100">Exact Retrieval Accuracy vs. Stored Fact Load</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-amber-950/80 text-amber-400 border border-amber-800/80">
              Precomputed / Multi-Seed Simulation
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Averaged over multiple random seeds. Notice the sharp degradation around the orthogonal capacity boundary <strong className="text-amber-400">d = 32</strong>.
          </p>
        </div>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 25, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis 
              dataKey="n" 
              stroke="#9CA3AF" 
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              label={{ value: 'Number of Stored Facts (N)', position: 'insideBottom', offset: -5, fill: '#9CA3AF', fontSize: 11 }}
            />
            <YAxis 
              stroke="#9CA3AF" 
              tick={{ fill: '#9CA3AF', fontSize: 11 }} 
              domain={[0, 100]}
              label={{ value: 'Recall Accuracy (%)', angle: -90, position: 'insideLeft', fill: '#9CA3AF', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#F3F4F6' }}
              itemStyle={{ color: '#F3F4F6', fontSize: '12px' }}
              labelStyle={{ color: '#9CA3AF', fontWeight: 'bold', fontSize: '12px' }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, undefined]}
              labelFormatter={(label) => `Fact Load: N = ${label}`}
            />
            <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }} />

            {/* Capacity Boundary Line */}
            <ReferenceLine 
              x={32} 
              stroke="#F59E0B" 
              strokeDasharray="4 4" 
              strokeWidth={2}
              label={{ value: 'Capacity Limit d=32', fill: '#F59E0B', fontSize: 11, position: 'insideTopLeft' }}
            />

            {/* Current Slider N Indicator */}
            <ReferenceLine 
              x={currentN} 
              stroke="#06B6D4" 
              strokeDasharray="2 2" 
              label={{ value: `Slider: ${currentN}`, fill: '#06B6D4', fontSize: 10, position: 'insideBottomRight' }}
            />

            <Line 
              type="monotone" 
              dataKey="fullAttention" 
              name="Full Attention (KV Cache Baseline)" 
              stroke="#06B6D4" 
              strokeWidth={2.5} 
              dot={{ r: 3 }} 
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              dataKey="additiveFastWeight" 
              name="Fixed Memory (Additive / BDH Analogue)" 
              stroke="#F59E0B" 
              strokeWidth={3} 
              dot={{ r: 3 }} 
              activeDot={{ r: 7 }} 
            />
            <Line 
              type="monotone" 
              dataKey="deltanet" 
              name="DeltaNet (Corrective Delta Rule Contrast)" 
              stroke="#A855F7" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              dot={{ r: 3 }} 
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-gray-900/60 p-3 rounded-lg border border-gray-800">
        <div>
          <span className="text-cyan-400 font-semibold block">Full Attention:</span>
          <span className="text-gray-400">Maintains 100% exact lookup by paying unbounded KV cache growth.</span>
        </div>
        <div>
          <span className="text-amber-400 font-semibold block">Fixed Memory (Additive):</span>
          <span className="text-gray-400">Zero inference growth, but hits the memory cliff once $N &gt; d$.</span>
        </div>
        <div>
          <span className="text-purple-400 font-semibold block">DeltaNet (Delta Rule):</span>
          <span className="text-gray-400">Subtractive error correction dampens key collision interference.</span>
        </div>
      </div>
    </div>
  );
}
