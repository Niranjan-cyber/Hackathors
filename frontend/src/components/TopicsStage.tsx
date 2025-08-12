import React, { useState } from 'react';
import { ArrowRight, Tag, Check, Brain } from 'lucide-react';

interface TopicsStageProps {
  quizData: any;
  setQuizData: (data: any) => void;
  currentStage: string;
  setCurrentStage: (stage: any) => void;
}

const TopicsStage: React.FC<TopicsStageProps> = ({ quizData, setQuizData, setCurrentStage }) => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const allTopics = [
    'Data Structures', 'Algorithms', 'Database Design', 'Software Engineering',
    'Computer Networks', 'Operating Systems', 'Machine Learning', 'Web Development',
    'Mobile Development', 'Cloud Computing', 'Cybersecurity', 'DevOps',
    'System Design', 'Programming Languages', 'Software Testing'
  ];

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleNext = () => {
    setQuizData({ ...quizData, topics: selectedTopics });
    setCurrentStage('difficulty');
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16 fade-in-up">
        <div className="w-24 h-24 mx-auto glass-panel rounded-3xl flex items-center justify-center mb-6 floating-card">
          <Tag className="w-12 h-12 text-purple-400" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-3xl animate-pulse"></div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
          Select Topics
        </h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          Choose the topics you want to focus on. Our AI has identified these key areas from your content.
        </p>
      </div>

      {/* Selected Count */}
      <div className="glass-panel-strong p-6 rounded-2xl mb-12 max-w-md mx-auto text-center fade-in-up stagger-1">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-cyan-400" />
          <span className="text-2xl font-bold text-white">{selectedTopics.length}</span>
          <span className="text-slate-400">topics selected</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <div 
            className="h-full bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${(selectedTopics.length / allTopics.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
        {allTopics.map((topic, index) => {
          const isSelected = selectedTopics.includes(topic);
          return (
            <div
              key={topic}
              onClick={() => toggleTopic(topic)}
              className={`
                relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 group fade-in-up
                ${isSelected 
                  ? 'glass-panel-strong scale-105 neon-glow' 
                  : 'glass-panel hover:scale-105'
                }
              `}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Selection Indicator */}
              <div className={`
                absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                ${isSelected 
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-400 border-transparent' 
                  : 'border-slate-500 group-hover:border-cyan-400'
                }
              `}>
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </div>

              {/* Topic Content */}
              <div className="pr-8">
                <h3 className={`
                  text-lg font-semibold transition-colors duration-300
                  ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}
                `}>
                  {topic}
                </h3>
                {/* Removed per request: number of questions per topic */}
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              
              {/* Selection Ripple */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 rounded-2xl animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-6 fade-in-up stagger-3">
        <button
          onClick={() => setSelectedTopics(allTopics)}
          className="glass-panel px-6 py-3 rounded-xl text-slate-300 hover:text-white transition-all duration-300 hover:scale-105"
        >
          Select All
        </button>
        
        <button
          onClick={() => setSelectedTopics([])}
          className="glass-panel px-6 py-3 rounded-xl text-slate-300 hover:text-white transition-all duration-300 hover:scale-105"
        >
          Clear All
        </button>

        <button
          onClick={handleNext}
          disabled={selectedTopics.length === 0}
          className={`
            premium-button flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed
            ${selectedTopics.length === 0 ? 'hover:scale-100' : ''}
          `}
        >
          <span>Continue</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TopicsStage;