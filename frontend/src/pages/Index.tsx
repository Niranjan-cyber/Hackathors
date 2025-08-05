import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { ScanningPage } from '@/components/ScanningPage';
import { TopicSelection } from '@/components/TopicSelection';
import { DifficultySelection } from '@/components/DifficultySelection';
import { QuestionCountSelection } from '@/components/QuestionCountSelection';
import { TimerSelection } from '@/components/TimerSelection';
import { TestStarting } from '@/components/TestStarting';
import { TestInterface } from '@/components/TestInterface';
import { Results } from '@/components/Results';


// Mock question data (fallback if API fails)
const generateMockQuestions = (topics: string[], difficulty: string, count: number) => {
  const questions = [];
  for (let i = 0; i < count; i++) {
    const topic = topics[i % topics.length];
    questions.push({
      id: i,
      question: `Sample ${difficulty} question ${i + 1} about ${topic}. What is the primary concept that defines this topic in modern applications?`,
      options: [
        `Option A for ${topic} - Basic understanding`,
        `Option B for ${topic} - Intermediate concept`,
        `Option C for ${topic} - Advanced application`,
        `Option D for ${topic} - Expert level insight`
      ],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: `This is the explanation for question ${i + 1} about ${topic}. The correct answer demonstrates understanding of key principles in ${difficulty} level concepts.`,
      topic: topic
    });
  }
  return questions;
};

type Step = 'upload' | 'scanning' | 'topics' | 'difficulty' | 'count' | 'timer' | 'starting' | 'test' | 'results';

interface TestConfig {
  file: File | null;
  detectedTopics: string[];
  topics: string[];
  difficulty: string;
  questionCount: number;
  timeLimit: number | null;
  questions: any[];
  answers: Record<number, number>;
  timeSpent: number;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [config, setConfig] = useState<TestConfig>({
    file: null,
    detectedTopics: [],
    topics: [],
    difficulty: '',
    questionCount: 10,
    timeLimit: null,
    questions: [],
    answers: {},
    timeSpent: 0
  });
  // This state will now correctly hold our single promise
  const [questionsPromise, setQuestionsPromise] = useState<Promise<any[]> | null>(null);

  const handleFileSelect = (file: File) => {
    setConfig(prev => ({ ...prev, file }));
  };

  const handleScanningComplete = (detectedTopics: string[]) => {
    setConfig(prev => ({ ...prev, detectedTopics }));
    setCurrentStep('topics');
  };

  const handleTopicSelect = (topics: string[]) => {
    setConfig(prev => ({ ...prev, topics }));
    setCurrentStep('difficulty');
  };

  const handleDifficultySelect = (difficulty: string) => {
    setConfig(prev => ({ ...prev, difficulty }));
    setCurrentStep('count');
  };

  // --- MODIFICATION 1: Start API call and save the promise to state ---
  const handleQuestionCountSelect = (questionCount: number) => {
    // Update config first
    setConfig(prev => ({ ...prev, questionCount }));

    // Prepare and start the API call
    const formData = new FormData();
    // Use the latest state values by accessing them directly from `config`
    formData.append('topics', JSON.stringify(config.topics));
    formData.append('difficulty', config.difficulty);
    formData.append('num_questions', questionCount.toString());
    
    console.log("Sent request to generate questions from QuestionCountSelection...");

    const promise = fetch('http://localhost:8000/generate-questions/', {
      method: 'POST',
      body: formData,
    })
      .then(res => {
        if (!res.ok) {
            console.error('API response was not OK.');
            throw new Error('Failed to generate questions');
        }
        return res.json();
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        // Return null on failure so the next component knows to use mock data
        return null; 
      });

    // Save the entire promise to state
    setQuestionsPromise(promise);
    
    // Move to the next step
    setCurrentStep('timer');
  };

  // --- MODIFICATION 2: Simplify this handler drastically ---
  const handleTimerSelect = (timeLimit: number | null) => {
    setConfig(prev => ({ ...prev, timeLimit }));
    // No need for complex logic here. The promise is already running.
    // We just move to the 'starting' screen which will act as our loading page.
    setCurrentStep('starting');
  };

  const handleStartTest = (questions?: any[]) => {
    // Use API-generated questions if available, otherwise use mock questions
    const finalQuestions = questions || generateMockQuestions(config.topics, config.difficulty, config.questionCount);
    
    // Transform API questions to match the expected format if needed
    const formattedQuestions = finalQuestions.map((q, index) => {
      // Handle the format from your Python backend: { "question": "...", "options": { "A": "...", ... }, ... }
      if (q.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
        const optionsArray = Object.values(q.options);
        const correctAnswerKey = q.correct_answer; // e.g., "A"
        const correctAnswerIndex = Object.keys(q.options).findIndex(key => key === correctAnswerKey);
        
        return {
          id: index,
          question: q.question,
          options: optionsArray,
          correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : 0, // Fallback to 0 if key not found
          explanation: q.explanation || `Explanation for question ${index + 1}`,
          topic: Array.isArray(q.topics) ? q.topics[0] : q.topics || 'General'
        };
      } else {
        // This handles mock data or already formatted data
        return {
          id: index,
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer || 0,
          explanation: q.explanation || `Explanation for question ${index + 1}`,
          topic: q.topic || 'General'
        };
      }
    });

    setConfig(prev => ({ ...prev, questions: formattedQuestions }));
    setCurrentStep('test');
  };

  const handleTestSubmit = (answers: Record<number, number>, timeSpent: number) => {
    setConfig(prev => ({ ...prev, answers, timeSpent }));
    setCurrentStep('results');
  };

  const handleRestart = () => {
    setConfig({
      file: null,
      detectedTopics: [],
      topics: [],
      difficulty: '',
      questionCount: 10,
      timeLimit: null,
      questions: [],
      answers: {},
      timeSpent: 0
    });
    // Reset the promise as well
    setQuestionsPromise(null);
    setCurrentStep('upload');
  };

  const goBack = () => {
    switch (currentStep) {
      case 'topics':
        setCurrentStep('upload');
        break;
      case 'difficulty':
        setCurrentStep('topics');
        break;
      case 'count':
        setCurrentStep('difficulty');
        break;
      case 'timer':
        // If going back from timer, we should cancel the API call logic.
        // The simplest way is to clear the promise.
        setQuestionsPromise(null);
        setCurrentStep('count');
        break;
      case 'starting':
        // Also clear promise if going back from the final loading screen
        setQuestionsPromise(null);
        setCurrentStep('timer');
        break;
      default:
        break;
    }
  };

  // The rest of your component remains the same
  switch (currentStep) {
    case 'upload':
      return (
        <FileUpload
          onFileSelect={handleFileSelect}
          onNext={() => setCurrentStep('scanning')}
          selectedFile={config.file}
        />
      );

    case 'scanning':
      return (
        <ScanningPage
          fileName={config.file?.name || ''}
          file={config.file}
          onComplete={handleScanningComplete}
        />
      );

    case 'topics':
      return (
        <TopicSelection
          onNext={handleTopicSelect}
          onBack={goBack}
          selectedFile={config.file}
          detectedTopics={config.detectedTopics}
        />
      );

    case 'difficulty':
      return (
        <DifficultySelection
          onNext={handleDifficultySelect}
          onBack={goBack}
          selectedTopics={config.topics}
        />
      );

    case 'count':
      return (
        <QuestionCountSelection
          onNext={handleQuestionCountSelect}
          onBack={goBack}
          selectedTopics={config.topics}
          difficulty={config.difficulty}
        />
      );

    case 'timer':
      return (
        <TimerSelection
          onNext={handleTimerSelect}
          onBack={goBack}
          questionCount={config.questionCount}
          difficulty={config.difficulty}
        />
      );

    case 'starting':
      return (
        <TestStarting
          onStart={handleStartTest}
          questionCount={config.questionCount}
          timeLimit={config.timeLimit}
          difficulty={config.difficulty}
          topics={config.topics}
          // Pass the promise from state
          questionsPromise={questionsPromise}
        />
      );

    case 'test':
      return (
        <TestInterface
          onSubmit={handleTestSubmit}
          questions={config.questions}
          timeLimit={config.timeLimit}
        />
      );

    case 'results':
      return (
        <Results
          questions={config.questions}
          userAnswers={config.answers}
          timeSpent={config.timeSpent}
          onRestart={handleRestart}
        />
      );

    default:
      return (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, hsl(220, 20%, 8%) 0%, hsl(220, 18%, 12%) 50%, hsl(220, 20%, 8%) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'hsl(220, 15%, 95%)',
          fontFamily: 'Inter, sans-serif'
        }}>
          Loading...
        </div>
      );
  }
};

export default Index;