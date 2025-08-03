import React, { useState } from 'react';
import { Hash, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

interface QuestionCountSelectionProps {
  onNext: (questionCount: number) => void;
  onBack: () => void;
  selectedTopics: string[];
  difficulty: string;
}

export const QuestionCountSelection: React.FC<QuestionCountSelectionProps> = ({ 
  onNext, 
  onBack, 
  selectedTopics, 
  difficulty 
}) => {
  const [questionCount, setQuestionCount] = useState<number>(10);
  
  // Mock maximum questions based on AI analysis (in real app, this would be dynamic)
  const maxQuestions = 30;
  const estimatedTime = Math.ceil(questionCount * 1.5); // 1.5 minutes per question

  const quickSelectOptions = [ 10, 15, 20, 25, 30];

  const handleNext = () => {
    onNext(questionCount);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-success';
      case 'medium': return 'text-warning';
      case 'hard': return 'text-destructive';
      case 'expert': return 'text-accent';
      default: return 'text-primary';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      {/* Particle Background */}
      <div className="particles">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Hash className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-gradient">
              Select Question Count
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Choose how many questions you want in your test
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className={`text-sm font-medium px-3 py-1 rounded-full bg-primary/10 ${getDifficultyColor(difficulty)}`}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level
            </span>
            <span className="text-sm text-muted-foreground bg-muted/20 px-3 py-1 rounded-full">
              {selectedTopics.length} Topics
            </span>
          </div>
        </div>

        {/* Current Selection Display */}
        <Card className="card-gradient border-primary/20 p-8 text-center">
          <div className="space-y-4">
            <div className="text-6xl font-bold text-primary">
              {questionCount}
            </div>
            <div className="text-xl text-foreground">
              Questions Selected
            </div>
            <div className="flex justify-center items-center space-x-6 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>~{estimatedTime} minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Max: {maxQuestions}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Slider Selection */}
        <Card className="card-gradient border-primary/20 p-8">
          <h3 className="text-lg font-semibold text-foreground mb-6 text-center">
            Drag to Select Number of Questions
          </h3>
          <div className="space-y-6">
            <Slider
              value={[questionCount]}
              onValueChange={(value) => setQuestionCount(value[0])}
              max={maxQuestions}
              min={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>5 (Minimum)</span>
              <span>{maxQuestions} (Maximum Available)</span>
            </div>
          </div>
        </Card>

        {/* Quick Select Options */}
        <Card className="card-gradient border-primary/20 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
            Quick Select
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {quickSelectOptions.map((count) => (
              <Button
                key={count}
                onClick={() => setQuestionCount(count)}
                variant={questionCount === count ? "default" : "outline"}
                size="lg"
                disabled={count > maxQuestions}
                className="h-16 text-lg"
              >
                {count}
              </Button>
            ))}
          </div>
        </Card>

        {/* Test Information */}
        <Card className="card-gradient border-primary/20 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Test Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">{selectedTopics.length}</div>
              <div className="text-sm text-muted-foreground">Topics Covered</div>
            </div>
            <div className="text-center p-4 bg-secondary/10 rounded-lg">
              <div className={`text-2xl font-bold ${getDifficultyColor(difficulty)}`}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </div>
              <div className="text-sm text-muted-foreground">Difficulty Level</div>
            </div>
            <div className="text-center p-4 bg-accent/10 rounded-lg">
              <div className="text-2xl font-bold text-accent">MCQ</div>
              <div className="text-sm text-muted-foreground">Question Type</div>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button onClick={onBack} variant="outline" size="lg">
            Back
          </Button>
          <Button
            onClick={handleNext}
            variant="default"
            size="lg"
          >
            Proceed to Timer Selection
          </Button>
        </div>
      </div>
    </div>
  );
};