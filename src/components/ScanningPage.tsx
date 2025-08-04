import React, { useEffect } from 'react';
import { Brain } from 'lucide-react';

interface ScanningPageProps {
  fileName: string;
  onComplete: (detectedTopics: string[]) => void;
}

// Mock detected topics - in real app, this would come from AI
const mockDetectedTopics = [
  "Machine Learning",
  "Data Structures",
  "Algorithms",
  "Computer Networks",
  "Database Management",
  "Software Engineering",
  "Artificial Intelligence",
  "Operating Systems"
];

export const ScanningPage: React.FC<ScanningPageProps> = ({ fileName, onComplete }) => {
  useEffect(() => {
    // Since topics are hardcoded/ready, redirect after 2 seconds
    const timer = setTimeout(() => {
      onComplete(mockDetectedTopics);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

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

        {/* Extracting Topics Text */}
        <h1 className="text-4xl font-bold text-gradient">
          Extracting Topics
        </h1>

        {/* Please wait text */}
        <p className="text-xl text-muted-foreground">
          Please wait
        </p>

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