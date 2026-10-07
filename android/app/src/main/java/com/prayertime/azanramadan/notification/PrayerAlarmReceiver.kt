package com.prayertime.azanramadan.notification

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import com.prayertime.azanramadan.R
import com.prayertime.azanramadan.presentation.MainActivity

class PrayerAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val prayerId = intent.getStringExtra(PrayerSchedulerWorker.EXTRA_PRAYER_ID) ?: "prayer"
        val prayerName = intent.getStringExtra(PrayerSchedulerWorker.EXTRA_PRAYER_NAME) ?: "Salah"
        val isAzanAudio = intent.getBooleanExtra(PrayerSchedulerWorker.EXTRA_IS_AZAN_AUDIO, true)
        val requestCode = intent.getIntExtra(PrayerSchedulerWorker.EXTRA_REQUEST_CODE, 100)

        // Acquire a 10-second WakeLock to ensure audio & notification post while screen is off
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        val wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "PrayerTime:AlarmWakeLock"
        )
        wakeLock.acquire(10 * 1000L)

        showPrayerNotification(context, prayerId, prayerName, isAzanAudio, requestCode)

        // Reschedule next upcoming prayer cycles via WorkManager
        PrayerSchedulerWorker.enqueueImmediate(context)
    }

    private fun showPrayerNotification(
        context: Context,
        prayerId: String,
        prayerName: String,
        isAzanAudio: Boolean,
        notificationId: Int
    ) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Intent to launch app when notification tapped
        val contentIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("EXTRA_NAV_TARGET", prayerId)
        }
        val contentPendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            contentIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Route to the appropriate notification channel
        val isRamadanAlert = prayerId.startsWith("sehri") || prayerId.startsWith("iftar")
        val channelId = when {
            isRamadanAlert -> NotificationChannels.CHANNEL_RAMADAN
            isAzanAudio -> NotificationChannels.CHANNEL_AZAN
            else -> NotificationChannels.CHANNEL_PRAYER
        }

        val title = when (prayerId) {
            "sehri" -> context.getString(R.string.sehri_reminder_title)
            "iftar" -> context.getString(R.string.iftar_notification_title)
            else -> "$prayerName Azan — It's time for prayer"
        }

        val contentText = when (prayerId) {
            "sehri" -> "Sehri time is ending soon. Prepare for Fajr."
            "iftar" -> "Time to break your fast. May Allah accept your fasting."
            else -> "Come to prayer, come to success. Hayya 'ala-s-Salah."
        }

        val notificationBuilder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.drawable.ic_splash_crescent)
            .setContentTitle(title)
            .setContentText(contentText)
            .setStyle(NotificationCompat.BigTextStyle().bigText(contentText))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true)
            .setContentIntent(contentPendingIntent)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)

        notificationBuilder.addAction(
            R.drawable.ic_splash_crescent,
            "Open Prayer Time",
            contentPendingIntent
        )

        notificationManager.notify(notificationId, notificationBuilder.build())
    }
}
