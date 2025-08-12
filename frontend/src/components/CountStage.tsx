import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Hash, Plus, Minus } from 'lucide-react';

interface CountStageProps {
  quizData: any;
  setQuizData: (data: any) => void;
  currentStage: string;
  setCurrentStage: (stage: any) => void;
}

const CountStage: React.FC<CountStageProps> = ({ quizData, setQuizData, setCurrentStage }) => {
  const [questionCount, setQuestionCount] = useState(quizData.count || 10);
  const [customCountInput, setCustomCountInput] = useState<string>(String(quizData.count || 10));

  const presetCounts = [5, 10, 15, 20, 25, 30];

  const handleCountChange = (count: number) => {
    const newCount = Math.min(50, Math.max(5, count));
    setQuestionCount(newCount);
    setCustomCountInput(String(newCount));
  };

  const handleNext = () => {
    setQuizData({ 
      ...quizData, 
      count: questionCount,
      retakeMode: quizData.retakeMode // Preserve retakeMode
    });
    setCurrentStage('timer');
  };

  const handleBack = () => {
    setCurrentStage('difficulty');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16 fade-in-up">
        <div className="w-24 h-24 mx-auto glass-panel rounded-3xl flex items-center justify-center mb-6 floating-card">
          <Hash className="w-12 h-12 text-green-400" />
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-3xl animate-pulse"></div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
          Question Count
        </h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          How many questions would you like in your quiz? We recommend 10-20 for optimal learning.
        </p>
      </div>

      {/* Main Counter */}
      <div className="glass-panel-strong p-12 rounded-3xl mb-12 text-center fade-in-up stagger-1">
        <div className="flex items-center justify-center space-x-8 mb-8">
          <button
            onClick={() => handleCountChange(questionCount - 1)}
            disabled={questionCount <= 5}
            className="w-16 h-16 glass-panel rounded-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Minus className="w-8 h-8 text-red-400" />
          </button>

          <div className="relative">
            <div className="text-8xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {questionCount}
            </div>
            <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-green-400/30 to-emerald-400/30 -z-10"></div>
          </div>

          <button
            onClick={() => handleCountChange(questionCount + 1)}
            disabled={questionCount >= 50}
            className="w-16 h-16 glass-panel rounded-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Plus className="w-8 h-8 text-green-400" />
          </button>
        </div>

        <p className="text-2xl text-slate-300 mb-8">Questions</p>

        {/* Estimated Time */}
        <div className="glass-panel p-6 rounded-2xl max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-cyan-400 mb-2">
                {Math.ceil(questionCount * 1.5)}-{Math.ceil(questionCount * 2.5)}
              </div>
              <div className="text-sm text-slate-400">Minutes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {questionCount * 2}
              </div>
              <div className="text-sm text-slate-400">Max Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Options */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-12 fade-in-up stagger-2">
        {presetCounts.map((count, index) => (
          <button
            key={count}
            onClick={() => handleCountChange(count)}
            className={`
              glass-panel p-4 rounded-2xl transition-all duration-300 hover:scale-105
              ${questionCount === count ? 'neon-glow bg-green-500/10' : 'hover:bg-white/5'}
            `}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`
              text-2xl font-bold mb-2 transition-colors duration-300
              ${questionCount === count ? 'text-green-400' : 'text-slate-300'}
            `}>
              {count}
            </div>
            <div className="text-xs text-slate-400">
              {count <= 10 ? 'Quick' : count <= 20 ? 'Standard' : 'Extended'}
            </div>
          </button>
        ))}
      </div>

      {/* Recommendations */}
      <div className="grid md:grid-cols-3 gap-6 mb-12 fade-in-up stagger-3">
        {[
          { range: '5-10', title: 'Quick Review', desc: 'Perfect for daily practice sessions', icon: '⚡' },
          { range: '10-20', title: 'Standard Quiz', desc: 'Balanced learning experience', icon: '🎯' },
          { range: '20-30', title: 'Deep Dive', desc: 'Comprehensive topic coverage', icon: '🧠' }
        ].map((rec, index) => (
          <div key={index} className="glass-panel p-6 rounded-2xl text-center group hover:scale-105 transition-all duration-300">
            <div className="text-3xl mb-3">{rec.icon}</div>
            <h3 className="text-xl font-semibold text-white mb-2">{rec.title}</h3>
            <p className="text-green-400 font-medium mb-3">{rec.range} questions</p>
            <p className="text-slate-400 text-sm">{rec.desc}</p>
          </div>
        ))}
      </div>

      {/* Input Field */}
      <div className="glass-panel p-6 rounded-2xl max-w-md mx-auto mb-12 fade-in-up stagger-4">
        <label className="block text-slate-300 mb-3 font-medium">Custom Amount</label>
        <input
          type="number"
          min="5"
          max="50"
          value={customCountInput}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '' || /^\d+$/.test(v)) {
              setCustomCountInput(v);
            }
          }}
          onBlur={() => {
            const parsed = parseInt(customCountInput);
            if (isNaN(parsed)) {
              handleCountChange(5);
            } else {
              handleCountChange(parsed);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const parsed = parseInt(customCountInput);
              if (isNaN(parsed)) {
                handleCountChange(5);
              } else {
                handleCountChange(parsed);
              }
              (e.currentTarget as HTMLInputElement).blur();
            }
          }}
          className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-green-400 focus:outline-none transition-all duration-300"
          placeholder="Enter number of questions"
        />
        <p className="text-xs text-slate-500 mt-2">Range: 5-50 questions</p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center fade-in-up stagger-5">
        <button
          onClick={handleBack}
          className="glass-panel px-8 py-4 rounded-2xl flex items-center space-x-3 text-slate-300 hover:text-white transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        <button
          onClick={() => {
            // Ensure we commit any un-blurred custom input value
            const parsed = parseInt(customCountInput);
            if (!isNaN(parsed)) {
              handleCountChange(parsed);
            }
            handleNext();
          }}
          className="premium-button flex items-center space-x-3 text-lg px-10 py-4"
        >
          <span>Continue</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default CountStage;