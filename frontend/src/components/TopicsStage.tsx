import React, { useMemo, useState } from 'react';
import { ArrowRight, Tag, Check, Brain, Search, Plus, Sparkles } from 'lucide-react';

interface TopicsStageProps {
  quizData: any;
  setQuizData: (data: any) => void;
  currentStage: string;
  setCurrentStage: (stage: any) => void;
}

const TopicsStage: React.FC<TopicsStageProps> = ({ quizData, setQuizData, setCurrentStage }) => {
  const baseTopics = [
    'Data Structures', 'Algorithms', 'Database Design', 'Software Engineering',
    'Computer Networks', 'Operating Systems', 'Machine Learning', 'Web Development',
    'Mobile Development', 'Cloud Computing', 'Cybersecurity', 'DevOps',
    'System Design', 'Programming Languages', 'Software Testing'
  ];

  // Get extracted topics from quiz data
  const extractedTopics = quizData.extractedTopics || [];
  
  // Debug logging
  console.log('QuizData:', quizData);
  console.log('ExtractedTopics:', extractedTopics);
  console.log('ExtractedTopics length:', extractedTopics.length);
  
  // Combine extracted topics with base topics, prioritizing extracted ones
  const allTopics = useMemo(() => {
    const combined = [...extractedTopics];
    
    // Add base topics that aren't already in extracted topics
    baseTopics.forEach(topic => {
      if (!combined.some(t => t.toLowerCase() === topic.toLowerCase())) {
        combined.push(topic);
      }
    });
    
    console.log('AllTopics combined:', combined);
    return combined;
  }, [extractedTopics]);

  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    quizData.presetTopics ? (quizData.topics || []) : []
  );
  const [search, setSearch] = useState('');
  const [customTopic, setCustomTopic] = useState('');

  const filteredTopics = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allTopics;
    return allTopics.filter(t => t.toLowerCase().includes(q));
  }, [search, allTopics]);

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleAddCustomTopic = () => {
    const t = customTopic.trim();
    if (!t) return;
    if (!selectedTopics.includes(t)) setSelectedTopics(prev => [...prev, t]);
    setCustomTopic('');
  };

  const handleNext = () => {
    console.log('TopicsStage handleNext - selectedTopics:', selectedTopics);
    console.log('TopicsStage handleNext - quizData before:', quizData);
    
    const updatedQuizData = { 
      ...quizData, 
      topics: selectedTopics, 
      presetTopics: false,
      extractedTopics: quizData.extractedTopics, // Preserve extractedTopics
      retakeMode: quizData.retakeMode // Preserve retakeMode
    };
    
    console.log('TopicsStage handleNext - updatedQuizData:', updatedQuizData);
    setQuizData(updatedQuizData);
    setCurrentStage('difficulty');
  };

  const isExtractedTopic = (topic: string) => {
    return extractedTopics.some((t: string) => t.toLowerCase() === topic.toLowerCase());
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10 fade-in-up">
        <div className="w-24 h-24 mx-auto glass-panel rounded-3xl flex items-center justify-center mb-5 floating-card">
          <Tag className="w-12 h-12 text-purple-400" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-3xl animate-pulse"></div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
          Select Topics
        </h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          {extractedTopics.length > 0 
            ? `Our AI has identified ${extractedTopics.length} key topics from your content. You can also select additional topics.`
            : 'Choose the topics you want to focus on. Our AI has identified these key areas from your content.'
          }
        </p>
      </div>



      {/* Search bar */}
      <div className="max-w-2xl mx-auto mb-8 fade-in-up">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics..."
            className="w-full bg-slate-800/60 border border-slate-600 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Selected Count */}
      <div className="glass-panel-strong p-6 rounded-2xl mb-10 max-w-md mx-auto text-center fade-in-up">
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
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
        {filteredTopics.map((topic, index) => {
          const isSelected = selectedTopics.includes(topic);
          const isExtracted = isExtractedTopic(topic);
          
          return (
            <div
              key={topic}
              onClick={() => toggleTopic(topic)}
              className={`
                relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 group fade-in-up
                ${isSelected 
                  ? isExtracted 
                    ? 'glass-panel-strong scale-105 neon-glow border-2 border-cyan-400/50' 
                    : 'glass-panel-strong scale-105 neon-glow'
                  : isExtracted
                    ? 'glass-panel border-2 border-cyan-400/30 hover:scale-105 hover:border-cyan-400/50'
                    : 'glass-panel hover:scale-105'
                }
              `}
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              {/* AI Extracted Badge */}
              {isExtracted && (
                <div className="absolute top-2 left-2 z-10">
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI
                  </div>
                </div>
              )}

              {/* Selection Indicator */}
              <div className={`
                absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                ${isSelected 
                  ? isExtracted
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 border-transparent' 
                    : 'bg-gradient-to-r from-purple-400 to-pink-500 border-transparent'
                  : 'border-slate-500 group-hover:border-cyan-400'
                }
              `}>
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </div>

              {/* Topic Content */}
              <div className={`pr-8 ${isExtracted ? 'pt-6' : ''}`}>
                <h3 className={`
                  text-lg font-semibold transition-colors duration-300
                  ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}
                `}>
                  {topic}
                </h3>
              </div>

              {/* Hover Effect */}
              <div className={`
                absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl
                ${isExtracted 
                  ? 'bg-gradient-to-r from-cyan-400/5 to-blue-400/5' 
                  : 'bg-gradient-to-r from-purple-400/5 to-pink-400/5'
                }
              `} />
              
              {/* Selection Ripple */}
              {isSelected && (
                <div className={`
                  absolute inset-0 rounded-2xl animate-pulse
                  ${isExtracted 
                    ? 'bg-gradient-to-r from-cyan-400/10 to-blue-400/10' 
                    : 'bg-gradient-to-r from-purple-400/10 to-pink-400/10'
                  }
                `} />
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Topic Input */}
      <div className="max-w-2xl mx-auto mb-12 fade-in-up">
        <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-stretch">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCustomTopic();
            }}
            placeholder="Add a custom topic (e.g., Probability, NLP)"
            className="flex-1 bg-slate-800/60 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none transition-all"
          />
          <button
            onClick={handleAddCustomTopic}
            className="premium-button px-6 py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-6 fade-in-up">
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