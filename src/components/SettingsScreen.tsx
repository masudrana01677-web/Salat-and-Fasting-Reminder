import React from 'react';
import {
  MapPin,
  Calculator,
  Sliders,
  Volume2,
  Globe,
  Moon,
  Sun,
  FolderGit2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  CalculationMethod,
  AsrMethod,
  PrayerAdjustment,
  LocationCoordinates,
} from '../utils/prayerCalculation';
import { Language, TRANSLATIONS } from '../utils/translations';

interface SettingsScreenProps {
  location: LocationCoordinates;
  isAutoLocation: boolean;
  onToggleAutoLocation: () => void;
  onOpenCitySelector: () => void;
  calculationMethod: CalculationMethod;
  onChangeCalculationMethod: (method: CalculationMethod) => void;
  asrMethod: AsrMethod;
  onChangeAsrMethod: (method: AsrMethod) => void;
  adjustments: PrayerAdjustment;
  onChangeAdjustments: (adj: PrayerAdjustment) => void;
  hijriOffset: number;
  onChangeHijriOffset: (offset: number) => void;
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAndroidModal: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  location,
  isAutoLocation,
  onToggleAutoLocation,
  onOpenCitySelector,
  calculationMethod,
  onChangeCalculationMethod,
  asrMethod,
  onChangeAsrMethod,
  adjustments,
  onChangeAdjustments,
  hijriOffset,
  onChangeHijriOffset,
  language,
  onChangeLanguage,
  isDarkMode,
  onToggleDarkMode,
  onOpenAndroidModal,
}) => {
  const t = TRANSLATIONS[language];

  const calculationMethods: { id: CalculationMethod; label: string; desc: string }[] = [
    { id: 'KARACHI', label: 'Univ. of Islamic Sciences, Karachi', desc: 'Fajr 18°, Isha 18° (Bangladesh & Pakistan standard)' },
    { id: 'MWL', label: 'Muslim World League (MWL)', desc: 'Fajr 18°, Isha 17° (Europe & Worldwide standard)' },
    { id: 'MAKKAH', label: 'Umm al-Qura University, Makkah', desc: 'Fajr 18.5°, Isha 90 min after Maghrib (Saudi Arabia)' },
    { id: 'EGYPT', label: 'Egyptian General Authority', desc: 'Fajr 19.5°, Isha 17.5° (Middle East & North Africa)' },
    { id: 'ISNA', label: 'Islamic Society of North America (ISNA)', desc: 'Fajr 15°, Isha 15° (USA & Canada)' },
    { id: 'SINGAPORE', label: 'Majlis Ugama Islam Singapura (MUIS)', desc: 'Fajr 20°, Isha 18° (Singapore, Malaysia)' },
    { id: 'TEHRAN', label: 'Institute of Geophysics, Univ. of Tehran', desc: 'Fajr 17.7°, Isha 14°' },
  ];

  const handleAdjust = (prayer: keyof PrayerAdjustment, delta: number) => {
    onChangeAdjustments({
      ...adjustments,
      [prayer]: adjustments[prayer] + delta,
    });
  };

  return (
    <div className="pb-28 pt-2 space-y-5">
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
          {t.settingsTitle}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure prayer calculation, notifications, and localization
        </p>
      </div>

      {/* Android Studio Stage 1 Banner */}
      <div
        onClick={onOpenAndroidModal}
        className="cursor-pointer rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 shadow-md flex items-center justify-between transition-transform active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Android Studio Project
            </h3>
            <p className="text-sm font-semibold text-white">
              Inspect Source &amp; Download ZIP
            </p>
            <p className="text-[11px] text-emerald-100/70">
              Kotlin · Jetpack Compose · Material 3
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-emerald-200" />
      </div>

      {/* Section 1: Location */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>{t.sectionLocation}</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <span className="text-sm font-medium text-slate-900 dark:text-white block">
              {isAutoLocation ? t.autoLocation : t.manualLocation}
            </span>
            <span className="text-xs text-slate-500">
              {location.name}, {location.country} ({location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCitySelector}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              Change City
            </button>
            <button
              onClick={onToggleAutoLocation}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isAutoLocation
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              GPS
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Calculation Method */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <Calculator className="w-4 h-4 text-emerald-600" />
          <span>{t.sectionCalculation}</span>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            {t.calcMethod}
          </label>
          <select
            value={calculationMethod}
            onChange={(e) => onChangeCalculationMethod(e.target.value as CalculationMethod)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {calculationMethods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {calculationMethods.find((m) => m.id === calculationMethod)?.desc}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            {t.asrMethod}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onChangeAsrMethod('HANAFI')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                asrMethod === 'HANAFI'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {t.hanafi} (2x shadow)
            </button>
            <button
              onClick={() => onChangeAsrMethod('STANDARD')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                asrMethod === 'STANDARD'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Standard (1x shadow)
            </button>
          </div>
        </div>

        {/* Hijri Adjustment */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              {t.hijriAdjustment}
            </span>
            <span className="text-[11px] text-slate-400">
              Align with local moon sighting
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onChangeHijriOffset(hijriOffset - 1)}
              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
            >
              -
            </button>
            <span className="text-xs font-mono font-bold w-6 text-center text-slate-900 dark:text-white">
              {hijriOffset > 0 ? `+${hijriOffset}` : hijriOffset}
            </span>
            <button
              onClick={() => onChangeHijriOffset(hijriOffset + 1)}
              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Section 4: Notifications & AlarmManager Architecture */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <Volume2 className="w-4 h-4 text-emerald-600" />
          <span>NOTIFICATION CHANNELS &amp; ALARMS</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                AlarmManager Engine
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Exact Wakeup (RTC_WAKEUP)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Uses <code className="text-emerald-600 font-mono">setExactAndAllowWhileIdle()</code> to wake the device from Doze mode at prayer times.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                WorkManager Engine
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                DailyWorker (24h)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              <code className="text-teal-600 font-mono">DailyPrayerScheduleWorker</code> recalculates astronomical coordinates daily and handles device reboots via <code className="font-mono">BootReceiver</code>.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">
            Test Notification Trigger (Simulate Alarm)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                import('../utils/audioPlayer').then(({ azanAudio }) => azanAudio.playAzanPhrase());
                alert('🔔 Simulated Alarm Triggered: [Fajr Azan]\nChannel: channel_azan_audio\nPriority: High (WakeLock active)');
              }}
              className="py-1.5 px-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-lg text-[11px] font-semibold transition-colors"
            >
              Fajr Azan
            </button>
            <button
              onClick={() => {
                import('../utils/audioPlayer').then(({ azanAudio }) => azanAudio.playAzanPhrase());
                alert('🌙 Simulated Alarm Triggered: [Iftar / Maghrib Time]\nChannel: channel_ramadan_alerts\nPriority: High (WakeLock active)');
              }}
              className="py-1.5 px-2 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-lg text-[11px] font-semibold transition-colors"
            >
              Iftar Alarm
            </button>
            <button
              onClick={() => {
                alert('⏰ Simulated Alarm Triggered: [Sehri Ending Soon]\nChannel: channel_ramadan_alerts\nInterval: 15 min before Fajr');
              }}
              className="py-1.5 px-2 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 rounded-lg text-[11px] font-semibold transition-colors"
            >
              Sehri Alert
            </button>
          </div>
        </div>
      </div>

      {/* Section 4: Language & Appearance */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>{t.sectionLanguage}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              {t.language}
            </label>
            <div className="flex gap-1.5">
              <button
                onClick={() => onChangeLanguage('en')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  language === 'en'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                English
              </button>
              <button
                onClick={() => onChangeLanguage('bn')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  language === 'bn'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                বাংলা
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              {t.theme}
            </label>
            <button
              onClick={onToggleDarkMode}
              className="w-full py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              <span>{isDarkMode ? t.lightMode : t.darkMode}</span>
            </button>
          </div>
        </div>
      </div>

      {/* App Info & Privacy */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Privacy &amp; Offline Guarantee</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Prayer times and Qibla bearings are computed 100% locally on your device. Your precise location is never uploaded to any remote server.
        </p>
        <p className="text-[11px] text-slate-400 pt-1">
          Version 1.0.0 · Package: com.prayertime.azanramadan
        </p>
      </div>
    </div>
  );
};
