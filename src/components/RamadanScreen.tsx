import React, { useState, useEffect } from 'react';
import { Moon, Clock, Calendar, CheckCircle2, Bell, BookOpen } from 'lucide-react';
import {
  LocationCoordinates,
  PrayerTimesResult,
  calculatePrayerTimes,
  formatTime,
  formatDuration,
  getHijriDate,
  CalculationMethod,
  AsrMethod,
  PrayerAdjustment,
} from '../utils/prayerCalculation';
import { Language, TRANSLATIONS } from '../utils/translations';

interface RamadanScreenProps {
  location: LocationCoordinates;
  prayerTimes: PrayerTimesResult;
  calculationMethod: CalculationMethod;
  asrMethod: AsrMethod;
  adjustments: PrayerAdjustment;
  hijriOffset: number;
  language: Language;
}

export const RamadanScreen: React.FC<RamadanScreenProps> = ({
  location,
  prayerTimes,
  calculationMethod,
  asrMethod,
  adjustments,
  hijriOffset,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [sehriReminderLead, setSehriReminderLead] = useState<number>(15); // minutes
  const [showFullCalendar, setShowFullCalendar] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hijri = getHijriDate(currentTime, hijriOffset);
  const isRamadanActive = hijri.month === 9; // Ramadan is 9th Hijri month
  const ramadanDay = isRamadanActive ? hijri.day : 1;

  const nowMs = currentTime.getTime();
  const sehriEndMs = prayerTimes.fajr.getTime();
  const iftarMs = prayerTimes.maghrib.getTime();

  const sehriRemainingSeconds = Math.max(0, Math.floor((sehriEndMs - nowMs) / 1000));
  const iftarRemainingSeconds = Math.max(0, Math.floor((iftarMs - nowMs) / 1000));

  // Determine current fasting phase
  let fastingPhaseText = t.fastingPhaseFasting;
  let fastingPhaseColor = 'bg-emerald-600 text-white';

  if (nowMs < sehriEndMs) {
    fastingPhaseText = t.fastingPhaseEating;
    fastingPhaseColor = 'bg-amber-500 text-white';
  } else if (nowMs >= sehriEndMs && nowMs < iftarMs) {
    fastingPhaseText = t.fastingPhaseFasting;
    fastingPhaseColor = 'bg-emerald-600 text-white';
  } else if (nowMs >= iftarMs && nowMs < iftarMs + 30 * 60 * 1000) {
    fastingPhaseText = t.fastingPhaseCompleted;
    fastingPhaseColor = 'bg-purple-600 text-white';
  } else {
    fastingPhaseText = t.fastingPhaseTaraweeh;
    fastingPhaseColor = 'bg-indigo-600 text-white';
  }

  // Calculate 30 Ramadan Days for the timetable
  // Anchor to current year or upcoming Ramadan
  const ramadanDaysList: {
    day: number;
    date: Date;
    sehri: Date;
    fajr: Date;
    dhuhr: Date;
    asr: Date;
    iftar: Date;
    isha: Date;
  }[] = [];

  const baseDate = new Date();
  for (let i = 1; i <= 30; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + (i - (isRamadanActive ? ramadanDay : 1)));
    const times = calculatePrayerTimes(d, location.latitude, location.longitude, calculationMethod, asrMethod, adjustments);
    ramadanDaysList.push({
      day: i,
      date: d,
      sehri: times.fajr,
      fajr: times.fajr,
      dhuhr: times.dhuhr,
      asr: times.asr,
      iftar: times.maghrib,
      isha: times.isha,
    });
  }

  return (
    <div className="pb-24 pt-2 space-y-4">
      {/* Title & Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Moon className="w-5 h-5 text-amber-500" />
            <span>{t.ramadanKareem}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {hijri.day} {language === 'bn' ? hijri.monthNameBn : hijri.monthName} {hijri.year} AH
          </p>
        </div>

        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${fastingPhaseColor}`}>
          {fastingPhaseText}
        </div>
      </div>

      {/* Hero Sehri & Iftar Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Sehri Card */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/80 dark:from-slate-800 dark:to-slate-900 border border-amber-200 dark:border-amber-900/50 p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-400 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{t.sehriEnds}</span>
          </div>
          <div className="text-2xl font-black font-mono text-amber-950 dark:text-amber-100 tabular-nums">
            {formatTime(prayerTimes.fajr)}
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-300 mt-2 font-mono tabular-nums">
            {nowMs < sehriEndMs
              ? `${t.sehriEndsIn} ${formatDuration(sehriRemainingSeconds)}`
              : 'Sehri ended'}
          </div>
        </div>

        {/* Iftar Card */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/80 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-900/50 p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400 mb-1">
            <Moon className="w-3.5 h-3.5" />
            <span>{t.iftarTime}</span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-950 dark:text-emerald-100 tabular-nums">
            {formatTime(prayerTimes.maghrib)}
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-2 font-mono tabular-nums">
            {nowMs < iftarMs
              ? `${t.iftarIn} ${formatDuration(iftarRemainingSeconds)}`
              : 'Iftar completed'}
          </div>
        </div>
      </div>

      {/* Sehri Reminder Lead Control */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          <div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              {language === 'bn' ? 'সেহরির অ্যালার্ট' : 'Sehri Alert'}
            </span>
            <span className="text-[11px] text-slate-500">
              {sehriReminderLead > 0
                ? `${sehriReminderLead} min before Fajr`
                : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {[0, 10, 15, 30].map((mins) => (
            <button
              key={mins}
              onClick={() => setSehriReminderLead(mins)}
              className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                sehriReminderLead === mins
                  ? 'bg-amber-500 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {mins === 0 ? 'Off' : `${mins}m`}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Duas for Fasting */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Fasting Duas (রোজার দোয়া ও নিয়ত)</span>
        </div>

        {/* Sehri Niyyah */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
          <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
            {t.sehriDuaTitle}
          </h4>
          <p className="text-right text-base font-serif text-slate-900 dark:text-white pt-1">
            {t.sehriDuaArabic}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 italic">
            "{t.sehriDuaTranslit}"
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.sehriDuaMeaning}
          </p>
        </div>

        {/* Iftar Dua */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
          <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
            {t.iftarDuaTitle}
          </h4>
          <p className="text-right text-base font-serif text-slate-900 dark:text-white pt-1">
            {t.iftarDuaArabic}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 italic">
            "{t.iftarDuaTranslit}"
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.iftarDuaMeaning}
          </p>
        </div>
      </div>

      {/* 30-Day Ramadan Calendar Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              {t.ramadanCalendar} (30 Days)
            </h3>
          </div>
          <button
            onClick={() => setShowFullCalendar(!showFullCalendar)}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {showFullCalendar ? 'Show Less' : 'Expand All'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/70 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-2.5 py-2">Ramadan</th>
                <th className="px-2 py-2">Date</th>
                <th className="px-2 py-2 text-amber-700 dark:text-amber-400 font-bold">Sehri End</th>
                <th className="px-2 py-2">Fajr</th>
                <th className="px-2 py-2 text-emerald-700 dark:text-emerald-400 font-bold">Iftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
              {(showFullCalendar ? ramadanDaysList : ramadanDaysList.slice(0, 7)).map((item) => {
                const isToday = isRamadanActive && item.day === ramadanDay;

                return (
                  <tr
                    key={item.day}
                    className={
                      isToday
                        ? 'bg-amber-50 dark:bg-amber-950/40 font-bold text-amber-900 dark:text-amber-200'
                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                    }
                  >
                    <td className="px-2.5 py-2 font-semibold">
                      {item.day} {language === 'bn' ? 'রমজান' : 'Ramadan'}
                    </td>
                    <td className="px-2 py-2 text-slate-500 font-sans">
                      {item.date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-2 py-2 font-semibold text-amber-700 dark:text-amber-400">
                      {formatTime(item.sehri, true)}
                    </td>
                    <td className="px-2 py-2 text-slate-600 dark:text-slate-400">
                      {formatTime(item.fajr, true)}
                    </td>
                    <td className="px-2 py-2 font-bold text-emerald-700 dark:text-emerald-400">
                      {formatTime(item.iftar, true)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
