import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Moon, Compass, Bell, BellOff, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import {
  LocationCoordinates,
  PrayerTimesResult,
  formatTime,
  formatDuration,
  getHijriDate,
  calculateQibla,
} from '../utils/prayerCalculation';
import { Language, TRANSLATIONS } from '../utils/translations';
import { azanAudio } from '../utils/audioPlayer';

interface HomeScreenProps {
  location: LocationCoordinates;
  prayerTimes: PrayerTimesResult;
  hijriOffset: number;
  language: Language;
  onNavigateToTab: (tab: 'prayer' | 'quran' | 'ramadan' | 'settings') => void;
  onOpenQiblaModal: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  location,
  prayerTimes,
  hijriOffset,
  language,
  onNavigateToTab,
  onOpenQiblaModal,
}) => {
  const t = TRANSLATIONS[language];
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isPlayingAzan, setIsPlayingAzan] = useState(false);
  const [mutedPrayers, setMutedPrayers] = useState<Record<string, boolean>>({});

  // 1-second interval timer for accurate countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hijri = getHijriDate(currentTime, hijriOffset);
  const qibla = calculateQibla(location.latitude, location.longitude);

  // Determine current & next prayer
  const prayersList: { id: string; name: string; date: Date; isObligatory: boolean }[] = [
    { id: 'fajr', name: t.fajr, date: prayerTimes.fajr, isObligatory: true },
    { id: 'sunrise', name: t.sunrise, date: prayerTimes.sunrise, isObligatory: false },
    { id: 'dhuhr', name: t.dhuhr, date: prayerTimes.dhuhr, isObligatory: true },
    { id: 'asr', name: t.asr, date: prayerTimes.asr, isObligatory: true },
    { id: 'sunset', name: t.sunset, date: prayerTimes.sunset, isObligatory: false },
    { id: 'maghrib', name: t.maghrib, date: prayerTimes.maghrib, isObligatory: true },
    { id: 'isha', name: t.isha, date: prayerTimes.isha, isObligatory: true },
  ];

  const nowMs = currentTime.getTime();
  let nextPrayer = prayersList.find((p) => p.date.getTime() > nowMs && p.isObligatory);
  let previousPrayer = [...prayersList].reverse().find((p) => p.date.getTime() <= nowMs && p.isObligatory);

  // If after Isha, next is tomorrow's Fajr
  let nextPrayerTime = nextPrayer ? nextPrayer.date : new Date(prayerTimes.fajr.getTime() + 24 * 60 * 60 * 1000);
  let nextPrayerName = nextPrayer ? nextPrayer.name : t.fajr;

  const secondsRemaining = Math.max(0, Math.floor((nextPrayerTime.getTime() - nowMs) / 1000));

  // Progress percentage between previous prayer and next prayer
  let progressPercent = 0;
  if (previousPrayer) {
    const totalDuration = nextPrayerTime.getTime() - previousPrayer.date.getTime();
    const elapsed = nowMs - previousPrayer.date.getTime();
    progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
  }

  // Sehri & Iftar for quick Ramadan card
  const sehriEndMs = prayerTimes.fajr.getTime();
  const iftarMs = prayerTimes.maghrib.getTime();
  const sehriSecondsRemaining = Math.max(0, Math.floor((sehriEndMs - nowMs) / 1000));
  const iftarSecondsRemaining = Math.max(0, Math.floor((iftarMs - nowMs) / 1000));

  const handleToggleAzan = () => {
    if (isPlayingAzan) {
      azanAudio.stop();
      setIsPlayingAzan(false);
    } else {
      azanAudio.playAzanPhrase(() => setIsPlayingAzan(false));
      setIsPlayingAzan(true);
    }
  };

  const toggleMute = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMutedPrayers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Full current English Gregorian date
  const englishGregorianDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="pb-28 pt-2 space-y-4">
      {/* Date Header: Clear English Date + Authentic Hijri Date */}
      <div className="px-1 text-center bg-slate-50 dark:bg-slate-800/40 py-2.5 rounded-2xl border border-slate-200/50 dark:border-slate-800">
        <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
          {englishGregorianDate}
        </p>
        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5 tracking-wide">
          {hijri.day} {language === 'bn' ? hijri.monthNameBn : hijri.monthName} {hijri.year} AH
        </p>
      </div>

      {/* Hero Next Prayer Countdown Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white p-5 shadow-lg shadow-emerald-900/20">
        {/* Subtle Islamic Motif Background Decoration */}
        <div className="absolute -right-6 -bottom-6 w-36 h-36 opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 L61 35 L98 35 L68 57 L79 91 L50 70 L21 91 L32 57 L2 35 L39 35 Z" />
          </svg>
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-200 uppercase font-medium tracking-wider">
            <span>{t.nextPrayer}</span>
            <span>·</span>
            <span className="font-semibold text-amber-300">{nextPrayerName}</span>
          </div>
          <button
            onClick={handleToggleAzan}
            className={`min-h-[36px] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
              isPlayingAzan
                ? 'bg-amber-400 text-emerald-950 font-bold shadow-md shadow-amber-400/30 animate-pulse'
                : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm'
            }`}
          >
            {isPlayingAzan ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isPlayingAzan ? t.stopAzan : t.playAzan}</span>
          </button>
        </div>

        {/* Large Countdown Display */}
        <div className="my-2">
          <div className="text-4xl font-extrabold tracking-tight font-mono tabular-nums text-white">
            {formatDuration(secondsRemaining)}
          </div>
          <p className="text-xs text-emerald-200/80 mt-1">
            {t.remaining} until {nextPrayerName} at {formatTime(nextPrayerTime)}
          </p>
        </div>

        {/* Prayer Window Progress Bar */}
        <div className="mt-4 pt-3 border-t border-emerald-700/50 flex items-center gap-3">
          <div className="flex-1 bg-black/25 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-emerald-200/90 tabular-nums">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Ramadan Quick Spotlight Banner */}
      <div
        onClick={() => onNavigateToTab('ramadan')}
        className="cursor-pointer rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 p-3.5 transition-all hover:border-amber-300 active:scale-[0.99]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                {t.ramadanKareem}
              </h3>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                {nowMs < sehriEndMs
                  ? `${t.sehriEndsIn} ${formatDuration(sehriSecondsRemaining)}`
                  : nowMs < iftarMs
                  ? `${t.iftarIn} ${formatDuration(iftarSecondsRemaining)}`
                  : t.fastingPhaseCompleted}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-right">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.iftarTime}</span>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-100 font-mono">
                {formatTime(prayerTimes.maghrib)}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* Today's 7 Prayer Timings List */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {t.todayPrayers}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {location.name}
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {prayersList.map((prayer) => {
            const isNext = nextPrayer?.id === prayer.id;
            const isMuted = mutedPrayers[prayer.id];
            const isPast = prayer.date.getTime() < nowMs;

            return (
              <div
                key={prayer.id}
                className={`flex items-center justify-between px-4 py-3 transition-colors ${
                  isNext
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-l-4 border-l-emerald-600'
                    : isPast
                    ? 'opacity-60 bg-transparent'
                    : 'bg-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isNext
                        ? 'bg-emerald-600 ring-4 ring-emerald-100 dark:ring-emerald-900/60'
                        : isPast
                        ? 'bg-slate-300 dark:bg-slate-700'
                        : 'bg-slate-400 dark:bg-slate-600'
                    }`}
                  />
                  <div>
                    <span
                      className={`text-sm ${
                        isNext
                          ? 'font-bold text-emerald-900 dark:text-emerald-200'
                          : 'font-medium text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {prayer.name}
                    </span>
                    {isNext && (
                      <span className="ml-2 text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded">
                        {t.nextPrayer}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-mono tabular-nums ${
                      isNext
                        ? 'font-bold text-emerald-900 dark:text-emerald-100'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {formatTime(prayer.date)}
                  </span>

                  {prayer.isObligatory && (
                    <button
                      onClick={(e) => toggleMute(prayer.id, e)}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"
                      title={isMuted ? 'Notifications muted' : 'Notifications active'}
                    >
                      {isMuted ? (
                        <BellOff className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                      ) : (
                        <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Quran Recitation Spotlight Tile */}
      <div
        onClick={() => onNavigateToTab('quran')}
        className="cursor-pointer rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 p-3.5 flex items-center justify-between hover:border-emerald-300 transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                {language === 'bn' ? 'পবিত্র কুরআন তেলওয়াত ও অর্থ' : 'Holy Quran Audio & Recitation'}
              </span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
              {language === 'bn' ? '১১৪টি সূরা অডিও শুনুন ও পড়ুন' : 'Listen to all 114 Surahs with audio'}
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      </div>

      {/* Quick Qibla Info Tile (Opens Qibla Compass) */}
      <div
        onClick={onOpenQiblaModal}
        className="cursor-pointer rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-3.5 flex items-center justify-between hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-300">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-900 dark:text-white block">
              {t.qiblaTitle}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {qibla.bearing}° from North · {qibla.distanceKm.toLocaleString()} km to Makkah
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>
    </div>
  );
};
