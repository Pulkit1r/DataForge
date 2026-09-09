import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AudienceSection } from './components/AudienceSection';
import { GuidedWalkthrough } from './components/GuidedWalkthrough';
import { MemorySlider } from './components/MemorySlider';
import { PredictionGate } from './components/PredictionGate';
import { ThreePanelDemo } from './components/TwoPanelDemo';
import { AccuracyChart } from './components/AccuracyChart';
import { StateMicroscope } from './components/StateMicroscope';
import { DemonstrationSurgery } from './components/DemonstrationSurgery';
import { BDHSection } from './components/BDHSection';
import { ExplainItBack } from './components/ExplainItBack';
import { Footer } from './components/Footer';
import { fetchPrediction, fetchCurve, PredictResponse, CurveData } from './api';

function App() {
  const [currentN, setCurrentN] = useState<number>(16);
  const [isSandboxUnlocked, setIsSandboxUnlocked] = useState<boolean>(true);
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
    <div className="min-h-screen bg-[#08080c] text-gray-200 font-sans selection:bg-violet-900 selection:text-violet-100 ambient-bg">
      {/* 1. Global Navigation Bar */}
      <Navbar />

      {/* 2. Step 2 Hero Section Only */}
      <HeroSection />

      {/* Sections 1-11 Below - to be redesigned section-by-section in Step 3 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Section 1: Who this is for */}
        <AudienceSection />

        {/* Section 2: Guided Capacity Walkthrough */}
        <GuidedWalkthrough
          currentN={currentN}
          onSelectN={setCurrentN}
          isUnlocked={isSandboxUnlocked}
          onUnlock={() => setIsSandboxUnlocked(true)}
        />

        {/* Section 3: Interactive Fact Load Slider */}
        <section id="section-workbench">
          <MemorySlider currentN={currentN} onChange={setCurrentN} disabled={isLoading || !isSandboxUnlocked} />
        </section>

        {/* Section 4: 60-Second Prediction Gate */}
        <PredictionGate
          currentN={currentN}
          actualAccuracy={predictionData?.additive_fast_weight?.accuracy}
        />

        {/* 3-Model Comparison Panel */}
        <section>
          <ThreePanelDemo predictionData={predictionData} isLoading={isLoading} />
        </section>

        {/* Capacity vs Accuracy Line Chart */}
        <section>
          <AccuracyChart curveData={curveData} currentN={currentN} />
        </section>

        {/* State Microscope */}
        <section id="section-microscope">
          <StateMicroscope 
            stateMatrix={predictionData?.state_matrix} 
            stateSteps={predictionData?.state_matrices_steps}
            nPairs={currentN}
          />
        </section>

        {/* Demonstration Surgery */}
        <section id="section-surgery">
          <DemonstrationSurgery 
            nPairs={currentN} 
            originalData={predictionData as any} 
            surgeryData={surgeryData as any}
            onSurgery={handleSurgery}
            onReset={() => setSurgeryData(null)}
            isLoading={isSurgeryLoading || isLoading}
          />
        </section>

        {/* BDH Connection Module */}
        <section id="section-bdh">
          <BDHSection />
        </section>

        {/* Student Explain-It-Back Sandbox */}
        <section className="pb-16">
          <ExplainItBack />
        </section>
      </main>

      {/* Epilogue & Limitations Footer */}
      <Footer />
    </div>
  );
}

export default App;
