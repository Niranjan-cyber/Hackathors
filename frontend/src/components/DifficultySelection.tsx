import React, { useState } from 'react';
import { Target, Zap, Flame, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DifficultySelectionProps {
  onNext: (difficulty: string) => void;
  onBack: () => void;
  selectedTopics: string[];
}

export const DifficultySelection: React.FC<DifficultySelectionProps> = ({ onNext, onBack, selectedTopics }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');

  const difficulties = [
    {
      id: 'easy',
      name: 'Easy',
      icon: Target,
      description: 'Basic concepts and fundamental understanding',
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
      hoverColor: 'hover:border-success hover:bg-success/20'
    },
    {
      id: 'medium',
      name: 'Medium',
      icon: Zap,
      description: 'Moderate complexity with analytical thinking',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
      hoverColor: 'hover:border-warning hover:bg-warning/20'
    },
    {
      id: 'hard',
      name: 'Hard',
      icon: Flame,
      description: 'Advanced concepts requiring deep understanding',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/30',
      hoverColor: 'hover:border-destructive hover:bg-destructive/20'
    }
  ];

  const handleNext = () => {
    if (selectedDifficulty) {
      onNext(selectedDifficulty);
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
            <Target className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-gradient">
              Select Difficulty
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Choose the difficulty level for your MCQ test
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {selectedTopics.slice(0, 3).map((topic, index) => (
              <span key={index} className="text-sm text-primary bg-primary/10 px-3 py-1 rounded-full">
                {topic}
              </span>
            ))}
            {selectedTopics.length > 3 && (
              <span className="text-sm text-muted-foreground bg-muted/20 px-3 py-1 rounded-full">
                +{selectedTopics.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Difficulty Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {difficulties.map((difficulty) => {
            const Icon = difficulty.icon;
            const isSelected = selectedDifficulty === difficulty.id;
            
            return (
              <Card
                key={difficulty.id}
                onClick={() => setSelectedDifficulty(difficulty.id)}
                className={`card-gradient p-8 cursor-pointer transition-all duration-300 hover-lift border-2 ${
                  isSelected
                    ? `${difficulty.borderColor.replace('/30', '')} ${difficulty.bgColor.replace('/10', '/20')} glow-effect`
                    : `border-primary/30 ${difficulty.hoverColor}`
                }`}
              >
                <div className="text-center space-y-4">
                  <div className={`inline-flex p-4 rounded-full ${difficulty.bgColor}`}>
                    <Icon className={`w-8 h-8 ${difficulty.color}`} />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${isSelected ? difficulty.color : 'text-foreground'}`}>
                      {difficulty.name}
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      {difficulty.description}
                    </p>
                  </div>
                  
                  {/* Difficulty Indicators */}
                  <div className="flex justify-center space-x-1">
                    {[...Array(3)].map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-6 rounded-full ${
                          index < (['easy', 'medium', 'hard'].indexOf(difficulty.id) + 1)
                            ? difficulty.color.replace('text-', 'bg-')
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>

                  {isSelected && (
                    <div className={`inline-flex items-center text-sm ${difficulty.color} font-medium`}>
                      <Target className="w-4 h-4 mr-1" />
                      Selected
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <Card className="card-gradient border-primary/20 p-6 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Difficulty Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="text-success font-medium">Easy:</span> Recall & Recognition
            </div>
            <div>
              <span className="text-warning font-medium">Medium:</span> Application & Analysis
            </div>
            <div>
              <span className="text-destructive font-medium">Hard:</span> Synthesis & Evaluation
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
            disabled={!selectedDifficulty}
          >
            Proceed to Question Count
          </Button>
        </div>
      </div>
    </div>
  );
};