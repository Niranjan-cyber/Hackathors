import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Brain, Sparkles, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ScanningPageProps {
  fileName: string;
  file: File;
  onComplete: (detectedTopics: string[]) => void;
}

const scanningSteps = [
  { id: 1, text: "Analyzing document structure...", icon: FileText },
  { id: 2, text: "Extracting content and context...", icon: Brain },
  { id: 3, text: "Identifying key topics...", icon: Sparkles },
  { id: 4, text: "Generating topic suggestions...", icon: CheckCircle },
];

export const ScanningPage: React.FC<ScanningPageProps> = ({ fileName, file, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [topics, setTopics] = useState<string[] | null>(null);
  const [animationDone, setAnimationDone] = useState(false);

  // 1. Start API request immediately
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post('http://localhost:8000/extract-topics', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          },
        });
        setTopics(response.data.topics || []);
      } catch (error) {
        setTopics([]);
      }
    };
    fetchTopics();
  }, [file]);

  // 2. Run animation as before
  useEffect(() => {
    const totalDuration = 4000;
    const stepDuration = totalDuration / scanningSteps.length;

    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + (100 / (totalDuration / 100)), 100));
    }, 100);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = prev + 1;
        if (nextStep <= scanningSteps.length) {
          setCompletedSteps(prevCompleted => [...prevCompleted, nextStep - 1]);
          if (nextStep === scanningSteps.length) {
            setTimeout(() => {
              setAnimationDone(true);
            }, 500);
          }
          return nextStep;
        }
        return prev;
      });
    }, stepDuration);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  // 3. When both are done, call onComplete
  useEffect(() => {
    if (animationDone && topics !== null) {
      onComplete(topics);
    }
  }, [animationDone, topics, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="particles">
        {[...Array(50)].map((_, i) => (
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

      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-gradient floating-animation">
            Analyzing Document
          </h1>
          <p className="text-xl text-muted-foreground">
            Our AI is scanning "{fileName}" to identify relevant topics
          </p>
        </div>

        <Card className="card-gradient border-primary/20 p-8 hover-lift glow-effect">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Scanning Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3 bg-secondary/50" />
            </div>

            <div className="space-y-4">
              {scanningSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = completedSteps.includes(index);
                const isCurrent = currentStep === index;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-500 ${
                      isCompleted
                        ? 'bg-success/10 border border-success/30'
                        : isCurrent
                        ? 'bg-primary/10 border border-primary/30 scale-105'
                        : 'bg-secondary/20 border border-secondary/30'
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-success text-success-foreground'
                          : isCurrent
                          ? 'bg-primary text-primary-foreground animate-pulse'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isCurrent ? 'animate-spin' : ''}`} />
                    </div>
                    <span
                      className={`font-medium transition-all duration-500 ${
                        isCompleted
                          ? 'text-success'
                          : isCurrent
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {step.text}
                    </span>
                    {isCompleted && (
                      <CheckCircle className="w-5 h-5 text-success ml-auto animate-fadeIn" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
                <div className="absolute top-2 left-2 w-16 h-16 border-4 border-transparent border-t-primary/50 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
                <Brain className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground">
                Please wait while we process your document...
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Deep Analysis", description: "Advanced AI algorithms analyze your content" },
            { title: "Topic Detection", description: "Automatically identify key subject areas" },
            { title: "Smart Suggestions", description: "Get relevant topic recommendations" }
          ].map((feature, index) => (
            <Card key={index} className="card-gradient border-primary/20 p-6 text-center hover-lift">
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};