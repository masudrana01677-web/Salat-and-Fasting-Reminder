package com.prayertime.azanramadan.location

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Geocoder
import android.location.Location
import android.location.LocationManager
import android.os.Build
import android.os.CancellationSignal
import android.util.Log
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.prayertime.azanramadan.notification.PrayerSchedulerWorker
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import java.util.Locale
import java.util.TimeZone
import kotlin.coroutines.resume

data class UserLocation(
    val latitude: Double,
    val longitude: Double,
    val accuracyMeters: Float,
    val city: String,
    val country: String,
    val timeZoneId: String
)

sealed class LocationFetchResult {
    data class Success(val location: UserLocation) : LocationFetchResult()
    data class PermissionDenied(val isPermanentlyDenied: Boolean) : LocationFetchResult()
    object GpsDisabled : LocationFetchResult()
    data class Error(val message: String) : LocationFetchResult()
}

/**
 * Battery-efficient single-shot LocationTracker.
 * 
 * Uses FusedLocationProviderClient.getCurrentLocation() with Priority.PRIORITY_BALANCED_POWER_ACCURACY
 * to get a fresh location fix without running persistent background location tracking or battery drain.
 */
class LocationTracker(private val context: Context) {

    private val fusedLocationClient: FusedLocationProviderClient =
        LocationServices.getFusedLocationProviderClient(context)

    fun hasLocationPermission(): Boolean {
        val fineLocationGranted = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        val coarseLocationGranted = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        return fineLocationGranted || coarseLocationGranted
    }

    fun isGpsEnabled(): Boolean {
        val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager
        return locationManager?.isProviderEnabled(LocationManager.GPS_PROVIDER) == true ||
                locationManager?.isProviderEnabled(LocationManager.NETWORK_PROVIDER) == true
    }

    @SuppressLint("MissingPermission")
    suspend fun fetchFreshLocation(): LocationFetchResult = withContext(Dispatchers.IO) {
        if (!hasLocationPermission()) {
            return@withContext LocationFetchResult.PermissionDenied(isPermanentlyDenied = false)
        }

        if (!isGpsEnabled()) {
            return@withContext LocationFetchResult.GpsDisabled
        }

        try {
            val cancellationSignal = CancellationSignal()
            val rawLocation: Location? = suspendCancellableCoroutine { continuation ->
                fusedLocationClient.getCurrentLocation(
                    Priority.PRIORITY_BALANCED_POWER_ACCURACY,
                    null
                ).addOnSuccessListener { location: Location? ->
                    if (location != null) {
                        continuation.resume(location)
                    } else {
                        // Fallback to last known location if getCurrentLocation returns null (e.g. indoors)
                        fusedLocationClient.lastLocation.addOnSuccessListener { lastLoc: Location? ->
                            continuation.resume(lastLoc)
                        }.addOnFailureListener {
                            continuation.resume(null)
                        }
                    }
                }.addOnFailureListener { exception ->
                    Log.e(TAG, "Error fetching location from FusedLocationProviderClient", exception)
                    continuation.resume(null)
                }

                continuation.invokeOnCancellation {
                    cancellationSignal.cancel()
                }
            }

            if (rawLocation != null) {
                val userLocation = resolveAddressAndDetails(rawLocation)
                saveLocationToPreferences(userLocation)
                
                // Automatically refresh and schedule prayer alarms for the newly fetched location
                PrayerSchedulerWorker.enqueueImmediate(context)
                
                Log.d(TAG, "Location updated: ${userLocation.city}, ${userLocation.country} (${userLocation.latitude}, ${userLocation.longitude})")
                LocationFetchResult.Success(userLocation)
            } else {
                LocationFetchResult.Error("Unable to acquire location fix. Please check your GPS connection.")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception during location retrieval", e)
            LocationFetchResult.Error(e.localizedMessage ?: "Unknown location error")
        }
    }

    private fun resolveAddressAndDetails(location: Location): UserLocation {
        var cityName = "Detected City"
        var countryName = "Unknown Country"

        try {
            val geocoder = Geocoder(context, Locale.getDefault())
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                geocoder.getFromLocation(location.latitude, location.longitude, 1) { addresses ->
                    if (addresses.isNotEmpty()) {
                        val addr = addresses[0]
                        cityName = addr.locality ?: addr.subAdminArea ?: addr.adminArea ?: "Detected City"
                        countryName = addr.countryName ?: "Unknown Country"
                    }
                }
            } else {
                @Suppress("DEPRECATION")
                val addresses = geocoder.getFromLocation(location.latitude, location.longitude, 1)
                if (!addresses.isNullOrEmpty()) {
                    val addr = addresses[0]
                    cityName = addr.locality ?: addr.subAdminArea ?: addr.adminArea ?: "Detected City"
                    countryName = addr.countryName ?: "Unknown Country"
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Geocoder reverse-lookup failed: ${e.message}. Using default labels.")
        }

        return UserLocation(
            latitude = location.latitude,
            longitude = location.longitude,
            accuracyMeters = location.accuracy,
            city = cityName,
            country = countryName,
            timeZoneId = TimeZone.getDefault().id
        )
    }

    private fun saveLocationToPreferences(location: UserLocation) {
        val prefs = context.getSharedPreferences(PrayerSchedulerWorker.PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().apply {
            putFloat(PrayerSchedulerWorker.KEY_LATITUDE, location.latitude.toFloat())
            putFloat(PrayerSchedulerWorker.KEY_LONGITUDE, location.longitude.toFloat())
            putString("pref_city_name", location.city)
            putString("pref_country_name", location.country)
            putString("pref_timezone_id", location.timeZoneId)
            putFloat("pref_accuracy_meters", location.accuracyMeters)
            putBoolean("pref_is_auto_location", true)
            apply()
        }
    }

    companion object {
        private const val TAG = "LocationTracker"
    }
}
