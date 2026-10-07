import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Book,
  X,
  Check,
  Headphones,
  Sparkles,
} from 'lucide-react';
import { SURAHS_LIST, SURAH_VERSES_SAMPLE, SurahMeta, AyahItem } from '../utils/quranData';
import { Language, TRANSLATIONS } from '../utils/translations';

interface QuranScreenProps {
  language: Language;
}

export const QuranScreen: React.FC<QuranScreenProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [activeSurah, setActiveSurah] = useState<SurahMeta>(SURAHS_LIST[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [readingSurah, setReadingSurah] = useState<SurahMeta | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize or update audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(activeSurah.audioUrl);
    } else {
      audioRef.current.src = activeSurah.audioUrl;
      audioRef.current.load();
    }

    const audio = audioRef.current;
    audio.volume = volume;

    const onTimeUpdate = () => {
      if (audio.duration) {
        setCurrentTime(audio.currentTime);
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onEnded = () => {
      setIsPlaying(false);
      // Automatically advance to next Surah if available
      if (activeSurah.number < 114) {
        const next = SURAHS_LIST[activeSurah.number]; // next is index number
        if (next) {
          setActiveSurah(next);
        }
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    if (isPlaying) {
      audio.play().catch((e) => console.warn('Autoplay prevented:', e));
    }

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [activeSurah]);

  const togglePlayPause = (surah?: SurahMeta) => {
    if (surah && surah.number !== activeSurah.number) {
      setActiveSurah(surah);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = surah.audioUrl;
        audioRef.current.play().catch(console.warn);
      }
      return;
    }

    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.warn);
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setAudioProgress(newProgress);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
    }
  };

  const handleNextSurah = () => {
    if (activeSurah.number < 114) {
      setActiveSurah(SURAHS_LIST[activeSurah.number]);
    }
  };

  const handlePrevSurah = () => {
    if (activeSurah.number > 1) {
      setActiveSurah(SURAHS_LIST[activeSurah.number - 2]);
    }
  };

  const filteredSurahs = SURAHS_LIST.filter((s) => {
    const matchesSearch =
      s.englishName.toLowerCase().includes(search.toLowerCase()) ||
      s.arabicName.includes(search) ||
      s.banglaName.includes(search) ||
      s.number.toString() === search.trim();

    const matchesFilter =
      filterType === 'all' || s.revelationType === filterType;

    return matchesSearch && matchesFilter;
  });

  const formatSecs = (sec: number) => {
    if (isNaN(sec)) return '0:00';
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="pb-32 pt-2 space-y-4">
      {/* Title & Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{language === 'bn' ? 'পবিত্র আল-কুরআন' : 'Holy Quran'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'bn'
              ? '১১৪টি সূরার তেলওয়াত ও অর্থসহ পাঠ'
              : 'Recite & Listen to all 114 Surahs'}
          </p>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
          <Headphones className="w-3.5 h-3.5" />
          <span>Mishary Alafasy</span>
        </div>
      </div>

      {/* Persistent Audio Recitation Player Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 shadow-lg shadow-emerald-950/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-mono font-bold text-amber-300 text-sm">
              {activeSurah.number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {language === 'bn' ? activeSurah.banglaName : activeSurah.englishName}
                </span>
                <span className="text-xs font-serif text-amber-200">
                  {activeSurah.arabicName}
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80">
                {activeSurah.englishMeaning} · {activeSurah.numberOfAyahs} {language === 'bn' ? 'আয়াত' : 'Ayahs'}
              </p>
            </div>
          </div>

          {/* Quick Recite Text Button */}
          <button
            onClick={() => setReadingSurah(activeSurah)}
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium text-white flex items-center gap-1 transition-colors"
          >
            <Book className="w-3.5 h-3.5" />
            <span>Recite</span>
          </button>
        </div>

        {/* Progress scrub bar */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max="100"
            value={audioProgress}
            onChange={handleSeek}
            className="w-full accent-amber-400 h-1.5 bg-black/20 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-emerald-200/80 tabular-nums">
            <span>{formatSecs(currentTime)}</span>
            <span>{formatSecs(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevSurah}
              disabled={activeSurah.number <= 1}
              className="w-8 h-8 rounded-full flex items-center justify-center text-emerald-200 hover:text-white disabled:opacity-30"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => togglePlayPause()}
              className="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold flex items-center justify-center shadow-md transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={handleNextSurah}
              disabled={activeSurah.number >= 114}
              className="w-8 h-8 rounded-full flex items-center justify-center text-emerald-200 hover:text-white disabled:opacity-30"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-emerald-200" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => {
                const v = Number(e.target.value);
                setVolume(v);
                if (audioRef.current) audioRef.current.volume = v;
              }}
              className="w-16 accent-amber-400 h-1 bg-black/30 rounded"
            />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={language === 'bn' ? 'সূরার নাম বা নম্বর দিয়ে খুঁজুন (যেমন: আল-ফাতিহা, 36)...' : 'Search Surah by name or number (e.g., Al-Mulk, 36)...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(['all', 'Meccan', 'Medinan'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterType === type
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {type === 'all'
                ? language === 'bn' ? 'সকল সূরা (১১৪)' : 'All Surahs (114)'
                : type === 'Meccan'
                ? language === 'bn' ? 'মাক্কী' : 'Meccan'
                : language === 'bn' ? 'মাদানী' : 'Medinan'}
            </button>
          ))}
        </div>
      </div>

      {/* 114 Surahs Directory List */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[460px] overflow-y-auto">
          {filteredSurahs.map((surah) => {
            const isCurrentlyActive = activeSurah.number === surah.number;
            const isThisPlaying = isCurrentlyActive && isPlaying;

            return (
              <div
                key={surah.number}
                className={`flex items-center justify-between px-4 py-3 transition-colors ${
                  isCurrentlyActive
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Left: Number + Names */}
                <div
                  onClick={() => setReadingSurah(surah)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                      isCurrentlyActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {surah.number}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {language === 'bn' ? surah.banglaName : surah.englishName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                        {language === 'bn' ? surah.revelationTypeBn : surah.revelationType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {surah.englishMeaning} · {surah.numberOfAyahs} {language === 'bn' ? 'আয়াত' : 'Ayahs'}
                    </p>
                  </div>
                </div>

                {/* Right: Arabic Calligraphy + Play Button */}
                <div className="flex items-center gap-3">
                  <span className="text-base font-serif text-emerald-800 dark:text-emerald-300 hidden sm:inline">
                    {surah.arabicName}
                  </span>

                  <button
                    onClick={() => togglePlayPause(surah)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isThisPlaying
                        ? 'bg-emerald-600 text-white animate-pulse shadow-sm'
                        : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-200'
                    }`}
                    title={isThisPlaying ? 'Pause recitation' : 'Play audio recitation'}
                  >
                    {isThisPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recite Reader Modal */}
      {readingSurah && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-amber-300 text-xs">
                  {readingSurah.number}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">
                    {language === 'bn' ? readingSurah.banglaName : readingSurah.englishName} ({readingSurah.arabicName})
                  </h2>
                  <p className="text-[11px] text-emerald-200">
                    {readingSurah.englishMeaning} · {readingSurah.numberOfAyahs} Ayahs
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePlayPause(readingSurah)}
                  className="px-2.5 py-1 bg-amber-400 text-emerald-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm"
                >
                  {isPlaying && activeSurah.number === readingSurah.number ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlaying && activeSurah.number === readingSurah.number ? 'Pause' : 'Listen'}</span>
                </button>

                <button
                  onClick={() => setReadingSurah(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Verses Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Bismillah Header (except Surah 9 At-Tawbah) */}
              {readingSurah.number !== 9 && (
                <div className="text-center py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xl font-serif text-emerald-800 dark:text-emerald-400">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                  <p className="text-xs text-slate-500 mt-1 italic">
                    In the name of Allah, the Entirely Merciful, the Especially Merciful
                  </p>
                </div>
              )}

              {/* Verses */}
              {SURAH_VERSES_SAMPLE[readingSurah.number] ? (
                SURAH_VERSES_SAMPLE[readingSurah.number].map((ayah) => (
                  <div
                    key={ayah.numberInSurah}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold font-mono text-[10px]">
                        {ayah.numberInSurah}
                      </span>
                    </div>

                    <p className="text-right text-xl font-serif text-slate-900 dark:text-white leading-loose pt-1">
                      {ayah.arabic}
                    </p>

                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                      "{ayah.transliteration}"
                    </p>

                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      {language === 'bn' ? ayah.bangla : ayah.english}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 space-y-2">
                  <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Surah {readingSurah.englishName} ({readingSurah.arabicName})
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Audio recitation by Sheikh Mishary Rashid Alafasy is available above. Click <strong>Listen</strong> to hear the complete {readingSurah.numberOfAyahs} verses.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
