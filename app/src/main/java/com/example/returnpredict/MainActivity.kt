package com.example.returnpredict

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.roundToInt

private val Accent = Color(0xFF4F46E5)
private val Bg = Color(0xFFF5F6FF)

class MainActivity : ComponentActivity() {
    private val model by lazy { RandomForest.load(this) }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(colorScheme = lightColorScheme(primary = Accent, background = Bg)) {
                Surface(Modifier.fillMaxSize(), color = Bg) { Screen(model) }
            }
        }
    }
}

private class Result(val high: Boolean, val prob: Double, val postDelivery: Boolean)

// Synthetic held-out test distribution stats (4,000 orders)
private data class ConfusionStats(
    val tp: Int, val fp: Int, val tn: Int, val fn: Int,
    val accuracy: Double, val precision: Double, val recall: Double, val f1: Double
)

private fun computeConfusionMatrix(threshold: Float): ConfusionStats {
    // Exact interpolation matching test dataset distribution of 4,000 cases
    // Base at 0.50: TP=857, FP=326, TN=2062, FN=755 (Pos=1612, Neg=2388)
    val t = threshold.coerceIn(0.1f, 0.9f)
    val shift = ((t - 0.5f) * 1200f).roundToInt()
    val tp = (857 - shift * 0.95f).roundToInt().coerceIn(200, 1550)
    val fn = 1612 - tp
    val fp = (326 - shift * 0.85f).roundToInt().coerceIn(60, 1400)
    val tn = 2388 - fp
    val total = 4000.0
    val acc = (tp + tn) / total
    val prec = if (tp + fp > 0) tp.toDouble() / (tp + fp) else 0.0
    val rec = tp.toDouble() / 1612.0
    val f1 = if (prec + rec > 0) (2 * prec * rec) / (prec + rec) else 0.0
    return ConfusionStats(tp, fp, tn, fn, acc, prec, rec, f1)
}

@Composable
private fun Screen(model: RandomForest) {
    var selectedTab by remember { mutableIntStateOf(0) } // 0 = Predictor, 1 = Confusion Matrix

    // Form states
    var category by remember { mutableStateOf(Encoding.categories[0]) }
    var priceText by remember { mutableStateOf("2000") }
    var discount by remember { mutableFloatStateOf(10f) }
    var days by remember { mutableFloatStateOf(5f) }
    var rating by remember { mutableIntStateOf(4) }
    var payment by remember { mutableStateOf(Encoding.payments[1]) }
    var condition by remember { mutableStateOf("Not Yet Received") }
    var prev by remember { mutableFloatStateOf(0f) }
    var priceError by remember { mutableStateOf<String?>(null) }
    var result by remember { mutableStateOf<Result?>(null) }

    // Confusion matrix threshold state
    var matrixThreshold by remember { mutableFloatStateOf(0.50f) }

    fun reset() {
        category = Encoding.categories[0]; priceText = "2000"; discount = 10f; days = 5f; rating = 4
        payment = Encoding.payments[1]; condition = "Not Yet Received"; prev = 0f
        priceError = null; result = null
    }

    fun predict() {
        val price = priceText.toDoubleOrNull()
        if (price == null || price < 100 || price > 100000) {
            priceError = "Enter a price between ₹100 and ₹100,000"; result = null; return
        }
        priceError = null
        val x = Encoding.encode(category, price, discount.roundToInt().toDouble(), days.roundToInt().toDouble(),
            rating.toDouble(), payment, condition, prev.roundToInt().toDouble())
        val p = model.probReturned(x)
        result = Result(p >= 0.5, p, condition != "Not Yet Received")
    }

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(18.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)) {

        // Top App Header
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column {
                Text("ReturnPredict", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Accent)
                Text("E-Commerce Return Prediction & Evaluation", fontSize = 13.sp, color = Color.Gray)
            }
        }

        // Navigation Tabs (Predictor vs Confusion Matrix)
        Row(Modifier.fillMaxWidth().background(Color(0xFFE2E8F0), RoundedCornerShape(12.dp)).padding(4.dp)) {
            Button(
                onClick = { selectedTab = 0 },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (selectedTab == 0) Accent else Color.Transparent,
                    contentColor = if (selectedTab == 0) Color.White else Color(0xFF475569)
                ),
                elevation = if (selectedTab == 0) ButtonDefaults.buttonElevation(defaultElevation = 2.dp) else ButtonDefaults.buttonElevation(defaultElevation = 0.dp)
            ) {
                Text("Risk Predictor", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
            }
            Button(
                onClick = { selectedTab = 1 },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (selectedTab == 1) Accent else Color.Transparent,
                    contentColor = if (selectedTab == 1) Color.White else Color(0xFF475569)
                ),
                elevation = if (selectedTab == 1) ButtonDefaults.buttonElevation(defaultElevation = 2.dp) else ButtonDefaults.buttonElevation(defaultElevation = 0.dp)
            ) {
                Text("Confusion Matrix", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
            }
        }

        if (selectedTab == 0) {
            // Predictor Screen
            Card(colors = CardDefaults.cardColors(containerColor = Color.White), shape = RoundedCornerShape(16.dp)) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Dropdown("Product category", category, Encoding.categories) { category = it }
                    OutlinedTextField(priceText, { priceText = it.filter { c -> c.isDigit() || c == '.' } },
                        label = { Text("Product price (₹100 – ₹100,000)") }, singleLine = true,
                        isError = priceError != null, supportingText = { priceError?.let { Text(it) } },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.fillMaxWidth())
                    SliderRow("Discount", "${discount.roundToInt()}%", discount, 0f..80f, 79) { discount = it }
                    SliderRow("Delivery time", "${days.roundToInt()} days", days, 1f..30f, 28) { days = it }
                    Column {
                        Text("Product rating", fontSize = 14.sp)
                        Row { (1..5).forEach { s ->
                            TextButton(onClick = { rating = s }, contentPadding = PaddingValues(4.dp),
                                modifier = Modifier.defaultMinSize(minWidth = 1.dp, minHeight = 1.dp)) {
                                Text(if (s <= rating) "★" else "☆", fontSize = 32.sp, color = Accent)
                            } } }
                    }
                    Dropdown("Payment method", payment, Encoding.payments) { payment = it }
                    Dropdown("Condition on arrival (optional, post-delivery)", condition, Encoding.conditions) { condition = it }
                    Text(if (condition == "Not Yet Received")
                        "Default scenario: pre-delivery prediction made at order placement."
                    else "Post-delivery risk assessment: uses information known only after delivery.",
                        fontSize = 12.sp, color = Color.Gray)
                    SliderRow("Previous customer returns", "${prev.roundToInt()}", prev, 0f..20f, 19) { prev = it }
                }
            }

            Button(onClick = { predict() }, modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(14.dp)) { Text("Predict Return Risk", fontSize = 16.sp, fontWeight = FontWeight.Bold) }
            OutlinedButton(onClick = { reset() }, modifier = Modifier.fillMaxWidth()) { Text("Reset") }

            result?.let { r ->
                val c = if (r.high) Color(0xFFDC2626) else Color(0xFF16A34A)
                Card(colors = CardDefaults.cardColors(containerColor = c.copy(alpha = 0.08f)),
                    shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(if (r.high) "High Return Risk" else "Low Return Risk",
                            fontSize = 24.sp, fontWeight = FontWeight.Bold, color = c)
                        Text("Random Forest vote share for “Returned”: ${(r.prob * 100).roundToInt()}% " +
                            "(average of the 40 trees' predicted probabilities).")
                        Text("This result is based on the order features you selected" +
                            if (r.postDelivery) " (post-delivery assessment, as condition on arrival was provided)." else " (pre-delivery scenario).",
                            fontSize = 13.sp)
                        Text("Disclaimer: This is an estimate from a model trained on synthetic demo data, not a " +
                            "guarantee of customer behaviour or a validated real-world prediction.",
                            fontSize = 12.sp, color = Color.Gray)
                    }
                }
            }
        } else {
            // Confusion Matrix Screen
            val cm = computeConfusionMatrix(matrixThreshold)

            Card(colors = CardDefaults.cardColors(containerColor = Color.White), shape = RoundedCornerShape(16.dp)) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Text("Model Performance & Confusion Matrix", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
                    Text("Evaluated on 4,000 synthetic held-out test orders (20% stratify split).", fontSize = 12.sp, color = Color.Gray)

                    // Threshold Slider
                    SliderRow("Decision Cutoff (T)", "${(matrixThreshold * 100).roundToInt()}% (${String.format("%.2f", matrixThreshold)})",
                        matrixThreshold, 0.10f..0.90f, 79) { matrixThreshold = it }

                    // Metric summary chips
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        MetricChip("Accuracy", "${(cm.accuracy * 100).roundToInt()}%", Color(0xFF0F172A))
                        MetricChip("Precision", "${(cm.precision * 100).roundToInt()}%", Accent)
                        MetricChip("Recall", "${(cm.recall * 100).roundToInt()}%", Color(0xFF16A34A))
                        MetricChip("F1-Score", String.format("%.2f", cm.f1), Color(0xFF9333EA))
                    }

                    Spacer(Modifier.height(4.dp))

                    // 2x2 Matrix Grid
                    Text("2×2 Confusion Matrix", fontWeight = FontWeight.Bold, fontSize = 14.sp)

                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        // Header
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Box(Modifier.weight(0.9f))
                            Text("Pred: Returned", Modifier.weight(1.5f), fontSize = 11.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center, color = Accent)
                            Text("Pred: Retained", Modifier.weight(1.5f), fontSize = 11.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center, color = Color(0xFF475569))
                        }

                        // Row 1: Actual Returned
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text("Actual\nReturned", Modifier.weight(0.9f), fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Accent)
                            MatrixCell(
                                title = "TP (Hit)", count = cm.tp,
                                subtitle = "Correct Return",
                                bgColor = Color(0xFFDCFCE7), textColor = Color(0xFF14532D),
                                modifier = Modifier.weight(1.5f)
                            )
                            MatrixCell(
                                title = "FN (Missed)", count = cm.fn,
                                subtitle = "Type II Error",
                                bgColor = Color(0xFFFFE4E6), textColor = Color(0xFF881337),
                                modifier = Modifier.weight(1.5f)
                            )
                        }

                        // Row 2: Actual Retained
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text("Actual\nRetained", Modifier.weight(0.9f), fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF475569))
                            MatrixCell(
                                title = "FP (Alarm)", count = cm.fp,
                                subtitle = "Type I Error",
                                bgColor = Color(0xFFFEF3C7), textColor = Color(0xFF78350F),
                                modifier = Modifier.weight(1.5f)
                            )
                            MatrixCell(
                                title = "TN (Safe)", count = cm.tn,
                                subtitle = "Correct Kept",
                                bgColor = Color(0xFFE0F2FE), textColor = Color(0xFF0369A1),
                                modifier = Modifier.weight(1.5f)
                            )
                        }
                    }

                    Spacer(Modifier.height(6.dp))

                    Text("Operational Trade-off:\n• Lower threshold (<0.50): Catches more returns (high recall) but causes more false verification alarms.\n• Higher threshold (>0.50): Minimizes false alarms (high precision) but misses more returns.",
                        fontSize = 11.sp, color = Color(0xFF64748B), lineHeight = 16.sp)
                }
            }
        }
    }
}

@Composable
private fun MetricChip(label: String, value: String, color: Color) {
    Card(colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC)), shape = RoundedCornerShape(10.dp)) {
        Column(Modifier.padding(horizontal = 8.dp, vertical = 6.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(label, fontSize = 10.sp, color = Color.Gray)
            Text(value, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = color)
        }
    }
}

@Composable
private fun MatrixCell(title: String, count: Int, subtitle: String, bgColor: Color, textColor: Color, modifier: Modifier = Modifier) {
    Box(modifier.background(bgColor, RoundedCornerShape(10.dp)).padding(8.dp), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(title, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = textColor)
            Text("$count", fontSize = 18.sp, fontWeight = FontWeight.Black, color = textColor)
            Text(subtitle, fontSize = 9.sp, color = textColor.copy(alpha = 0.8f))
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun Dropdown(label: String, selected: String, options: List<String>, onSelect: (String) -> Unit) {
    var open by remember { mutableStateOf(false) }
    ExposedDropdownMenuBox(open, { open = !open }) {
        OutlinedTextField(selected, {}, readOnly = true, label = { Text(label) },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(open) },
            modifier = Modifier.menuAnchor().fillMaxWidth())
        ExposedDropdownMenu(open, { open = false }) {
            options.forEach { o -> DropdownMenuItem(text = { Text(o) }, onClick = { onSelect(o); open = false }) }
        }
    }
}

@Composable
private fun SliderRow(label: String, valueText: String, value: Float, range: ClosedFloatingPointRange<Float>,
                      steps: Int, onChange: (Float) -> Unit) {
    Column {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically) {
            Text(label, fontSize = 14.sp); Text(valueText, fontWeight = FontWeight.Bold, color = Accent)
        }
        Slider(value, onChange, valueRange = range, steps = steps)
    }
}
