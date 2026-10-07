import React from 'react';
import { MapPin, Globe, FolderGit2, Compass, Crosshair } from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/translations';
import { LocationCoordinates, calculateQibla } from '../utils/prayerCalculation';

interface HeaderProps {
  location: LocationCoordinates;
  isAutoLocation: boolean;
  language: Language;
  onLanguageToggle: () => void;
  onOpenLocationTracker: () => void;
  onOpenQiblaModal: () => void;
  onOpenAndroidModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  location,
  isAutoLocation,
  language,
  onLanguageToggle,
  onOpenLocationTracker,
  onOpenQiblaModal,
  onOpenAndroidModal,
}) => {
  const t = TRANSLATIONS[language];
  const qibla = calculateQibla(location.latitude, location.longitude);

  const todayEnglishDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      {/* Main Top Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5">
        {/* Zone 1: Wordmark & Live Date */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 dark:bg-emerald-600 flex items-center justify-center text-amber-300 font-bold shadow-sm shrink-0">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none block">
              {t.appName}
            </span>
            {/* Current English Date */}
            <span className="text-[10px] font-medium text-emerald-800 dark:text-emerald-400 font-sans leading-none block mt-0.5">
              {todayEnglishDate}
            </span>
          </div>
        </div>

        {/* Zone 2 & 3: Actions (Qibla in menu bar, Location Tracker, Language) */}
        <div className="flex items-center gap-1.5">
          {/* Qibla Compass Trigger in Menu Bar */}
          <button
            onClick={onOpenQiblaModal}
            className="min-h-[36px] px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            title="Open Qibla Direction Compass"
          >
            <Compass className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 animate-spin-slow" />
            <span>Qibla</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-teal-200/60 dark:bg-teal-900/80">
              {qibla.bearing}°
            </span>
          </button>

          {/* Location Tracker Pin */}
          <button
            onClick={onOpenLocationTracker}
            className="min-h-[36px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors border border-slate-200/50 dark:border-slate-700/50"
            title="Open GPS Location Tracker"
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="max-w-[70px] truncate">{location.name}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={onLanguageToggle}
            className="min-h-[36px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors border border-slate-200/50 dark:border-slate-700/50"
            title="Switch English / Bangla"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'en' ? 'বাং' : 'EN'}</span>
          </button>

          {/* Android Code Project */}
          <button
            onClick={onOpenAndroidModal}
            className="min-h-[36px] px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-medium text-white flex items-center gap-1 shadow-sm transition-colors"
            title="Inspect Android Project Files & Download ZIP"
          >
            <FolderGit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
