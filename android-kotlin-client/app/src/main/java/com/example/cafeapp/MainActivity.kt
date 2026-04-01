package com.example.cafeapp

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.lifecycle.lifecycleScope
import com.example.cafeapp.network.RetrofitClient
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        fetchOrders()
    }

    private fun fetchOrders() {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.getCommandes()

                if (response.success) {
                    response.data.forEach { commande ->
                        Log.d(
                            "API_ORDERS",
                            "ID=${commande.id}, Table=${commande.tableNumber}, Produit=${commande.produit}, Prix=${commande.prix}, Statut=${commande.statut}"
                        )
                    }
                } else {
                    Log.e("API_ORDERS", "Erreur API: ${response.message}")
                }
            } catch (exception: Exception) {
                Log.e("API_ORDERS", "Erreur reseau: ${exception.message}", exception)
            }
        }
    }
}
