export interface Tree {
  f: number[];  // Feature indices
  t: number[];  // Split thresholds
  l: number[];  // Left child indices (-1 for leaf)
  r: number[];  // Right child indices (-1 for leaf)
  p: number[];  // Probability of class 1 ("Returned") at each node
}

export interface ModelData {
  features: string[];
  trees: Tree[];
}

export interface OrderInput {
  category: string;
  price: number;
  discount: number;
  deliveryDays: number;
  rating: number;
  paymentMethod: string;
  condition: string;
  previousReturns: number;
}

export interface PredictionResult {
  highRisk: boolean;
  probability: number;
  voteSharePercent: number;
  postDelivery: boolean;
  positiveTreeVotes: number;
  totalTrees: number;
  input: OrderInput;
  riskFactors: {
    name: string;
    impact: 'elevates' | 'reduces' | 'neutral';
    detail: string;
  }[];
}

export interface TestSample {
  id: number;
  actual: number; // 0 = retained, 1 = returned
  prob: number;
  cat: string;
  pay: string;
  cond: string;
  price: number;
  disc: number;
  days: number;
  rating: number;
  prev: number;
}

export interface ConfusionMatrixStats {
  threshold: number;
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  total: number;
  actualPositives: number;
  actualNegatives: number;
  predictedPositives: number;
  predictedNegatives: number;
  accuracy: number;
  precision: number;
  recall: number;
  specificity: number;
  f1Score: number;
  balancedAccuracy: number;
  fpr: number; // False positive rate: FP / (FP + TN)
  fnr: number; // False negative rate: FN / (FN + TP)
}
