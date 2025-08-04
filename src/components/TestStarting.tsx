import React, { useEffect } from 'react';
import { Brain } from 'lucide-react';

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
  useEffect(() => {
    // Since questions are hardcoded/ready, redirect after 2 seconds
    const timer = setTimeout(() => {
      onStart();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onStart]);
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

      <div className="text-center space-y-8">
        {/* Brain Loading Icon */}
        <div className="flex justify-center">
          <Brain className="w-24 h-24 text-primary animate-pulse" />
        </div>

        {/* Starting Test Text */}
        <h1 className="text-4xl font-bold text-gradient">
          Starting Test
        </h1>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};