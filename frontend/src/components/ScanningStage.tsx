import React, { useEffect, useState } from 'react';
import { Brain, Cpu, FileText, CheckCircle } from 'lucide-react';

interface ScanningStageProps {
  quizData: any;
  setQuizData: (data: any) => void;
  currentStage: string;
  setCurrentStage: (stage: any) => void;
}

const ScanningStage: React.FC<ScanningStageProps> = ({ quizData, setQuizData, setCurrentStage }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const scanningSteps = [
    { id: 'parsing', label: 'Parsing Document', icon: FileText },
    { id: 'analyzing', label: 'AI Content Analysis', icon: Brain },
    { id: 'extracting', label: 'Extracting Key Concepts', icon: Cpu },
    { id: 'generating', label: 'Generating Question Bank', icon: CheckCircle },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        
        // Update current step based on progress
        if (newProgress >= 25 && currentStep < 1) setCurrentStep(1);
        if (newProgress >= 50 && currentStep < 2) setCurrentStep(2);
        if (newProgress >= 75 && currentStep < 3) setCurrentStep(3);
        
        if (newProgress >= 100) {
          clearInterval(interval);
          // Mock extracted topics
          const mockTopics = ['Data Structures', 'Algorithms', 'Database Design', 'Software Engineering', 'Computer Networks'];
          setQuizData({ ...quizData, topics: mockTopics });
          setTimeout(() => setCurrentStage('topics'), 1500);
        }
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentStep, quizData, setQuizData, setCurrentStage]);

  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Header */}
      <div className="mb-16 fade-in-up">
        <div className="relative inline-block mb-8">
          <div className="w-32 h-32 glass-panel rounded-full flex items-center justify-center floating-card">
            <Brain className="w-16 h-16 text-cyan-400 rotate-slow" />
            <div className="absolute inset-0 bg-gradient-conic from-cyan-400/30 via-purple-400/30 to-cyan-400/30 rounded-full animate-pulse"></div>
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
          AI Processing
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Our neural network is analyzing your content and extracting the most important concepts
        </p>
      </div>

      {/* Progress Circle */}
      <div className="relative w-64 h-64 mx-auto mb-12 fade-in-up stagger-1">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(71, 85, 105, 0.3)"
            strokeWidth="4"
          />
          {/* Progress Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${progress * 2.827} 282.7`}
            className="transition-all duration-300 ease-out"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="50%" stopColor="#ff0080" />
              <stop offset="100%" stopColor="#00ffaa" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Progress Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white mb-2">{Math.round(progress)}%</span>
          <span className="text-sm text-slate-400">Processing</span>
        </div>
      </div>

      {/* Processing Steps */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 fade-in-up stagger-2">
        {scanningSteps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const IconComponent = step.icon;
          
          return (
            <div
              key={step.id}
              className={`
                glass-panel p-6 rounded-2xl transition-all duration-500
                ${isActive ? 'scale-105 neon-glow' : ''}
                ${isCompleted ? 'bg-emerald-500/10' : ''}
              `}
            >
              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto transition-all duration-500
                ${isActive 
                  ? 'bg-gradient-to-r from-cyan-400/30 to-purple-400/30 scale-110' 
                  : isCompleted
                  ? 'bg-emerald-500/20'
                  : 'bg-slate-700/30'
                }
              `}>
                <IconComponent className={`
                  w-8 h-8 transition-colors duration-300
                  ${isActive ? 'text-cyan-300' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}
                `} />
              </div>
              
              <h3 className={`
                text-lg font-semibold mb-2 transition-colors duration-300
                ${isActive ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-slate-400'}
              `}>
                {step.label}
              </h3>
              
              <div className={`
                w-full h-1 rounded-full transition-all duration-500
                ${isActive 
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-400' 
                  : isCompleted 
                  ? 'bg-emerald-400'
                  : 'bg-slate-600'
                }
              `} />
            </div>
          );
        })}
      </div>

      {/* AI Insights Preview */}
      <div className="glass-panel-strong p-8 rounded-3xl max-w-2xl mx-auto fade-in-up stagger-3">
        <h3 className="text-2xl font-bold text-white mb-4">AI Insights</h3>
        <div className="space-y-3 text-left">
          {progress > 30 && (
            <div className="flex items-center space-x-3 text-slate-300 fade-in-up">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Identified {Math.floor(progress / 20)} key topics</span>
            </div>
          )}
          {progress > 60 && (
            <div className="flex items-center space-x-3 text-slate-300 fade-in-up stagger-1">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Generated {Math.floor(progress / 2)} potential questions</span>
            </div>
          )}
          {progress > 90 && (
            <div className="flex items-center space-x-3 text-slate-300 fade-in-up stagger-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Optimized for multiple difficulty levels</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanningStage;