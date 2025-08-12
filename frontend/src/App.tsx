import React, { useState, useEffect } from 'react';
import { Upload, Brain, Clock, Target, FileText, Trophy } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import UploadStage from './components/UploadStage';
import ScanningStage from './components/ScanningStage';
import TopicsStage from './components/TopicsStage';
import DifficultyStage from './components/DifficultyStage';
import CountStage from './components/CountStage';
import TimerStage from './components/TimerStage';
import StartingStage from './components/StartingStage';
import TestStage from './components/TestStage';
import ResultsStage from './components/ResultsStage';
import Background3D from './components/Background3D';
import CursorOrb from './components/CursorOrb';
import LanguageStage from './components/LanguageStage';
import './index.css';

type Stage = 'upload' | 'scanning' | 'topics' | 'difficulty' | 'count' | 'timer' | 'language' | 'starting' | 'test' | 'results';

interface QuizData {
  file?: File;
  topics: string[];
  extractedTopics?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  timeLimit: number;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    topic: string;
  }>;
  answers: Record<string, number>;
  score?: number;
  timeSpent?: number;
}

function App() {
  const [currentStage, setCurrentStage] = useState<Stage>('upload');
  const [quizData, setQuizData] = useState<QuizData>({
    topics: [],
    difficulty: 'medium',
    count: 10,
    timeLimit: 30,
    questions: [],
    answers: {}
  });

  // Immediate, smooth scroll-to-top when stage changes
  useEffect(() => {
    let rafId = 0;
    const startY = window.scrollY || document.documentElement.scrollTop || 0;
    const duration = 600; // Faster duration
    const startTime = performance.now();
    
    // Smoother easing function
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutQuart(t);
      const nextY = Math.max(0, Math.round(startY * (1 - eased)));
      window.scrollTo(0, nextY);
      if (t < 1) rafId = requestAnimationFrame(step);
    };

    // Start immediately
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [currentStage]);

  const stageComponents = {
    upload: UploadStage,
    scanning: ScanningStage,
    topics: TopicsStage,
    difficulty: DifficultyStage,
    count: CountStage,
    timer: TimerStage,
    language: LanguageStage,
    starting: StartingStage,
    test: TestStage,
    results: ResultsStage
  };

  const CurrentStageComponent = stageComponents[currentStage];

  const progressStages = ['upload', 'scanning', 'topics', 'difficulty', 'count', 'timer', 'language', 'starting', 'test', 'results'];
  const currentProgress = progressStages.indexOf(currentStage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden">
      <Background3D />
      <CursorOrb />
      
      {/* Premium Navigation Header */}
      <nav className="relative z-50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Brain className="w-10 h-10 text-cyan-400" />
              <div className="absolute inset-0 animate-pulse bg-cyan-400/20 rounded-full blur-md"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Neocortex
            </span>
          </div>

          {/* Progress Indicators */}
          <div className="hidden md:flex items-center space-x-2">
            {progressStages.map((stage, index) => (
              <div
                key={stage}
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  index <= currentProgress
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg shadow-cyan-400/50'
                    : 'bg-slate-700/50 backdrop-blur-sm'
                }`}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-6 pb-12">
        <CurrentStageComponent
          quizData={quizData}
          setQuizData={setQuizData}
          currentStage={currentStage}
          setCurrentStage={setCurrentStage}
        />
      </main>

      <Toaster />
    </div>
  );
}

export default App;