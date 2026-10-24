"""Train a Random Forest on SYNTHETIC e-commerce data and export it as JSON for Android.
Run: pip install scikit-learn numpy && python train.py"""
import json
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

CATS = ["Electronics", "Clothing", "Footwear", "Home & Kitchen", "Beauty", "Other"]
PAY = ["Cash on Delivery", "UPI", "Card", "Other"]
COND = ["Good", "Damaged", "Not Yet Received"]
FEATURES = (["price", "discount", "delivery_days", "rating", "previous_returns"]
            + ["cat_" + c for c in CATS] + ["pay_" + p for p in PAY] + ["cond_" + c for c in COND])


def encode(cat, price, disc, days, rating, pay, cond, prev):
    """Single source of truth for feature order (mirrored in RandomForest.kt)."""
    v = [price, disc, days, rating, prev]
    v += [1.0 if i == cat else 0.0 for i in range(len(CATS))]
    v += [1.0 if i == pay else 0.0 for i in range(len(PAY))]
    v += [1.0 if i == cond else 0.0 for i in range(len(COND))]
    return v


rng = np.random.default_rng(42)
N = 20000
X, y = [], []
cat_risk = [0.0, 0.9, 0.7, -0.2, 0.2, 0.1]
pay_risk = [0.8, -0.2, -0.1, 0.0]
for _ in range(N):
    cat = int(rng.integers(0, 6))
    pay = int(rng.integers(0, 4))
    price = float(np.exp(rng.uniform(np.log(100), np.log(100000))))
    disc = float(rng.integers(0, 81))
    days = float(rng.integers(1, 31))
    rating = float(rng.integers(1, 6))
    prev = float(min(20, rng.poisson(1.5)))
    cond = int(rng.choice(3, p=[0.2, 0.1, 0.7]))
    z = (-3.9 + cat_risk[cat] + pay_risk[pay] + 0.035 * disc + 0.06 * days
         - 0.5 * (rating - 3) + 0.22 * prev + 0.15 * np.log10(price / 1000)
         + (-0.6 if cond == 0 else 2.2 if cond == 1 else 0.0) + rng.normal(0, 0.8))
    X.append(encode(cat, price, disc, days, rating, pay, cond, prev))
    y.append(int(rng.random() < 1 / (1 + np.exp(-z))))

X, y = np.array(X), np.array(y)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=1, stratify=y)
rf = RandomForestClassifier(n_estimators=40, max_depth=8, min_samples_leaf=30,
                            random_state=1, n_jobs=-1).fit(Xtr, ytr)
print("Return rate: %.2f | Held-out accuracy (synthetic data): %.3f"
      % (y.mean(), accuracy_score(yte, rf.predict(Xte))))

trees = []
for e in rf.estimators_:
    t = e.tree_
    v = t.value[:, 0, :]
    p1 = v[:, 1] / v.sum(axis=1)
    trees.append({"f": t.feature.tolist(),
                  "t": [round(float(x), 4) for x in t.threshold],
                  "l": t.children_left.tolist(), "r": t.children_right.tolist(),
                  "p": [round(float(x), 4) for x in p1]})
json.dump({"features": FEATURES, "trees": trees},
          open("../app/src/main/assets/rf_model.json", "w"), separators=(",", ":"))


# Parity check: same tree walk as the Kotlin code vs. sklearn.
def walk(tr, x):
    n = 0
    while tr["l"][n] != -1:
        n = tr["l"][n] if x[tr["f"][n]] <= tr["t"][n] else tr["r"][n]
    return tr["p"][n]


sub = Xte[:500]
mine = np.array([np.mean([walk(tr, x) for tr in trees]) for x in sub])
ref = rf.predict_proba(sub)[:, 1]
print("Max |walk - sklearn| prob diff:", float(np.abs(mine - ref).max()),
      "| label agreement:", float(((mine >= .5) == (ref >= .5)).mean()))
