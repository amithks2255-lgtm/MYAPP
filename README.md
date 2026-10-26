# ReturnPredict - E-Commerce Product Return Risk Prediction

A web application rewritten from Android Jetpack Compose to React + TypeScript + Tailwind CSS, featuring full in-browser Random Forest machine learning inference and comprehensive Model Performance & Confusion Matrix evaluation metrics.

## Features

- **Live Risk Predictor**:
  - Full parity with original model inputs: Category, Price (₹100 – ₹100,000), Discount (0–80%), Delivery transit days (1–30), Rating (1–5 stars), Payment method, Package arrival condition, and Previous customer returns.
  - Random Forest ensemble inference (40 decision trees, max depth 8) executed client-side without any network latency.
  - Real-time vote share percentage, probability gauge, risk classification (High vs Low), pre/post delivery scenario labeling, and breakdown of key contributing risk drivers.
  - One-click presets (e.g. Impulse Apparel on COD, Prepaid Gadget, Damaged Transit, Safe Kitchen Utensil).

- **Confusion Matrix & Model Performance**:
  - Interactive $2 \times 2$ Confusion Matrix with True Positives (TP), False Positives (FP), False Negatives (FN), and True Negatives (TN).
  - Dynamic Decision Threshold slider ($T \in [0.10, 0.90]$) allowing real-time tuning between Detection Recall (Sensitivity) and Precision.
  - KPI Cards: Accuracy, Precision (PPV), Recall (TPR), Specificity (TNR), F1-Score, and ROC-AUC.
  - Interactive SVG ROC Curve visualizer with dynamic current operating point indicator.
  - Pre-Delivery vs. Post-Delivery sub-matrix comparison.
  - Category-wise return rate and classification accuracy table.
  - Business cost impact simulator calculating operational savings based on unflagged return costs vs intervention costs.

- **Batch Simulator & Error Analysis**:
  - Filter 4,000 held-out test orders by outcome: Hits (TP), False Alarms (FP), Missed Returns (FN), and Retained (TN).
  - Inspect sample features and model probabilities to analyze failure modes and edge cases.

- **Model Architecture & Specifications**:
  - Detailed inspection of the 40 tree topologies, root split features, and underlying risk coefficients from `ml/train.py`.

## Running the App

```bash
npm install
npm run dev
```

The app will run at `http://localhost:3000`.
