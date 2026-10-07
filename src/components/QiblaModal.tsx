import React from 'react';
import { X, Compass } from 'lucide-react';
import { LocationCoordinates } from '../utils/prayerCalculation';
import { Language } from '../utils/translations';
import { QiblaScreen } from './QiblaScreen';

interface QiblaModalProps {
  location: LocationCoordinates;
  language: Language;
  onClose: () => void;
}

export const QiblaModal: React.FC<QiblaModalProps> = ({ location, language, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-300">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {language === 'bn' ? 'কিবলা দিকনির্ণয় (কম্পাস)' : 'Qibla Direction Compass'}
              </h2>
              <span className="text-[11px] text-slate-500">
                {location.name} · Kaaba Finder
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto">
          <QiblaScreen location={location} language={language} />
        </div>
      </div>
    </div>
  );
};
