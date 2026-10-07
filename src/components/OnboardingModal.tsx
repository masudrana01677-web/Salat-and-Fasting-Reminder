import React, { useState } from 'react';
import { Clock, ShieldCheck, Moon, Compass, Bell, ChevronRight, X } from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/translations';

interface OnboardingModalProps {
  language: Language;
  onFinish: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ language, onFinish }) => {
  const t = TRANSLATIONS[language];
  const [step, setStep] = useState<number>(0);

  const slides = [
    {
      title: t.onboardingP1Title,
      desc: t.onboardingP1Desc,
      icon: Clock,
      gradient: 'from-emerald-700 to-teal-800',
    },
    {
      title: t.onboardingP2Title,
      desc: t.onboardingP2Desc,
      icon: ShieldCheck,
      gradient: 'from-teal-700 to-cyan-800',
    },
    {
      title: t.onboardingP3Title,
      desc: t.onboardingP3Desc,
      icon: Moon,
      gradient: 'from-amber-600 to-orange-700',
    },
    {
      title: t.onboardingP4Title,
      desc: t.onboardingP4Desc,
      icon: Compass,
      gradient: 'from-emerald-800 to-teal-900',
    },
    {
      title: t.onboardingP5Title,
      desc: t.onboardingP5Desc,
      icon: Bell,
      gradient: 'from-teal-800 to-emerald-900',
    },
  ];

  const currentSlide = slides[step];
  const Icon = currentSlide.icon;

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Visual Hero Header */}
        <div className={`p-8 bg-gradient-to-br ${currentSlide.gradient} text-white flex flex-col items-center justify-center text-center relative`}>
          <button
            onClick={onFinish}
            className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            {t.onboardingSkip}
          </button>

          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-lg text-white">
            <Icon className="w-8 h-8" />
          </div>

          <h2 className="text-lg font-bold text-white px-2">
            {currentSlide.title}
          </h2>
        </div>

        {/* Slide Body */}
        <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
          <p className="text-xs text-slate-600 dark:text-slate-300 text-center leading-relaxed">
            {currentSlide.desc}
          </p>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === step
                    ? 'w-6 bg-emerald-600 dark:bg-emerald-400'
                    : 'w-1.5 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={handleNext}
            className="w-full min-h-[46px] py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/20 transition-all active:scale-[0.98]"
          >
            <span>{step === slides.length - 1 ? t.onboardingGetStarted : t.onboardingNext}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
