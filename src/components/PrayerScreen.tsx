import React, { useState } from 'react';
import { Bell, Volume2, BellOff, Calendar, List } from 'lucide-react';
import {
  LocationCoordinates,
  PrayerTimesResult,
  calculatePrayerTimes,
  formatTime,
  CalculationMethod,
  AsrMethod,
  PrayerAdjustment,
} from '../utils/prayerCalculation';
import { Language, TRANSLATIONS } from '../utils/translations';

interface PrayerScreenProps {
  location: LocationCoordinates;
  prayerTimes: PrayerTimesResult;
  calculationMethod: CalculationMethod;
  asrMethod: AsrMethod;
  adjustments: PrayerAdjustment;
  language: Language;
}

export const PrayerScreen: React.FC<PrayerScreenProps> = ({
  location,
  prayerTimes,
  calculationMethod,
  asrMethod,
  adjustments,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  const prayers = [
    { id: 'fajr', name: t.fajr, time: prayerTimes.fajr, desc: 'Dawn to Sunrise' },
    { id: 'sunrise', name: t.sunrise, time: prayerTimes.sunrise, desc: 'Prohibition time for prayer' },
    { id: 'dhuhr', name: t.dhuhr, time: prayerTimes.dhuhr, desc: 'After zenith until shadow = object' },
    { id: 'asr', name: t.asr, time: prayerTimes.asr, desc: 'Afternoon until sunset' },
    { id: 'sunset', name: t.sunset, time: prayerTimes.sunset, desc: 'Solar disc sets below horizon' },
    { id: 'maghrib', name: t.maghrib, time: prayerTimes.maghrib, desc: 'Immediately after sunset' },
    { id: 'isha', name: t.isha, time: prayerTimes.isha, desc: 'Nightfall until Islamic midnight' },
  ];

  const nightPrayers = [
    { id: 'midnight', name: t.midnight, time: prayerTimes.midnight, desc: 'Islamic midpoint of the night' },
    { id: 'tahajjud', name: t.tahajjud, time: prayerTimes.tahajjud, desc: 'Last third of night begins' },
  ];

  // Generate 30 days of prayer times for monthly calendar
  const currentYear = new Date().getFullYear();
  const daysInMonth = new Date(currentYear, selectedMonth + 1, 0).getDate();
  const monthlyList: { day: number; times: PrayerTimesResult }[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dObj = new Date(currentYear, selectedMonth, d);
    const times = calculatePrayerTimes(dObj, location.latitude, location.longitude, calculationMethod, asrMethod, adjustments);
    monthlyList.push({ day: d, times });
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="pb-24 pt-2 space-y-4">
      {/* View Switcher: Daily vs Monthly */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            {t.navPrayer}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {location.name}, {location.country}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setViewMode('daily')}
            className={`min-h-[34px] px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
              viewMode === 'daily'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Daily</span>
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`min-h-[34px] px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
              viewMode === 'monthly'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly</span>
          </button>
        </div>
      </div>

      {viewMode === 'daily' ? (
        <>
          {/* Daily Obligatory Prayer Cards */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>PRAYER</span>
              <span>TIME</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {prayers.map((prayer) => (
                <div key={prayer.id} className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {prayer.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {prayer.desc}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {formatTime(prayer.time)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Night & Voluntary Windows (Midnight & Tahajjud) */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Night &amp; Tahajjud Windows
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {nightPrayers.map((item) => (
                <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                    {item.name}
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white tabular-nums block mt-0.5">
                    {formatTime(item.time)}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Monthly Timetable */
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-900 dark:text-white"
            >
              {monthNames.map((name, idx) => (
                <option key={idx} value={idx}>
                  {name} {currentYear}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-500 font-mono">
              {location.name}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100/70 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-2.5 py-2">Day</th>
                  <th className="px-2 py-2">Fajr</th>
                  <th className="px-2 py-2">Sunrise</th>
                  <th className="px-2 py-2">Dhuhr</th>
                  <th className="px-2 py-2">Asr</th>
                  <th className="px-2 py-2">Maghrib</th>
                  <th className="px-2 py-2">Isha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                {monthlyList.map(({ day, times }) => {
                  const isToday =
                    day === new Date().getDate() &&
                    selectedMonth === new Date().getMonth();

                  return (
                    <tr
                      key={day}
                      className={
                        isToday
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 font-bold text-emerald-900 dark:text-emerald-200'
                          : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                      }
                    >
                      <td className="px-2.5 py-2 font-semibold">{day}</td>
                      <td className="px-2 py-2">{formatTime(times.fajr, true)}</td>
                      <td className="px-2 py-2 text-slate-400">{formatTime(times.sunrise, true)}</td>
                      <td className="px-2 py-2">{formatTime(times.dhuhr, true)}</td>
                      <td className="px-2 py-2">{formatTime(times.asr, true)}</td>
                      <td className="px-2 py-2 font-semibold text-emerald-700 dark:text-emerald-400">
                        {formatTime(times.maghrib, true)}
                      </td>
                      <td className="px-2 py-2">{formatTime(times.isha, true)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
