import React, { useState } from 'react';
import { Trophy, Download, Mail, CheckCircle, XCircle, Clock, Target, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

interface ResultsProps {
  questions: Question[];
  userAnswers: Record<number, number>;
  timeSpent: number; // in seconds
  onRestart: () => void;
}

export const Results: React.FC<ResultsProps> = ({ questions, userAnswers, timeSpent, onRestart }) => {
  const [email, setEmail] = useState('');
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Calculate results
  const totalQuestions = questions.length;
  const correctAnswers = questions.filter((q, index) => userAnswers[index] === q.correctAnswer).length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const timeFormatted = Math.floor(timeSpent / 60) + 'm ' + (timeSpent % 60) + 's';

  const getGrade = () => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-success', bgColor: 'bg-success/20' };
    if (percentage >= 80) return { grade: 'A', color: 'text-success', bgColor: 'bg-success/20' };
    if (percentage >= 70) return { grade: 'B', color: 'text-info', bgColor: 'bg-info/20' };
    if (percentage >= 60) return { grade: 'C', color: 'text-warning', bgColor: 'bg-warning/20' };
    return { grade: 'F', color: 'text-destructive', bgColor: 'bg-destructive/20' };
  };

  const grade = getGrade();

  const getTopicBreakdown = () => {
    const topicStats: Record<string, { correct: number; total: number }> = {};
    
    questions.forEach((q, index) => {
      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { correct: 0, total: 0 };
      }
      topicStats[q.topic].total++;
      if (userAnswers[index] === q.correctAnswer) {
        topicStats[q.topic].correct++;
      }
    });

    return Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      percentage: Math.round((stats.correct / stats.total) * 100),
      correct: stats.correct,
      total: stats.total
    }));
  };

  const topicBreakdown = getTopicBreakdown();

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Generate email content
  const generateEmailContent = () => {
    const resultsText = `
TEST RESULTS SUMMARY
===================

Overall Performance:
• Score: ${percentage}% (${correctAnswers}/${totalQuestions})
• Grade: ${grade.grade}
• Time Spent: ${timeFormatted}

Topic Breakdown:
${topicBreakdown.map(topic => 
  `• ${topic.topic}: ${topic.percentage}% (${topic.correct}/${topic.total})`
).join('\n')}

Detailed Question Review:
${questions.map((q, index) => {
  const userAnswer = userAnswers[index];
  const isCorrect = userAnswer === q.correctAnswer;
  return `
Q${index + 1}. ${q.question}
Your Answer: ${userAnswer !== undefined ? q.options[userAnswer] : 'Not answered'}
Correct Answer: ${q.options[q.correctAnswer]}
Result: ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
${q.explanation ? `Explanation: ${q.explanation}` : ''}
`;
}).join('\n')}

Generated on: ${new Date().toLocaleString()}
    `;
    return resultsText;
  };

  // Simulate email sending with actual content
  const handleEmailSend = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsEmailSending(true);
    
    try {
      // Simulate API call with actual email service
      const emailData = {
        to: email,
        subject: `Test Results - ${percentage}% Score`,
        content: generateEmailContent(),
        attachments: []
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, you would make an API call here:
      // const response = await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(emailData)
      // });

      console.log('Email would be sent with data:', emailData);
      toast.success(`Results sent successfully to ${email}!`);
      setEmail(''); // Clear email field after successful send
      
    } catch (error) {
      console.error('Email sending failed:', error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsEmailSending(false);
    }
  };

  // Generate and download PDF
  const handleDownloadPDF = () => {
    try {
      // Create PDF content as HTML string
      const pdfContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Results Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
        .score { font-size: 48px; font-weight: bold; color: #3b82f6; margin: 20px 0; }
        .grade { font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 10px; display: inline-block; }
        .grade-a { background: #dcfce7; color: #166534; }
        .grade-b { background: #dbeafe; color: #1d4ed8; }
        .grade-c { background: #fef3c7; color: #92400e; }
        .grade-f { background: #fee2e2; color: #dc2626; }
        .stats { display: flex; justify-content: space-around; margin: 30px 0; }
        .stat { text-align: center; }
        .stat-value { font-size: 32px; font-weight: bold; }
        .stat-label { color: #666; font-size: 14px; }
        .section { margin: 30px 0; }
        .section h2 { border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .topic-item { background: #f9fafb; padding: 15px; margin: 10px 0; border-radius: 8px; display: flex; justify-content: space-between; }
        .question { margin: 20px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .question-header { font-weight: bold; margin-bottom: 10px; }
        .options { margin: 15px 0; }
        .option { padding: 8px; margin: 5px 0; border-radius: 4px; }
        .correct { background: #dcfce7; color: #166534; }
        .incorrect { background: #fee2e2; color: #dc2626; }
        .neutral { background: #f3f4f6; color: #374151; }
        .explanation { background: #eff6ff; padding: 15px; border-radius: 8px; margin-top: 15px; }
        .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏆 Test Results Report</h1>
        <div class="score">${percentage}%</div>
        <div class="grade grade-${grade.grade.toLowerCase().replace('+', '')}">${grade.grade}</div>
    </div>

    <div class="stats">
        <div class="stat">
            <div class="stat-value" style="color: #16a34a;">${correctAnswers}</div>
            <div class="stat-label">Correct</div>
        </div>
        <div class="stat">
            <div class="stat-value" style="color: #dc2626;">${totalQuestions - correctAnswers}</div>
            <div class="stat-label">Incorrect</div>
        </div>
        <div class="stat">
            <div class="stat-value" style="color: #3b82f6;">${timeFormatted}</div>
            <div class="stat-label">Time Spent</div>
        </div>
    </div>

    <div class="section">
        <h2>📊 Performance by Topic</h2>
        ${topicBreakdown.map(topic => `
            <div class="topic-item">
                <span><strong>${topic.topic}</strong></span>
                <span>${topic.percentage}% (${topic.correct}/${topic.total})</span>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>📝 Detailed Question Review</h2>
        ${questions.map((q, index) => {
          const userAnswer = userAnswers[index];
          const isCorrect = userAnswer === q.correctAnswer;
          return `
            <div class="question">
                <div class="question-header">
                    Q${index + 1}. ${q.question}
                    <span style="float: right; color: ${isCorrect ? '#16a34a' : '#dc2626'}">
                        ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                </div>
                <div class="options">
                    ${q.options.map((option, optionIndex) => `
                        <div class="option ${
                          optionIndex === q.correctAnswer ? 'correct' : 
                          userAnswer === optionIndex ? 'incorrect' : 'neutral'
                        }">
                            ${String.fromCharCode(65 + optionIndex)}. ${option}
                            ${optionIndex === q.correctAnswer ? ' ✓' : ''}
                            ${userAnswer === optionIndex && optionIndex !== q.correctAnswer ? ' ✗ Your Answer' : ''}
                        </div>
                    `).join('')}
                </div>
                ${q.explanation ? `
                    <div class="explanation">
                        <strong>💡 Explanation:</strong> ${q.explanation}
                    </div>
                ` : ''}
            </div>
          `;
        }).join('')}
    </div>

    <div class="footer">
        <p>Report generated on ${new Date().toLocaleString()}</p>
        <p>Test Results System</p>
    </div>
</body>
</html>
      `;

      // Create blob and download
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `test-results-${percentage}%-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Results report downloaded successfully!");

    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error("Failed to generate report. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
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

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Trophy className="w-10 h-10 text-primary" />
            <h1 className="text-5xl font-bold text-gradient">
              Test Complete!
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Here are your detailed results
          </p>
        </div>

        {/* Score Card */}
        <Card className="card-gradient border-primary/20 p-8 text-center pulse-glow">
          <div className="space-y-6">
            <div className="text-8xl font-bold text-primary">
              {percentage}%
            </div>
            <div className={`inline-flex items-center space-x-2 text-2xl font-bold ${grade.color} ${grade.bgColor} px-6 py-3 rounded-full`}>
              <span>Grade: {grade.grade}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-success">{correctAnswers}</div>
                <div className="text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-destructive">{totalQuestions - correctAnswers}</div>
                <div className="text-muted-foreground">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{timeFormatted}</div>
                <div className="text-muted-foreground">Time Spent</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Topic Breakdown */}
        <Card className="card-gradient border-primary/20 p-6">
          <h3 className="text-2xl font-semibold text-foreground mb-6">Performance by Topic</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topicBreakdown.map((topic, index) => (
              <div key={index} className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-foreground">{topic.topic}</h4>
                  <Badge variant={topic.percentage >= 70 ? "default" : "destructive"}>
                    {topic.percentage}%
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {topic.correct}/{topic.total} correct
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email Results */}
          <Card className="card-gradient border-primary/20 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Email Results
            </h3>
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input/50 border-primary/30"
              />
              <Button
                onClick={handleEmailSend}
                variant="outline"
                className="w-full"
                disabled={isEmailSending}
              >
                {isEmailSending ? 'Sending...' : 'Send Results'}
              </Button>
            </div>
          </Card>

          {/* Download Report */}
          <Card className="card-gradient border-primary/20 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Download Report
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Download a comprehensive HTML report with all questions, answers, and explanations.
              </p>
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                className="w-full"
              >
                Download Report
              </Button>
            </div>
          </Card>
        </div>

        {/* Detailed Results Toggle */}
        <Card className="card-gradient border-primary/20 p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">
              Detailed Question Review
            </h3>
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </Card>

        {/* Detailed Question Review */}
        {showDetails && (
          <div className="space-y-4">
            {questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <Card key={index} className="card-gradient border-primary/20 p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg font-semibold text-foreground">
                            Q{index + 1}.
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {question.topic}
                          </Badge>
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-success" />
                          ) : (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <p className="text-foreground mb-4">{question.question}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg border-2 ${
                            optionIndex === question.correctAnswer
                              ? 'border-success bg-success/10 text-success'
                              : userAnswer === optionIndex
                              ? 'border-destructive bg-destructive/10 text-destructive'
                              : 'border-muted bg-muted/5 text-muted-foreground'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            <span>{option}</span>
                            {optionIndex === question.correctAnswer && (
                              <CheckCircle className="w-4 h-4 text-success ml-auto" />
                            )}
                            {userAnswer === optionIndex && optionIndex !== question.correctAnswer && (
                              <XCircle className="w-4 h-4 text-destructive ml-auto" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {question.explanation && (
                      <div className="mt-4 p-4 bg-info/10 border border-info/30 rounded-lg">
                        <h4 className="font-semibold text-info mb-2">Explanation:</h4>
                        <p className="text-muted-foreground">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Restart Button */}
        <div className="text-center">
          <Button onClick={onRestart} variant="default" size="xl">
            <RotateCcw className="w-5 h-5 mr-2" />
            Take Another Test
          </Button>
        </div>
      </div>
    </div>
  );
};