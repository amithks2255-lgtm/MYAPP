import React, { useState } from 'react';
import {
  CATEGORIES,
  PAYMENT_METHODS,
  CONDITIONS,
  predictOrderRisk,
} from '../lib/randomForest';
import { OrderInput, PredictionResult } from '../types/model';
import { PredictionResultCard } from './PredictionResultCard';
import { RotateCcw, ArrowRight, Star, AlertCircle, Sparkles } from 'lucide-react';

interface Preset {
  name: string;
  desc: string;
  data: OrderInput;
}

const PRESETS: Preset[] = [
  {
    name: 'Impulse Apparel on COD',
    desc: 'Clothing, high discount, COD, 3 previous returns (Typical High Risk)',
    data: {
      category: 'Clothing',
      price: 3200,
      discount: 45,
      deliveryDays: 8,
      rating: 3,
      paymentMethod: 'Cash on Delivery',
      condition: 'Not Yet Received',
      previousReturns: 3,
    },
  },
  {
    name: 'Prepaid Premium Gadget',
    desc: 'Electronics, prepaid UPI, 5-star, zero prior returns (Low Risk)',
    data: {
      category: 'Electronics',
      price: 18500,
      discount: 10,
      deliveryDays: 3,
      rating: 5,
      paymentMethod: 'UPI',
      condition: 'Not Yet Received',
      previousReturns: 0,
    },
  },
  {
    name: 'Damaged Transit Arrival',
    desc: 'Footwear received with physical damage (Critical Post-Delivery Risk)',
    data: {
      category: 'Footwear',
      price: 4200,
      discount: 20,
      deliveryDays: 6,
      rating: 4,
      paymentMethod: 'Card',
      condition: 'Damaged',
      previousReturns: 1,
    },
  },
  {
    name: 'Safe Kitchen Utensil',
    desc: 'Home & Kitchen, intact arrival, zero returns (Minimal Risk)',
    data: {
      category: 'Home & Kitchen',
      price: 1400,
      discount: 5,
      deliveryDays: 4,
      rating: 4,
      paymentMethod: 'Card',
      condition: 'Good',
      previousReturns: 0,
    },
  },
];

export const PredictorForm: React.FC = () => {
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [priceText, setPriceText] = useState<string>('2000');
  const [discount, setDiscount] = useState<number>(10);
  const [deliveryDays, setDeliveryDays] = useState<number>(5);
  const [rating, setRating] = useState<number>(4);
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[1]);
  const [condition, setCondition] = useState<string>('Not Yet Received');
  const [previousReturns, setPreviousReturns] = useState<number>(0);

  const [priceError, setPriceError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const handleReset = () => {
    setCategory(CATEGORIES[0]);
    setPriceText('2000');
    setDiscount(10);
    setDeliveryDays(5);
    setRating(4);
    setPaymentMethod(PAYMENT_METHODS[1]);
    setCondition('Not Yet Received');
    setPreviousReturns(0);
    setPriceError(null);
    setResult(null);
  };

  const applyPreset = (preset: Preset) => {
    setCategory(preset.data.category);
    setPriceText(preset.data.price.toString());
    setDiscount(preset.data.discount);
    setDeliveryDays(preset.data.deliveryDays);
    setRating(preset.data.rating);
    setPaymentMethod(preset.data.paymentMethod);
    setCondition(preset.data.condition);
    setPreviousReturns(preset.data.previousReturns);
    setPriceError(null);

    // Automatically evaluate prediction on preset select
    const res = predictOrderRisk(preset.data);
    setResult(res);
  };

  const handlePredict = () => {
    const price = parseFloat(priceText);
    if (isNaN(price) || price < 100 || price > 100000) {
      setPriceError('Enter a price between ₹100 and ₹100,000');
      setResult(null);
      return;
    }
    setPriceError(null);

    const input: OrderInput = {
      category,
      price,
      discount: Math.round(discount),
      deliveryDays: Math.round(deliveryDays),
      rating,
      paymentMethod,
      condition,
      previousReturns: Math.round(previousReturns),
    };

    const res = predictOrderRisk(input);
    setResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Interactive Order Risk Evaluation
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Input order parameters to evaluate return probability across the 40 Random Forest decision trees.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Presets:
            </span>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors"
                title={p.desc}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Inputs Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          {/* Product Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Product Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Product Price */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Product Price (₹100 – ₹100,000)
              </label>
              <span className="text-xs text-indigo-600 font-bold tabular-nums">
                ₹{priceText || '0'}
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-semibold text-sm">
                ₹
              </div>
              <input
                type="number"
                min="100"
                max="100000"
                step="50"
                value={priceText}
                onChange={(e) => {
                  setPriceText(e.target.value);
                  if (priceError) setPriceError(null);
                }}
                placeholder="2000"
                className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm font-medium outline-hidden transition-all ${
                  priceError
                    ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
            </div>
            {priceError && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {priceError}
              </p>
            )}
          </div>

          {/* Discount Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Discount
              </label>
              <span className="text-xs font-bold text-indigo-600 tabular-nums bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {Math.round(discount)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="1"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>0% (Full Price)</span>
              <span>40%</span>
              <span>80% (Heavy Clearance)</span>
            </div>
          </div>

          {/* Delivery Time Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Delivery Time
              </label>
              <span className="text-xs font-bold text-indigo-600 tabular-nums bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {Math.round(deliveryDays)} {deliveryDays === 1 ? 'day' : 'days'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>1 day (Express)</span>
              <span>15 days</span>
              <span>30 days (Standard / Delayed)</span>
            </div>
          </div>

          {/* Product Rating (Stars) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Product Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className={`p-1.5 rounded-lg transition-transform hover:scale-110 focus:outline-hidden ${
                    s <= rating ? 'text-amber-400' : 'text-slate-300 hover:text-slate-400'
                  }`}
                  aria-label={`Set rating to ${s} stars`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
              <span className="ml-2 text-sm font-bold text-slate-700">
                {rating}.0 out of 5
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden transition-all"
            >
              {PAYMENT_METHODS.map((pay) => (
                <option key={pay} value={pay}>
                  {pay}
                </option>
              ))}
            </select>
          </div>

          {/* Condition on Arrival */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Condition on Arrival (Optional, Post-Delivery)
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden transition-all"
            >
              {CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-500 leading-normal">
              {condition === 'Not Yet Received'
                ? 'Default scenario: pre-delivery prediction made at order placement.'
                : 'Post-delivery risk assessment: uses information known only after delivery.'}
            </p>
          </div>

          {/* Previous Customer Returns */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Previous Customer Returns
              </label>
              <span className="text-xs font-bold text-indigo-600 tabular-nums bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {Math.round(previousReturns)} returns
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={previousReturns}
              onChange={(e) => setPreviousReturns(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>0 (First-time / Loyal)</span>
              <span>10</span>
              <span>20 (High Frequency Returner)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handlePredict}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <span>Predict Return Risk</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Results & Live Diagnostics Column */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <PredictionResultCard result={result} />
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Ready to Predict
              </h3>
              <p className="text-sm text-slate-500 mt-1.5 max-w-sm mx-auto">
                Adjust the order characteristics on the left and click <strong>Predict Return Risk</strong> to see the Random Forest classification and individual tree consensus.
              </p>
              <button
                type="button"
                onClick={handlePredict}
                className="mt-5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <span>Run default scenario (₹2,000 Electronics)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mini Model Summary Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs text-xs space-y-3">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
              <span className="font-semibold text-slate-300">Model Engine</span>
              <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-indigo-300">RandomForest</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div>
                <span className="text-slate-500 block">Estimator Count</span>
                <span className="font-bold text-slate-100 text-sm">40 Decision Trees</span>
              </div>
              <div>
                <span className="text-slate-500 block">Input Features</span>
                <span className="font-bold text-slate-100 text-sm">18 One-Hot Dims</span>
              </div>
              <div>
                <span className="text-slate-500 block">Max Tree Depth</span>
                <span className="font-bold text-slate-100 text-sm">8 Levels</span>
              </div>
              <div>
                <span className="text-slate-500 block">Decision Boundary</span>
                <span className="font-bold text-indigo-400 text-sm">P ≥ 0.50 (Adjustable)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
