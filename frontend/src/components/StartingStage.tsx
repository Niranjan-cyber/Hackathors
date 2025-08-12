import React, { useState, useEffect } from 'react';
import { Play, Brain, Target, Clock, Hash, Lightbulb, Eye, CheckCircle, Zap } from 'lucide-react';

interface StartingStageProps {
  quizData: any;
  setQuizData: (data: any) => void;
  currentStage: string;
  setCurrentStage: (stage: any) => void;
}

const StartingStage: React.FC<StartingStageProps> = ({ quizData, setCurrentStage }) => {
  const [countdown, setCountdown] = useState(3);
  const [isReady, setIsReady] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [activeTip, setActiveTip] = useState(0);

  const handleStart = () => {
    setShowSummary(false);
    setCountdown(3);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCurrentStage('test');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Auto-rotate tips
  useEffect(() => {
    if (!showSummary) return;
    
    const tipInterval = setInterval(() => {
      setActiveTip(prev => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(tipInterval);
  }, [showSummary]);

  const difficultyColors: Record<string, string> = {
    easy: 'from-emerald-400 to-green-500',
    medium: 'from-amber-400 to-orange-500',
    hard: 'from-red-400 to-rose-500'
  };

  const tips = [
    {
      icon: Eye,
      title: "Read Carefully",
      description: "Take time to read each question thoroughly before answering",
      color: "from-blue-400 to-cyan-400"
    },
    {
      icon: CheckCircle,
      title: "Trust Your Instincts",
      description: "Your first impression is often correct, but review if unsure",
      color: "from-green-400 to-emerald-400"
    },
    {
      icon: Zap,
      title: "Stay Focused",
      description: "Eliminate distractions and maintain concentration throughout",
      color: "from-purple-400 to-pink-400"
    },
    {
      icon: Lightbulb,
      title: "Think Strategically",
      description: "Use process of elimination when you're uncertain",
      color: "from-amber-400 to-orange-400"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {showSummary ? (
        <>
          {/* Header */}
          <div className="text-center mb-16 fade-in-up">
            <div className="w-24 h-24 mx-auto glass-panel rounded-3xl flex items-center justify-center mb-6 floating-card">
              <Play className="w-12 h-12 text-green-400" />
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-3xl animate-pulse"></div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
              Ready to Start?
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Review your quiz settings before we begin. Take a deep breath and trust your preparation!
            </p>
          </div>

          {/* Quiz Summary */}
          <div className="glass-panel-strong p-8 rounded-3xl mb-12 fade-in-up stagger-1">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Quiz Summary</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Topics */}
              <div className="glass-panel p-6 rounded-2xl text-center">
                <Brain className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                <div className="text-2xl font-bold text-white mb-2">{quizData.topics.length}</div>
                <div className="text-sm text-slate-400">Topics</div>
              </div>

              {/* Difficulty */}
              <div className="glass-panel p-6 rounded-2xl text-center">
                <Target className="w-8 h-8 mx-auto mb-3 text-amber-400" />
                <div className={`text-2xl font-bold mb-2 bg-gradient-to-r ${difficultyColors[quizData.difficulty]} bg-clip-text text-transparent capitalize`}>
                  {quizData.difficulty}
                </div>
                <div className="text-sm text-slate-400">Difficulty</div>
              </div>

              {/* Question Count */}
              <div className="glass-panel p-6 rounded-2xl text-center">
                <Hash className="w-8 h-8 mx-auto mb-3 text-green-400" />
                <div className="text-2xl font-bold text-white mb-2">{quizData.count}</div>
                <div className="text-sm text-slate-400">Questions</div>
              </div>

              {/* Time Limit */}
              <div className="glass-panel p-6 rounded-2xl text-center">
                <Clock className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                <div className="text-2xl font-bold text-white mb-2">
                  {quizData.timeLimit === 0 ? '∞' : `${quizData.timeLimit}m`}
                </div>
                <div className="text-sm text-slate-400">Time Limit</div>
              </div>
            </div>

            {/* Selected Topics */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Selected Topics:</h3>
              <div className="flex flex-wrap gap-3">
                {quizData.topics.map((topic: string, index: number) => (
                  <span
                    key={index}
                    className="glass-panel px-4 py-2 rounded-xl text-sm text-slate-300 border border-purple-400/30"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Interactive Quick Tips */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-6 text-center">Quick Tips</h3>
              
              {/* Active Tip Display */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto glass-panel rounded-2xl flex items-center justify-center mb-4">
                  {React.createElement(tips[activeTip].icon, { 
                    className: `w-8 h-8 text-cyan-400` 
                  })}
                </div>
                <h4 className={`text-xl font-bold mb-2 bg-gradient-to-r ${tips[activeTip].color} bg-clip-text text-transparent`}>
                  {tips[activeTip].title}
                </h4>
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  {tips[activeTip].description}
                </p>
              </div>

              {/* Tip Navigation Dots */}
              <div className="flex justify-center space-x-2">
                {tips.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTip(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === activeTip 
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 scale-125' 
                        : 'bg-slate-600 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="glass-panel p-8 rounded-3xl mb-12 text-center fade-in-up stagger-2">
            <div className="text-4xl mb-4">🧠✨</div>
            <h3 className="text-2xl font-bold text-white mb-4">You've Got This!</h3>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
              Remember, this is about learning and growth. Take your time, trust your instincts, 
              and don't hesitate to make your best educated guess.
            </p>
          </div>

          {/* Start Button */}
          <div className="flex justify-center fade-in-up stagger-3">
            <button
              onClick={handleStart}
              className="premium-button flex items-center space-x-4 text-xl px-12 py-6 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Play className="w-8 h-8 relative z-10" />
              <span className="relative z-10">Start Quiz</span>
            </button>
          </div>
        </>
      ) : (
        /* Countdown */
        <div className="text-center fade-in-up">
          <div className="relative mb-16">
            <div className="w-64 h-64 mx-auto glass-panel-strong rounded-full flex items-center justify-center">
              <div className="text-9xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {countdown}
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/20 to-emerald-400/20 animate-ping"></div>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4">Get Ready!</h2>
          <p className="text-xl text-slate-300">
            {countdown === 3 && "Prepare yourself..."}
            {countdown === 2 && "Focus your mind..."}
            {countdown === 1 && "Here we go!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default StartingStage;