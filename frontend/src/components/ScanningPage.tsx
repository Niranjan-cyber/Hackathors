import React, { useEffect, useState } from 'react';
import { Brain } from 'lucide-react';

interface ScanningPageProps {
  fileName: string;
  file: File;
  onComplete: (detectedTopics: string[]) => void;
}

export const ScanningPage: React.FC<ScanningPageProps> = ({ fileName, file, onComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const extractTopics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create form data for the API call
        const formData = new FormData();
        formData.append('file', file);

        // Make API call to extract topics from PDF
        const response = await fetch('http://localhost:8000/extract-topics/', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to extract topics: ${response.statusText}`);
        }

        const responseData = await response.json();
        
        // Extract topics from the response - backend returns {"topics": [...]}
        const detectedTopics = responseData.topics || responseData || [];
        
        // Ensure detectedTopics is always an array
        const topicsArray = Array.isArray(detectedTopics) ? detectedTopics : [];
        
        // Wait a bit to show the loading animation
        setTimeout(() => {
          onComplete(topicsArray);
        }, 1000);

      } catch (err) {
        console.error('Error extracting topics:', err);
        setError(err instanceof Error ? err.message : 'Failed to extract topics');
        
        // Fallback: use mock topics after error
        setTimeout(() => {
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
          onComplete(mockDetectedTopics);
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    extractTopics();
  }, [file, onComplete]);

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
          {error ? 'Error Extracting Topics' : 'Extracting Topics'}
        </h1>

        {/* File name display */}
        <p className="text-lg text-muted-foreground">
          Processing: {fileName}
        </p>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-lg max-w-md mx-auto">
            {error}
          </p>
        )}

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