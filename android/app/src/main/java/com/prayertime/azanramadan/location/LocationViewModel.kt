package com.prayertime.azanramadan.location

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.prayertime.azanramadan.notification.PrayerSchedulerWorker
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class LocationUiState {
    object Idle : LocationUiState()
    object Loading : LocationUiState()
    data class Success(val location: UserLocation, val isAuto: Boolean) : LocationUiState()
    object PermissionRequired : LocationUiState()
    object GpsDisabled : LocationUiState()
    data class Error(val message: String) : LocationUiState()
}

class LocationViewModel(application: Application) : AndroidViewModel(application) {

    private val locationTracker = LocationTracker(application.applicationContext)
    private val _uiState = MutableStateFlow<LocationUiState>(LocationUiState.Idle)
    val uiState: StateFlow<LocationUiState> = _uiState.asStateFlow()

    init {
        loadSavedLocation()
    }

    private fun loadSavedLocation() {
        val prefs = getApplication<Application>().getSharedPreferences(
            PrayerSchedulerWorker.PREFS_NAME,
            Context.MODE_PRIVATE
        )
        val lat = prefs.getFloat(PrayerSchedulerWorker.KEY_LATITUDE, 23.8103f).toDouble()
        val lng = prefs.getFloat(PrayerSchedulerWorker.KEY_LONGITUDE, 90.4125f).toDouble()
        val city = prefs.getString("pref_city_name", "Dhaka") ?: "Dhaka"
        val country = prefs.getString("pref_country_name", "Bangladesh") ?: "Bangladesh"
        val tz = prefs.getString("pref_timezone_id", java.util.TimeZone.getDefault().id) ?: "Asia/Dhaka"
        val acc = prefs.getFloat("pref_accuracy_meters", 10f)
        val isAuto = prefs.getBoolean("pref_is_auto_location", false)

        val savedLoc = UserLocation(
            latitude = lat,
            longitude = lng,
            accuracyMeters = acc,
            city = city,
            country = country,
            timeZoneId = tz
        )
        _uiState.value = LocationUiState.Success(savedLoc, isAuto = isAuto)
    }

    fun refreshAutoLocation() {
        viewModelScope.launch {
            if (!locationTracker.hasLocationPermission()) {
                _uiState.value = LocationUiState.PermissionRequired
                return@launch
            }

            if (!locationTracker.isGpsEnabled()) {
                _uiState.value = LocationUiState.GpsDisabled
                return@launch
            }

            _uiState.value = LocationUiState.Loading

            when (val result = locationTracker.fetchFreshLocation()) {
                is LocationFetchResult.Success -> {
                    _uiState.value = LocationUiState.Success(result.location, isAuto = true)
                }
                is LocationFetchResult.PermissionDenied -> {
                    _uiState.value = LocationUiState.PermissionRequired
                }
                is LocationFetchResult.GpsDisabled -> {
                    _uiState.value = LocationUiState.GpsDisabled
                }
                is LocationFetchResult.Error -> {
                    _uiState.value = LocationUiState.Error(result.message)
                }
            }
        }
    }

    fun setManualLocation(
        latitude: Double,
        longitude: Double,
        cityName: String,
        countryName: String
    ) {
        val manualLoc = UserLocation(
            latitude = latitude,
            longitude = longitude,
            accuracyMeters = 0f,
            city = cityName,
            country = countryName,
            timeZoneId = java.util.TimeZone.getDefault().id
        )

        val prefs = getApplication<Application>().getSharedPreferences(
            PrayerSchedulerWorker.PREFS_NAME,
            Context.MODE_PRIVATE
        )
        prefs.edit().apply {
            putFloat(PrayerSchedulerWorker.KEY_LATITUDE, latitude.toFloat())
            putFloat(PrayerSchedulerWorker.KEY_LONGITUDE, longitude.toFloat())
            putString("pref_city_name", cityName)
            putString("pref_country_name", countryName)
            putBoolean("pref_is_auto_location", false)
            apply()
        }

        // Trigger immediate recalculation of alarms for manual coordinates
        PrayerSchedulerWorker.enqueueImmediate(getApplication())

        _uiState.value = LocationUiState.Success(manualLoc, isAuto = false)
    }

    fun onPermissionGranted() {
        refreshAutoLocation()
    }
}
