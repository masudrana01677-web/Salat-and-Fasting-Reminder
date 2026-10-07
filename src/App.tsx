import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { PrayerScreen } from './components/PrayerScreen';
import { QuranScreen } from './components/QuranScreen';
import { RamadanScreen } from './components/RamadanScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { CitySelectorModal } from './components/CitySelectorModal';
import { LocationTrackerModal } from './components/LocationTrackerModal';
import { QiblaModal } from './components/QiblaModal';
import { AndroidProjectModal } from './components/AndroidProjectModal';
import { OnboardingModal } from './components/OnboardingModal';
import {
  LocationCoordinates,
  PRESET_CITIES,
  CalculationMethod,
  AsrMethod,
  PrayerAdjustment,
  calculatePrayerTimes,
} from './utils/prayerCalculation';
import { Language } from './utils/translations';
import { Smartphone, Monitor, Sparkles, Compass } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [location, setLocation] = useState<LocationCoordinates>(PRESET_CITIES[0]); // Dhaka default
  const [isAutoLocation, setIsAutoLocation] = useState<boolean>(false);
  const [calculationMethod, setCalculationMethod] = useState<CalculationMethod>('KARACHI');
  const [asrMethod, setAsrMethod] = useState<AsrMethod>('HANAFI');
  const [adjustments, setAdjustments] = useState<PrayerAdjustment>({
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  });
  const [hijriOffset, setHijriOffset] = useState<number>(0);
  const [language, setLanguage] = useState<Language>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  // Modals
  const [showCitySelector, setShowCitySelector] = useState<boolean>(false);
  const [showLocationTracker, setShowLocationTracker] = useState<boolean>(false);
  const [showQiblaModal, setShowQiblaModal] = useState<boolean>(false);
  const [showAndroidModal, setShowAndroidModal] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Sync dark mode class with HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Compute live prayer times for current date and parameters
  const prayerTimes = useMemo(() => {
    return calculatePrayerTimes(
      new Date(),
      location.latitude,
      location.longitude,
      calculationMethod,
      asrMethod,
      adjustments
    );
  }, [location, calculationMethod, asrMethod, adjustments]);

  const toggleAutoLocation = () => {
    if (!isAutoLocation && navigator.geolocation) {
      setIsAutoLocation(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            name: 'Precise GPS Location',
            country: 'GPS Fix',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });
        },
        () => {
          setIsAutoLocation(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setIsAutoLocation(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 transition-colors selection:bg-emerald-600 selection:text-white">
      {/* Top Companion Bar for switching Phone Simulator view vs Full Desktop View */}
      <div className="w-full max-w-4xl hidden sm:flex items-center justify-between mb-3 px-2 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
            Prayer Time – Azan &amp; Ramadan
          </span>
          <span>·</span>
          <span>Precision GPS, Quran Audio &amp; Qibla Menu</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Qibla button in companion bar */}
          <button
            onClick={() => setShowQiblaModal(true)}
            className="px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 hover:bg-teal-100 flex items-center gap-1.5 transition-colors font-medium"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Qibla Compass</span>
          </button>

          {/* Onboarding trigger */}
          <button
            onClick={() => setShowOnboarding(true)}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Onboarding</span>
          </button>

          {/* Phone Frame Toggle */}
          <div className="flex items-center p-0.5 bg-slate-200 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setIsPhoneFrame(true)}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 text-[11px] font-medium transition-all ${
                isPhoneFrame
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
            <button
              onClick={() => setIsPhoneFrame(false)}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 text-[11px] font-medium transition-all ${
                !isPhoneFrame
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Expanded</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main App Container */}
      <div
        className={`w-full bg-white dark:bg-slate-900 shadow-xl transition-all relative flex flex-col ${
          isPhoneFrame
            ? 'max-w-[430px] min-h-[100dvh] sm:min-h-[820px] sm:max-h-[880px] sm:rounded-[36px] sm:border-[8px] sm:border-slate-800 sm:ring-1 sm:ring-slate-700/50 overflow-hidden'
            : 'max-w-2xl min-h-[100dvh] sm:min-h-[840px] sm:rounded-2xl sm:border border-slate-200 dark:border-slate-800 overflow-hidden'
        }`}
      >
        {/* Smartphone Camera Notch */}
        {isPhoneFrame && (
          <div className="hidden sm:flex items-center justify-center pt-2 pb-1 bg-white dark:bg-slate-900 z-40">
            <div className="w-24 h-4 bg-slate-900 dark:bg-slate-950 rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700 mr-2" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>
          </div>
        )}

        {/* Top App Bar with Qibla Button & Current English Date */}
        <Header
          location={location}
          isAutoLocation={isAutoLocation}
          language={language}
          onLanguageToggle={() => setLanguage(language === 'en' ? 'bn' : 'en')}
          onOpenLocationTracker={() => setShowLocationTracker(true)}
          onOpenQiblaModal={() => setShowQiblaModal(true)}
          onOpenAndroidModal={() => setShowAndroidModal(true)}
        />

        {/* Scrollable Screen Content */}
        <main className="flex-1 overflow-y-auto px-4">
          {currentTab === 'home' && (
            <HomeScreen
              location={location}
              prayerTimes={prayerTimes}
              hijriOffset={hijriOffset}
              language={language}
              onNavigateToTab={(tab) => setCurrentTab(tab as NavTab)}
              onOpenQiblaModal={() => setShowQiblaModal(true)}
            />
          )}

          {currentTab === 'prayer' && (
            <PrayerScreen
              location={location}
              prayerTimes={prayerTimes}
              calculationMethod={calculationMethod}
              asrMethod={asrMethod}
              adjustments={adjustments}
              language={language}
            />
          )}

          {currentTab === 'quran' && (
            <QuranScreen
              language={language}
            />
          )}

          {currentTab === 'ramadan' && (
            <RamadanScreen
              location={location}
              prayerTimes={prayerTimes}
              calculationMethod={calculationMethod}
              asrMethod={asrMethod}
              adjustments={adjustments}
              hijriOffset={hijriOffset}
              language={language}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsScreen
              location={location}
              isAutoLocation={isAutoLocation}
              onToggleAutoLocation={toggleAutoLocation}
              onOpenCitySelector={() => setShowLocationTracker(true)}
              calculationMethod={calculationMethod}
              onChangeCalculationMethod={setCalculationMethod}
              asrMethod={asrMethod}
              onChangeAsrMethod={setAsrMethod}
              adjustments={adjustments}
              onChangeAdjustments={setAdjustments}
              hijriOffset={hijriOffset}
              onChangeHijriOffset={setHijriOffset}
              language={language}
              onChangeLanguage={setLanguage}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              onOpenAndroidModal={() => setShowAndroidModal(true)}
            />
          )}
        </main>

        {/* Bottom Navigation (5 destinations: Home, Prayer, Quran, Ramadan, Settings) */}
        <BottomNav
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          language={language}
        />
      </div>

      {/* Modals */}
      {showLocationTracker && (
        <LocationTrackerModal
          currentLocation={location}
          onUpdateLocation={(newLoc) => {
            setLocation(newLoc);
            setIsAutoLocation(true);
          }}
          onClose={() => setShowLocationTracker(false)}
        />
      )}

      {showCitySelector && (
        <CitySelectorModal
          currentCity={location}
          onSelectCity={(city) => {
            setLocation(city);
            setIsAutoLocation(false);
          }}
          onClose={() => setShowCitySelector(false)}
        />
      )}

      {showQiblaModal && (
        <QiblaModal
          location={location}
          language={language}
          onClose={() => setShowQiblaModal(false)}
        />
      )}

      {showAndroidModal && (
        <AndroidProjectModal
          onClose={() => setShowAndroidModal(false)}
        />
      )}

      {showOnboarding && (
        <OnboardingModal
          language={language}
          onFinish={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}
