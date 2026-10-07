package com.prayertime.azanramadan.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build

/**
 * Manages Android Notification Channels (API 26+) for:
 * 1. Daily prayer reminders (Silent / Standard notification)
 * 2. Azan audio call to prayer (High importance, audible Azan)
 * 3. Ramadan alerts (Sehri end countdown & Iftar break-fast)
 */
object NotificationChannels {

    const val CHANNEL_PRAYER = "channel_prayer_reminders"
    const val CHANNEL_AZAN = "channel_azan_audio"
    const val CHANNEL_RAMADAN = "channel_ramadan_alerts"

    fun createChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(NotificationManager::class.java) ?: return

            // Channel 1: Standard Prayer Reminders
            val prayerChannel = NotificationChannel(
                CHANNEL_PRAYER,
                "Prayer Times",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Timely alerts for Fajr, Dhuhr, Asr, Maghrib, and Isha"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 300, 200, 300)
                setShowBadge(true)
            }

            // Channel 2: Full Azan Call to Prayer
            val azanChannel = NotificationChannel(
                CHANNEL_AZAN,
                "Azan Call to Prayer",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Audible Azan voice when prayer time starts"
                val audioAttributes = AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .build()
                
                // Plays bundled Azan sound or default notification sound
                val azanUri = Uri.parse("android.resource://${context.packageName}/raw/azan")
                setSound(azanUri, audioAttributes)
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 500, 250, 500)
                setShowBadge(true)
                lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
            }

            // Channel 3: Ramadan Sehri & Iftar Alerts
            val ramadanChannel = NotificationChannel(
                CHANNEL_RAMADAN,
                "Ramadan Sehri & Iftar",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Alerts for Sehri ending window and Iftar time"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 400, 200, 400)
                setShowBadge(true)
            }

            notificationManager.createNotificationChannels(
                listOf(prayerChannel, azanChannel, ramadanChannel)
            )
        }
    }
}
