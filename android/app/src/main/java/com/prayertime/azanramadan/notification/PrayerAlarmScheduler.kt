package com.prayertime.azanramadan.notification

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

interface PrayerAlarmScheduler {
    fun schedulePrayerAlarm(
        prayerId: String,
        prayerName: String,
        triggerAtMillis: Long,
        isAzanAudio: Boolean,
        requestCode: Int
    )
    fun cancelPrayerAlarm(requestCode: Int)
    fun canScheduleExactAlarms(): Boolean
}

class AndroidPrayerAlarmScheduler(
    private val context: Context
) : PrayerAlarmScheduler {

    private val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    override fun canScheduleExactAlarms(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            alarmManager.canScheduleExactAlarms()
        } else {
            true
        }
    }

    override fun schedulePrayerAlarm(
        prayerId: String,
        prayerName: String,
        triggerAtMillis: Long,
        isAzanAudio: Boolean,
        requestCode: Int
    ) {
        // Do not schedule alarms in the past
        if (triggerAtMillis <= System.currentTimeMillis()) {
            return
        }

        val intent = Intent(context, PrayerAlarmReceiver::class.java).apply {
            action = ACTION_TRIGGER_PRAYER
            putExtra(EXTRA_PRAYER_ID, prayerId)
            putExtra(EXTRA_PRAYER_NAME, prayerName)
            putExtra(EXTRA_TRIGGER_MILLIS, triggerAtMillis)
            putExtra(EXTRA_IS_AZAN_AUDIO, isAzanAudio)
            putExtra(EXTRA_REQUEST_CODE, requestCode)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        try {
            if (canScheduleExactAlarms()) {
                // Exact alarm that triggers even when device is in Doze / Idle mode
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                )
                Log.d("PrayerAlarmScheduler", "Scheduled exact alarm for $prayerName at $triggerAtMillis")
            } else {
                // Fallback for when exact alarm permission is missing on Android 12+
                alarmManager.setAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                )
                Log.w("PrayerAlarmScheduler", "Exact alarm permission missing, scheduled inexact fallback for $prayerName")
            }
        } catch (e: SecurityException) {
            Log.e("PrayerAlarmScheduler", "SecurityException scheduling alarm for $prayerName", e)
        }
    }

    override fun cancelPrayerAlarm(requestCode: Int) {
        val intent = Intent(context, PrayerAlarmReceiver::class.java).apply {
            action = ACTION_TRIGGER_PRAYER
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
        )
        if (pendingIntent != null) {
            alarmManager.cancel(pendingIntent)
            pendingIntent.cancel()
        }
    }

    companion object {
        const val ACTION_TRIGGER_PRAYER = "com.prayertime.azanramadan.ACTION_TRIGGER_PRAYER"
        const val EXTRA_PRAYER_ID = "extra_prayer_id"
        const val EXTRA_PRAYER_NAME = "extra_prayer_name"
        const val EXTRA_TRIGGER_MILLIS = "extra_trigger_millis"
        const val EXTRA_IS_AZAN_AUDIO = "extra_is_azan_audio"
        const val EXTRA_REQUEST_CODE = "extra_request_code"

        // Standard Request Codes
        const val RC_FAJR = 101
        const val RC_DHUHR = 102
        const val RC_ASR = 103
        const val RC_MAGHRIB = 104
        const val RC_ISHA = 105
        const val RC_SEHRI_ALERT = 201
        const val RC_IFTAR_ALERT = 202
    }
}
