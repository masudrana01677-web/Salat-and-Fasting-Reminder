package com.prayertime.azanramadan.notification

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * Reschedules all prayer and Ramadan alarms when:
 * 1. Device reboots (BOOT_COMPLETED)
 * 2. App is updated/replaced (MY_PACKAGE_REPLACED)
 * 3. User travels and timezone changes (TIMEZONE_CHANGED)
 * 4. System clock is manually adjusted (TIME_SET)
 */
class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        val action = intent?.action
        Log.d("BootReceiver", "Received broadcast action: $action — refreshing prayer alarms via PrayerSchedulerWorker")

        when (action) {
            Intent.ACTION_BOOT_COMPLETED,
            "android.intent.action.QUICKBOOT_POWERON",
            Intent.ACTION_MY_PACKAGE_REPLACED,
            Intent.ACTION_TIMEZONE_CHANGED,
            Intent.ACTION_TIME_CHANGED -> {
                // Trigger background WorkManager worker to re-register all exact alarms
                PrayerSchedulerWorker.enqueueImmediate(context)
            }
        }
    }
}
