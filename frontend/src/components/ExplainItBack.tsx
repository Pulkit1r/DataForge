import React, { useState, useEffect, useMemo } from 'react';

export const ExplainItBack: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({
    rank: false,
    crosstalk: false,
    buffer: false,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('memoryCliff_explain');
    if (stored) setText(stored);
  }, []);

  // Debounced auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('memoryCliff_explain', text);
      if (text.trim().length > 0) {
        setIsSaved(true);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [text]);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
    const chars = text.length;
    return { words, chars };
  }, [text]);

  const handlePromptClick = (prompt: string) => {
    setText((prev) => {
      if (!prev.trim()) return prompt;
      return `${prev}\n\n${prompt}`;
    });
    setIsSaved(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (window.confirm('Clear your written explanation? This cannot be undone.')) {
      setText('');
      localStorage.removeItem('memoryCliff_explain');
      setIsSaved(false);
    }
  };

  const toggleCheck = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section id="section-synthesis" className="scroll-mt-20">
      <div className="rounded-2xl border border-white/[0.07] bg-[#0e0e17]/90 p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b border-white/[0.06] pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 bg-violet-950/50 border border-violet-800/40 px-2.5 py-0.5 rounded-full">
                Track 10 · Cognitive Synthesis
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/[0.04] text-gray-400 border border-white/[0.08]">
                Student Workbench
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Synthesize & Explain: Cement Your Mental Model
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
              Explaining technical mechanisms in your own words is the highest-fidelity test of comprehension. 
              Draft your synthesis comparing the three architectures below.
            </p>
          </div>

          {/* Live Autosave Indicator & Actions */}
          <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
            {isSaved && text.trim().length > 0 ? (
              <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Saved locally
              </span>
            ) : text.trim().length > 0 ? (
              <span className="text-gray-400 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-lg">
                Editing...
              </span>
            ) : null}

            {text.trim().length > 0 && (
              <>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 bg-[#131320] hover:bg-white/[0.08] text-gray-300 hover:text-white border border-white/[0.08] rounded-lg transition-colors flex items-center gap-1"
                  title="Copy explanation to clipboard"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleClear}
                  className="px-2.5 py-1 bg-[#131320] hover:bg-rose-950/50 text-gray-400 hover:text-rose-300 border border-white/[0.08] hover:border-rose-800/50 rounded-lg transition-colors"
                  title="Clear written text"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Guiding Question Prompts */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-gray-400 block">
            Guiding Questions (Click to insert prompt starter):
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handlePromptClick("The fundamental trade-off between KV caching and fast-weight states is...")}
              className="text-left px-3 py-1.5 rounded-lg bg-[#131320] hover:bg-violet-950/40 border border-white/[0.06] hover:border-violet-700/50 text-gray-300 hover:text-violet-200 text-xs font-mono transition-all"
            >
              1. The fundamental trade-off →
            </button>
            <button
              onClick={() => handlePromptClick("At N > 32, Fixed Memory collapses because outer products superimpose cross-talk...")}
              className="text-left px-3 py-1.5 rounded-lg bg-[#131320] hover:bg-violet-950/40 border border-white/[0.06] hover:border-violet-700/50 text-gray-300 hover:text-violet-200 text-xs font-mono transition-all"
            >
              2. Why N &gt; 32 triggers interference →
            </button>
            <button
              onClick={() => handlePromptClick("DeltaNet stabilizes retrieval compared to pure Hebbian BDH by subtracting error...")}
              className="text-left px-3 py-1.5 rounded-lg bg-[#131320] hover:bg-violet-950/40 border border-white/[0.06] hover:border-violet-700/50 text-gray-300 hover:text-violet-200 text-xs font-mono transition-all"
            >
              3. How DeltaNet's delta rule resists the cliff →
            </button>
          </div>
        </div>

        {/* Textarea Editor Well */}
        <div className="relative rounded-xl border border-white/[0.08] bg-[#0a0a10] overflow-hidden focus-within:border-violet-500/60 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Write your explanation here... (e.g., compare how Full Attention's unbounded KV cache isolates memory slots while BDH's additive accumulator superimposes facts into a fixed 32×32 matrix, causing cross-talk interference past rank d=32)..."
            rows={7}
            className="w-full bg-transparent p-4 sm:p-5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none font-sans leading-relaxed resize-y"
          />

          {/* Editor Footer Bar with Word Count */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#131320]/60 border-t border-white/[0.04] text-[11px] font-mono text-gray-500">
            <span>
              {stats.words} {stats.words === 1 ? 'word' : 'words'} · {stats.chars} characters
            </span>
            <span className="text-gray-500 hidden sm:inline">
              Auto-saved to your browser session
            </span>
          </div>
        </div>

        {/* Conceptual Self-Check Checklist */}
        <div className="rounded-xl border border-white/[0.06] bg-[#131320]/50 p-5 space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-gray-300 font-semibold block">
            Self-Assessment Checklist: Does your explanation cover:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <label 
              onClick={() => toggleCheck('rank')}
              className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                checklist.rank 
                  ? 'bg-violet-950/50 border-violet-700/60 text-violet-200' 
                  : 'bg-[#0a0a10] border-white/[0.05] text-gray-400 hover:text-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={checklist.rank}
                onChange={() => {}}
                className="mt-0.5 rounded border-white/20 bg-black text-violet-500 focus:ring-0"
              />
              <span className="leading-snug">
                <strong>Rank Limit:</strong> Explains the <code className="text-amber-400">d = 32</code> orthogonal capacity bound.
              </span>
            </label>

            <label 
              onClick={() => toggleCheck('crosstalk')}
              className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                checklist.crosstalk 
                  ? 'bg-violet-950/50 border-violet-700/60 text-violet-200' 
                  : 'bg-[#0a0a10] border-white/[0.05] text-gray-400 hover:text-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={checklist.crosstalk}
                onChange={() => {}}
                className="mt-0.5 rounded border-white/20 bg-black text-violet-500 focus:ring-0"
              />
              <span className="leading-snug">
                <strong>Cross-Talk:</strong> Identifies superposition noise <code className="text-violet-300">Σ v_i k_i^T</code>.
              </span>
            </label>

            <label 
              onClick={() => toggleCheck('buffer')}
              className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                checklist.buffer 
                  ? 'bg-violet-950/50 border-violet-700/60 text-violet-200' 
                  : 'bg-[#0a0a10] border-white/[0.05] text-gray-400 hover:text-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={checklist.buffer}
                onChange={() => {}}
                className="mt-0.5 rounded border-white/20 bg-black text-violet-500 focus:ring-0"
              />
              <span className="leading-snug">
                <strong>Buffer vs. State:</strong> Distinguishes isolated KV slots from entangled fast weights.
              </span>
            </label>
          </div>
        </div>

      </div>
    </section>
  );
};

