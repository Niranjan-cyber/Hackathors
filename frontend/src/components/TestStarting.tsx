import React, { useEffect, useState } from 'react';
import { Brain } from 'lucide-react';

interface TestStartingProps {
  onStart: (questions?: any[]) => void;
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create form data for the API call
        const formData = new FormData();
        formData.append('topics', JSON.stringify(topics));
        formData.append('difficulty', difficulty);
        formData.append('num_questions', questionCount.toString());

        // Make API call to generate questions
        const response = await fetch('http://localhost:8000/generate-questions/', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to generate questions: ${response.statusText}`);
        }

        const questions = await response.json();
        
        // Wait a bit to show the loading animation
        setTimeout(() => {
          onStart(questions);
        }, 1000);

      } catch (err) {
        console.error('Error generating questions:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate questions');
        
        // Fallback: start test without questions after error
        setTimeout(() => {
          onStart();
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    generateQuestions();
  }, [onStart, questionCount, difficulty, topics]);

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
          {error ? 'Error Generating Questions' : 'Generating Questions'}
        </h1>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-lg max-w-md mx-auto">
            {error}
          </p>
        )}

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