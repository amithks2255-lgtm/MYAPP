import { ConfusionMatrixStats, TestSample } from '../types/model';
import rawTestData from '../data/testDataset.json';

export const testDataset: TestSample[] = rawTestData as TestSample[];

/**
 * Computes confusion matrix and all standard classification metrics
 * for a given probability decision threshold (default 0.50).
 */
export function calculateConfusionMatrix(
  dataset: TestSample[] = testDataset,
  threshold: number = 0.5
): ConfusionMatrixStats {
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;

  for (let i = 0; i < dataset.length; i++) {
    const d = dataset[i];
    const predicted = d.prob >= threshold ? 1 : 0;
    const actual = d.actual;

    if (predicted === 1 && actual === 1) {
      tp++;
    } else if (predicted === 1 && actual === 0) {
      fp++;
    } else if (predicted === 0 && actual === 0) {
      tn++;
    } else {
      fn++;
    }
  }

  const total = dataset.length;
  const actualPositives = tp + fn;
  const actualNegatives = tn + fp;
  const predictedPositives = tp + fp;
  const predictedNegatives = tn + fn;

  const accuracy = total > 0 ? (tp + tn) / total : 0;
  const precision = predictedPositives > 0 ? tp / predictedPositives : 0;
  const recall = actualPositives > 0 ? tp / actualPositives : 0;
  const specificity = actualNegatives > 0 ? tn / actualNegatives : 0;
  const f1Score =
    precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const balancedAccuracy = (recall + specificity) / 2;
  const fpr = actualNegatives > 0 ? fp / actualNegatives : 0;
  const fnr = actualPositives > 0 ? fn / actualPositives : 0;

  return {
    threshold,
    tp,
    fp,
    tn,
    fn,
    total,
    actualPositives,
    actualNegatives,
    predictedPositives,
    predictedNegatives,
    accuracy,
    precision,
    recall,
    specificity,
    f1Score,
    balancedAccuracy,
    fpr,
    fnr,
  };
}

/**
 * Generates ROC curve coordinate points (FPR vs TPR / Recall)
 * across 25 threshold steps from 0.0 to 1.0.
 */
export function generateRocCurvePoints(dataset: TestSample[] = testDataset) {
  const points: { threshold: number; fpr: number; tpr: number }[] = [];
  const steps = 40;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cm = calculateConfusionMatrix(dataset, t);
    points.push({
      threshold: t,
      fpr: cm.fpr,
      tpr: cm.recall,
    });
  }

  // Calculate approximate Area Under ROC Curve (AUC) using trapezoidal rule
  let auc = 0;
  // Sort by FPR ascending
  const sorted = [...points].sort((a, b) => a.fpr - b.fpr);
  for (let i = 1; i < sorted.length; i++) {
    const dx = sorted[i].fpr - sorted[i - 1].fpr;
    const avgY = (sorted[i].tpr + sorted[i - 1].tpr) / 2;
    auc += Math.abs(dx) * avgY;
  }

  return { points: sorted, auc: Math.min(1, Math.max(0, auc)) };
}

/**
 * Computes confusion matrices broken down by product category.
 */
export function getCategoryBreakdown(
  dataset: TestSample[] = testDataset,
  threshold: number = 0.5
) {
  const categories = Array.from(new Set(dataset.map((d) => d.cat)));

  return categories.map((category) => {
    const subset = dataset.filter((d) => d.cat === category);
    const cm = calculateConfusionMatrix(subset, threshold);
    const returnRate = subset.filter((d) => d.actual === 1).length / subset.length;

    return {
      category,
      totalCount: subset.length,
      returnRate,
      ...cm,
    };
  });
}

/**
 * Computes comparison between pre-delivery and post-delivery predictions.
 */
export function getScenarioBreakdown(
  dataset: TestSample[] = testDataset,
  threshold: number = 0.5
) {
  const preDelivery = dataset.filter((d) => d.cond === 'Not Yet Received');
  const postDelivery = dataset.filter((d) => d.cond !== 'Not Yet Received');

  return {
    preDelivery: {
      label: 'Pre-Delivery Orders',
      description: 'Prediction evaluated before fulfillment (Condition: Not Yet Received)',
      count: preDelivery.length,
      cm: calculateConfusionMatrix(preDelivery, threshold),
    },
    postDelivery: {
      label: 'Post-Delivery Orders',
      description: 'Evaluation incorporating arrival package status (Good or Damaged)',
      count: postDelivery.length,
      cm: calculateConfusionMatrix(postDelivery, threshold),
    },
  };
}
