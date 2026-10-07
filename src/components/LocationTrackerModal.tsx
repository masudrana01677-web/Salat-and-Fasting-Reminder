import React, { useState } from 'react';
import { X, Navigation, MapPin, RefreshCw, CheckCircle2, AlertCircle, Crosshair } from 'lucide-react';
import { LocationCoordinates, PRESET_CITIES } from '../utils/prayerCalculation';

interface LocationTrackerModalProps {
  currentLocation: LocationCoordinates;
  onUpdateLocation: (newLocation: LocationCoordinates) => void;
  onClose: () => void;
}

export const LocationTrackerModal: React.FC<LocationTrackerModalProps> = ({
  currentLocation,
  onUpdateLocation,
  onClose,
}) => {
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualCity, setManualCity] = useState(currentLocation.name);
  const [customLat, setCustomLat] = useState(currentLocation.latitude.toString());
  const [customLng, setCustomLng] = useState(currentLocation.longitude.toString());

  const handleTrackExactGPS = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your device or browser.');
      return;
    }

    setIsLocating(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);
        setAccuracy(acc);
        setCustomLat(lat.toFixed(5));
        setCustomLng(lng.toFixed(5));

        // Find closest preset city or use GPS label
        let closest = 'Accurate GPS Location';
        let minDistance = 999999;
        PRESET_CITIES.forEach((city) => {
          const d = Math.hypot(city.latitude - lat, city.longitude - lng);
          if (d < minDistance) {
            minDistance = d;
            if (d < 0.4) {
              closest = city.name;
            }
          }
        });

        const newLoc: LocationCoordinates = {
          name: closest,
          country: 'GPS Detected',
          latitude: lat,
          longitude: lng,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        onUpdateLocation(newLoc);
      },
      (err) => {
        setIsLocating(false);
        setErrorMsg(`GPS Error: ${err.message}. You can manually input coordinates below.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleApplyManual = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      onUpdateLocation({
        name: manualCity.trim() || 'Custom Location',
        country: 'Manual',
        latitude: lat,
        longitude: lng,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                High-Accuracy Location Tracker
              </h2>
              <span className="text-[11px] text-slate-500">
                Pinpoint coordinates for exact prayer times
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live GPS Tracker Action Card */}
        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-slate-800 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wide">
                Live GPS Tracker
              </span>
              {accuracy !== null && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 font-semibold">
                  Accuracy: ±{accuracy}m
                </span>
              )}
            </div>

            <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Active Location:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{currentLocation.name}</span>
              </div>
              <div className="flex justify-between font-mono tabular-nums">
                <span className="text-slate-500">Latitude:</span>
                <span>{currentLocation.latitude.toFixed(5)}°</span>
              </div>
              <div className="flex justify-between font-mono tabular-nums">
                <span className="text-slate-500">Longitude:</span>
                <span>{currentLocation.longitude.toFixed(5)}°</span>
              </div>
            </div>

            <button
              onClick={handleTrackExactGPS}
              disabled={isLocating}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-900/10 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting GPS Satellites...' : 'Get Pinpoint GPS Location'}</span>
            </button>

            {errorMsg && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Manual Precise Adjustment */}
          <form onSubmit={handleApplyManual} className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Or Fine-Tune Coordinates Manually
            </span>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                City / Location Label
              </label>
              <input
                type="text"
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Save &amp; Recalculate Prayer Times
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
