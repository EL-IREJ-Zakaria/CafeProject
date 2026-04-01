# Android Kotlin Retrofit Client

Base URL used by the API client:

http://192.168.1.10/cafe_api/

Included files:
- app/src/main/java/com/example/cafeapp/network/Commande.kt
- app/src/main/java/com/example/cafeapp/network/CommandesResponse.kt
- app/src/main/java/com/example/cafeapp/network/ApiService.kt
- app/src/main/java/com/example/cafeapp/network/RetrofitClient.kt
- app/src/main/java/com/example/cafeapp/MainActivity.kt
- app/src/main/AndroidManifest.xml
- app/build.gradle.kts

Expected backend response format from get_commandes.php:
{
  "success": true,
  "message": "Commandes fetched successfully.",
  "count": 2,
  "data": [
    {
      "id": 1,
      "table_number": 5,
      "produit": "Espresso x2",
      "prix": 5.0,
      "statut": "en_attente"
    }
  ]
}
