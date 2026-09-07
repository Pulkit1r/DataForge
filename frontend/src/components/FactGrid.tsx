import { ModelEvaluation } from '../api';

interface FactGridProps {
  model: ModelEvaluation;
  nFacts: number;
}

export function FactGrid({ model, nFacts }: FactGridProps) {
  const correctCount = model.correct_per_fact.filter(Boolean).length;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-400 font-medium">Per-Fact Recall Breakdown:</span>
        <span className="font-mono text-gray-300">
          <strong className="text-emerald-400">{correctCount}</strong> / {nFacts} retrieved
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-gray-950/70 border border-gray-800/80 max-h-40 overflow-y-auto custom-scrollbar">
        {model.correct_per_fact.map((isCorrect, idx) => (
          <div
            key={idx}
            className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
              isCorrect
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-500/25 text-rose-300 border border-rose-500/50 scale-95'
            }`}
            title={`Fact #${idx + 1}: ${isCorrect ? 'Correct Recall (Cosine Sim > 0.70)' : 'Collision Error (Key Interference)'}`}
          >
            {idx + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
