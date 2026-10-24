package com.example.returnpredict

import android.content.Context
import org.json.JSONObject

/** Inference for a scikit-learn RandomForestClassifier exported by ml/train.py (rf_model.json). */
class RandomForest private constructor(private val trees: List<Tree>) {

    private class Tree(val f: IntArray, val t: DoubleArray, val l: IntArray, val r: IntArray, val p: DoubleArray)

    /** Mean of per-tree P(Returned), identical to sklearn's predict_proba[:, 1]. */
    fun probReturned(x: DoubleArray): Double =
        trees.map { tr ->
            var n = 0
            while (tr.l[n] != -1) n = if (x[tr.f[n]] <= tr.t[n]) tr.l[n] else tr.r[n]
            tr.p[n]
        }.average()

    companion object {
        fun load(ctx: Context): RandomForest {
            val json = ctx.assets.open("rf_model.json").bufferedReader().use { it.readText() }
            val arr = JSONObject(json).getJSONArray("trees")
            val trees = (0 until arr.length()).map { i ->
                val o = arr.getJSONObject(i)
                fun ints(k: String) = o.getJSONArray(k).let { a -> IntArray(a.length()) { a.getInt(it) } }
                fun dbls(k: String) = o.getJSONArray(k).let { a -> DoubleArray(a.length()) { a.getDouble(it) } }
                Tree(ints("f"), dbls("t"), ints("l"), ints("r"), dbls("p"))
            }
            return RandomForest(trees)
        }
    }
}

object Encoding {
    val categories = listOf("Electronics", "Clothing", "Footwear", "Home & Kitchen", "Beauty", "Other")
    val payments = listOf("Cash on Delivery", "UPI", "Card", "Other")
    val conditions = listOf("Not Yet Received", "Good", "Damaged")
    private val trainCond = listOf("Good", "Damaged", "Not Yet Received") // order used in train.py

    /** Must match train.py encode(): [price, discount, days, rating, prev] + one-hots (cat, pay, cond). */
    fun encode(cat: String, price: Double, disc: Double, days: Double, rating: Double,
               pay: String, cond: String, prev: Double): DoubleArray {
        val v = ArrayList<Double>()
        v += listOf(price, disc, days, rating, prev)
        categories.forEach { v += if (it == cat) 1.0 else 0.0 }
        payments.forEach { v += if (it == pay) 1.0 else 0.0 }
        trainCond.forEach { v += if (it == cond) 1.0 else 0.0 }
        return v.toDoubleArray()
    }
}
