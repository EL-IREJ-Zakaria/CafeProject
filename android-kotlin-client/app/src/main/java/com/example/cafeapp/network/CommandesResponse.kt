package com.example.cafeapp.network

import com.google.gson.annotations.SerializedName

data class CommandesResponse(
    @SerializedName("success")
    val success: Boolean,
    @SerializedName("message")
    val message: String,
    @SerializedName("count")
    val count: Int,
    @SerializedName("data")
    val data: List<Commande>
)
