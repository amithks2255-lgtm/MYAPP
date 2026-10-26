import React, { useState, useMemo } from 'react';
import { testDataset } from '../lib/evaluation';


export const BatchSimulatorView: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'tp' | 'fp' | 'fn' | 'tn'>('all');
  const [searchCat, setSearchCat] = useState<string>('all');
  const [threshold, setThreshold] = useState<number>(0.5);
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

  const filteredSamples = useMemo(() => {
    return testDataset.filter((sample) => {
      const pred = sample.prob >= threshold ? 1 : 0;
      let type: 'tp' | 'fp' | 'fn' | 'tn';
      if (pred === 1 && sample.actual === 1) type = 'tp';
      else if (pred === 1 && sample.actual === 0) type = 'fp';
      else if (pred === 0 && sample.actual === 0) type = 'tn';
      else type = 'fn';

      if (filterType !== 'all' && type !== filterType) return false;
      if (searchCat !== 'all' && sample.cat !== searchCat) return false;
      return true;
    });
  }, [filterType, searchCat, threshold]);

  const totalPages = Math.ceil(filteredSamples.length / pageSize) || 1;
  const currentSamples = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSamples.slice(start, start + pageSize);
  }, [filteredSamples, page]);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Batch Orders & Error Case Explorer
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Inspect test cases, examine where the model succeeded (TP/TN), and diagnose false predictions (FP/FN) at threshold {threshold.toFixed(2)}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Active Filter Count:</span>
            <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-200">
              {filteredSamples.length} of {testDataset.length} orders
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
          {/* Classification Outcome Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => { setFilterType('all'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Outcomes
            </button>
            <button
              onClick={() => { setFilterType('tp'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                filterType === 'tp'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <span>Hits (TP)</span>
            </button>
            <button
              onClick={() => { setFilterType('fp'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                filterType === 'fp'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <span>False Alarms (FP)</span>
            </button>
            <button
              onClick={() => { setFilterType('fn'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                filterType === 'fn'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-800 hover:bg-rose-50'
              }`}
            >
              <span>Missed Returns (FN)</span>
            </button>
            <button
              onClick={() => { setFilterType('tn'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                filterType === 'tn'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-sky-800 hover:bg-sky-50'
              }`}
            >
              <span>Retained (TN)</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Category:</label>
            <select
              value={searchCat}
              onChange={(e) => { setSearchCat(e.target.value); setPage(1); }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Footwear">Footwear</option>
              <option value="Home & Kitchen">Home & Kitchen</option>
              <option value="Beauty">Beauty</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Inline Threshold Control */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-slate-500 font-medium">Cutoff:</span>
            <input
              type="range"
              min="0.10"
              max="0.90"
              step="0.05"
              value={threshold}
              onChange={(e) => { setThreshold(parseFloat(e.target.value)); setPage(1); }}
              className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              {threshold.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-3">Classification</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Price</th>
                <th className="py-3 px-3 text-center">Disc / Days / Rating</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Arrival Cond</th>
                <th className="py-3 px-3 text-right">Model P(Returned)</th>
                <th className="py-3 px-3 text-center">Actual Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentSamples.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No orders matching selected criteria.
                  </td>
                </tr>
              ) : (
                currentSamples.map((s) => {
                  const pred = s.prob >= threshold ? 1 : 0;
                  let badge = {
                    label: 'True Positive',
                    cls: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  };
                  if (pred === 1 && s.actual === 0) {
                    badge = {
                      label: 'False Positive (Type I)',
                      cls: 'bg-amber-100 text-amber-800 border-amber-200',
                    };
                  } else if (pred === 0 && s.actual === 1) {
                    badge = {
                      label: 'False Negative (Type II)',
                      cls: 'bg-rose-100 text-rose-800 border-rose-200',
                    };
                  } else if (pred === 0 && s.actual === 0) {
                    badge = {
                      label: 'True Negative',
                      cls: 'bg-sky-100 text-sky-800 border-sky-200',
                    };
                  }

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        #{s.id.toString().padStart(4, '0')}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {s.cat}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium">
                        ₹{s.price.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-500">
                        {s.disc}% / {s.days}d / {s.rating}★
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] text-slate-600">
                          {s.pay}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[11px] font-medium ${
                            s.cond === 'Damaged'
                              ? 'text-rose-600 font-bold'
                              : s.cond === 'Good'
                              ? 'text-emerald-700'
                              : 'text-slate-500'
                          }`}
                        >
                          {s.cond}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {(s.prob * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        {s.actual === 1 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            Returned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Retained
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-100 gap-3 text-xs text-slate-500">
          <div>
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, filteredSamples.length)} of{' '}
            {filteredSamples.length} orders
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none font-semibold text-slate-700"
            >
              Previous
            </button>
            <span className="px-3 py-1 font-mono font-semibold text-slate-800">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none font-semibold text-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
