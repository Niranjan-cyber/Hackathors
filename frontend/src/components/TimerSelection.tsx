import React, { useState } from 'react';
import { Timer, Clock, Zap, Infinity, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TimerSelectionProps {
  onNext: (timeLimit: number | null) => void;
  onBack: () => void;
  questionCount: number;
  difficulty: string;
}

export const TimerSelection: React.FC<TimerSelectionProps> = ({ 
  onNext, 
  onBack, 
  questionCount, 
  difficulty 
}) => {
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [customTime, setCustomTime] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  // Calculate recommended time based on difficulty and question count
  const getRecommendedTime = () => {
    const baseTime = questionCount * 2; // 2 minutes per question base
    const difficultyMultiplier = {
      easy: 1,
      medium: 1.25,
      hard: 1.5,
      expert: 2
    }[difficulty] || 1;
    
    return Math.ceil(baseTime * difficultyMultiplier);
  };

  const recommendedTime = getRecommendedTime();

  const handleCustomTimeSelect = () => {
    if (selectedTime !== 'custom') {
      setShowCustomInput(true);
      setSelectedTime('custom' as any);
    }
  };

  const handleCustomTimeChange = (value: string) => {
    setCustomTime(value);
    // Keep the selected time as 'custom' to maintain the selection state
    setSelectedTime('custom' as any);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const numValue = parseInt(customTime);
      if (!isNaN(numValue) && numValue > 0) {
        // Just update the selected time, don't proceed to next step
        setSelectedTime(numValue);
      }
    }
  };

  const timeOptions = [
    {
      value: Math.floor(recommendedTime * 0.5),
      label: 'Speed Round',
      description: 'Quick thinking required',
      icon: Zap,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/30'
    },
    {
      value: recommendedTime,
      label: 'Recommended',
      description: 'Balanced time for all questions',
      icon: Clock,
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
      recommended: true
    },
    {
      value: 'custom',
      label: 'Custom Time',
      description: 'Set your own time limit',
      icon: Edit3,
      color: 'text-info',
      bgColor: 'bg-info/10',
      borderColor: 'border-info/30',
      isCustom: true
    },
    {
      value: null,
      label: 'No Timer',
      description: 'Take your time, no pressure',
      icon: Infinity,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/10',
      borderColor: 'border-muted/30'
    }
  ];

  const handleNext = () => {
    if (selectedTime === 'custom') {
      const numValue = parseInt(customTime);
      onNext(numValue);
    } else {
      onNext(selectedTime);
    }
  };

  const formatTime = (minutes: number | null) => {
    if (minutes === null) return 'No limit';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getDisplayTime = () => {
    if (selectedTime === 'custom') {
      const numValue = parseInt(customTime);
      if (!isNaN(numValue) && numValue > 0) {
        return formatTime(numValue);
      }
      return 'Enter custom time';
    }
    return formatTime(selectedTime);
  };

  const isNextDisabled = () => {
    if (selectedTime === undefined) return true;
    if (selectedTime === 'custom') {
      const numValue = parseInt(customTime);
      return isNaN(numValue) || numValue <= 0;
    }
    return false;
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
            <Timer className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-gradient">
              Set Timer
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Choose your preferred time limit for the test
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="text-sm text-primary bg-primary/10 px-3 py-1 rounded-full">
              {questionCount} Questions
            </span>
            <span className="text-sm text-secondary bg-secondary/10 px-3 py-1 rounded-full">
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level
            </span>
          </div>
        </div>

        {/* Selected Time Display */}
        {selectedTime !== undefined && (
          <Card className="card-gradient border-primary/20 p-8 text-center pulse-glow">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">
                {getDisplayTime()}
              </div>
              <div className="text-muted-foreground">
                Selected Time Limit
              </div>
              {selectedTime !== null && selectedTime !== 'custom' && (
                <div className="text-sm text-muted-foreground">
                  Approximately {Math.floor(selectedTime / questionCount)} minutes per question
                </div>
              )}
              {selectedTime === 'custom' && customTime && !isNaN(parseInt(customTime)) && parseInt(customTime) > 0 && (
                <div className="text-sm text-muted-foreground">
                  Approximately {Math.floor(parseInt(customTime) / questionCount)} minutes per question
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Timer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {timeOptions.map((option, index) => {
            const Icon = option.icon;
            const isSelected = selectedTime === option.value;
            
            return (
              <Card
                key={index}
                onClick={() => option.isCustom ? handleCustomTimeSelect() : setSelectedTime(option.value)}
                className={`card-gradient p-8 cursor-pointer transition-all duration-300 hover-lift border-2 ${
                  isSelected
                    ? `${option.borderColor.replace('/30', '')} ${option.bgColor.replace('/10', '/20')} glow-effect`
                    : `border-primary/30 hover:border-primary/60 hover:bg-primary/5`
                }`}
              >
                <div className="text-center space-y-4">
                  <div className={`inline-flex p-4 rounded-full ${option.bgColor} relative`}>
                    <Icon className={`w-8 h-8 ${option.color}`} />
                    {option.recommended && (
                      <div className="absolute -top-2 -right-2 bg-success text-white text-xs px-2 py-1 rounded-full">
                        ★
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className={`text-xl font-bold ${isSelected ? option.color : 'text-foreground'}`}>
                      {option.label}
                    </h3>
                    {option.value && !option.isCustom && (
                      <div className="text-2xl font-bold text-primary mt-1">
                        {formatTime(option.value)}
                      </div>
                    )}
                    {option.isCustom && isSelected && (
                      <div className="mt-2">
                        <input
                          type="number"
                          value={customTime}
                          onChange={(e) => handleCustomTimeChange(e.target.value)}
                          onKeyDown={handleKeyPress}
                          placeholder="Enter minutes"
                          min="1"
                          className="w-40 px-4 py-3 text-center border-2 border-blue-300 rounded-lg bg-background/80 text-primary font-bold text-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-muted-foreground/60 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:bg-blue-500 [&::-webkit-outer-spin-button]:bg-blue-500"
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#3b82f6 transparent',
                            WebkitAppearance: 'textfield'
                          }}
                        />
                        <div className="text-sm text-blue-500 mt-2 font-medium">minutes</div>
                      </div>
                    )}
                    <p className="text-muted-foreground mt-2">
                      {option.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div className={`inline-flex items-center text-sm ${option.color} font-medium`}>
                      <Clock className="w-4 h-4 mr-1" />
                      Selected
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recommendation Box */}
        <Card className="card-gradient border-success/30 p-6 bg-success/5">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 p-2 bg-success/20 rounded-lg">
              <Clock className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Time Recommendation
              </h3>
              <p className="text-muted-foreground">
                Based on your selected difficulty ({difficulty}) and {questionCount} questions, 
                we recommend <span className="text-success font-medium">{formatTime(recommendedTime)}</span>{' '} 
                to ensure you have adequate time to read, think, and answer each question thoroughly.
              </p>
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
            disabled={isNextDisabled()}
          >
            Start Test
          </Button>
        </div>
      </div>
    </div>
  );
};