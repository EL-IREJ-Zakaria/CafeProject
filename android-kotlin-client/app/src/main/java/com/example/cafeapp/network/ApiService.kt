package com.example.cafeapp.network

import retrofit2.http.GET

interface ApiService {
    @GET("get_commandes.php")
    suspend fun getCommandes(): CommandesResponse
}
