package com.vanasetu.app

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.graphics.Bitmap
import android.location.Location
import android.os.Bundle
import android.provider.MediaStore
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.widget.doAfterTextChanged
import com.google.android.material.button.MaterialButton
import com.google.android.material.card.MaterialCardView
import com.google.android.material.materialswitch.MaterialSwitch
import com.google.android.material.textfield.TextInputEditText
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import org.tensorflow.lite.Interpreter
import java.io.FileInputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.channels.FileChannel
import java.util.*
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MainActivity : AppCompatActivity() {

    private lateinit var imageView: ImageView
    private lateinit var tvResult: TextView
    private lateinit var tvConfidence: TextView
    private lateinit var tvLocation: TextView
    private lateinit var tvTime: TextView
    private lateinit var etCollectorName: TextInputEditText
    private lateinit var etWeight: TextInputEditText
    private lateinit var etNotes: TextInputEditText
    private lateinit var btnSubmit: MaterialButton
    private lateinit var cardResult: MaterialCardView
    private lateinit var successPopup: MaterialCardView
    private lateinit var ivCheck: ImageView
    private lateinit var switchLang: MaterialSwitch
    
    private lateinit var tflite: Interpreter
    private lateinit var labels: List<String>
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var apiService: ApiService

    private var currentHerb: String = ""
    private var currentConfidence: Float = 0f
    private var currentLat: Double = 0.0
    private var currentLon: Double = 0.0

    // Camera Launcher with Null Safety
    private val cameraLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == RESULT_OK) {
            val bitmap = result.data?.extras?.get("data") as? Bitmap
            if (bitmap != null) {
                imageView.setImageBitmap(bitmap)
                runInference(bitmap)
                fetchLocation()
            } else {
                Toast.makeText(this, getString(R.string.pending), Toast.LENGTH_SHORT).show()
            }
        }
    }

    private val requestPermissionLauncher = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { permissions ->
        if (permissions[Manifest.permission.CAMERA] == true && 
            permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true) {
            openCamera()
        } else {
            Toast.makeText(this, getString(R.string.validation_error), Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Initialize Views
        imageView = findViewById(R.id.imageView)
        tvResult = findViewById(R.id.tvResult)
        tvConfidence = findViewById(R.id.tvConfidence)
        tvLocation = findViewById(R.id.tvLocation)
        tvTime = findViewById(R.id.tvTime)
        etCollectorName = findViewById(R.id.etCollectorName)
        etWeight = findViewById(R.id.etWeight)
        etNotes = findViewById(R.id.etNotes)
        btnSubmit = findViewById(R.id.btnSubmit)
        cardResult = findViewById(R.id.cardResult)
        successPopup = findViewById(R.id.successPopup)
        ivCheck = findViewById(R.id.ivCheck)
        switchLang = findViewById(R.id.switchLang)
        val btnCapture = findViewById<MaterialButton>(R.id.btnCapture)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        // Initialize Retrofit
        val retrofit = Retrofit.Builder()
            .baseUrl("https://192.168.137.196:8000") // Connect to backend on the local network
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        apiService = retrofit.create(ApiService::class.java)

        try {
            initTFLite()
        } catch (e: Exception) {
            Toast.makeText(this, "Model Error: ${e.message}", Toast.LENGTH_LONG).show()
        }

        // Listeners
        btnCapture.setOnClickListener { checkPermissionsAndOpen() }
        btnSubmit.setOnClickListener { submitHarvest() }
        
        switchLang.setOnCheckedChangeListener { _, isChecked ->
            updateLanguage(if (isChecked) "hi" else "en")
        }

        // Validation for Submit button
        etCollectorName.doAfterTextChanged { validateForm() }
        etWeight.doAfterTextChanged { validateForm() }
    }

    private fun updateLanguage(lang: String) {
        val locale = Locale(lang)
        Locale.setDefault(locale)
        val config = Configuration()
        config.setLocale(locale)
        
        // This updates the internal resources so getString() returns the right language
        val context = createConfigurationContext(config)
        val resources = context.resources

        // Update all UI strings manually to avoid the "recreate glitch"
        findViewById<TextView>(R.id.tvAppName).text = resources.getString(R.string.app_name)
        findViewById<MaterialButton>(R.id.btnCapture).text = resources.getString(R.string.camera_btn)
        findViewById<MaterialButton>(R.id.btnSubmit).text = resources.getString(R.string.submit_btn)
        findViewById<com.google.android.material.textfield.TextInputLayout>(R.id.tilName).hint = resources.getString(R.string.collector_name_hint)
        findViewById<com.google.android.material.textfield.TextInputLayout>(R.id.tilWeight).hint = resources.getString(R.string.weight_hint)
        findViewById<com.google.android.material.textfield.TextInputLayout>(R.id.tilNotes).hint = resources.getString(R.string.notes_hint)
        findViewById<TextView>(R.id.tvSuccessTitle).text = resources.getString(R.string.success_title)
        findViewById<TextView>(R.id.tvSuccessSub).text = resources.getString(R.string.success_subtext)
        
        // If results are showing, update them too
        if (currentHerb.isNotEmpty()) {
            tvResult.text = resources.getString(R.string.herb_detected, currentHerb)
            tvConfidence.text = resources.getString(R.string.confidence, currentConfidence)
        }
        
        // Update persistent text
        tvLocation.text = resources.getString(R.string.gps_label, if(currentLat != 0.0) "$currentLat, $currentLon" else resources.getString(R.string.pending))
        
        // Update the global locale for future getString calls
        baseContext.resources.updateConfiguration(config, baseContext.resources.displayMetrics)
    }

    private fun validateForm() {
        val name = etCollectorName.text?.toString() ?: ""
        val weight = etWeight.text?.toString() ?: ""
        btnSubmit.isEnabled = name.isNotEmpty() && weight.isNotEmpty() && currentHerb.isNotEmpty()
    }

    private fun initTFLite() {
        try {
            val modelFileDescriptor = assets.openFd("mobilenet_v2_5_classes.tflite")
            val inputStream = FileInputStream(modelFileDescriptor.fileDescriptor)
            val fileChannel = inputStream.channel
            val startOffset = modelFileDescriptor.startOffset
            val declaredLength = modelFileDescriptor.declaredLength
            val mappedByteBuffer = fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength)
            tflite = Interpreter(mappedByteBuffer)
            labels = assets.open("labels.txt").bufferedReader().readLines()
        } catch (e: Exception) {
            android.util.Log.e("TFLite", "Error loading model", e)
        }
    }

    private fun checkPermissionsAndOpen() {
        val cameraPerm = ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
        val locationPerm = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)

        if (cameraPerm == PackageManager.PERMISSION_GRANTED && locationPerm == PackageManager.PERMISSION_GRANTED) {
            openCamera()
        } else {
            requestPermissionLauncher.launch(arrayOf(Manifest.permission.CAMERA, Manifest.permission.ACCESS_FINE_LOCATION))
        }
    }

    private fun openCamera() {
        val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        cameraLauncher.launch(intent)
    }

    private fun runInference(bitmap: Bitmap) {
        try {
            if (!::tflite.isInitialized || !::labels.isInitialized) return

            val resizedBitmap = Bitmap.createScaledBitmap(bitmap, 256, 256, true)
            val inputBuffer = ByteBuffer.allocateDirect(1 * 256 * 256 * 3 * 4).apply { order(ByteOrder.nativeOrder()) }
            val intValues = IntArray(256 * 256)
            resizedBitmap.getPixels(intValues, 0, resizedBitmap.width, 0, 0, resizedBitmap.width, resizedBitmap.height)
            
            for (pixelValue in intValues) {
                inputBuffer.putFloat(((pixelValue shr 16 and 0xFF) / 255f))
                inputBuffer.putFloat(((pixelValue shr 8 and 0xFF) / 255f))
                inputBuffer.putFloat(((pixelValue and 0xFF) / 255f))
            }

            val outputBuffer = Array(1) { FloatArray(labels.size) }
            tflite.run(inputBuffer, outputBuffer)

            val probabilities = outputBuffer[0]
            val maxIndex = probabilities.indices.maxByOrNull { probabilities[it] } ?: -1
            
            if (maxIndex != -1 && maxIndex < labels.size) {
                currentHerb = labels[maxIndex]
                currentConfidence = probabilities[maxIndex] * 100
                
                cardResult.visibility = View.VISIBLE
                tvResult.text = getString(R.string.herb_detected, currentHerb)
                tvConfidence.text = getString(R.string.confidence, currentConfidence)
                ivCheck.visibility = if (currentConfidence > 80) View.VISIBLE else View.GONE
                
                val sdf = java.text.SimpleDateFormat("HH:mm:ss, dd MMM yyyy", Locale.getDefault())
                tvTime.text = getString(R.string.time_label, sdf.format(Date()))
                validateForm()
            }
        } catch (e: Exception) {
            Toast.makeText(this, "AI Error: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    @SuppressLint("MissingPermission")
    private fun fetchLocation() {
        try {
            tvLocation.text = getString(R.string.pending)
            fusedLocationClient.lastLocation.addOnSuccessListener { location: Location? ->
                if (location != null) {
                    currentLat = location.latitude
                    currentLon = location.longitude
                    tvLocation.text = getString(R.string.gps_label, "${location.latitude}, ${location.longitude}")
                } else {
                    fusedLocationClient.getCurrentLocation(com.google.android.gms.location.Priority.PRIORITY_HIGH_ACCURACY, null)
                        .addOnSuccessListener { fresh ->
                            if (fresh != null) {
                                currentLat = fresh.latitude
                                currentLon = fresh.longitude
                                tvLocation.text = getString(R.string.gps_label, "${fresh.latitude}, ${fresh.longitude}")
                            }
                        }
                }
            }
        } catch (e: Exception) { /* Silent */ }
    }

    private fun submitHarvest() {
        val name = etCollectorName.text?.toString() ?: ""
        val weight = etWeight.text?.toString() ?: 0.0f
        val weightFloat = try { weight.toString().toFloat() } catch(e: Exception) { 0.0f }

        val request = HarvestRequest(
            herb_name = currentHerb,
            collector_name = name,
            weight_kg = weightFloat,
            gps_lat = currentLat,
            gps_lng = currentLon,
            gps_place_name = tvLocation.text.toString().replace("GPS: ", ""),
            ai_confidence = currentConfidence
        )

        // Disable UI
        btnSubmit.isEnabled = false
        
        apiService.submitHarvest(request).enqueue(object : Callback<HarvestResponse> {
            override fun onResponse(call: Call<HarvestResponse>, response: Response<HarvestResponse>) {
                if (response.isSuccessful && response.body()?.success == true) {
                    showSuccess()
                } else {
                    btnSubmit.isEnabled = true
                    Toast.makeText(this@MainActivity, "Error: ${response.message()}", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<HarvestResponse>, t: Throwable) {
                btnSubmit.isEnabled = true
                Toast.makeText(this@MainActivity, "Network Error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun showSuccess() {
        // Show success popup with animation
        successPopup.visibility = View.VISIBLE
        successPopup.alpha = 0f
        successPopup.animate().alpha(1f).setDuration(300).start()

        // Hide after 2 seconds
        successPopup.postDelayed({
            successPopup.animate().alpha(0f).setDuration(300).withEndAction {
                successPopup.visibility = View.GONE
                // Reset form for next harvest
                resetForm()
            }.start()
        }, 2000)
    }

    private fun resetForm() {
        etCollectorName.setText("")
        etWeight.setText("")
        etNotes.setText("")
        cardResult.visibility = View.GONE
        currentHerb = ""
        btnSubmit.isEnabled = false
    }

    override fun onDestroy() {
        super.onDestroy()
        if (::tflite.isInitialized) tflite.close()
    }
}
