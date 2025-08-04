import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, Target, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TestStartingProps {
  onStart: () => void;
  questionCount: number;
  timeLimit: number | null;
  difficulty: string;
  topics: string[];
}

export const TestStarting: React.FC<TestStartingProps> = ({ 
  onStart, 
  questionCount, 
  timeLimit, 
  difficulty, 
  topics 
}) => {
  const [countdown, setCountdown] = useState(3);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setIsReady(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (minutes: number | null) => {
    if (!minutes) return 'No time limit';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-6 flex items-center justify-center">
      {/* Particle Background */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${10 + Math.random() * 8}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gradient">
            Get Ready!
          </h1>
          <p className="text-xl text-muted-foreground">
            Your test is about to begin
          </p>
        </div>

        {/* Countdown or Ready State */}
        <Card className="card-gradient border-primary/20 p-8 pulse-glow">
          {!isReady ? (
            <div className="space-y-6">
              <div className="text-8xl font-bold text-primary animate-pulse">
                {countdown}
              </div>
              <p className="text-lg text-muted-foreground">
                Starting in...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <CheckCircle className="w-16 h-16 text-success mx-auto animate-bounce" />
              <div className="text-3xl font-bold text-success">
                Ready to Start!
              </div>
              <p className="text-lg text-muted-foreground">
                Click the button below to begin your test
              </p>
            </div>
          )}
        </Card>

        {/* Test Summary */}
        <Card className="card-gradient border-primary/20 p-6">
          <h3 className="text-xl font-semibold text-foreground mb-6">
            Test Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Questions</div>
                <div className="font-semibold text-foreground">{questionCount}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Time Limit</div>
                <div className="font-semibold text-foreground">{formatTime(timeLimit)}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Difficulty</div>
                <div className="font-semibold text-foreground capitalize">{difficulty}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-primary rounded-full" />
              <div>
                <div className="text-sm text-muted-foreground">Topics</div>
                <div className="font-semibold text-foreground">{topics.length}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Topics Preview */}
        <Card className="card-gradient border-primary/20 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Test Topics
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {topics.map((topic, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium border border-primary/30"
              >
                {topic}
              </span>
            ))}
          </div>
        </Card>

        {/* Start Button */}
        {isReady && (
          <div className="animate-fade-in">
            <Button 
              onClick={onStart} 
              variant="default" 
              size="xl"
              className="pulse-glow"
            >
              Start Test Now
            </Button>
          </div>
        )}

        {/* Instructions */}
        <Card className="card-gradient border-primary/20 p-6 text-left">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
            Instructions
          </h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>Read each question carefully before selecting your answer</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>You can change your answers before submitting</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>Keep an eye on the timer if you have a time limit</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>Submit your test when you're finished or when time runs out</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};