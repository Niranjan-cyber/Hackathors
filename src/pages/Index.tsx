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

// Mock question data (in a real app, this would come from AI generation)
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

  const handleQuestionCountSelect = (questionCount: number) => {
    setConfig(prev => ({ ...prev, questionCount }));
    setCurrentStep('timer');
  };

  const handleTimerSelect = (timeLimit: number | null) => {
    const questions = generateMockQuestions(config.topics, config.difficulty, config.questionCount);
    setConfig(prev => ({ ...prev, timeLimit, questions }));
    setCurrentStep('starting');
  };

  const handleStartTest = () => {
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
        setCurrentStep('count');
        break;
      case 'starting':
        setCurrentStep('timer');
        break;
      default:
        break;
    }
  };

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