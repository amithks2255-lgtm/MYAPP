import React, { useState, useMemo } from 'react';
import {
  calculateConfusionMatrix,
  generateRocCurvePoints,
  getCategoryBreakdown,
  getScenarioBreakdown,
  testDataset,
} from '../lib/evaluation';
import {
  Sliders,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  DollarSign,
} from 'lucide-react';

export const ConfusionMatrixView: React.FC = () => {
  const [threshold, setThreshold] = useState<number>(0.5);
  const [returnCost, setReturnCost] = useState<number>(350); // ₹ cost of an unflagged return (logistics + restocking)
  const [interventionCost, setInterventionCost] = useState<number>(60); // ₹ cost of proactive intervention/call

  // Calculate confusion stats at current threshold
  const stats = useMemo(() => {
    return calculateConfusionMatrix(testDataset, threshold);
  }, [threshold]);

  // ROC curve data
  const roc = useMemo(() => {
    return generateRocCurvePoints(testDataset);
  }, []);

  // Category breakdown at current threshold
  const categoryStats = useMemo(() => {
    return getCategoryBreakdown(testDataset, threshold);
  }, [threshold]);

  // Scenario breakdown (pre-delivery vs post-delivery)
  const scenarios = useMemo(() => {
    return getScenarioBreakdown(testDataset, threshold);
  }, [threshold]);

  // Financial Cost calculation
  // Cost = (FN * returnCost) + (FP * interventionCost)
  const totalCost = stats.fn * returnCost + stats.fp * interventionCost;
  const unmanagedCost = stats.actualPositives * returnCost;
  const costSavings = Math.max(0, unmanagedCost - totalCost);

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Held-Out Evaluation
              </span>
              <span className="text-xs text-slate-500 font-medium">
                4,000 Synthetic Test Orders (20% Stratified Split)
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Model Performance & Confusion Matrix
            </h2>
            <p className="text-sm text-slate-500 mt-0.5 max-w-3xl">
              Evaluate classification accuracy, false alarm rates, and detection sensitivity. Adjust the decision threshold to balance precision and recall according to business priorities.
            </p>
          </div>

          {/* Quick Threshold Presets */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Preset Thresholds:</span>
            <div className="flex gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setThreshold(0.35)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                  threshold === 0.35
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                title="High Recall: Catches more returns, higher false positives"
              >
                0.35 (High Recall)
              </button>
              <button
                type="button"
                onClick={() => setThreshold(0.5)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                  threshold === 0.5
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                title="Balanced Standard Scikit-Learn Default"
              >
                0.50 (Balanced)
              </button>
              <button
                type="button"
                onClick={() => setThreshold(0.65)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                  threshold === 0.65
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                title="High Precision: Minimizes false alarms, flags only confident returns"
              >
                0.65 (High Precision)
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Threshold Slider */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Decision Threshold Cutoff ($T$)
              </label>
              <span className="text-xs text-slate-400">
                (Order flagged as "High Return Risk" if predicted probability $\ge T$)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Current Cutoff:</span>
              <span className="text-sm font-extrabold text-indigo-700 font-mono bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                {(threshold * 100).toFixed(0)}% ({threshold.toFixed(2)})
              </span>
            </div>
          </div>

          <input
            type="range"
            min="0.10"
            max="0.90"
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />

          <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
            <span>0.10 (Aggressive Flagging)</span>
            <span>0.30</span>
            <span className="font-bold text-indigo-600">0.50 (Default)</span>
            <span>0.70</span>
            <span>0.90 (Very Conservative)</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Accuracy */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Accuracy
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
            {(stats.accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {stats.tp + stats.tn} of {stats.total} correct
          </div>
        </div>

        {/* Precision */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Precision (PPV)
          </div>
          <div className="text-2xl font-black text-indigo-700 mt-1 tabular-nums">
            {(stats.precision * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {stats.tp} of {stats.predictedPositives} flagged true
          </div>
        </div>

        {/* Recall / Sensitivity */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Recall (Sensitivity)
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">
            {(stats.recall * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {stats.tp} of {stats.actualPositives} returns caught
          </div>
        </div>

        {/* Specificity */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Specificity (TNR)
          </div>
          <div className="text-2xl font-black text-sky-700 mt-1 tabular-nums">
            {(stats.specificity * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {stats.tn} of {stats.actualNegatives} kept safe
          </div>
        </div>

        {/* F1 Score */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            F1-Score
          </div>
          <div className="text-2xl font-black text-purple-700 mt-1 tabular-nums">
            {stats.f1Score.toFixed(3)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Harmonic balance P & R
          </div>
        </div>

        {/* ROC AUC */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            ROC-AUC
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1 tabular-nums">
            {roc.auc.toFixed(3)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Global model discrimination
          </div>
        </div>
      </div>

      {/* Main Grid: Confusion Matrix Table & Visual ROC Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* The 2x2 Confusion Matrix */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>2×2 Confusion Matrix</span>
            </h3>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold">
              $N = {stats.total}$ Test Cases
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Compare actual ground-truth order outcomes against model predictions at current cutoff ({threshold.toFixed(2)}):
          </p>

          {/* Matrix Layout */}
          <div className="overflow-x-auto pt-2 pb-1">
            <div className="min-w-[480px]">
              {/* Header Row: Predicted Labels */}
              <div className="grid grid-cols-12 gap-2 text-center text-xs font-bold text-slate-600 mb-2">
                <div className="col-span-3"></div>
                <div className="col-span-4 bg-indigo-50/70 text-indigo-900 py-1.5 rounded-lg border border-indigo-100/60 font-semibold">
                  Predicted: Returned (1)
                </div>
                <div className="col-span-4 bg-slate-100 text-slate-800 py-1.5 rounded-lg border border-slate-200 font-semibold">
                  Predicted: Retained (0)
                </div>
                <div className="col-span-1 text-slate-400 py-1.5 font-semibold text-[10px]">
                  Total
                </div>
              </div>

              {/* Row 1: Actual Returned */}
              <div className="grid grid-cols-12 gap-2 mb-2 items-stretch">
                <div className="col-span-3 bg-indigo-50/70 text-indigo-900 px-2 py-3 rounded-xl border border-indigo-100 flex flex-col justify-center text-left">
                  <span className="text-xs font-extrabold">Actual Returned</span>
                  <span className="text-[10px] text-indigo-600 font-medium">True Positives Class</span>
                </div>

                {/* True Positive Cell */}
                <div className="col-span-4 bg-emerald-50 border-2 border-emerald-400/80 rounded-xl p-3 text-center transition-all shadow-xs relative">
                  <div className="flex items-center justify-between text-[11px] text-emerald-800 font-bold mb-1">
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      True Positive (TP)
                    </span>
                    <span className="text-[10px] bg-emerald-200/60 px-1.5 py-0.5 rounded text-emerald-900 font-mono">
                      Hit
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-900 tabular-nums">
                    {stats.tp.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                    {((stats.tp / stats.total) * 100).toFixed(1)}% of all orders
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-1 pt-1 border-t border-emerald-200/60">
                    Caught {((stats.tp / stats.actualPositives) * 100).toFixed(1)}% of returns
                  </div>
                </div>

                {/* False Negative Cell */}
                <div className="col-span-4 bg-rose-50 border-2 border-rose-300 rounded-xl p-3 text-center transition-all shadow-xs relative">
                  <div className="flex items-center justify-between text-[11px] text-rose-800 font-bold mb-1">
                    <span className="inline-flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      False Negative (FN)
                    </span>
                    <span className="text-[10px] bg-rose-200/60 px-1.5 py-0.5 rounded text-rose-900 font-mono">
                      Type II Error
                    </span>
                  </div>
                  <div className="text-2xl font-black text-rose-900 tabular-nums">
                    {stats.fn.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-rose-700 font-medium mt-0.5">
                    {((stats.fn / stats.total) * 100).toFixed(1)}% of all orders
                  </div>
                  <div className="text-[10px] text-rose-600 font-semibold mt-1 pt-1 border-t border-rose-200/60">
                    Missed {((stats.fn / stats.actualPositives) * 100).toFixed(1)}% of returns
                  </div>
                </div>

                {/* Row 1 Marginal Total */}
                <div className="col-span-1 bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-col justify-center text-center font-bold text-xs text-slate-700 tabular-nums">
                  <span>{stats.actualPositives.toLocaleString()}</span>
                  <span className="text-[9px] text-slate-400 font-normal">P</span>
                </div>
              </div>

              {/* Row 2: Actual Retained */}
              <div className="grid grid-cols-12 gap-2 mb-2 items-stretch">
                <div className="col-span-3 bg-slate-100 text-slate-800 px-2 py-3 rounded-xl border border-slate-200 flex flex-col justify-center text-left">
                  <span className="text-xs font-extrabold">Actual Retained</span>
                  <span className="text-[10px] text-slate-500 font-medium">True Negatives Class</span>
                </div>

                {/* False Positive Cell */}
                <div className="col-span-4 bg-amber-50 border-2 border-amber-300 rounded-xl p-3 text-center transition-all shadow-xs relative">
                  <div className="flex items-center justify-between text-[11px] text-amber-900 font-bold mb-1">
                    <span className="inline-flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      False Positive (FP)
                    </span>
                    <span className="text-[10px] bg-amber-200/60 px-1.5 py-0.5 rounded text-amber-900 font-mono">
                      Type I Error
                    </span>
                  </div>
                  <div className="text-2xl font-black text-amber-950 tabular-nums">
                    {stats.fp.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-amber-800 font-medium mt-0.5">
                    {((stats.fp / stats.total) * 100).toFixed(1)}% of all orders
                  </div>
                  <div className="text-[10px] text-amber-700 font-semibold mt-1 pt-1 border-t border-amber-200/60">
                    False Alarm Rate: {((stats.fp / stats.actualNegatives) * 100).toFixed(1)}%
                  </div>
                </div>

                {/* True Negative Cell */}
                <div className="col-span-4 bg-sky-50 border-2 border-sky-400/80 rounded-xl p-3 text-center transition-all shadow-xs relative">
                  <div className="flex items-center justify-between text-[11px] text-sky-900 font-bold mb-1">
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-sky-600" />
                      True Negative (TN)
                    </span>
                    <span className="text-[10px] bg-sky-200/60 px-1.5 py-0.5 rounded text-sky-900 font-mono">
                      Correct
                    </span>
                  </div>
                  <div className="text-2xl font-black text-sky-950 tabular-nums">
                    {stats.tn.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-sky-800 font-medium mt-0.5">
                    {((stats.tn / stats.total) * 100).toFixed(1)}% of all orders
                  </div>
                  <div className="text-[10px] text-sky-700 font-semibold mt-1 pt-1 border-t border-sky-200/60">
                    Specificity: {((stats.tn / stats.actualNegatives) * 100).toFixed(1)}%
                  </div>
                </div>

                {/* Row 2 Marginal Total */}
                <div className="col-span-1 bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-col justify-center text-center font-bold text-xs text-slate-700 tabular-nums">
                  <span>{stats.actualNegatives.toLocaleString()}</span>
                  <span className="text-[9px] text-slate-400 font-normal">N</span>
                </div>
              </div>

              {/* Column Totals */}
              <div className="grid grid-cols-12 gap-2 text-center text-xs font-bold text-slate-600">
                <div className="col-span-3 text-right py-1 pr-2 text-slate-400 font-semibold text-[11px]">
                  Total Predicted:
                </div>
                <div className="col-span-4 bg-slate-50 py-1.5 rounded-lg border border-slate-200 text-indigo-700 font-mono">
                  {stats.predictedPositives.toLocaleString()} ({( (stats.predictedPositives / stats.total) * 100 ).toFixed(1)}%)
                </div>
                <div className="col-span-4 bg-slate-50 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-mono">
                  {stats.predictedNegatives.toLocaleString()} ({( (stats.predictedNegatives / stats.total) * 100 ).toFixed(1)}%)
                </div>
                <div className="col-span-1 bg-slate-200 py-1.5 rounded-lg text-slate-900 font-mono text-[11px]">
                  {stats.total.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Practical Error Trade-off Guide */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-600" />
              <span>Operational Trade-Off at {threshold.toFixed(2)} Threshold:</span>
            </div>
            <p>
              • <strong>Missed Returns (False Negatives = {stats.fn}):</strong> Orders that end up returned without early warehouse or customer-service intervention.
            </p>
            <p>
              • <strong>False Alarms (False Positives = {stats.fp}):</strong> Good orders incorrectly tagged as high risk, causing unnecessary order verification or friction.
            </p>
          </div>
        </div>

        {/* Visual ROC Curve & AUC Visualizer */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Receiver Operating Characteristic (ROC)
              </h3>
              <p className="text-xs text-slate-500">
                True Positive Rate vs. False Positive Rate
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
              AUC = {roc.auc.toFixed(3)}
            </span>
          </div>

          {/* SVG ROC Curve */}
          <div className="relative bg-slate-950 p-4 rounded-xl border border-slate-800">
            <svg
              viewBox="0 0 320 280"
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((v, i) => {
                const y = 240 - v * 200;
                const x = 50 + v * 240;
                return (
                  <g key={i}>
                    {/* Horizontal grid */}
                    <line
                      x1="50"
                      y1={y}
                      x2="290"
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray="2,2"
                    />
                    <text
                      x="42"
                      y={y + 3}
                      fill="#64748b"
                      fontSize="9"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {v.toFixed(2)}
                    </text>

                    {/* Vertical grid */}
                    <line
                      x1={x}
                      y1="40"
                      x2={x}
                      y2="240"
                      stroke="#1e293b"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={x}
                      y="254"
                      fill="#64748b"
                      fontSize="9"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {v.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              {/* Diagonal Chance Line (AUC = 0.5) */}
              <line
                x1="50"
                y1="240"
                x2="290"
                y2="40"
                stroke="#475569"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />

              {/* ROC Curve Path */}
              <path
                d={roc.points
                  .map((p, idx) => {
                    const x = 50 + p.fpr * 240;
                    const y = 240 - p.tpr * 200;
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Current Threshold Operating Point */}
              {(() => {
                const curX = 50 + stats.fpr * 240;
                const curY = 240 - stats.recall * 200;
                return (
                  <g>
                    <line
                      x1={curX}
                      y1="40"
                      x2={curX}
                      y2="240"
                      stroke="#f59e0b"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                    <line
                      x1="50"
                      y1={curY}
                      x2="290"
                      y2={curY}
                      stroke="#f59e0b"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                    <circle
                      cx={curX}
                      cy={curY}
                      r="6"
                      fill="#f59e0b"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={Math.min(270, curX + 10)}
                      y={Math.max(50, curY - 8)}
                      fill="#fbbf24"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      T = {threshold.toFixed(2)}
                    </text>
                  </g>
                );
              })()}

              {/* Axes labels */}
              <text
                x="170"
                y="272"
                fill="#94a3b8"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
              >
                False Positive Rate (1 - Specificity)
              </text>
              <text
                x="14"
                y="140"
                fill="#94a3b8"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                transform="rotate(-90 14 140)"
              >
                True Positive Rate (Recall)
              </text>
            </svg>
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              <span>Current operating point: TPR={(stats.recall * 100).toFixed(1)}%, FPR={(stats.fpr * 100).toFixed(1)}%</span>
            </span>
            <span className="font-mono text-indigo-600 font-bold">
              Random Forest 40
            </span>
          </div>
        </div>
      </div>

      {/* Pre-Delivery vs Post-Delivery Sub-Scenarios Comparison */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Pre-Delivery vs. Post-Delivery Matrix Comparison
            </h3>
            <p className="text-xs text-slate-500">
              How arrival condition signals change prediction reliability and precision
            </p>
          </div>
          <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
            Threshold: {threshold.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pre-Delivery Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {scenarios.preDelivery.label}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {scenarios.preDelivery.description}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                {scenarios.preDelivery.count} orders
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-emerald-100/60 p-2 rounded-lg">
                <span className="block text-[10px] text-emerald-800 font-semibold">TP</span>
                <span className="font-extrabold text-emerald-950 text-sm">
                  {scenarios.preDelivery.cm.tp}
                </span>
              </div>
              <div className="bg-rose-100/60 p-2 rounded-lg">
                <span className="block text-[10px] text-rose-800 font-semibold">FN</span>
                <span className="font-extrabold text-rose-950 text-sm">
                  {scenarios.preDelivery.cm.fn}
                </span>
              </div>
              <div className="bg-amber-100/60 p-2 rounded-lg">
                <span className="block text-[10px] text-amber-800 font-semibold">FP</span>
                <span className="font-extrabold text-amber-950 text-sm">
                  {scenarios.preDelivery.cm.fp}
                </span>
              </div>
              <div className="bg-sky-100/60 p-2 rounded-lg">
                <span className="block text-[10px] text-sky-800 font-semibold">TN</span>
                <span className="font-extrabold text-sky-950 text-sm">
                  {scenarios.preDelivery.cm.tn}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-xs pt-1 border-t border-slate-200/60 text-slate-600">
              <span>Accuracy: <strong>{(scenarios.preDelivery.cm.accuracy * 100).toFixed(1)}%</strong></span>
              <span>Precision: <strong>{(scenarios.preDelivery.cm.precision * 100).toFixed(1)}%</strong></span>
              <span>Recall: <strong>{(scenarios.preDelivery.cm.recall * 100).toFixed(1)}%</strong></span>
            </div>
          </div>

          {/* Post-Delivery Card */}
          <div className="bg-indigo-50/40 rounded-xl p-4 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
              <div>
                <h4 className="text-sm font-bold text-indigo-950">
                  {scenarios.postDelivery.label}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {scenarios.postDelivery.description}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                {scenarios.postDelivery.count} orders
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-emerald-100/60 p-2 rounded-lg">
                <span className="block text-[10px] text-emerald-800 font-semibold">TP</span>
                <span className="font-extrabold text-emerald-950 text-sm">
                  {scenarios.postDelivery.cm.tp}
                </span>
              </div>
              <div className="bg-rose-100/60 p-2 rounded-lg">
                <span className="block text-[10px] text-rose-800 font-semibold">FN</span>
                <span className="font-extrabold text-rose-950 text-sm">
                  {scenarios.postDelivery.cm.fn}
                </span>
              </div>
              <div className="bg-amber-100/60 p-2 rounded-lg">
                <span className="block text-[10px] text-amber-800 font-semibold">FP</span>
                <span className="font-extrabold text-amber-950 text-sm">
                  {scenarios.postDelivery.cm.fp}
                </span>
              </div>
              <div className="bg-sky-100/60 p-2 rounded-lg">
                <span className="block text-[10px] text-sky-800 font-semibold">TN</span>
                <span className="font-extrabold text-sky-950 text-sm">
                  {scenarios.postDelivery.cm.tn}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-xs pt-1 border-t border-indigo-100 text-indigo-900">
              <span>Accuracy: <strong>{(scenarios.postDelivery.cm.accuracy * 100).toFixed(1)}%</strong></span>
              <span>Precision: <strong>{(scenarios.postDelivery.cm.precision * 100).toFixed(1)}%</strong></span>
              <span>Recall: <strong>{(scenarios.postDelivery.cm.recall * 100).toFixed(1)}%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Category-Wise Performance Breakdown Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Category-Specific Return Rates & Performance
          </h3>
          <p className="text-xs text-slate-500">
            Held-out accuracy, precision, and return detection by merchandising category
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Product Category</th>
                <th className="py-2.5 px-3 text-right">Test Orders</th>
                <th className="py-2.5 px-3 text-right">Actual Return Rate</th>
                <th className="py-2.5 px-3 text-right">Accuracy</th>
                <th className="py-2.5 px-3 text-right">Precision</th>
                <th className="py-2.5 px-3 text-right">Recall</th>
                <th className="py-2.5 px-3 text-right">F1-Score</th>
                <th className="py-2.5 px-3 text-center">TP / FP / FN / TN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {categoryStats.map((cat, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {cat.category}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {cat.totalCount}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-indigo-700">
                    {(cat.returnRate * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {(cat.accuracy * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {(cat.precision * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {(cat.recall * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold">
                    {cat.f1Score.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-500">
                    <span className="text-emerald-700 font-semibold">{cat.tp}</span> /{' '}
                    <span className="text-amber-700">{cat.fp}</span> /{' '}
                    <span className="text-rose-700">{cat.fn}</span> /{' '}
                    <span className="text-sky-700">{cat.tn}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Business Impact & Cost Simulator */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-800/60">
          <div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">
                Business Cost & Threshold Optimizer
              </h3>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Simulate operational savings by tuning threshold $T$ against false-positive and false-negative costs
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div>
              <span className="text-indigo-300 block text-[10px]">Unmanaged Loss:</span>
              <span className="font-mono font-bold text-rose-300">
                ₹{unmanagedCost.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-indigo-300 block text-[10px]">Model Net Cost:</span>
              <span className="font-mono font-bold text-emerald-300">
                ₹{totalCost.toLocaleString()}
              </span>
            </div>
            <div className="bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 rounded-lg">
              <span className="text-emerald-300 block text-[10px] uppercase font-bold">Estimated Savings:</span>
              <span className="font-mono font-black text-emerald-300 text-sm">
                ₹{costSavings.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          <div className="space-y-1.5">
            <label className="text-indigo-200 font-semibold block">
              Cost of Unflagged Return (FN): ₹{returnCost}
            </label>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={returnCost}
              onChange={(e) => setReturnCost(parseInt(e.target.value))}
              className="w-full h-2 bg-indigo-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <span className="text-[10px] text-indigo-300">
              Includes reverse shipping, quality check, repackaging, and depreciation loss.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-indigo-200 font-semibold block">
              Cost of Proactive Intervention (FP): ₹{interventionCost}
            </label>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={interventionCost}
              onChange={(e) => setInterventionCost(parseInt(e.target.value))}
              className="w-full h-2 bg-indigo-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <span className="text-[10px] text-indigo-300">
              Customer support call, sizing verification WhatsApp bot, or delivery confirmation prompt.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
