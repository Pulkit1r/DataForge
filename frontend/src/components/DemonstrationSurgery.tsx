import { useState } from 'react';
import { PredictResponse } from '../api';

interface DemonstrationSurgeryProps {
  nPairs: number;
  originalData: PredictResponse | null;
  surgeryData: PredictResponse | null;
  onSurgery: (type: 'remove' | 'corrupt', index: number) => void;
  isLoading: boolean;
}

export function DemonstrationSurgery({ nPairs, originalData, surgeryData, onSurgery, isLoading }: DemonstrationSurgeryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  if (selectedIndex >= nPairs && nPairs > 0) {
    setSelectedIndex(0);
  }

  const handleRemove = () => onSurgery('remove', selectedIndex);
  const handleCorrupt = () => onSurgery('corrupt', selectedIndex);

  return (
    <div className="bg-gray-800/90 rounded-xl p-6 border border-gray-700/60 shadow-xl space-y-6">
      <div>
        <span className="text-xs font-semibold tracking-wider text-rose-400 uppercase">Interference Inspection</span>
        <h3 className="text-xl font-bold text-gray-100">Demonstration Surgery: Isolated Fact Alteration</h3>
        <p className="text-xs text-gray-400 mt-1">
          Select a memorized fact slot and surgically remove its key or corrupt its target value. 
          Observe how the change propagates differently through unbounded KV caches vs. entangled fast-weight states.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-end bg-gray-900/60 p-4 rounded-lg border border-gray-800">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Target Fact Index</label>
          <select 
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(parseInt(e.target.value, 10))}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-36 p-2 font-mono"
          >
            {Array.from({ length: Math.min(nPairs, 96) }).map((_, i) => (
              <option key={i} value={i}>Fact #{i + 1}</option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={handleRemove}
          disabled={isLoading}
          className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-xs font-semibold rounded-lg border border-rose-800/60 transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <span>✂</span> Remove Fact Key
        </button>
        
        <button 
          onClick={handleCorrupt}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-950/80 hover:bg-purple-900 text-purple-200 text-xs font-semibold rounded-lg border border-purple-800/60 transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <span>⚡</span> Corrupt Fact Value
        </button>
      </div>

      {surgeryData && originalData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Full Attention Impact */}
          <div className="bg-gray-900/60 rounded-lg p-4 border border-cyan-800/40">
            <h4 className="text-cyan-400 font-semibold text-xs mb-2 uppercase tracking-wide">Full Attention Impact</h4>
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <div className="text-center">
                <div className="text-[10px] text-gray-500">Before</div>
                <div className="text-lg font-mono font-bold">{(originalData.full_attention.accuracy * 100).toFixed(0)}%</div>
              </div>
              <div className="text-gray-500">&rarr;</div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500">After</div>
                <div className="text-lg font-mono font-bold text-cyan-300">{(surgeryData.full_attention.accuracy * 100).toFixed(0)}%</div>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              Isolated alteration: only the target slot is affected with zero spillover to other slots.
            </p>
          </div>

          {/* Additive Fast-Weight Impact */}
          <div className="bg-gray-900/60 rounded-lg p-4 border border-amber-800/40">
            <h4 className="text-amber-400 font-semibold text-xs mb-2 uppercase tracking-wide">Fixed Memory (Additive) Impact</h4>
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <div className="text-center">
                <div className="text-[10px] text-gray-500">Before</div>
                <div className="text-lg font-mono font-bold">{(originalData.additive_fast_weight.accuracy * 100).toFixed(0)}%</div>
              </div>
              <div className="text-gray-500">&rarr;</div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500">After</div>
                <div className="text-lg font-mono font-bold text-amber-300">{(surgeryData.additive_fast_weight.accuracy * 100).toFixed(0)}%</div>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              Shared state matrix: altering one outer product adjusts the superimposed energy landscape.
            </p>
          </div>

          {/* DeltaNet Impact */}
          <div className="bg-gray-900/60 rounded-lg p-4 border border-purple-800/40">
            <h4 className="text-purple-400 font-semibold text-xs mb-2 uppercase tracking-wide">DeltaNet (Delta Rule) Impact</h4>
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <div className="text-center">
                <div className="text-[10px] text-gray-500">Before</div>
                <div className="text-lg font-mono font-bold">{(originalData.deltanet.accuracy * 100).toFixed(0)}%</div>
              </div>
              <div className="text-gray-500">&rarr;</div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500">After</div>
                <div className="text-lg font-mono font-bold text-purple-300">{(surgeryData.deltanet.accuracy * 100).toFixed(0)}%</div>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              Corrective updates recalculate subsequent states based on current prediction residual.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
