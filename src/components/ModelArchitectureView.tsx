import React, { useState } from 'react';
import { getModelMetadata } from '../lib/randomForest';
import { Cpu, Layers, GitBranch, Binary, Terminal, CheckCircle } from 'lucide-react';
import rawModel from '../data/rf_model.json';

export const ModelArchitectureView: React.FC = () => {
  const meta = getModelMetadata();
  const [selectedTreeIndex, setSelectedTreeIndex] = useState<number>(0);
  const selectedTree = rawModel.trees[selectedTreeIndex];

  // Feature weights / coefficients from ml/train.py synthesis logic
  const featureWeights = [
    { name: 'cond_Damaged', type: 'Arrival Condition', weight: '+2.20', note: 'Largest positive contributor to return probability' },
    { name: 'cat_Clothing', type: 'Merchandise Category', weight: '+0.90', note: 'Fit, styling, sizing variability' },
    { name: 'pay_Cash on Delivery', type: 'Payment Method', weight: '+0.80', note: 'Zero friction upfront, higher doorstep rejection' },
    { name: 'cat_Footwear', type: 'Merchandise Category', weight: '+0.70', note: 'Size and comfort mismatch' },
    { name: 'previous_returns', type: 'Customer History', weight: '+0.22/unit', note: 'Persistent buyer return habit' },
    { name: 'price (log10)', type: 'Product Price', weight: '+0.15/log', note: 'Higher ticket value increases evaluation scrutiny' },
    { name: 'delivery_days', type: 'Fulfillment Window', weight: '+0.06/day', note: 'Longer wait drives buyer remorse / local alternatives' },
    { name: 'discount', type: 'Promotions', weight: '+0.035/%', note: 'Deep clearance discount impulse buys' },
    { name: 'rating', type: 'Product Quality', weight: '-0.50/star', note: 'High star ratings significantly reduce return odds' },
    { name: 'cond_Good', type: 'Arrival Condition', weight: '-0.60', note: 'Undamaged verified delivery' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Random Forest Model Architecture & Specification
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Trained in Python with scikit-learn, exported to lightweight JSON, and evaluated in pure JavaScript/TypeScript.
            </p>
          </div>
        </div>
      </div>

      {/* Model Spec Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Layers className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Estimators</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{meta.totalTrees} Trees</div>
          <div className="text-xs text-slate-500 mt-1">Independent bagged decision trees</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <GitBranch className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Max Depth</span>
          </div>
          <div className="text-2xl font-black text-slate-900">8 Levels</div>
          <div className="text-xs text-slate-500 mt-1">Constrained for fast edge inference</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Binary className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Features</span>
          </div>
          <div className="text-2xl font-black text-slate-900">18 Inputs</div>
          <div className="text-xs text-slate-500 mt-1">5 continuous + 13 one-hot categories</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Parity</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">100% Match</div>
          <div className="text-xs text-slate-500 mt-1">Zero difference vs sklearn / Android Kotlin</div>
        </div>
      </div>

      {/* Feature Importance & Synthesis Weights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Feature Importance & Underlying Risk Logits
          </h3>
          <p className="text-xs text-slate-500">
            How each attribute affects the underlying log-odds of a customer return in the data generation model:
          </p>

          <div className="divide-y divide-slate-100">
            {featureWeights.map((f, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 font-mono">{f.name}</div>
                  <div className="text-slate-500 text-[11px]">{f.note}</div>
                </div>
                <div className="text-right">
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded ${
                      f.weight.startsWith('+')
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {f.weight}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">{f.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Individual Tree Inspector */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Tree Inspector
            </h3>
            <select
              value={selectedTreeIndex}
              onChange={(e) => setSelectedTreeIndex(parseInt(e.target.value))}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
            >
              {Array.from({ length: meta.totalTrees }).map((_, i) => (
                <option key={i} value={i}>
                  Tree #{i + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-xs space-y-2">
            <div className="text-indigo-400 font-bold flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Terminal className="w-4 h-4" />
              <span>Tree #{selectedTreeIndex + 1} Node Topology</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px]">
              <div>Total Nodes: <span className="text-white font-bold">{selectedTree.f.length}</span></div>
              <div>Leaves: <span className="text-white font-bold">{selectedTree.l.filter(x => x === -1).length}</span></div>
              <div>Root Feature: <span className="text-indigo-300 font-bold">{meta.features[selectedTree.f[0]] || 'Feature #' + selectedTree.f[0]}</span></div>
              <div>Root Split: <span className="text-amber-300 font-bold">≤ {selectedTree.t[0]}</span></div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 leading-relaxed border-t border-slate-800">
              At inference time, an input vector walks each tree from node 0. When it reaches a leaf node (left child == -1), the node's stored empirical probability P(Returned) is accumulated. The mean across all 40 trees yields the final ensemble score.
            </div>
          </div>

          {/* Tree Walk Algorithm Code Snippet */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs">
            <div className="font-bold text-slate-700 mb-1.5">TypeScript Tree Walk Engine</div>
            <pre className="text-[11px] font-mono text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 overflow-x-auto">
{`function walkTree(tree: Tree, x: number[]): number {
  let node = 0;
  while (tree.l[node] !== -1) {
    node = (x[tree.f[node]] <= tree.t[node]) 
      ? tree.l[node] 
      : tree.r[node];
  }
  return tree.p[node];
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
