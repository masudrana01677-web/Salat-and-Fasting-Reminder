import React, { useState } from 'react';
import { X, Search, MapPin, Check } from 'lucide-react';
import { LocationCoordinates, PRESET_CITIES } from '../utils/prayerCalculation';

interface CitySelectorModalProps {
  currentCity: LocationCoordinates;
  onSelectCity: (city: LocationCoordinates) => void;
  onClose: () => void;
}

export const CitySelectorModal: React.FC<CitySelectorModalProps> = ({
  currentCity,
  onSelectCity,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [customName, setCustomName] = useState('');

  const filtered = PRESET_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (!isNaN(lat) && !isNaN(lng) && customName.trim()) {
      onSelectCity({
        name: customName.trim(),
        country: 'Custom Coordinates',
        latitude: lat,
        longitude: lng,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Choose City Location
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search city or country (e.g. Dhaka, Mecca)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Preset City List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filtered.map((city) => {
            const isSelected = currentCity.name === city.name && currentCity.country === city.country;
            return (
              <button
                key={`${city.name}-${city.country}`}
                onClick={() => {
                  onSelectCity(city);
                  onClose();
                }}
                className={`w-full min-h-[48px] px-3 py-2.5 rounded-xl flex items-center justify-between text-left transition-colors ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div>
                  <span className="text-xs font-semibold block">{city.name}</span>
                  <span className="text-[11px] text-slate-400 block">{city.country}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {/* Manual Coordinates Option */}
        <form onSubmit={handleAddCustom} className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Or Enter Custom Coordinates
          </span>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Location name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={customLat}
              onChange={(e) => setCustomLat(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={customLng}
              onChange={(e) => setCustomLng(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>
          <button
            type="submit"
            className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Apply Custom Coordinates
          </button>
        </form>
      </div>
    </div>
  );
};
