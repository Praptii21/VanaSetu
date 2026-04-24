package com.vanasetu.app

import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Header

data class HarvestRequest(
    val herb_name: String,
    val collector_name: String,
    val weight_kg: Float,
    val gps_lat: Double,
    val gps_lng: Double,
    val gps_place_name: String?,
    val ai_confidence: Float,
    val collected_at: String? = null
)

data class HarvestResponse(
    val success: Boolean,
    val data: HarvestData?
)

data class HarvestData(
    val batch_id: Int,
    val tx_hash: String
)

interface ApiService {
    @POST("submit-harvest")
    fun submitHarvest(
        @Body request: HarvestRequest,
        @Header("Authorization") token: String? = null
    ): Call<HarvestResponse>
}
