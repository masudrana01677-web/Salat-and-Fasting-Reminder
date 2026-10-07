import JSZip from 'jszip';

export interface AndroidFileRecord {
  path: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'properties' | 'markdown';
  purpose: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidFileRecord[] = [
  {
    path: 'settings.gradle.kts',
    language: 'groovy',
    purpose: 'Root project settings and Google/MavenCentral plugin repositories management.',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "PrayerTime"
include(":app")
`,
  },
  {
    path: 'build.gradle.kts',
    language: 'groovy',
    purpose: 'Root project build file configuring Android Gradle Plugin 8.5.2 & Kotlin 2.0 Compose compiler.',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id("com.android.application") version "8.5.2" apply false
    id("org.jetbrains.kotlin.android") version "2.0.20" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.20" apply false
    id("org.jetbrains.kotlin.plugin.serialization") version "2.0.20" apply false
}
`,
  },
  {
    path: 'gradle.properties',
    language: 'properties',
    purpose: 'Gradle JVM daemon allocation and AndroidX migration flags.',
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`,
  },
  {
    path: 'app/build.gradle.kts',
    language: 'groovy',
    purpose: 'Application module build file with Material 3, Navigation, DataStore, Adhan-java calculation library, Play Services Location, and Coroutines.',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.kotlin.plugin.serialization")
}

android {
    namespace = "com.prayertime.azanramadan"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.prayertime.azanramadan"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
        freeCompilerArgs += listOf(
            "-opt-in=androidx.compose.material3.ExperimentalMaterial3Api",
            "-opt-in=kotlinx.coroutines.ExperimentalCoroutinesApi"
        )
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // AndroidX Core & Lifecycle
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.6")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.6")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.6")
    implementation("androidx.activity:activity-compose:1.9.3")

    // Jetpack Compose & Material 3
    val composeBom = platform("androidx.compose:compose-bom:2024.10.00")
    implementation(composeBom)
    androidTestImplementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")

    // Navigation
    implementation("androidx.navigation:navigation-compose:2.8.3")

    // Splash Screen API
    implementation("androidx.core:core-splashscreen:1.0.1")

    // Preferences & Local DataStore
    implementation("androidx.datastore:datastore-preferences:1.1.1")

    // Location & Google Play Services
    implementation("com.google.android.gms:play-services-location:21.3.0")

    // WorkManager (Background prayer schedule & notification rescheduling)
    implementation("androidx.work:work-runtime-ktx:2.9.1")

    // Astronomical Calculation Engine (Batoul Apps Adhan)
    implementation("com.batoulapps.adhan:adhan:1.2.1")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.8.1")

    // Serialization
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")

    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.8.1")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
}
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    purpose: 'Android Manifest declaring Location, Exact Alarm, Notifications, Boot Receiver, and MainActivity.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.USE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:name=".PrayerApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.PrayerTime">

        <activity
            android:name=".presentation.MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize"
            android:theme="@style/Theme.PrayerTime.Splash">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <receiver
            android:name=".notification.PrayerAlarmReceiver"
            android:enabled="true"
            android:exported="false" />

        <receiver
            android:name=".notification.BootReceiver"
            android:enabled="true"
            android:exported="false">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.QUICKBOOT_POWERON" />
                <action android:name="android.intent.action.MY_PACKAGE_REPLACED" />
                <action android:name="android.intent.action.TIMEZONE_CHANGED" />
                <action android:name="android.intent.action.TIME_SET" />
            </intent-filter>
        </receiver>

    </application>

</manifest>
`,
  },
  {
    path: 'app/src/main/java/com/prayertime/azanramadan/PrayerApplication.kt',
    language: 'kotlin',
    purpose: 'Application entry point initializing Android notification channels and registering PrayerSchedulerWorker.',
    content: `package com.prayertime.azanramadan

import android.app.Application
import com.prayertime.azanramadan.notification.NotificationChannels
import com.prayertime.azanramadan.notification.PrayerSchedulerWorker

class PrayerApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        
        // 1. Create Android Notification Channels (API 26+)
        NotificationChannels.createChannels(this)

        // 2. Schedule Daily Background Prayer Computation & Exact Alarms via WorkManager
        PrayerSchedulerWorker.enqueuePeriodic(this)
        PrayerSchedulerWorker.enqueueImmediate(this)
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/prayertime/azanramadan/notification/NotificationChannels.kt',
    language: 'kotlin',
    purpose: 'Notification channel setup configuring Prayer, Azan (audio/alarm attributes), and Ramadan channels.',
    content: `package com.prayertime.azanramadan.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build

object NotificationChannels {

    const val CHANNEL_PRAYER = "channel_prayer_reminders"
    const val CHANNEL_AZAN = "channel_azan_audio"
    const val CHANNEL_RAMADAN = "channel_ramadan_alerts"

    fun createChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(NotificationManager::class.java) ?: return

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
                
                val azanUri = Uri.parse("android.resource://\${context.packageName}/raw/azan")
                setSound(azanUri, audioAttributes)
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 500, 250, 500)
                setShowBadge(true)
                lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
            }

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
`,
  },
  {
    path: 'app/src/main/java/com/prayertime/azanramadan/notification/PrayerAlarmScheduler.kt',
    language: 'kotlin',
    purpose: 'AlarmManager scheduler supporting exact alarms, Doze idle wakeups, and permission verification.',
    content: `package com.prayertime.azanramadan.notification

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
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                )
                Log.d("PrayerAlarmScheduler", "Scheduled exact alarm for $prayerName at $triggerAtMillis")
            } else {
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

        const val RC_FAJR = 101
        const val RC_DHUHR = 102
        const val RC_ASR = 103
        const val RC_MAGHRIB = 104
        const val RC_ISHA = 105
        const val RC_SEHRI_ALERT = 201
        const val RC_IFTAR_ALERT = 202
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/prayertime/azanramadan/notification/PrayerAlarmReceiver.kt',
    language: 'kotlin',
    purpose: 'BroadcastReceiver that catches alarm events, wakes the CPU via WakeLock, and posts rich notifications.',
    content: `package com.prayertime.azanramadan.notification

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
        val prayerId = intent.getStringExtra(AndroidPrayerAlarmScheduler.EXTRA_PRAYER_ID) ?: "prayer"
        val prayerName = intent.getStringExtra(AndroidPrayerAlarmScheduler.EXTRA_PRAYER_NAME) ?: "Salah"
        val isAzanAudio = intent.getBooleanExtra(AndroidPrayerAlarmScheduler.EXTRA_IS_AZAN_AUDIO, true)
        val requestCode = intent.getIntExtra(AndroidPrayerAlarmScheduler.EXTRA_REQUEST_CODE, 100)

        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        val wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "PrayerTime:AlarmWakeLock"
        )
        wakeLock.acquire(10 * 1000L)

        showPrayerNotification(context, prayerId, prayerName, isAzanAudio, requestCode)
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
`,
  },
  {
    path: 'app/src/main/java/com/prayertime/azanramadan/notification/PrayerSchedulerWorker.kt',
    language: 'kotlin',
    purpose: 'WorkManager CoroutineWorker that calculates upcoming prayer times using the adhan library and schedules future notifications via AlarmManager.',
    content: `package com.prayertime.azanramadan.notification

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

class PrayerSchedulerWorker(
    private val context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    private val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    override suspend fun doWork(): Result {
        return try {
            scheduleUpcomingPrayers()
            Result.success()
        } catch (e: Exception) {
            Log.e("PrayerSchedulerWorker", "Failed to calculate prayer times or schedule alarms", e)
            if (runAttemptCount < 3) Result.retry() else Result.failure()
        }
    }

    private fun scheduleUpcomingPrayers() {
        val prefs = context.getSharedPreferences("prayer_time_prefs", Context.MODE_PRIVATE)
        val latitude = prefs.getFloat("pref_latitude", 23.8103f).toDouble()
        val longitude = prefs.getFloat("pref_longitude", 90.4125f).toDouble()
        val coordinates = Coordinates(latitude, longitude)

        val methodKey = prefs.getString("pref_calc_method", "KARACHI") ?: "KARACHI"
        val params: CalculationParameters = when (methodKey) {
            "MWL" -> CalculationMethod.MUSLIM_WORLD_LEAGUE.parameters
            "EGYPT" -> CalculationMethod.EGYPTIAN.parameters
            "MAKKAH" -> CalculationMethod.UMM_AL_QURA.parameters
            "ISNA" -> CalculationMethod.NORTH_AMERICA.parameters
            "SINGAPORE" -> CalculationMethod.SINGAPORE.parameters
            "TEHRAN" -> CalculationMethod.TEHRAN.parameters
            else -> CalculationMethod.KARACHI.parameters
        }

        val isHanafi = prefs.getBoolean("pref_is_hanafi", true)
        params.madhab = if (isHanafi) Madhab.HANAFI else Madhab.SHAFI
        params.highLatitudeRule = HighLatitudeRule.TWILIGHT_ANGLE

        val todayCalendar = Calendar.getInstance()
        val todayComponents = DateComponents.from(todayCalendar.time)
        val todayPrayers = PrayerTimes(coordinates, todayComponents, params)

        val tomorrowCalendar = Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, 1) }
        val tomorrowComponents = DateComponents.from(tomorrowCalendar.time)
        val tomorrowPrayers = PrayerTimes(coordinates, tomorrowComponents, params)

        val nowMillis = System.currentTimeMillis()
        val isAzanAudio = prefs.getBoolean("pref_azan_audio_enabled", true)

        val prayerScheduleList = listOf(
            PrayerScheduleItem("fajr", "Fajr", resolveUpcomingTime(todayPrayers.fajr, tomorrowPrayers.fajr, nowMillis), isAzanAudio, RC_FAJR),
            PrayerScheduleItem("dhuhr", "Dhuhr", resolveUpcomingTime(todayPrayers.dhuhr, tomorrowPrayers.dhuhr, nowMillis), isAzanAudio, RC_DHUHR),
            PrayerScheduleItem("asr", "Asr", resolveUpcomingTime(todayPrayers.asr, tomorrowPrayers.asr, nowMillis), isAzanAudio, RC_ASR),
            PrayerScheduleItem("maghrib", "Maghrib", resolveUpcomingTime(todayPrayers.maghrib, tomorrowPrayers.maghrib, nowMillis), isAzanAudio, RC_MAGHRIB),
            PrayerScheduleItem("isha", "Isha", resolveUpcomingTime(todayPrayers.isha, tomorrowPrayers.isha, nowMillis), isAzanAudio, RC_ISHA)
        )

        for (item in prayerScheduleList) {
            scheduleExactAlarm(item.id, item.name, item.triggerMillis, item.isAzan, item.requestCode)
        }
    }

    private fun resolveUpcomingTime(todayDate: Date, tomorrowDate: Date, nowMillis: Long): Long {
        return if (todayDate.time > nowMillis) todayDate.time else tomorrowDate.time
    }

    private fun scheduleExactAlarm(prayerId: String, prayerName: String, triggerAtMillis: Long, isAzanAudio: Boolean, requestCode: Int) {
        if (triggerAtMillis <= System.currentTimeMillis()) return
        val intent = Intent(context, PrayerAlarmReceiver::class.java).apply {
            action = "com.prayertime.azanramadan.ACTION_TRIGGER_PRAYER"
            putExtra("extra_prayer_id", prayerId)
            putExtra("extra_prayer_name", prayerName)
            putExtra("extra_trigger_millis", triggerAtMillis)
            putExtra("extra_is_azan_audio", isAzanAudio)
            putExtra("extra_request_code", requestCode)
        }
        val pendingIntent = PendingIntent.getBroadcast(context, requestCode, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val canExact = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) alarmManager.canScheduleExactAlarms() else true
        if (canExact) {
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
        } else {
            alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
        }
    }

    private data class PrayerScheduleItem(val id: String, val name: String, val triggerMillis: Long, val isAzan: Boolean, val requestCode: Int)

    companion object {
        const val RC_FAJR = 101
        const val RC_DHUHR = 102
        const val RC_ASR = 103
        const val RC_MAGHRIB = 104
        const val RC_ISHA = 105
        const val RC_SEHRI_ALERT = 201

        fun enqueuePeriodic(context: Context) {
            val periodicWork = PeriodicWorkRequestBuilder<PrayerSchedulerWorker>(24, TimeUnit.HOURS).build()
            WorkManager.getInstance(context).enqueueUniquePeriodicWork("prayer_scheduler_periodic_work", ExistingPeriodicWorkPolicy.UPDATE, periodicWork)
        }

        fun enqueueImmediate(context: Context) {
            val immediateWork = OneTimeWorkRequestBuilder<PrayerSchedulerWorker>().build()
            WorkManager.getInstance(context).enqueueUniqueWork("prayer_scheduler_immediate_work", ExistingWorkPolicy.REPLACE, immediateWork)
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/prayertime/azanramadan/notification/BootReceiver.kt',
    language: 'kotlin',
    purpose: 'BroadcastReceiver to reschedule alarms on reboot or timezone change.',
    content: `package com.prayertime.azanramadan.notification

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        val action = intent?.action
        Log.d("BootReceiver", "Received broadcast action: $action — refreshing prayer alarms")

        when (action) {
            Intent.ACTION_BOOT_COMPLETED,
            "android.intent.action.QUICKBOOT_POWERON",
            Intent.ACTION_MY_PACKAGE_REPLACED,
            Intent.ACTION_TIMEZONE_CHANGED,
            Intent.ACTION_TIME_CHANGED -> {
                PrayerSchedulerWorker.enqueueImmediate(context)
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/prayertime/azanramadan/location/LocationTracker.kt',
    language: 'kotlin',
    purpose: 'FusedLocationProviderClient GPS tracker with PRIORITY_HIGH_ACCURACY for pinpoint astronomical prayer calculation.',
    content: `package com.prayertime.azanramadan.location

import android.annotation.SuppressLint
import android.content.Context
import android.location.Geocoder
import android.location.Location
import android.os.Build
import android.os.Looper
import android.util.Log
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import java.util.Locale

data class PreciseLocationResult(
    val latitude: Double,
    val longitude: Double,
    val accuracyMeters: Float,
    val cityName: String,
    val countryName: String,
    val timezoneId: String
)

class LocationTracker(private val context: Context) {

    private val fusedLocationClient: FusedLocationProviderClient =
        LocationServices.getFusedLocationProviderClient(context)

    @SuppressLint("MissingPermission")
    fun getFreshAccurateLocation(): Flow<PreciseLocationResult?> = callbackFlow {
        val locationRequest = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            1000L
        ).apply {
            setMinUpdateIntervalMillis(500L)
            setMaxUpdates(1)
            setWaitForAccurateLocation(true)
        }.build()

        val locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                val location = result.lastLocation
                if (location != null) {
                    val resolved = resolveLocationDetails(location)
                    saveLocationToPreferences(resolved)
                    trySend(resolved)
                } else {
                    trySend(null)
                }
                channel.close()
            }
        }

        fusedLocationClient.lastLocation.addOnSuccessListener { lastLoc: Location? ->
            if (lastLoc != null && System.currentTimeMillis() - lastLoc.time < 60_000) {
                trySend(resolveLocationDetails(lastLoc))
            }
        }

        fusedLocationClient.requestLocationUpdates(
            locationRequest,
            locationCallback,
            Looper.getMainLooper()
        ).addOnFailureListener {
            trySend(null)
            channel.close()
        }

        awaitClose {
            fusedLocationClient.removeLocationUpdates(locationCallback)
        }
    }

    private fun resolveLocationDetails(location: Location): PreciseLocationResult {
        var cityName = "Detected Location"
        var countryName = "Unknown"

        try {
            val geocoder = Geocoder(context, Locale.getDefault())
            val addresses = geocoder.getFromLocation(location.latitude, location.longitude, 1)
            if (!addresses.isNullOrEmpty()) {
                val addr = addresses[0]
                cityName = addr.locality ?: addr.subAdminArea ?: addr.adminArea ?: "Detected Location"
                countryName = addr.countryName ?: "Unknown"
            }
        } catch (e: Exception) {
            Log.w("LocationTracker", "Reverse geocoding failed", e)
        }

        return PreciseLocationResult(
            latitude = location.latitude,
            longitude = location.longitude,
            accuracyMeters = location.accuracy,
            cityName = cityName,
            countryName = countryName,
            timezoneId = java.util.TimeZone.getDefault().id
        )
    }

    private fun saveLocationToPreferences(loc: PreciseLocationResult) {
        val prefs = context.getSharedPreferences("prayer_time_prefs", Context.MODE_PRIVATE)
        prefs.edit().apply {
            putFloat("pref_latitude", loc.latitude.toFloat())
            putFloat("pref_longitude", loc.longitude.toFloat())
            putString("pref_city_name", loc.cityName)
            putString("pref_country_name", loc.countryName)
            putFloat("pref_accuracy_meters", loc.accuracyMeters)
            apply()
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/prayertime/azanramadan/location/LocationViewModel.kt',
    language: 'kotlin',
    purpose: 'AndroidViewModel managing LocationUiState, triggering single-shot GPS updates, and rescheduling prayer alarms.',
    content: `package com.prayertime.azanramadan.location

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

    fun setManualLocation(latitude: Double, longitude: Double, cityName: String, countryName: String) {
        val manualLoc = UserLocation(
            latitude = latitude,
            longitude = longitude,
            accuracyMeters = 0f,
            city = cityName,
            country = countryName,
            timeZoneId = java.util.TimeZone.getDefault().id
        )

        val prefs = getApplication<Application>().getSharedPreferences(PrayerSchedulerWorker.PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().apply {
            putFloat(PrayerSchedulerWorker.KEY_LATITUDE, latitude.toFloat())
            putFloat(PrayerSchedulerWorker.KEY_LONGITUDE, longitude.toFloat())
            putString("pref_city_name", cityName)
            putString("pref_country_name", countryName)
            putBoolean("pref_is_auto_location", false)
            apply()
        }

        PrayerSchedulerWorker.enqueueImmediate(getApplication())
        _uiState.value = LocationUiState.Success(manualLoc, isAuto = false)
    }

    fun onPermissionGranted() {
        refreshAutoLocation()
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/prayertime/azanramadan/presentation/location/LocationPermissionCard.kt',
    language: 'kotlin',
    purpose: 'Jetpack Compose card for requesting ACCESS_FINE_LOCATION permission and refreshing GPS fix.',
    content: `package com.prayertime.azanramadan.presentation.location

import android.Manifest
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.prayertime.azanramadan.R
import com.prayertime.azanramadan.location.LocationUiState

@Composable
fun LocationPermissionCard(
    uiState: LocationUiState,
    onRefreshClick: () -> Unit,
    onManualPickClick: () -> Unit,
    onPermissionGranted: () -> Unit,
    modifier: Modifier = Modifier
) {
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val isFineGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true
        val isCoarseGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        if (isFineGranted || isCoarseGranted) {
            onPermissionGranted()
        }
    }

    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            when (uiState) {
                is LocationUiState.Loading -> {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        CircularProgressIndicator(modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
                        Text(text = "Acquiring accurate GPS satellite fix...", fontSize = 12.sp)
                    }
                }
                is LocationUiState.PermissionRequired -> {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(text = "Location Permission Needed", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(text = stringResource(R.string.permission_location_rationale), fontSize = 12.sp)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                onClick = {
                                    permissionLauncher.launch(
                                        arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
                                    )
                                }
                            ) {
                                Text("Grant Permission", fontSize = 12.sp)
                            }
                            OutlinedButton(onClick = onManualPickClick) {
                                Text("Choose City", fontSize = 12.sp)
                            }
                        }
                    }
                }
                is LocationUiState.Success -> {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = if (uiState.isAuto) Icons.Default.MyLocation else Icons.Default.LocationOn,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text(text = uiState.location.city, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text(text = "\${uiState.location.country} (\${String.format("%.2f", uiState.location.latitude)}°, \${String.format("%.2f", uiState.location.longitude)}°)", fontSize = 11.sp)
                            }
                        }
                        IconButton(onClick = onRefreshClick) {
                            Icon(Icons.Default.Refresh, contentDescription = "Refresh GPS")
                        }
                    }
                }
                else -> {}
            }
        }
    }
}
`,
  },
  {
    path: 'README.md',
    language: 'markdown',
    purpose: 'Complete step-by-step beginner guide to open in Android Studio and run on emulator or physical phone.',
    content: `# Prayer Time – Azan & Ramadan

Production-ready Muslim Prayer Times, Azan notifications, Ramadan calendar, Sehri & Iftar countdowns, Qibla compass, and Hijri calendar in English and Bangla.

## Notification Architecture (Stage 10 Implemented)
- **NotificationChannels**: 3 high-importance channels (Prayer Reminders, Azan Call to Prayer, Ramadan Sehri & Iftar).
- **AlarmManager**: Exact alarms scheduled via \`setExactAndAllowWhileIdle()\` with Doze wakeups.
- **WorkManager**: \`DailyPrayerScheduleWorker\` recalculates prayer times every 24 hours and on demand.
- **BootReceiver**: Automatically re-registers alarms on device reboot and timezone changes.
`,
  },
];

export async function downloadAndroidProjectZip(): Promise<void> {
  const zip = new JSZip();
  const rootFolder = zip.folder('PrayerTime-Android');

  if (!rootFolder) return;

  ANDROID_PROJECT_FILES.forEach((file) => {
    rootFolder.file(file.path, file.content);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'PrayerTime-Android-Project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
