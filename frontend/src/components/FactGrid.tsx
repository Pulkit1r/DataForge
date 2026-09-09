import React from 'react';
import { ModelEvaluation } from '../api';

interface FactGridProps {
  model: ModelEvaluation;
  nFacts: number;
}

export const FactGrid: React.FC<FactGridProps> = ({ model, nFacts }) => {
  const correctCount = model.correct_per_fact.filter(Boolean).length;
  const failedCount = nFacts - correctCount;

  return (
    <div className="space-y-2 pt-2 border-t border-white/[0.05]">
      {/* Legend & Summary */}
      <div className="flex justify-between items-center text-[11px] font-mono">
        <span className="text-gray-400">Recall Array:</span>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-semibold">
            {correctCount} ✓
          </span>
          {failedCount > 0 && (
            <span className="text-rose-400 font-semibold">
              {failedCount} ✕
            </span>
          )}
        </div>
      </div>

      {/* Grid of Facts */}
      <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg bg-black/50 border border-white/[0.06] max-h-36 overflow-y-auto custom-scrollbar">
        {model.correct_per_fact.map((isCorrect, idx) => (
          <div
            key={idx}
            className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-mono font-bold transition-all select-none ${
              isCorrect
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 shadow-[0_0_5px_rgba(16,185,129,0.15)]'
                : 'bg-rose-950/90 text-rose-300 border border-rose-600/70 shadow-[0_0_5px_rgba(244,63,94,0.25)] ring-1 ring-rose-500/20'
            }`}
            title={`Fact #${idx + 1}: ${
              isCorrect
                ? 'High-Fidelity Recall (Cosine Sim > 0.70)'
                : 'Collision Error (Key Superposition Interference)'
            }`}
          >
            {isCorrect ? idx + 1 : '✕'}
          </div>
        ))}
      </div>
      
      {/* Legend footnote */}
      <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 px-0.5">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-emerald-500/60 border border-emerald-400" /> Correct Recall
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-rose-500/60 border border-rose-400" /> Collision Error
        </span>
      </div>
    </div>
  );
};
