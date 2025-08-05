import React, { useState } from 'react';
import { Check, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface TopicSelectionProps {
  onNext: (selectedTopics: string[]) => void;
  onBack: () => void;
  selectedFile: File | null;
  detectedTopics?: string[];
}

export const TopicSelection: React.FC<TopicSelectionProps> = ({ onNext, onBack, selectedFile, detectedTopics = [] }) => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Use only the topics detected by the AI. There is no fallback list.
  const availableTopics = Array.isArray(detectedTopics) ? detectedTopics : [];

  // Filter the available topics based on the search term
  const filteredTopics = availableTopics.filter(topic =>
    topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const addCustomTopic = () => {
    if (customTopic.trim() && !selectedTopics.includes(customTopic.trim())) {
      setSelectedTopics(prev => [...prev, customTopic.trim()]);
      setCustomTopic('');
    }
  };

  const handleNext = () => {
    if (selectedTopics.length === 0) {
      return;
    }
    onNext(selectedTopics);
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
          <h1 className="text-5xl font-bold text-gradient floating-animation">
            Select Topics
          </h1>
          <p className="text-xl text-muted-foreground">
            {availableTopics.length > 0
              ? "Select from the topics detected in your document, or add your own."
              : "No topics detected. Please add custom topics to proceed."
            }
          </p>
        </div>

        {/* Search Bar (only shown if there are topics to search) */}
        {availableTopics.length > 0 && (
          <Card className="card-gradient border-primary/20 p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search detected topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input/50 border-primary/30 text-foreground"
              />
            </div>
          </Card>
        )}

        {/* Selected Topics */}
        {selectedTopics.length > 0 && (
          <Card className="card-gradient border-primary/20 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Selected Topics ({selectedTopics.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedTopics.map((topic, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-primary/20 text-primary border-primary/30 px-3 py-1 cursor-pointer hover:bg-primary/30"
                  onClick={() => toggleTopic(topic)}
                >
                  {topic}
                  <Check className="w-4 h-4 ml-1" />
                </Badge>
              ))}
            </div>
          </Card>
        )}
        
        {/* Detected Topics Grid (only shown if there are topics) */}
        {availableTopics.length > 0 && (
          <Card className="card-gradient border-primary/20 p-8 hover-lift glow-effect">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                Detected Topics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTopics.map((topic) => {
                  const isSelected = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      onClick={() => toggleTopic(topic)}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 font-medium hover-lift ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105'
                          : 'bg-card text-card-foreground border-primary/30 hover:border-primary/60 hover:bg-primary/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{topic}</span>
                        {isSelected && <Check className="w-4 h-4 ml-2" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* Custom Topic Input */}
        <Card className="card-gradient border-primary/20 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Add Custom Topic
          </h3>
          <div className="flex space-x-3">
            <Input
              placeholder="Enter custom topic..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomTopic()}
              className="flex-1 bg-input/50 border-primary/30 text-foreground"
            />
            <Button
              onClick={addCustomTopic}
              variant="outline"
              disabled={!customTopic.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
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
            disabled={selectedTopics.length === 0}
          >
            Proceed to Difficulty Selection
          </Button>
        </div>
      </div>
    </div>
  );
};
