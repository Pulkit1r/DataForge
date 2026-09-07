import { PredictResponse } from '../api';
import { FactGrid } from './FactGrid';

interface ThreePanelDemoProps {
  predictionData: PredictResponse | null;
  isLoading: boolean;
}

export function ThreePanelDemo({ predictionData, isLoading }: ThreePanelDemoProps) {
  if (!predictionData) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-850 rounded-xl border border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></div>
          <span>Computing live associative recall...</span>
        </div>
      </div>
    );
  }

  const { full_attention, additive_fast_weight, deltanet, n_facts } = predictionData;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-100">Live Architecture Comparison (3 Models)</h2>
          <p className="text-xs text-gray-400">
            Identical synthetic associative memory task evaluated across unbounded vs fixed memory states.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Model 1: Full Attention Baseline */}
        <div className={`bg-gray-800/80 rounded-xl p-5 border border-cyan-700/40 shadow-lg flex flex-col justify-between ${isLoading ? 'opacity-70' : ''}`}>
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 text-[11px] font-semibold rounded border border-cyan-800/60">
                Baseline (100% In-Context)
              </span>
              <span className="text-[10px] font-mono text-cyan-400">O(N·d) storage</span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">{full_attention.name}</h3>
            <p className="text-xs text-gray-400 mb-3">{full_attention.mechanism}</p>

            <div className="flex items-baseline gap-2 mb-4 bg-gray-900/50 p-3 rounded-lg border border-gray-850">
              <span className="text-3xl font-extrabold text-cyan-400 font-mono">
                {(full_attention.accuracy * 100).toFixed(0)}%
              </span>
              <span className="text-xs text-gray-400">Accuracy</span>
            </div>

            <div className="text-xs text-gray-400 mb-4 space-y-1">
              <div className="flex justify-between">
                <span>KV Cache Footprint:</span>
                <strong className="text-gray-200 font-mono">{full_attention.memory_footprint.toLocaleString()} floats</strong>
              </div>
              <div className="text-[11px] text-cyan-400/80 italic">
                Scales linearly with sequence length (unbounded).
              </div>
            </div>
          </div>

          <FactGrid model={full_attention} nFacts={n_facts} />
        </div>

        {/* Model 2: Additive Fast-Weight (BDH Analogue) */}
        <div className={`bg-gray-800/90 rounded-xl p-5 border-2 border-amber-500/60 shadow-xl flex flex-col justify-between relative ${isLoading ? 'opacity-70' : ''}`}>
          <div className="absolute -top-3 left-4 px-2 py-0.5 bg-amber-500 text-gray-950 text-[10px] font-extrabold uppercase rounded shadow tracking-wide">
            Primary Study Model (BDH Analogue)
          </div>

          <div>
            <div className="flex justify-between items-start mb-2 pt-1">
              <span className="px-2 py-0.5 bg-amber-950/80 text-amber-300 text-[11px] font-semibold rounded border border-amber-700/60">
                Fixed Memory (Hebbian)
              </span>
              <span className="text-[10px] font-mono text-amber-400">O(1) storage</span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">{additive_fast_weight.name}</h3>
            <p className="text-xs text-amber-300/80 font-mono mb-3">{additive_fast_weight.mechanism}</p>

            <div className="flex items-baseline gap-2 mb-4 bg-gray-900/50 p-3 rounded-lg border border-gray-850">
              <span className={`text-3xl font-extrabold font-mono ${additive_fast_weight.accuracy < 0.70 ? 'text-rose-400' : 'text-amber-400'}`}>
                {(additive_fast_weight.accuracy * 100).toFixed(0)}%
              </span>
              <span className="text-xs text-gray-400">Accuracy</span>
            </div>

            <div className="text-xs text-gray-400 mb-4 space-y-1">
              <div className="flex justify-between">
                <span>Fast-Weight Matrix Footprint:</span>
                <strong className="text-gray-200 font-mono">{additive_fast_weight.memory_footprint.toLocaleString()} floats</strong>
              </div>
              <div className="text-[11px] text-amber-400/80 italic">
                Strictly constant 32×32 state matrix.
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <FactGrid model={additive_fast_weight} nFacts={n_facts} />
            <div className="text-[10px] text-gray-400 bg-gray-900/80 p-2 rounded border border-gray-800">
              {additive_fast_weight.labeling}
            </div>
          </div>
        </div>

        {/* Model 3: DeltaNet Corrective Contrast */}
        <div className={`bg-gray-800/80 rounded-xl p-5 border border-purple-700/40 shadow-lg flex flex-col justify-between ${isLoading ? 'opacity-70' : ''}`}>
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="px-2 py-0.5 bg-purple-950 text-purple-300 text-[11px] font-semibold rounded border border-purple-800/60">
                Delta Rule Contrast
              </span>
              <span className="text-[10px] font-mono text-purple-400">O(1) storage</span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">{deltanet.name}</h3>
            <p className="text-xs text-gray-400 mb-3">{deltanet.mechanism}</p>

            <div className="flex items-baseline gap-2 mb-4 bg-gray-900/50 p-3 rounded-lg border border-gray-850">
              <span className="text-3xl font-extrabold text-purple-400 font-mono">
                {(deltanet.accuracy * 100).toFixed(0)}%
              </span>
              <span className="text-xs text-gray-400">Accuracy</span>
            </div>

            <div className="text-xs text-gray-400 mb-4 space-y-1">
              <div className="flex justify-between">
                <span>State Matrix Footprint:</span>
                <strong className="text-gray-200 font-mono">{deltanet.memory_footprint.toLocaleString()} floats</strong>
              </div>
              <div className="text-[11px] text-purple-400/80 italic">
                Constant 32×32 matrix with error subtraction.
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <FactGrid model={deltanet} nFacts={n_facts} />
            <div className="text-[10px] text-gray-400 bg-gray-900/80 p-2 rounded border border-gray-800">
              {deltanet.labeling}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
