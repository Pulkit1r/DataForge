import { useState, useEffect, useCallback } from 'react';
import { MemorySlider } from './components/MemorySlider';
import { ThreePanelDemo } from './components/TwoPanelDemo';
import { AccuracyChart } from './components/AccuracyChart';
import { StateMicroscope } from './components/StateMicroscope';
import { DemonstrationSurgery } from './components/DemonstrationSurgery';
import { BDHSection } from './components/BDHSection';
import { ExplainItBack } from './components/ExplainItBack';
import { fetchPrediction, fetchCurve, PredictResponse, CurveData } from './api';

function App() {
  const [currentN, setCurrentN] = useState<number>(16);
  const [predictionData, setPredictionData] = useState<PredictResponse | null>(null);
  const [surgeryData, setSurgeryData] = useState<PredictResponse | null>(null);
  const [curveData, setCurveData] = useState<CurveData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSurgeryLoading, setIsSurgeryLoading] = useState<boolean>(false);

  // Load precomputed multi-seed curve once on mount
  useEffect(() => {
    fetchCurve().then(data => setCurveData(data)).catch(console.error);
  }, []);

  // Fetch live prediction when N changes (debounced)
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setSurgeryData(null);
      try {
        const data = await fetchPrediction(currentN);
        if (active) {
          setPredictionData(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (active) setIsLoading(false);
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [currentN]);

  const handleSurgery = useCallback(async (type: 'remove' | 'corrupt', index: number) => {
    setIsSurgeryLoading(true);
    try {
      const data = await fetchPrediction(
        currentN,
        42,
        type === 'remove' ? index : undefined,
        type === 'corrupt' ? index : undefined
      );
      setSurgeryData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSurgeryLoading(false);
    }
  }, [currentN]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-cyan-900 selection:text-cyan-100">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header with Topic and One-Sentence Claim */}
        <header className="text-center space-y-4 pt-6 pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <span>DataForge 2026</span> &bull; <span>Pathway Track</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-purple-400">
            Associative Memory and Fast Weights
          </h1>

          <div className="max-w-3xl mx-auto bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-sm text-gray-300 shadow-inner">
            <span className="text-amber-400 font-bold uppercase text-[11px] block tracking-wide mb-1">
              Falsifiable Core Claim
            </span>
            <p className="italic text-gray-200 leading-relaxed text-sm sm:text-base">
              &ldquo;A fixed-size additive associative-memory state can process an arbitrarily long stream of facts without allocating a new slot per fact, but its exact-recall accuracy degrades once the number of stored facts exceeds the state's effective capacity, due to key-collision interference.&rdquo;
            </p>
          </div>
        </header>

        {/* Fact Load Slider with Capacity Marker */}
        <section>
          <MemorySlider currentN={currentN} onChange={setCurrentN} disabled={isLoading} />
        </section>

        {/* 3-Model Comparison Panel */}
        <section>
          <ThreePanelDemo predictionData={predictionData} isLoading={isLoading} />
        </section>

        {/* Capacity vs Accuracy Line Chart */}
        <section>
          <AccuracyChart curveData={curveData} currentN={currentN} />
        </section>

        {/* State Microscope */}
        <section>
          <StateMicroscope 
            stateMatrix={predictionData?.state_matrix} 
            stateSteps={predictionData?.state_matrices_steps}
            nPairs={currentN}
          />
        </section>

        {/* Demonstration Surgery */}
        <section>
          <DemonstrationSurgery 
            nPairs={currentN} 
            originalData={predictionData as any} 
            surgeryData={surgeryData as any}
            onSurgery={handleSurgery}
            isLoading={isSurgeryLoading || isLoading}
          />
        </section>

        {/* BDH Connection Module */}
        <section>
          <BDHSection />
        </section>

        {/* Student Explain-It-Back Sandbox */}
        <section className="pb-16">
          <ExplainItBack />
        </section>

      </div>
    </div>
  );
}

export default App;
