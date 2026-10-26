import React from 'react';
import { Sparkles, Grid3X3, Sliders, Cpu, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: 'predictor' | 'confusion' | 'architecture' | 'batch';
  setActiveTab: (tab: 'predictor' | 'confusion' | 'architecture' | 'batch') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-white border-b border-indigo-100 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-indigo-950">
                  Return<span className="text-indigo-600">Predict</span>
                </h1>
                <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  RF-40 v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                E-Commerce Product Return Risk Intelligence & Evaluation Engine
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 overflow-x-auto">
            <button
              onClick={() => setActiveTab('predictor')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'predictor'
                  ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Risk Predictor</span>
            </button>

            <button
              onClick={() => setActiveTab('confusion')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'confusion'
                  ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Grid3X3 className="w-4 h-4 text-indigo-600" />
              <span>Confusion Matrix & Metrics</span>
            </button>

            <button
              onClick={() => setActiveTab('batch')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'batch'
                  ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Test Scenarios</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'architecture'
                  ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Model Specs</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
