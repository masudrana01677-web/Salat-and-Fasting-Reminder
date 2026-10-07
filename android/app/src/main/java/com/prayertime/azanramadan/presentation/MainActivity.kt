package com.prayertime.azanramadan.presentation

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.prayertime.azanramadan.location.LocationViewModel
import com.prayertime.azanramadan.presentation.location.LocationPermissionCard

class MainActivity : ComponentActivity() {

    private val locationViewModel: LocationViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        // Install modern Android 12+ Splash Screen API
        installSplashScreen()

        super.onCreate(savedInstanceState)

        setContent {
            PrayerTimeTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val locationState by locationViewModel.uiState.collectAsState()

                    // Main App Content Container
                    PrayerAppContent(
                        locationViewModel = locationViewModel
                    )
                }
            }
        }
    }
}

@Composable
fun PrayerAppContent(
    locationViewModel: LocationViewModel
) {
    val locationState by locationViewModel.uiState.collectAsState()

    // Host app layout with location permission banner when required
    LocationPermissionCard(
        uiState = locationState,
        onRefreshClick = { locationViewModel.refreshAutoLocation() },
        onManualPickClick = { /* Opens city selector sheet */ },
        onPermissionGranted = { locationViewModel.onPermissionGranted() }
    )
}

@Composable
fun PrayerTimeTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        content = content
    )
}
