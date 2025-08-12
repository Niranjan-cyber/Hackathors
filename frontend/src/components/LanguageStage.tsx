import React, { useEffect, useState } from 'react';
import { Globe2, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import InteractiveOrb from './InteractiveOrb';

interface LanguageStageProps {
  quizData: any;
  setQuizData: (data: any) => void;
  currentStage: string;
  setCurrentStage: (stage: any) => void;
}

const LANGUAGES: Array<{ code: string; name: string; native?: string; gradient: string; flag?: string }> = [
  { code: 'en', name: 'English', native: 'English', gradient: 'from-cyan-400 to-blue-500', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', gradient: 'from-amber-400 to-orange-500', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', gradient: 'from-teal-400 to-emerald-500', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', native: 'Español', gradient: 'from-pink-400 to-rose-500', flag: '🇪🇸' },
  { code: 'fr', name: 'French', native: 'Français', gradient: 'from-indigo-400 to-purple-500', flag: '🇫🇷' },
  { code: 'de', name: 'German', native: 'Deutsch', gradient: 'from-emerald-400 to-green-500', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', native: '中文', gradient: 'from-red-400 to-rose-500', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', native: '日本語', gradient: 'from-fuchsia-400 to-purple-500', flag: '🇯🇵' }
];

const LanguageStage: React.FC<LanguageStageProps> = ({ quizData, setQuizData, setCurrentStage }) => {
  console.log('LanguageStage - quizData received:', quizData);
  console.log('LanguageStage - quizData.language:', quizData.language);
  const [selected, setSelected] = useState<string>(quizData.language || '');

  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && selected) handleContinue();
    };
    window.addEventListener('keydown', handleEnter);
    return () => window.removeEventListener('keydown', handleEnter);
  }, [selected]);

  const handleContinue = () => {
    console.log('LanguageStage - selected language:', selected);
    console.log('LanguageStage - setting quizData.language to:', selected);
    setQuizData({ ...quizData, language: selected });
    setCurrentStage('starting');
  };

  const handleBack = () => {
    setCurrentStage('timer');
  };

  const handleSelect = (code: string) => {
    console.log('LanguageStage - handleSelect called with code:', code);
    setSelected(prev => {
      const newValue = prev === code ? '' : code;
      console.log('LanguageStage - setting selected to:', newValue);
      return newValue;
    });
  };

  return (
    <div className="relative min-h-screen">
      {/* Full-screen 3D orb overlay (behind content) */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center" style={{ zIndex: 1 }}>
        <div className="opacity-40 scale-110 w-full max-w-[1200px]">
          <InteractiveOrb />
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10 fade-in-up">
          <div className="w-24 h-24 mx-auto glass-panel rounded-full flex items-center justify-center mb-4 floating-card">
            <Globe2 className="w-12 h-12 text-cyan-400" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-3 leading-[1.2] inline-block pb-2 bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
            Choose Language
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">Select the language to translate your questions. You can change this later in settings.</p>
        </div>

        {/* Language grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 fade-in-up stagger-2">
          {LANGUAGES.map((lang, index) => {
            const isActive = selected === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`relative glass-panel p-6 rounded-2xl text-left group transition-all duration-300 hover:scale-105 ${
                  isActive ? 'neon-glow bg-white/5' : ''
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${lang.gradient}`}>
                    <span className="text-xl">{lang.flag || '🌐'}</span>
                  </div>
                  {isActive && (
                    <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/15 text-emerald-300 font-semibold flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" /> Selected
                    </span>
                  )}
                </div>
                <div className="text-white font-semibold text-lg">{lang.name}</div>
                <div className="text-slate-400">{lang.native}</div>
                <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: '0 0 40px rgba(59,130,246,0.15)' }} />
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-16 fade-in-up stagger-3">
          <button onClick={handleBack} className="glass-panel px-8 py-4 rounded-2xl flex items-center space-x-3 text-slate-300 hover:text-white transition-all duration-300 hover:scale-105">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <button 
            onClick={handleContinue} 
            disabled={!selected} 
            className={`premium-button px-8 py-4 flex items-center space-x-3 ${!selected ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span>Continue</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageStage;