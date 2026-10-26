import React from 'react';
import { AlertTriangle, CheckCircle2, Info, TrendingUp, ShieldAlert, PackageCheck } from 'lucide-react';
import { PredictionResult } from '../types/model';

interface PredictionResultCardProps {
  result: PredictionResult;
}

export const PredictionResultCard: React.FC<PredictionResultCardProps> = ({ result }) => {
  const isHigh = result.highRisk;
  const probPercent = Math.round(result.probability * 100);

  return (
    <div
      className={`rounded-2xl border p-6 transition-all duration-300 shadow-sm ${
        isHigh
          ? 'bg-rose-50/70 border-rose-200 text-rose-950'
          : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
      }`}
    >
      {/* Title & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              isHigh
                ? 'bg-rose-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isHigh ? (
              <ShieldAlert className="w-6 h-6" />
            ) : (
              <PackageCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                isHigh
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isHigh ? 'High Risk Assessment' : 'Low Risk Assessment'}
            </span>
            <h3
              className={`text-2xl font-extrabold mt-0.5 ${
                isHigh ? 'text-rose-700' : 'text-emerald-700'
              }`}
            >
              {isHigh ? 'High Return Risk' : 'Low Return Risk'}
            </h3>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-black/10 sm:pl-6">
          <div className="text-3xl font-black tabular-nums">
            {probPercent}%
          </div>
          <div className="text-xs text-slate-600 font-medium">
            Vote Share for "Returned"
          </div>
        </div>
      </div>

      {/* Probability Gauge Bar */}
      <div className="py-4">
        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
          <span>0% Retained</span>
          <span className="text-slate-900 font-bold">
            Threshold 50%
          </span>
          <span>100% Returned</span>
        </div>
        <div className="h-3 w-full bg-slate-200/80 rounded-full overflow-hidden relative">
          <div
            className={`h-full transition-all duration-700 rounded-full ${
              isHigh
                ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                : 'bg-gradient-to-r from-teal-500 to-emerald-600'
            }`}
            style={{ width: `${Math.max(4, Math.min(100, probPercent))}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-800 z-10"
            style={{ left: '50%' }}
            title="Standard 50% classification threshold"
          />
        </div>
      </div>

      {/* Core Explanation Paragraph matching Android implementation */}
      <div className="space-y-2.5 text-sm leading-relaxed text-slate-700">
        <p className="font-medium text-slate-800">
          Random Forest vote share for “Returned”: <strong className="text-slate-950 font-bold">{probPercent}%</strong>{' '}
          (average of the 40 trees' predicted probabilities).
        </p>

        <p className="text-xs sm:text-sm text-slate-600">
          This result is based on the order features you selected{' '}
          <strong className="text-slate-800 font-semibold">
            {result.postDelivery
              ? '(post-delivery assessment, as condition on arrival was provided).'
              : '(pre-delivery scenario).'}
          </strong>
        </p>

        {/* Individual Tree Voting Consensus */}
        <div className="bg-white/80 rounded-xl p-3 border border-black/5 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Tree Consensus Breakdown:</span>
          </div>
          <div className="flex gap-3">
            <span className="text-rose-700 font-semibold">
              {result.positiveTreeVotes} of 40 trees voted Returned
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-emerald-700 font-semibold">
              {result.totalTrees - result.positiveTreeVotes} of 40 voted Retained
            </span>
          </div>
        </div>

        {/* Contributing Risk Drivers */}
        {result.riskFactors.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Key Contributing Factors
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {result.riskFactors.map((rf, idx) => (
                <div
                  key={idx}
                  className={`text-xs p-2.5 rounded-lg border flex items-start gap-2 ${
                    rf.impact === 'elevates'
                      ? 'bg-rose-100/60 border-rose-200/80 text-rose-950'
                      : 'bg-emerald-100/60 border-emerald-200/80 text-emerald-950'
                  }`}
                >
                  {rf.impact === 'elevates' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold">{rf.name}:</span>{' '}
                    <span>{rf.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Original Android Disclaimer */}
        <div className="flex items-start gap-2 pt-2 border-t border-black/5 text-[11px] text-slate-500 leading-normal">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
          <span>
            Disclaimer: This is an estimate from a model trained on synthetic demo data, not a
            guarantee of customer behaviour or a validated real-world prediction.
          </span>
        </div>
      </div>
    </div>
  );
};
