package com.prayertime.azanramadan

import android.app.Application
import com.prayertime.azanramadan.notification.NotificationChannels
import com.prayertime.azanramadan.notification.PrayerSchedulerWorker

class PrayerApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        
        // 1. Initialize Android Notification Channels (API 26+)
        NotificationChannels.createChannels(this)

        // 2. Schedule Daily Background Prayer Computation & Exact Alarms via WorkManager
        PrayerSchedulerWorker.enqueuePeriodic(this)
        PrayerSchedulerWorker.enqueueImmediate(this)
    }
}
