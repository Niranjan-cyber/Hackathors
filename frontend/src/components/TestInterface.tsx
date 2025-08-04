import React, { useState, useEffect } from 'react';
import { Clock, Flag, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

interface TestInterfaceProps {
  onSubmit: (answers: Record<number, number>, timeSpent: number) => void;
  questions: Question[];
  timeLimit: number | null; // in minutes
}

export const TestInterface: React.FC<TestInterfaceProps> = ({ onSubmit, questions, timeLimit }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(timeLimit ? timeLimit * 60 : null); // in seconds
  const [startTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev !== null ? prev - 1 : null);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Warning when 5 minutes left
  useEffect(() => {
    if (timeLeft === 300) { // 5 minutes
      toast.warning("Only 5 minutes remaining!");
    } else if (timeLeft === 60) { // 1 minute
      toast.error("Only 1 minute remaining!");
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000); // in seconds
    
    toast.success("Test submitted successfully!", { duration: 1000});
    onSubmit(answers, timeSpent);
  };

  const getProgress = () => {
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const currentQ = questions[currentQuestion];

  if (!currentQ) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      {/* Header with Timer and Progress */}
      <div className="max-w-4xl mx-auto mb-6">
        <Card className="card-gradient border-primary/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-primary">
                Question {currentQuestion + 1} of {questions.length}
              </div>
              <div className="text-sm text-muted-foreground">
                {getAnsweredCount()} answered
              </div>
            </div>
            
            {timeLeft !== null && (
              <div className="flex items-center space-x-2">
                <Clock className={`w-5 h-5 ${timeLeft < 300 ? 'text-destructive' : 'text-primary'}`} />
                <span className={`text-xl font-mono font-bold ${
                  timeLeft < 300 ? 'text-destructive' : 'text-primary'
                }`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
          
          <Progress value={getProgress()} className="mt-4" />
        </Card>
      </div>

      {/* Question Card */}
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="card-gradient border-primary/20 p-8">
          <div className="space-y-6">
            {/* Topic Badge */}
            <div className="flex items-center space-x-2">
              <span className="text-sm bg-primary/20 text-primary px-3 py-1 rounded-full">
                {currentQ.topic}
              </span>
              {answers[currentQuestion] !== undefined && (
                <CheckCircle className="w-5 h-5 text-success" />
              )}
            </div>

            {/* Question */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                {currentQ.question}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-300 hover-lift ${
                    answers[currentQuestion] === index
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-primary/30 bg-card text-foreground hover:border-primary/60 hover:bg-primary/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion] === index
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-primary/50'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-base">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            variant="outline"
            size="lg"
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          <div className="flex space-x-3">
            {currentQuestion === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                variant="success"
                size="lg"
                disabled={isSubmitting}
                className="bg-success text-white hover:bg-success/90"
              >
                <Flag className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                variant="default"
                size="lg"
              >
                Next
              </Button>
            )}
          </div>
        </div>

        {/* Quick Navigation */}
        <Card className="card-gradient border-primary/20 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Question Navigator</h3>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg border-2 transition-all duration-300 ${
                  index === currentQuestion
                    ? 'border-primary bg-primary text-primary-foreground'
                    : answers[index] !== undefined
                    ? 'border-success bg-success/20 text-success'
                    : 'border-primary/30 bg-card text-foreground hover:border-primary/60'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary bg-primary rounded"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-success bg-success/20 rounded"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary/30 bg-card rounded"></div>
              <span>Unanswered</span>
            </div>
          </div>
        </Card>

        {/* Warning for unanswered questions */}
        {currentQuestion === questions.length - 1 && getAnsweredCount() < questions.length && (
          <Card className="card-gradient border-warning/30 p-4 bg-warning/5">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <div>
                <p className="text-warning font-medium">
                  You have {questions.length - getAnsweredCount()} unanswered questions.
                </p>
                <p className="text-sm text-muted-foreground">
                  You can still submit the test, but unanswered questions will be marked incorrect.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};