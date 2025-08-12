import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Target, Zap, Mountain } from 'lucide-react';

const InteractiveInfo: React.FC<{ selected: 'easy' | 'medium' | 'hard'; description: string }> = ({ selected, description }) => {
  const gradient = selected === 'easy'
    ? 'from-emerald-400 via-cyan-400 to-blue-400'
    : selected === 'medium'
    ? 'from-amber-400 via-pink-400 to-purple-400'
    : 'from-rose-400 via-fuchsia-400 to-indigo-400';

  return (
    <div className="glass-panel-strong p-8 rounded-3xl max-w-3xl mx-auto mb-12 text-center fade-in-up stagger-3">
      <h3 className="text-2xl font-bold text-white mb-4">
        Selected: {selected.charAt(0).toUpperCase() + selected.slice(1)}
      </h3>
      <p className="text-slate-300 mb-8">{description}</p>

      {/* Interactive bar that animates based on difficulty */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Focus</span>
            <span>Challenge</span>
          </div>
          <div className="h-3 rounded-full bg-slate-800/70 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${gradient} transition-all duration-700`}
              style={{ width: selected === 'easy' ? '40%' : selected === 'medium' ? '65%' : '90%' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[ 'Concepts', 'Application', 'Edge Cases' ].map((label, idx) => (
            <div key={label} className="glass-panel rounded-2xl p-4">
              <div className={`text-sm text-slate-400 mb-2`}>{label}</div>
              <div className="h-2 rounded-full bg-slate-800/70 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${gradient} transition-all duration-700`}
                  style={{ width: (
                    selected === 'easy' ? [80, 40, 20][idx] : selected === 'medium' ? [60, 65, 45][idx] : [40, 80, 75][idx]
                  ) + '%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface DifficultyStageProps {
  quizData: any;
  setQuizData: (data: any) => void;
  currentStage: string;
  setCurrentStage: (stage: any) => void;
}

const DifficultyStage: React.FC<DifficultyStageProps> = ({ quizData, setQuizData, setCurrentStage }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>(quizData.difficulty || 'medium');

  const difficulties = [
    {
      id: 'easy' as const,
      title: 'Easy',
      subtitle: 'Perfect for beginners',
      description: 'Basic concepts and fundamental understanding',
      icon: Target,
      color: 'from-emerald-400 to-green-500',
      glowColor: 'shadow-emerald-400/30',
      questions: '15-20 questions',
      timeEstimate: '10-15 minutes'
    },
    {
      id: 'medium' as const,
      title: 'Medium',
      subtitle: 'Balanced challenge',
      description: 'Intermediate concepts with practical applications',
      icon: Zap,
      color: 'from-amber-400 to-orange-500',
      glowColor: 'shadow-amber-400/30',
      questions: '20-25 questions',
      timeEstimate: '15-25 minutes'
    },
    {
      id: 'hard' as const,
      title: 'Hard',
      subtitle: 'Expert level',
      description: 'Advanced concepts requiring deep understanding',
      icon: Mountain,
      color: 'from-red-400 to-rose-500',
      glowColor: 'shadow-red-400/30',
      questions: '25-30 questions',
      timeEstimate: '20-35 minutes'
    }
  ];

  const handleNext = () => {
    setQuizData({ ...quizData, difficulty: selectedDifficulty });
    setCurrentStage('count');
  };

  const handleBack = () => {
    setCurrentStage('topics');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16 fade-in-up">
        <div className="w-24 h-24 mx-auto glass-panel rounded-3xl flex items-center justify-center mb-6 floating-card">
          <Target className="w-12 h-12 text-purple-400" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-3xl animate-pulse"></div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
          Choose Difficulty
        </h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          Select the difficulty level that matches your current knowledge and learning goals.
        </p>
      </div>

      {/* Difficulty Options */}
      <div className="grid md:grid-cols-3 gap-8 mb-12 fade-in-up stagger-1">
        {difficulties.map((difficulty, index) => {
          const IconComponent = difficulty.icon;
          const isSelected = selectedDifficulty === difficulty.id;

          return (
            <div
              key={difficulty.id}
              onClick={() => setSelectedDifficulty(difficulty.id)}
              className={`
                relative glass-panel-strong rounded-3xl cursor-pointer transition-all duration-500 group
                ${isSelected ? 'scale-105' : 'hover:scale-102'}
              `}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Background Gradient */}
              <div className={`
                absolute inset-0 bg-gradient-to-br ${difficulty.color} opacity-10 transition-opacity duration-500
                ${isSelected ? 'opacity-20' : 'group-hover:opacity-15'}
              `} />

              {/* Selection Ring */}
              {isSelected && (
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 p-[2px]">
                  <div className="bg-slate-950/90 rounded-3xl h-full w-full" />
                </div>
              )}

              <div className="relative p-8 text-center">
                {/* Icon */}
                <div className={`
                  w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 transition-all duration-500
                  ${isSelected 
                    ? `bg-gradient-to-r ${difficulty.color} shadow-lg ${difficulty.glowColor}` 
                    : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                  }
                `}>
                  <IconComponent className={`
                    w-10 h-10 transition-all duration-300
                    ${isSelected ? 'text-white scale-110' : 'text-slate-400 group-hover:text-slate-300'}
                  `} />
                </div>

                {/* Title */}
                <h3 className={`
                  text-3xl font-bold mb-2 transition-colors duration-300
                  ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}
                `}>
                  {difficulty.title}
                </h3>

                {/* Subtitle */}
                <p className={`
                  text-lg font-medium mb-4 transition-colors duration-300
                  ${isSelected 
                    ? `bg-gradient-to-r ${difficulty.color} bg-clip-text text-transparent` 
                    : 'text-slate-400'
                  }
                `}>
                  {difficulty.subtitle}
                </p>

                {/* Description */}
                <p className="text-slate-500 mb-6 leading-relaxed">
                  {difficulty.description}
                </p>

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Questions:</span>
                    <span className="text-slate-300 font-medium">{difficulty.questions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Est. Time:</span>
                    <span className="text-slate-300 font-medium">{difficulty.timeEstimate}</span>
                  </div>
                </div>

                {/* Selection Indicator */}
                <div className={`
                  absolute top-6 right-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                  ${isSelected 
                    ? `bg-gradient-to-r ${difficulty.color} border-transparent` 
                    : 'border-slate-500 group-hover:border-slate-400'
                  }
                `}>
                  {isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Info (replaces: number of questions & average score) */}
      <InteractiveInfo selected={selectedDifficulty} description={difficulties.find(d => d.id === selectedDifficulty)?.description || ''} />

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center fade-in-up stagger-4">
        <button
          onClick={handleBack}
          className="glass-panel px-8 py-4 rounded-2xl flex items-center space-x-3 text-slate-300 hover:text-white transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        <button
          onClick={handleNext}
          className="premium-button flex items-center space-x-3 text-lg px-10 py-4"
        >
          <span>Continue</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default DifficultyStage;