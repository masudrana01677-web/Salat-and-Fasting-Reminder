package com.prayertime.azanramadan.notification

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.batoulapps.adhan.CalculationMethod
import com.batoulapps.adhan.Coordinates
import com.batoulapps.adhan.Madhab
import com.batoulapps.adhan.PrayerTimes
import com.batoulapps.adhan.data.DateComponents
import java.util.Calendar
import java.util.Date
import java.util.concurrent.TimeUnit

/**
 * WorkManager worker that runs in the background to calculate daily prayer times
 * and schedule exact AlarmManager alarms for Fajr, Dhuhr, Asr, Maghrib, Isha,
 * and Ramadan Sehri/Iftar reminders.
 */
class DailyPrayerScheduleWorker(
    private val context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    private val scheduler = AndroidPrayerAlarmScheduler(context)

    override suspend fun doWork(): Result {
        return try {
            scheduleDailyPrayers()
            Result.success()
        } catch (e: Exception) {
            Log.e("DailyPrayerWorker", "Error calculating and scheduling prayer alarms", e)
            Result.retry()
        }
    }

    private fun scheduleDailyPrayers() {
        // Retrieve stored user location and preferences (defaulting to Dhaka if unset)
        val prefs = context.getSharedPreferences("prayer_time_prefs", Context.MODE_PRIVATE)
        val latitude = prefs.getFloat("pref_latitude", 23.8103f).toDouble()
        val longitude = prefs.getFloat("pref_longitude", 90.4125f).toDouble()
        val methodKey = prefs.getString("pref_calc_method", "KARACHI") ?: "KARACHI"
        val isHanafi = prefs.getBoolean("pref_is_hanafi", true)
        val isAzanAudio = prefs.getBoolean("pref_azan_audio_enabled", true)

        val coordinates = Coordinates(latitude, longitude)
        val calculationParams = when (methodKey) {
            "MWL" -> CalculationMethod.MUSLIM_WORLD_LEAGUE.parameters
            "EGYPT" -> CalculationMethod.EGYPTIAN.parameters
            "MAKKAH" -> CalculationMethod.UMM_AL_QURA.parameters
            "ISNA" -> CalculationMethod.NORTH_AMERICA.parameters
            "SINGAPORE" -> CalculationMethod.SINGAPORE.parameters
            "TEHRAN" -> CalculationMethod.TEHRAN.parameters
            else -> CalculationMethod.KARACHI.parameters
        }

        if (isHanafi) {
            calculationParams.madhab = Madhab.HANAFI
        } else {
            calculationParams.madhab = Madhab.SHAFI
        }

        val calendar = Calendar.getInstance()
        val todayComponents = DateComponents.from(calendar.time)
        val prayerTimesToday = PrayerTimes(coordinates, todayComponents, calculationParams)

        // Tomorrow for next day rollover
        calendar.add(Calendar.DAY_OF_YEAR, 1)
        val tomorrowComponents = DateComponents.from(calendar.time)
        val prayerTimesTomorrow = PrayerTimes(coordinates, tomorrowComponents, calculationParams)

        val nowMillis = System.currentTimeMillis()

        // Schedule Fajr
        val fajrTime = if (prayerTimesToday.fajr.time > nowMillis) prayerTimesToday.fajr else prayerTimesTomorrow.fajr
        scheduler.schedulePrayerAlarm(
            prayerId = "fajr",
            prayerName = "Fajr",
            triggerAtMillis = fajrTime.time,
            isAzanAudio = isAzanAudio,
            requestCode = AndroidPrayerAlarmScheduler.RC_FAJR
        )

        // Schedule Dhuhr
        val dhuhrTime = if (prayerTimesToday.dhuhr.time > nowMillis) prayerTimesToday.dhuhr else prayerTimesTomorrow.dhuhr
        scheduler.schedulePrayerAlarm(
            prayerId = "dhuhr",
            prayerName = "Dhuhr",
            triggerAtMillis = dhuhrTime.time,
            isAzanAudio = isAzanAudio,
            requestCode = AndroidPrayerAlarmScheduler.RC_DHUHR
        )

        // Schedule Asr
        val asrTime = if (prayerTimesToday.asr.time > nowMillis) prayerTimesToday.asr else prayerTimesTomorrow.asr
        scheduler.schedulePrayerAlarm(
            prayerId = "asr",
            prayerName = "Asr",
            triggerAtMillis = asrTime.time,
            isAzanAudio = isAzanAudio,
            requestCode = AndroidPrayerAlarmScheduler.RC_ASR
        )

        // Schedule Maghrib & Iftar
        val maghribTime = if (prayerTimesToday.maghrib.time > nowMillis) prayerTimesToday.maghrib else prayerTimesTomorrow.maghrib
        scheduler.schedulePrayerAlarm(
            prayerId = "maghrib",
            prayerName = "Maghrib",
            triggerAtMillis = maghribTime.time,
            isAzanAudio = isAzanAudio,
            requestCode = AndroidPrayerAlarmScheduler.RC_MAGHRIB
        )

        // Schedule Isha
        val ishaTime = if (prayerTimesToday.isha.time > nowMillis) prayerTimesToday.isha else prayerTimesTomorrow.isha
        scheduler.schedulePrayerAlarm(
            prayerId = "isha",
            prayerName = "Isha",
            triggerAtMillis = ishaTime.time,
            isAzanAudio = isAzanAudio,
            requestCode = AndroidPrayerAlarmScheduler.RC_ISHA
        )

        // Schedule Ramadan Sehri reminder (15 min before Fajr)
        val sehriLeadMinutes = prefs.getInt("pref_sehri_lead_minutes", 15)
        if (sehriLeadMinutes > 0) {
            val sehriAlertTime = fajrTime.time - (sehriLeadMinutes * 60 * 1000L)
            if (sehriAlertTime > nowMillis) {
                scheduler.schedulePrayerAlarm(
                    prayerId = "sehri",
                    prayerName = "Sehri",
                    triggerAtMillis = sehriAlertTime,
                    isAzanAudio = false,
                    requestCode = AndroidPrayerAlarmScheduler.RC_SEHRI_ALERT
                )
            }
        }

        Log.d("DailyPrayerWorker", "Successfully scheduled all exact prayer alarms")
    }

    companion object {
        private const val UNIQUE_PERIODIC_WORK_NAME = "daily_prayer_schedule_periodic_work"
        private const val UNIQUE_ONE_TIME_WORK_NAME = "daily_prayer_schedule_one_time_work"

        /**
         * Enqueues a periodic WorkManager task running once every 24 hours.
         */
        fun enqueuePeriodicWork(context: Context) {
            val periodicWork = PeriodicWorkRequestBuilder<DailyPrayerScheduleWorker>(
                24, TimeUnit.HOURS
            ).build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                UNIQUE_PERIODIC_WORK_NAME,
                ExistingPeriodicWorkPolicy.UPDATE,
                periodicWork
            )
        }

        /**
         * Enqueues an immediate one-time calculation and alarm schedule refresh
         * (e.g. upon app start, location change, settings update, or device reboot).
         */
        fun enqueueOneTimeWork(context: Context) {
            val oneTimeWork = OneTimeWorkRequestBuilder<DailyPrayerScheduleWorker>().build()

            WorkManager.getInstance(context).enqueueUniqueWork(
                UNIQUE_ONE_TIME_WORK_NAME,
                ExistingWorkPolicy.REPLACE,
                oneTimeWork
            )
        }
    }
}
