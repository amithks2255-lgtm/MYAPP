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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.roundToInt

private val Accent = Color(0xFF4F46E5)
private val Bg = Color(0xFFF5F6FF)

class MainActivity : ComponentActivity() {
    private val model by lazy { RandomForest.load(this) } // loaded from assets, no network
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

@Composable
private fun Screen(model: RandomForest) {
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

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("ReturnPredict", fontSize = 30.sp, fontWeight = FontWeight.Bold, color = Accent)
        Text("E-Commerce Product Return Prediction", color = Color.Gray)

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

        Button(onClick = { predict() }, modifier = Modifier.fillMaxWidth().height(54.dp),
            shape = RoundedCornerShape(14.dp)) { Text("Predict Return Risk", fontSize = 16.sp) }
        OutlinedButton(onClick = { reset() }, modifier = Modifier.fillMaxWidth()) { Text("Reset") }

        result?.let { r ->
            val c = if (r.high) Color(0xFFDC2626) else Color(0xFF16A34A)
            Card(colors = CardDefaults.cardColors(containerColor = c.copy(alpha = 0.1f)),
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
