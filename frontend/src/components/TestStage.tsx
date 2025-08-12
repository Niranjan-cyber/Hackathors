import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Flag, CheckCircle } from 'lucide-react';

interface TestStageProps {
  quizData: any;
  setQuizData: (data: any) => void;
  currentStage: string;
  setCurrentStage: (stage: any) => void;
}

const TestStage: React.FC<TestStageProps> = ({ quizData, setQuizData, setCurrentStage }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(quizData.timeLimit * 60);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());

  // Mock questions based on quiz data
  const questions = Array.from({ length: quizData.count }, (_, i) => ({
    id: `q${i + 1}`,
    question: `Question ${i + 1}: Which of the following best describes ${quizData.topics[i % quizData.topics.length]}?`,
    options: [
      `Option A for ${quizData.topics[i % quizData.topics.length]}`,
      `Option B for ${quizData.topics[i % quizData.topics.length]}`,
      `Option C for ${quizData.topics[i % quizData.topics.length]}`,
      `Option D for ${quizData.topics[i % quizData.topics.length]}`
    ],
    correctAnswer: Math.floor(Math.random() * 4),
    topic: quizData.topics[i % quizData.topics.length]
  }));

  useEffect(() => {
    if (quizData.timeLimit > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizData.timeLimit]);

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleFinish = () => {
    const score = questions.reduce((acc, q) => {
      return acc + (answers[q.id] === q.correctAnswer ? 1 : 0);
    }, 0);

    setQuizData({
      ...quizData,
      answers,
      score,
      timeSpent: quizData.timeLimit * 60 - timeRemaining,
      questions
    });
    setCurrentStage('results');
  };

  const toggleFlag = (questionIndex: number) => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(questionIndex)) {
      newFlagged.delete(questionIndex);
    } else {
      newFlagged.add(questionIndex);
    }
    setFlaggedQuestions(newFlagged);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (quizData.timeLimit === 0) return 'text-slate-400';
    const percentage = timeRemaining / (quizData.timeLimit * 60);
    if (percentage > 0.5) return 'text-green-400';
    if (percentage > 0.25) return 'text-amber-400';
    return 'text-red-400';
  };

  const currentQ = questions[currentQuestion];
  const progress = (currentQuestion + 1) / questions.length * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="glass-panel-strong p-6 rounded-2xl mb-8 fade-in-up">
        <div className="flex items-center justify-between">
          {/* Progress */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-white">
              {currentQuestion + 1}<span className="text-slate-400">/{questions.length}</span>
            </div>
            <div className="w-48 bg-slate-700/50 rounded-full h-2">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Timer */}
          {quizData.timeLimit > 0 && (
            <div className="flex items-center space-x-3">
              <Clock className={`w-5 h-5 ${getTimeColor()}`} />
              <span className={`text-xl font-bold ${getTimeColor()}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-slate-300">{answeredCount} answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <Flag className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300">{flaggedQuestions.size} flagged</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Question Panel */}
        <div className="lg:col-span-3">
          <div className="glass-panel-strong p-8 rounded-3xl mb-8 fade-in-up stagger-1">
            {/* Topic Tag */}
            <div className="inline-block glass-panel px-4 py-2 rounded-xl mb-6">
              <span className="text-purple-400 font-medium">{currentQ.topic}</span>
            </div>

            {/* Question */}
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-relaxed">
              {currentQ.question}
            </h2>

            {/* Options */}
            <div className="space-y-4">
              {currentQ.options.map((option, index) => {
                const isSelected = answers[currentQ.id] === index;
                const optionLabels = ['A', 'B', 'C', 'D'];
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(currentQ.id, index)}
                    className={`
                      w-full text-left p-6 rounded-2xl transition-all duration-300 group
                      ${isSelected 
                        ? 'glass-panel-strong neon-glow scale-[1.02]' 
                        : 'glass-panel hover:scale-[1.01] hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all duration-300
                        ${isSelected 
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white' 
                          : 'bg-slate-700/50 text-slate-300 group-hover:bg-slate-600/50'
                        }
                      `}>
                        {optionLabels[index]}
                      </div>
                      <span className={`
                        text-lg transition-colors duration-300
                        ${isSelected ? 'text-white font-medium' : 'text-slate-300 group-hover:text-white'}
                      `}>
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between fade-in-up stagger-2">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="glass-panel px-6 py-3 rounded-xl flex items-center space-x-2 text-slate-300 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => toggleFlag(currentQuestion)}
              className={`
                glass-panel px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 hover:scale-105
                ${flaggedQuestions.has(currentQuestion) 
                  ? 'text-amber-400' 
                  : 'text-slate-400 hover:text-amber-400'
                }
              `}
            >
              <Flag className="w-5 h-5" />
              <span>Flag</span>
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleFinish}
                className="premium-button px-8 py-3 flex items-center space-x-2"
              >
                <span>Finish Quiz</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                className="glass-panel px-6 py-3 rounded-xl flex items-center space-x-2 text-slate-300 hover:text-white transition-all duration-300 hover:scale-105"
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Question Overview Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-panel-strong p-6 rounded-2xl sticky top-8 fade-in-up stagger-3">
            <h3 className="text-xl font-bold text-white mb-6">Question Overview</h3>
            
            <div className="grid grid-cols-4 gap-2 mb-6">
              {questions.map((_, index) => {
                const isAnswered = answers[`q${index + 1}`] !== undefined;
                const isFlagged = flaggedQuestions.has(index);
                const isCurrent = index === currentQuestion;
                
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`
                      w-11 h-11 md:w-12 md:h-12 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 relative
                      ${isCurrent 
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white scale-110' 
                        : isAnswered
                        ? 'bg-green-500/20 text-green-400 hover:scale-105'
                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:scale-105'
                      }
                    `}
                  >
                    {index + 1}
                    {isFlagged && (
                      <Flag className="w-3 h-3 text-amber-400 absolute -top-1 -right-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded"></div>
                <span className="text-slate-300">Current</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500/20 rounded"></div>
                <span className="text-slate-300">Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-slate-700/50 rounded"></div>
                <span className="text-slate-300">Unanswered</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 pt-6 border-t border-slate-600">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Progress:</span>
                  <span className="text-white font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Answered:</span>
                  <span className="text-green-400 font-medium">{answeredCount}/{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Flagged:</span>
                  <span className="text-amber-400 font-medium">{flaggedQuestions.size}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestStage;