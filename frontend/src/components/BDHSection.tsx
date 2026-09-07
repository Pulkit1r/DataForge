import { useState } from 'react';

export function BDHSection() {
  const [viewMode, setViewMode] = useState<'matrix' | 'biological'>('biological');

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-8 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-5">
        <div>
          <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">Interactive Bridge</span>
          <h2 className="text-2xl font-extrabold text-gray-100">
            The BDH Connection: Fast Weights as Biological Synaptic Plasticity
          </h2>
        </div>

        {/* View mode toggle */}
        <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-700">
          <button
            onClick={() => setViewMode('biological')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'biological'
                ? 'bg-amber-500 text-gray-950 shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            🧠 Biological / BDH Framing
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'matrix'
                ? 'bg-cyan-500 text-gray-950 shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            💻 Matrix Fast-Weight Framing
          </button>
        </div>
      </div>

      {/* Dynamic Equation Card */}
      <div className="bg-gray-850/90 rounded-xl p-6 border border-gray-700/60 shadow-inner">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-mono text-gray-400 uppercase font-semibold">
            {viewMode === 'biological' ? 'Primary BDH Synaptic Update' : 'Linear Attention State Update'}
          </span>
          <span className="text-[11px] font-mono text-amber-400/90 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
            arXiv:2509.26507
          </span>
        </div>

        <div className="py-4 text-center font-mono text-xl sm:text-2xl font-bold text-gray-100 bg-gray-950/80 rounded-lg border border-gray-800 tracking-wider">
          {viewMode === 'biological' ? (
            <span>
              W<sub>t</sub> = W<sub>t-1</sub> + &eta; &middot; (y<sub>post</sub> &otimes; x<sub>pre</sub>)
            </span>
          ) : (
            <span>
              S<sub>t</sub> = S<sub>t-1</sub> + v<sub>t</sub> &otimes; k<sub>t</sub><sup>T</sup>
            </span>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-3 text-center italic">
          {viewMode === 'biological'
            ? 'Correlation-based Hebbian synaptic weight adjustment: neurons that fire together wire together with zero subtractive error correction.'
            : 'Additive outer-product write into a constant-size fast-weight recurrent state matrix.'}
        </p>
      </div>

      {/* Core Scholarly Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
        <div className="bg-gray-900/60 p-5 rounded-lg border border-gray-800 space-y-2">
          <h4 className="text-amber-300 font-semibold flex items-center gap-1.5">
            <span>⚡</span> Hebbian Plasticity & Additive Accumulation
          </h4>
          <p className="text-xs leading-relaxed text-gray-400">
            In <em>The Dragon Hatchling</em> (arXiv:2509.26507), attention is reformulated as a biological synaptic memory. 
            The write rule is strictly <strong>additive and correlation-based</strong> (outer product of post- and pre-synaptic activations). 
            Our <strong>Fixed Memory</strong> model provides a transparent, isolated implementation of this exact additive mechanism.
          </p>
          <div className="text-[11px] text-amber-400/80 pt-2 font-mono">
            Direct Link: BDH-CQ technical report confirms demonstration memory accumulates additively per exemplar.
          </div>
        </div>

        <div className="bg-gray-900/60 p-5 rounded-lg border border-gray-800 space-y-2">
          <h4 className="text-cyan-300 font-semibold flex items-center gap-1.5">
            <span>🛡</span> Why DeltaNet is NOT the BDH Stand-In
          </h4>
          <p className="text-xs leading-relaxed text-gray-400">
            Yang, Kautz, & Hatamizadeh (2024, arXiv:2412.06464) show that additive associative states suffer catastrophic collision once fact count exceeds matrix rank. 
            DeltaNet introduces a <strong>subtractive corrective error term</strong>: <code className="text-purple-300">W &larr; W + &beta;(v - Wk)k<sup>T</sup></code>. 
            Because BDH relies on pure Hebbian strengthening without negative error back-projection, conflating DeltaNet with BDH would violate technical correctness.
          </p>
        </div>
      </div>

      {/* Academic Citation Block */}
      <div className="bg-gray-950/70 p-4 rounded-lg border border-gray-800/80 text-xs space-y-2">
        <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px] block">
          Primary Literature Supporting the Interactive Claim:
        </span>
        <ul className="list-disc pl-5 space-y-1 text-gray-400 text-[11px]">
          <li>
            <strong className="text-gray-300">Primary BDH Paper:</strong> <em>The Dragon Hatchling: The Missing Link between the Transformer and Models of the Brain</em> (arXiv:2509.26507) — Attention as synaptic memory.
          </li>
          <li>
            <strong className="text-gray-300">Delta Networks:</strong> Yang et al. (2024, arXiv:2412.06464) — <em>Gated Delta Networks: Improving Mamba2 with Delta Rule</em> (Collision failure and the delta fix).
          </li>
          <li>
            <strong className="text-gray-300">Linear Attention Capacity Tradeoff:</strong> Arora et al. (2024, arXiv:2402.18668) — <em>Simple linear attention language models balance the recall-throughput tradeoff</em> ("Based").
          </li>
          <li>
            <strong className="text-gray-300">Collapse Dynamics:</strong> <em>Variational Linear Attention: Stable Associative Memory for Long-Context Transformers</em> (arXiv:2605.11196) — Documents degradation curve past dimension $d$.
          </li>
        </ul>
      </div>
    </div>
  );
}
