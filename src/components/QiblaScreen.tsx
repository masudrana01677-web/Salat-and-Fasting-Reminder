import React, { useState, useEffect } from 'react';
import { Compass, RotateCcw, CheckCircle, Navigation } from 'lucide-react';
import { LocationCoordinates, calculateQibla } from '../utils/prayerCalculation';
import { Language, TRANSLATIONS } from '../utils/translations';

interface QiblaScreenProps {
  location: LocationCoordinates;
  language: Language;
}

export const QiblaScreen: React.FC<QiblaScreenProps> = ({ location, language }) => {
  const t = TRANSLATIONS[language];
  const qibla = calculateQibla(location.latitude, location.longitude);

  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [hasCompassSensor, setHasCompassSensor] = useState<boolean>(false);
  const [manualHeading, setManualHeading] = useState<number>(0);

  // Listen to mobile device orientation
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading = 0;
      if ('webkitCompassHeading' in e && typeof (e as unknown as { webkitCompassHeading: number }).webkitCompassHeading === 'number') {
        // iOS Safari
        heading = (e as unknown as { webkitCompassHeading: number }).webkitCompassHeading;
        setHasCompassSensor(true);
      } else if (e.alpha !== null) {
        // Android Chrome
        heading = 360 - e.alpha;
        setHasCompassSensor(true);
      }
      setDeviceHeading(Math.round(heading));
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, []);

  const activeHeading = hasCompassSensor ? deviceHeading : manualHeading;

  // The angle to rotate the compass dial so North matches activeHeading
  // And the Qibla needle points to (qibla.bearing - activeHeading)
  const relativeAngle = (qibla.bearing - activeHeading + 360) % 360;
  const isAligned = Math.abs(relativeAngle <= 180 ? relativeAngle : relativeAngle - 360) <= 5;

  return (
    <div className="pb-24 pt-2 space-y-4">
      {/* Header Info */}
      <div className="text-center space-y-1">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
          {t.qiblaTitle}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {location.name}, {location.country}
        </p>
      </div>

      {/* Main Compass Visual Dial */}
      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative w-64 h-64 rounded-full bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-2 shadow-inner border border-slate-300/80 dark:border-slate-700">
          {/* Compass Rose Ring */}
          <div
            className="w-full h-full rounded-full border-2 border-slate-300 dark:border-slate-700 relative flex items-center justify-center transition-transform duration-300 ease-out"
            style={{ transform: `rotate(${-activeHeading}deg)` }}
          >
            {/* Cardinal Markers */}
            <span className="absolute top-2 text-xs font-black text-rose-600">N</span>
            <span className="absolute right-2 text-xs font-bold text-slate-400">E</span>
            <span className="absolute bottom-2 text-xs font-bold text-slate-400">S</span>
            <span className="absolute left-2 text-xs font-bold text-slate-400">W</span>

            {/* Degree Tick marks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                className="absolute w-0.5 h-2 bg-slate-400/50 dark:bg-slate-600"
                style={{
                  transform: `rotate(${deg}deg) translateY(-118px)`,
                }}
              />
            ))}

            {/* Kaaba Marker Pin at the calculated Qibla bearing */}
            <div
              className="absolute w-8 h-8 -top-3 left-1/2 -ml-4 flex flex-col items-center"
              style={{
                transformOrigin: '50% 128px',
                transform: `rotate(${qibla.bearing}deg)`,
              }}
            >
              <div className="w-6 h-6 rounded bg-amber-400 border border-amber-600 shadow-md flex items-center justify-center text-[10px] font-bold text-slate-950">
                🕋
              </div>
            </div>
          </div>

          {/* Central Qibla Pointer Needle */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-200 ease-out"
            style={{ transform: `rotate(${relativeAngle}deg)` }}
          >
            <div className="w-1.5 h-24 bg-gradient-to-t from-emerald-700 via-emerald-500 to-amber-400 rounded-full shadow-lg" />
            <div className="absolute top-8 w-4 h-4 bg-amber-400 rotate-45 rounded-sm" />
          </div>

          {/* Center Hub */}
          <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-white dark:bg-slate-950 border-2 border-emerald-600 shadow-md flex items-center justify-center">
            <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        {/* Alignment status alert */}
        <div className="mt-4">
          {isAligned ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-800 animate-pulse">
              <CheckCircle className="w-4 h-4" />
              <span>{t.alignedWithQibla}</span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {qibla.bearing}° from North (Device heading: {activeHeading}°)
            </div>
          )}
        </div>
      </div>

      {/* Numerical Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 text-center">
          <span className="text-[11px] font-medium text-slate-500 block">Qibla Direction</span>
          <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
            {qibla.bearing}°
          </span>
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 text-center">
          <span className="text-[11px] font-medium text-slate-500 block">Distance to Makkah</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {qibla.distanceKm.toLocaleString()} km
          </span>
        </div>
      </div>

      {/* Manual Compass Heading Slider (For testing & Desktop) */}
      <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {t.manualRotateDial}
          </span>
          <span className="font-mono text-slate-500 tabular-nums">
            {activeHeading}°
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          value={activeHeading}
          onChange={(e) => {
            setHasCompassSensor(false);
            setManualHeading(Number(e.target.value));
          }}
          className="w-full accent-emerald-600"
        />
        <p className="text-[10px] text-slate-400 text-center">
          {hasCompassSensor ? 'Live sensor active' : 'Drag slider to simulate device rotation'}
        </p>
      </div>

      {/* Calibration Guidance */}
      <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-center">
        <p className="text-[11px] text-amber-800 dark:text-amber-300">
          {t.calibrateTip}
        </p>
      </div>
    </div>
  );
};
