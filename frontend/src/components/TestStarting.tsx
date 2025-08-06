import React, { useEffect, useState } from 'react';
import { Brain } from 'lucide-react';

interface TestStartingProps {
  onStart: (questions?: any[]) => void;
  questionCount: number;
  timeLimit: number | null;
  difficulty: string;
  topics: string[];
  // This promise is now guaranteed to be passed from the parent
  questionsPromise: Promise<any[]> | null;
}

export const TestStarting: React.FC<TestStartingProps> = ({ 
  onStart, 
  questionCount, 
  timeLimit, 
  difficulty, 
  topics,
  questionsPromise
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This component now ONLY reacts to the promise it's given.
    // It does not make its own API calls.
    if (questionsPromise) {
      setIsLoading(true);
      setError(null);

      questionsPromise.then(questions => {
        if (questions) {
          // Success: API returned questions. Wait a moment then start the test.
          setTimeout(() => onStart(questions), 1500); // Slightly longer delay for better UX
        } else {
          // Failure: API call failed (promise resolved to null). Show error.
          setError('Could not generate questions. Starting with mock questions.');
          // Start the test with mock data after showing the error for a bit.
          setTimeout(() => onStart(), 2000); 
        }
      }).finally(() => {
        // This will run after .then() or .catch()
        setIsLoading(false);
      });

    } else {
        // This case might happen if the user navigates directly to this page or back-and-forth.
        setError("Something went wrong. Starting with mock questions.");
        setTimeout(() => onStart(), 2000);
        setIsLoading(false);
    }
  // The effect should only depend on the promise itself and the onStart callback.
  }, [questionsPromise, onStart]);

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

      <div className="text-center space-y-8 z-10">
        {/* Brain Loading Icon */}
        <div className="flex justify-center">
          <Brain className="w-24 h-24 text-primary animate-pulse" />
        </div>

        {/* Starting Test Text */}
        <h1 className="text-4xl font-bold text-gradient">
          {error ? 'Error' : 'Generating Your Test'}
        </h1>

        <p className="text-lg text-slate-300 max-w-md mx-auto">
          {error ? error : `Crafting ${questionCount} questions about ${topics.join(', ')} at ${difficulty} difficulty...`}
        </p>

        {/* Loading dots (only show if not error) */}
        {!error && (
            <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
        )}
      </div>
    </div>
  );
};