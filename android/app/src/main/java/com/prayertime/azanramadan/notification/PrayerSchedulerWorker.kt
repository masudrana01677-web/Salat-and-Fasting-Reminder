package com.prayertime.azanramadan.notification

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.batoulapps.adhan.CalculationMethod
import com.batoulapps.adhan.CalculationParameters
import com.batoulapps.adhan.Coordinates
import com.batoulapps.adhan.HighLatitudeRule
import com.batoulapps.adhan.Madhab
import com.batoulapps.adhan.PrayerTimes
import com.batoulapps.adhan.data.DateComponents
import java.util.Calendar
import java.util.Date
import java.util.concurrent.TimeUnit

/**
 * Background WorkManager worker responsible for:
 * 1. Fetching location coordinates & calculation preferences from local storage.
 * 2. Calculating accurate daily and upcoming prayer times using the astronomical Adhan library.
 * 3. Scheduling exact notifications & Azan alarms via Android's AlarmManager.
 * 4. Scheduling Sehri and Iftar reminders for Ramadan.
 */
class PrayerSchedulerWorker(
    private val context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    private val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    override suspend fun doWork(): Result {
        return try {
            Log.d(TAG, "Starting prayer calculation and alarm scheduling...")
            scheduleUpcomingPrayers()
            Log.d(TAG, "Successfully scheduled upcoming prayer notifications.")
            Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to calculate prayer times or schedule alarms", e)
            if (runAttemptCount < 3) {
                Result.retry()
            } else {
                Result.failure()
            }
        }
    }

    private fun scheduleUpcomingPrayers() {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        // 1. Retrieve stored coordinates (default to Dhaka, Bangladesh if not yet detected)
        val latitude = prefs.getFloat(KEY_LATITUDE, 23.8103f).toDouble()
        val longitude = prefs.getFloat(KEY_LONGITUDE, 90.4125f).toDouble()
        val coordinates = Coordinates(latitude, longitude)

        // 2. Configure astronomical calculation method parameters
        val methodKey = prefs.getString(KEY_CALC_METHOD, "KARACHI") ?: "KARACHI"
        val params: CalculationParameters = when (methodKey) {
            "MWL" -> CalculationMethod.MUSLIM_WORLD_LEAGUE.parameters
            "EGYPT" -> CalculationMethod.EGYPTIAN.parameters
            "MAKKAH" -> CalculationMethod.UMM_AL_QURA.parameters
            "ISNA" -> CalculationMethod.NORTH_AMERICA.parameters
            "SINGAPORE" -> CalculationMethod.SINGAPORE.parameters
            "TEHRAN" -> CalculationMethod.TEHRAN.parameters
            else -> CalculationMethod.KARACHI.parameters
        }

        // 3. Configure Asr Juristic Method (Madhab)
        val isHanafi = prefs.getBoolean(KEY_IS_HANAFI, true)
        params.madhab = if (isHanafi) Madhab.HANAFI else Madhab.SHAFI
        params.highLatitudeRule = HighLatitudeRule.TWILIGHT_ANGLE

        // 4. Minute adjustments
        val adjFajr = prefs.getInt(KEY_ADJ_FAJR, 0)
        val adjDhuhr = prefs.getInt(KEY_ADJ_DHUHR, 0)
        val adjAsr = prefs.getInt(KEY_ADJ_ASR, 0)
        val adjMaghrib = prefs.getInt(KEY_ADJ_MAGHRIB, 0)
        val adjIsha = prefs.getInt(KEY_ADJ_ISHA, 0)

        params.adjustments.fajr = adjFajr
        params.adjustments.dhuhr = adjDhuhr
        params.adjustments.asr = adjAsr
        params.adjustments.maghrib = adjMaghrib
        params.adjustments.isha = adjIsha

        // 5. Compute prayer times for Today and Tomorrow (for rolling over past prayers)
        val todayCalendar = Calendar.getInstance()
        val todayComponents = DateComponents.from(todayCalendar.time)
        val todayPrayers = PrayerTimes(coordinates, todayComponents, params)

        val tomorrowCalendar = Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, 1) }
        val tomorrowComponents = DateComponents.from(tomorrowCalendar.time)
        val tomorrowPrayers = PrayerTimes(coordinates, tomorrowComponents, params)

        val nowMillis = System.currentTimeMillis()
        val isAzanAudio = prefs.getBoolean(KEY_AZAN_AUDIO_ENABLED, true)

        // 6. Schedule individual prayers: if today's time has already elapsed, schedule tomorrow's time
        val prayerScheduleList = listOf(
            PrayerScheduleItem(
                id = PRAYER_FAJR,
                name = "Fajr",
                triggerMillis = resolveUpcomingTime(todayPrayers.fajr, tomorrowPrayers.fajr, nowMillis),
                isAzan = isAzanAudio,
                requestCode = RC_FAJR
            ),
            PrayerScheduleItem(
                id = PRAYER_DHUHR,
                name = "Dhuhr",
                triggerMillis = resolveUpcomingTime(todayPrayers.dhuhr, tomorrowPrayers.dhuhr, nowMillis),
                isAzan = isAzanAudio,
                requestCode = RC_DHUHR
            ),
            PrayerScheduleItem(
                id = PRAYER_ASR,
                name = "Asr",
                triggerMillis = resolveUpcomingTime(todayPrayers.asr, tomorrowPrayers.asr, nowMillis),
                isAzan = isAzanAudio,
                requestCode = RC_ASR
            ),
            PrayerScheduleItem(
                id = PRAYER_MAGHRIB,
                name = "Maghrib",
                triggerMillis = resolveUpcomingTime(todayPrayers.maghrib, tomorrowPrayers.maghrib, nowMillis),
                isAzan = isAzanAudio,
                requestCode = RC_MAGHRIB
            ),
            PrayerScheduleItem(
                id = PRAYER_ISHA,
                name = "Isha",
                triggerMillis = resolveUpcomingTime(todayPrayers.isha, tomorrowPrayers.isha, nowMillis),
                isAzan = isAzanAudio,
                requestCode = RC_ISHA
            )
        )

        for (item in prayerScheduleList) {
            scheduleExactAlarm(
                prayerId = item.id,
                prayerName = item.name,
                triggerAtMillis = item.triggerMillis,
                isAzanAudio = item.isAzan,
                requestCode = item.requestCode
            )
        }

        // 7. Schedule Ramadan Sehri reminder (e.g. 15 minutes before upcoming Fajr)
        val sehriLeadMinutes = prefs.getInt(KEY_SEHRI_LEAD_MINUTES, 15)
        if (sehriLeadMinutes > 0) {
            val upcomingFajr = resolveUpcomingTime(todayPrayers.fajr, tomorrowPrayers.fajr, nowMillis)
            val sehriTrigger = upcomingFajr - (sehriLeadMinutes * 60 * 1000L)
            if (sehriTrigger > nowMillis) {
                scheduleExactAlarm(
                    prayerId = PRAYER_SEHRI,
                    prayerName = "Sehri",
                    triggerAtMillis = sehriTrigger,
                    isAzanAudio = false,
                    requestCode = RC_SEHRI_ALERT
                )
            }
        }
    }

    private fun resolveUpcomingTime(todayDate: Date, tomorrowDate: Date, nowMillis: Long): Long {
        return if (todayDate.time > nowMillis) {
            todayDate.time
        } else {
            tomorrowDate.time
        }
    }

    private fun scheduleExactAlarm(
        prayerId: String,
        prayerName: String,
        triggerAtMillis: Long,
        isAzanAudio: Boolean,
        requestCode: Int
    ) {
        if (triggerAtMillis <= System.currentTimeMillis()) return

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
            val canExact = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                alarmManager.canScheduleExactAlarms()
            } else {
                true
            }

            if (canExact) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                )
                Log.d(TAG, "Exact alarm set for $prayerName at ${Date(triggerAtMillis)}")
            } else {
                alarmManager.setAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                )
                Log.w(TAG, "Exact alarm permission missing; set inexact alarm for $prayerName")
            }
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException setting alarm for $prayerName", e)
        }
    }

    private data class PrayerScheduleItem(
        val id: String,
        val name: String,
        val triggerMillis: Long,
        val isAzan: Boolean,
        val requestCode: Int
    )

    companion object {
        private const val TAG = "PrayerSchedulerWorker"
        const val UNIQUE_PERIODIC_WORK_NAME = "prayer_scheduler_periodic_work"
        const val UNIQUE_IMMEDIATE_WORK_NAME = "prayer_scheduler_immediate_work"

        // SharedPreferences Constants
        const val PREFS_NAME = "prayer_time_prefs"
        const val KEY_LATITUDE = "pref_latitude"
        const val KEY_LONGITUDE = "pref_longitude"
        const val KEY_CALC_METHOD = "pref_calc_method"
        const val KEY_IS_HANAFI = "pref_is_hanafi"
        const val KEY_AZAN_AUDIO_ENABLED = "pref_azan_audio_enabled"
        const val KEY_SEHRI_LEAD_MINUTES = "pref_sehri_lead_minutes"

        const val KEY_ADJ_FAJR = "pref_adj_fajr"
        const val KEY_ADJ_DHUHR = "pref_adj_dhuhr"
        const val KEY_ADJ_ASR = "pref_adj_asr"
        const val KEY_ADJ_MAGHRIB = "pref_adj_maghrib"
        const val KEY_ADJ_ISHA = "pref_adj_isha"

        // Intent Action & Extras
        const val ACTION_TRIGGER_PRAYER = "com.prayertime.azanramadan.ACTION_TRIGGER_PRAYER"
        const val EXTRA_PRAYER_ID = "extra_prayer_id"
        const val EXTRA_PRAYER_NAME = "extra_prayer_name"
        const val EXTRA_TRIGGER_MILLIS = "extra_trigger_millis"
        const val EXTRA_IS_AZAN_AUDIO = "extra_is_azan_audio"
        const val EXTRA_REQUEST_CODE = "extra_request_code"

        // Prayer Identifiers
        const val PRAYER_FAJR = "fajr"
        const val PRAYER_DHUHR = "dhuhr"
        const val PRAYER_ASR = "asr"
        const val PRAYER_MAGHRIB = "maghrib"
        const val PRAYER_ISHA = "isha"
        const val PRAYER_SEHRI = "sehri"

        // Request Codes
        const val RC_FAJR = 101
        const val RC_DHUHR = 102
        const val RC_ASR = 103
        const val RC_MAGHRIB = 104
        const val RC_ISHA = 105
        const val RC_SEHRI_ALERT = 201

        /**
         * Enqueues a periodic 24-hour WorkManager background task.
         */
        fun enqueuePeriodic(context: Context) {
            val periodicWork = PeriodicWorkRequestBuilder<PrayerSchedulerWorker>(
                24, TimeUnit.HOURS
            ).build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                UNIQUE_PERIODIC_WORK_NAME,
                ExistingPeriodicWorkPolicy.UPDATE,
                periodicWork
            )
            Log.d(TAG, "Periodic 24h prayer scheduler enqueued.")
        }

        /**
         * Enqueues an immediate calculation and alarm refresh task.
         */
        fun enqueueImmediate(context: Context) {
            val immediateWork = OneTimeWorkRequestBuilder<PrayerSchedulerWorker>().build()

            WorkManager.getInstance(context).enqueueUniqueWork(
                UNIQUE_IMMEDIATE_WORK_NAME,
                ExistingWorkPolicy.REPLACE,
                immediateWork
            )
            Log.d(TAG, "Immediate prayer scheduler enqueued.")
        }
    }
}
