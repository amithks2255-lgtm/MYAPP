import React, { useState } from 'react';
import { Header } from './components/Header';
import { PredictorForm } from './components/PredictorForm';
import { ConfusionMatrixView } from './components/ConfusionMatrixView';
import { BatchSimulatorView } from './components/BatchSimulatorView';
import { ModelArchitectureView } from './components/ModelArchitectureView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'predictor' | 'confusion' | 'architecture' | 'batch'>('predictor');

  return (
    <div className="min-h-screen bg-[#F5F6FF] flex flex-col font-sans">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'predictor' && <PredictorForm />}
        {activeTab === 'confusion' && <ConfusionMatrixView />}
        {activeTab === 'batch' && <BatchSimulatorView />}
        {activeTab === 'architecture' && <ModelArchitectureView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">ReturnPredict ML</span>
            <span>•</span>
            <span>Random Forest Classifier (40 Trees, Max Depth 8)</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Client-side inference</span>
            <span>•</span>
            <span>Synthetic Demo Training Dataset</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
