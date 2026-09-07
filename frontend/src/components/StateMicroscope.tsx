import React, { useState, useEffect } from 'react';

interface StateMicroscopeProps {
  stateMatrix?: number[][];
  stateSteps?: number[][][];
  nPairs: number;
}

export function StateMicroscope({ stateMatrix, stateSteps, nPairs }: StateMicroscopeProps) {
  const [currentStep, setCurrentStep] = useState<number>(-1);

  // Reset to final state when new data comes in
  useEffect(() => {
    setCurrentStep(stateSteps ? stateSteps.length - 1 : -1);
  }, [stateSteps, nPairs]);

  if (!stateMatrix || !stateSteps || stateSteps.length === 0) {
    return null; // Don't render if no matrix data
  }

  const activeMatrix = currentStep >= 0 && currentStep < stateSteps.length ? stateSteps[currentStep] : stateMatrix;
  const isFinal = currentStep === stateSteps.length - 1;

  // Render a tiny heatmap
  const renderHeatmap = (matrix: number[][]) => {
    // Flatten and find max abs value for color scaling
    let maxAbs = 0.001;
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (Math.abs(matrix[r][c]) > maxAbs) maxAbs = Math.abs(matrix[r][c]);
      }
    }

    return (
      <div 
        className="grid gap-[1px] bg-gray-900 border border-gray-700/50 p-1 mx-auto"
        style={{ 
          gridTemplateColumns: `repeat(${matrix[0].length}, minmax(0, 1fr))`,
          width: 'fit-content'
        }}
      >
        {matrix.map((row, rIdx) => (
          row.map((val, cIdx) => {
            // Map -maxAbs to blue, 0 to black, +maxAbs to red
            const norm = val / maxAbs; // -1 to 1
            let bg;
            if (norm < 0) {
              const intensity = Math.round(Math.abs(norm) * 255);
              bg = `rgb(0, ${Math.round(intensity/2)}, ${intensity})`; // Blueish
            } else {
              const intensity = Math.round(norm * 255);
              bg = `rgb(${intensity}, ${Math.round(intensity/2)}, 0)`; // Reddish/Orange
            }
            return (
              <div 
                key={`${rIdx}-${cIdx}`}
                className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 opacity-90 hover:opacity-100"
                style={{ backgroundColor: bg }}
                title={`Row ${rIdx}, Col ${cIdx}: ${val.toFixed(4)}`}
              />
            );
          })
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700/50 shadow-lg">
      <h3 className="text-xl font-bold text-gray-100 mb-2">State Microscope — Model B's Memory Matrix</h3>
      <p className="text-gray-400 text-sm mb-6 max-w-2xl">
        Unlike the Transformer which grows its cache, DeltaNet accumulates facts into a fixed-size state matrix. 
        Watch how the state changes as each fact is written. Over time, new facts start overwriting old ones.
      </p>

      <div className="flex flex-col items-center">
        <div className="mb-4 overflow-x-auto w-full flex justify-center">
          {renderHeatmap(activeMatrix)}
        </div>
        
        <div className="flex items-center space-x-4 bg-gray-900/50 px-6 py-3 rounded-full border border-gray-700/50">
          <button 
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep <= 0}
            className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ←
          </button>
          
          <div className="text-sm font-mono text-gray-300 min-w-[200px] text-center">
            {isFinal ? `Final State (${nPairs}/${nPairs} facts)` : `After storing fact ${currentStep + 1}/${nPairs}`}
          </div>

          <button 
            onClick={() => setCurrentStep(Math.min(stateSteps.length - 1, currentStep + 1))}
            disabled={currentStep >= stateSteps.length - 1}
            className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
