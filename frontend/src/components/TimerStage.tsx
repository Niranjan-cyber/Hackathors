import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Clock, Timer, Infinity } from 'lucide-react';
import axios from 'axios';

interface TimerStageProps {
  quizData: any;
  setQuizData: (data: any) => void;
  currentStage: string;
  setCurrentStage: (stage: any) => void;
}

const TimerStage: React.FC<TimerStageProps> = ({ quizData, setQuizData, setCurrentStage }) => {
  const [timeLimit, setTimeLimit] = useState(quizData.timeLimit && quizData.timeLimit > 0 ? quizData.timeLimit : 30);
  const [customTimeInput, setCustomTimeInput] = useState<string>(String(quizData.timeLimit && quizData.timeLimit > 0 ? quizData.timeLimit : 30));
  const [mode, setMode] = useState<'timed' | 'custom' | 'unlimited'>(quizData.timeLimit === 0 ? 'unlimited' : 'timed');
  const hasRequestedRef = useRef(false);

  const timePresets = [
    { minutes: 10, label: 'Quick', desc: 'Speed challenge' },
    { minutes: 20, label: 'Standard', desc: 'Balanced pace' },
    { minutes: 30, label: 'Relaxed', desc: 'Thoughtful answers' },
    { minutes: 45, label: 'Extended', desc: 'No pressure' }
  ];

  // Trigger question generation once when TimerStage loads
  useEffect(() => {
    const generateQuestions = async () => {
      try {
        const formData = new FormData();
        formData.append('topics', JSON.stringify(quizData.topics));
        formData.append('difficulty', quizData.difficulty || 'medium');
        formData.append('num_questions', (quizData.count ?? 10).toString());

        const response = await axios.post('http://localhost:8000/generate-questions/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data && Array.isArray(response.data)) {
          setQuizData((prev: any) => ({
            ...prev,
            questions: response.data,
          }));
        }
      } catch (err) {
        // Silently ignore; StartingStage will handle waiting if needed
        // console.error('Error generating questions:', err);
      }
    };

    if (!hasRequestedRef.current) {
      hasRequestedRef.current = true;
      // Only call if we don't already have questions and required inputs exist
      const hasInputs = Array.isArray(quizData.topics) && quizData.topics.length > 0 && !!quizData.difficulty && !!quizData.count;
      if (!quizData.questions || quizData.questions.length === 0) {
        if (hasInputs) generateQuestions();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = () => {
    setQuizData((prev: any) => ({ ...prev, timeLimit: mode === 'unlimited' ? 0 : timeLimit }));
    setCurrentStage('language');
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16 fade-in-up">
        <div className="w-24 h-24 mx-auto glass-panel rounded-3xl flex items-center justify-center mb-6 floating-card">
          <Clock className="w-12 h-12 text-blue-400" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-3xl animate-pulse"></div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
          Set Timer
        </h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          Choose your preferred time limit. You can always finish early or take your time with unlimited mode.
        </p>
      </div>

      {/* Timer Mode Toggle */}
      <div className="flex justify-center mb-12 fade-in-up stagger-1">
        <div className="glass-panel p-2 rounded-2xl inline-flex">
          <button
            onClick={() => setMode('timed')}
            className={`
              px-6 py-3 rounded-xl font-medium transition-all duration-300
              ${mode === 'timed' 
                ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-lg' 
                : 'text-slate-300 hover:text-white'
              }
            `}
          >
            Timed Mode
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`
              px-6 py-3 rounded-xl font-medium transition-all duration-300 mx-1
              ${mode === 'custom' 
                ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-lg' 
                : 'text-slate-300 hover:text-white'
              }
            `}
          >
            Custom
          </button>
          <button
            onClick={() => setMode('unlimited')}
            className={`
              px-6 py-3 rounded-xl font-medium transition-all duration-300
              ${mode === 'unlimited' 
                ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-lg' 
                : 'text-slate-300 hover:text-white'
              }
            `}
          >
            Unlimited
          </button>
        </div>
      </div>

      {mode === 'timed' ? (
        <>
          {/* Time Display */}
          <div className="glass-panel-strong p-12 rounded-3xl mb-12 text-center fade-in-up stagger-2">
            <div className="relative mb-8">
              <div className="text-8xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {timeLimit}
              </div>
              <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-blue-400/30 to-cyan-400/30 -z-10"></div>
            </div>
            <p className="text-2xl text-slate-300 mb-8">Minutes</p>

            {/* Time Slider */}
            <div className="max-w-md mx-auto mb-8">
              <input
                type="range"
                min="5"
                max="60"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-700 rounded-full appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-slate-400 mt-2">
                <span>5 min</span>
                <span>60 min</span>
              </div>
            </div>

            {/* Time Calculation */}
            <div className="glass-panel p-6 rounded-2xl">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-cyan-400 mb-2">
                    {Math.floor(timeLimit / quizData.count * 60)}s
                  </div>
                  <div className="text-sm text-slate-400">Per Question</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {timeLimit < 15 ? 'Fast' : timeLimit < 30 ? 'Medium' : 'Slow'}
                  </div>
                  <div className="text-sm text-slate-400">Pace</div>
                </div>
              </div>
            </div>
          </div>

          {/* Time Presets */}
          <div className="grid md:grid-cols-4 gap-4 mb-12 fade-in-up stagger-3">
            {timePresets.map((preset, index) => (
              <button
                key={preset.minutes}
                onClick={() => setTimeLimit(preset.minutes)}
                className={`
                  glass-panel p-6 rounded-2xl transition-all duration-300 text-center hover:scale-105
                  ${timeLimit === preset.minutes ? 'neon-glow bg-blue-500/10' : 'hover:bg-white/5'}
                `}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Timer className={`
                  w-8 h-8 mx-auto mb-3 transition-colors duration-300
                  ${timeLimit === preset.minutes ? 'text-blue-400' : 'text-slate-400'}
                `} />
                <div className={`
                  text-2xl font-bold mb-2 transition-colors duration-300
                  ${timeLimit === preset.minutes ? 'text-blue-400' : 'text-slate-300'}
                `}>
                  {preset.minutes}m
                </div>
                <div className="text-sm text-slate-300 font-medium mb-1">{preset.label}</div>
                <div className="text-xs text-slate-500">{preset.desc}</div>
              </button>
            ))}
          </div>
        </>
      ) : mode === 'custom' ? (
        <>
          {/* Custom Time Box */}
          <div className="glass-panel-strong p-12 rounded-3xl mb-12 text-center fade-in-up stagger-2">
            <h3 className="text-2xl font-bold text-white mb-6">Enter Custom Time</h3>
            <div className="flex items-center justify-center space-x-4 mb-8">
              <input
                type="number"
                min={1}
                max={240}
                value={customTimeInput}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '' || /^\d+$/.test(v)) {
                    setCustomTimeInput(v);
                    if (v !== '') {
                      const parsed = parseInt(v);
                      const clamped = Math.max(1, Math.min(240, parsed));
                      setTimeLimit(clamped);
                    }
                  }
                }}
                onBlur={() => {
                  const parsed = parseInt(customTimeInput);
                  if (isNaN(parsed)) {
                    setTimeLimit(1);
                    setCustomTimeInput('1');
                  } else {
                    const clamped = Math.max(1, Math.min(240, parsed));
                    setTimeLimit(clamped);
                    setCustomTimeInput(String(clamped));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const parsed = parseInt(customTimeInput);
                    if (isNaN(parsed)) {
                      setTimeLimit(1);
                      setCustomTimeInput('1');
                    } else {
                      const clamped = Math.max(1, Math.min(240, parsed));
                      setTimeLimit(clamped);
                      setCustomTimeInput(String(clamped));
                    }
                    (e.currentTarget as HTMLInputElement).blur();
                  }
                }}
                className="w-28 text-center bg-slate-800/70 text-white rounded-xl py-3 px-4 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-slate-300">minutes</span>
            </div>
            <div className="glass-panel p-6 rounded-2xl max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-cyan-400 mb-2">
                    {(() => {
                      const parsed = parseInt(customTimeInput);
                      const preview = isNaN(parsed) ? 0 : Math.max(1, Math.min(240, parsed));
                      return quizData.count > 0 ? Math.floor((preview / quizData.count) * 60) : 0;
                    })()}s
                  </div>
                  <div className="text-sm text-slate-400">Per Question</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {(() => {
                      const parsed = parseInt(customTimeInput);
                      const preview = isNaN(parsed) ? 0 : Math.max(1, Math.min(240, parsed));
                      return preview < 15 ? 'Fast' : preview < 30 ? 'Medium' : 'Slow';
                    })()}
                  </div>
                  <div className="text-sm text-slate-400">Pace</div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Unlimited Mode Display */
        <div className="glass-panel-strong p-12 rounded-3xl mb-12 text-center fade-in-up stagger-2">
          <div className="relative mb-8">
            <Infinity className="w-32 h-32 mx-auto text-purple-400 animate-pulse" />
            <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-purple-400/30 to-pink-400/30 -z-10"></div>
          </div>
          <h3 className="text-4xl font-bold text-white mb-4">Unlimited Time</h3>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Take as much time as you need. Perfect for learning and understanding each question thoroughly.
          </p>
          
          <div className="glass-panel p-6 rounded-2xl max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">∞</div>
                <div className="text-sm text-slate-400">Time Limit</div>
              </div>
              <div className="w-px h-12 bg-slate-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400 mb-1">0</div>
                <div className="text-sm text-slate-400">Pressure</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="grid md:grid-cols-3 gap-6 mb-12 fade-in-up stagger-4">
        {[
          { icon: '⚡', title: 'Quick Thinking', time: '10-15 min', desc: 'Test your instant recall' },
          { icon: '🎯', title: 'Balanced Approach', time: '20-30 min', desc: 'Think through each answer' },
          { icon: '🧘', title: 'Thoughtful Study', time: 'Unlimited', desc: 'Learn without pressure' }
        ].map((rec, index) => (
          <div key={index} className="glass-panel p-6 rounded-2xl text-center group hover:scale-105 transition-all duration-300">
            <div className="text-3xl mb-3">{rec.icon}</div>
            <h3 className="text-xl font-semibold text-white mb-2">{rec.title}</h3>
            <p className="text-blue-400 font-medium mb-3">{rec.time}</p>
            <p className="text-slate-400 text-sm">{rec.desc}</p>
          </div>
        ))}
      </div>

      {/* Continue Button */}
      <div className="flex justify-center fade-in-up stagger-5">
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

export default TimerStage;