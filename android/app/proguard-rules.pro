# Prayer Time – Azan & Ramadan Proguard Rules

# Adhan calculation library
-keep class com.batoulapps.adhan.** { *; }

# Kotlinx Serialization
-keepclassmembers class * {
    @kotlinx.serialization.SerialName <fields>;
}

# AndroidX Navigation & Compose
-keep class androidx.navigation.** { *; }
-keep class androidx.compose.material3.** { *; }

# WorkManager
-keep class androidx.work.** { *; }
