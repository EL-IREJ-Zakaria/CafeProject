package com.example.cafeapp.network

import com.google.gson.annotations.SerializedName

data class Commande(
    @SerializedName("id")
    val id: Int,
    @SerializedName("table_number")
    val tableNumber: Int,
    @SerializedName("produit")
    val produit: String,
    @SerializedName("prix")
    val prix: Double,
    @SerializedName("statut")
    val statut: String
)
