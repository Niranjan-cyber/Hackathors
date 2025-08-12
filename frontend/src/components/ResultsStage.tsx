import React, { useState } from 'react';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import ResultsPdf from './ResultsPdf';
import { Trophy, Download, Mail, RotateCcw, Target, Clock, Brain, Star, ChevronDown, ChevronUp, FileText, X, Repeat } from 'lucide-react';
import toast from 'react-hot-toast';

interface ResultsStageProps {
  quizData: any;
  setQuizData: (data: any) => void;
  currentStage: string;
  setCurrentStage: (stage: any) => void;
}

const ResultsStage: React.FC<ResultsStageProps> = ({ quizData, setQuizData, setCurrentStage }) => {
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isEmailSending, setIsEmailSending] = useState(false);
  
  // Debug logging to see what's in quizData
  console.log('ResultsStage quizData:', quizData);
  console.log('extractedTopics:', quizData.extractedTopics);
  console.log('topics:', quizData.topics);
  
  const score = quizData.score || 0;
  const totalQuestions = quizData.questions?.length || quizData.count;
  const percentage = Math.round((score / totalQuestions) * 100);
  const timeSpent = quizData.timeSpent || 0;

  const getGrade = (percent: number) => {
    if (percent >= 90) return { grade: 'A+', color: 'from-emerald-400 to-green-500', message: 'Outstanding!' };
    if (percent >= 80) return { grade: 'A', color: 'from-blue-400 to-cyan-500', message: 'Excellent!' };
    if (percent >= 70) return { grade: 'B', color: 'from-purple-400 to-pink-500', message: 'Good Job!' };
    if (percent >= 60) return { grade: 'C', color: 'from-amber-400 to-orange-500', message: 'Fair!' };
    return { grade: 'D', color: 'from-red-400 to-rose-500', message: 'Needs Work!' };
  };

  const grade = getGrade(percentage);

  const topicStats = React.useMemo(() => {
    const stats: Record<string, { correct: number; total: number }> = {};
    const questions: any[] = Array.isArray(quizData.questions) ? quizData.questions : [];
    const answers: Record<string, string> = quizData.answers || {};
    
    for (const q of questions) {
      const topic = q.topic || 'General';
      if (!stats[topic]) stats[topic] = { correct: 0, total: 0 };
      stats[topic].total += 1;
      
      // Handle both snake_case and camelCase for correct answer
      const correctAnswer = q.correct_answer || q.correctAnswer;
      if (answers[q.id] === correctAnswer) stats[topic].correct += 1;
    }
    
    const entries = Object.entries(stats).map(([topic, { correct, total }]) => ({
      topic,
      correct,
      total,
      percent: total > 0 ? Math.round((correct / total) * 100) : 0,
    }));
    entries.sort((a, b) => (b.percent - a.percent) || a.topic.localeCompare(b.topic));
    return entries;
  }, [quizData.questions, quizData.answers]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleDifferentPdf = () => {
    setCurrentStage('upload');
  };

  const handleRetakeSameTopics = () => {
    const uniqueTopics = Array.from(new Set((quizData.questions || []).map((q: any) => q.topic).filter(Boolean)));
    const topicsToUse = uniqueTopics.length === 0 && Array.isArray(quizData.extractedTopics) ? quizData.extractedTopics : uniqueTopics;
    
    console.log('ResultsStage handleRetakeSameTopics - uniqueTopics:', uniqueTopics);
    console.log('ResultsStage handleRetakeSameTopics - topicsToUse:', topicsToUse);
    console.log('ResultsStage handleRetakeSameTopics - quizData before:', quizData);
    
    const updatedQuizData = { 
      ...quizData, 
      topics: topicsToUse, 
      presetTopics: true,
      extractedTopics: quizData.extractedTopics // Explicitly preserve
    };
    
    console.log('ResultsStage handleRetakeSameTopics - updatedQuizData:', updatedQuizData);
    setQuizData(updatedQuizData);
    setCurrentStage('topics');
  };

  const handleRetakeFailedTopics = () => {
    const failed = topicStats.filter(t => t.percent < 50).map(t => t.topic);
    if (failed.length === 0) {
      toast('No failed topics (<50%)', { icon: '✅', duration: 1500 });
      return;
    }
    
    console.log('ResultsStage handleRetakeFailedTopics - failed:', failed);
    console.log('ResultsStage handleRetakeFailedTopics - quizData before:', quizData);
    
    const updatedQuizData = { 
      ...quizData, 
      topics: failed,
      extractedTopics: quizData.extractedTopics // Explicitly preserve
    };
    
    console.log('ResultsStage handleRetakeFailedTopics - updatedQuizData:', updatedQuizData);
    setQuizData(updatedQuizData);
    setCurrentStage('difficulty');
  };

  const handleEmailResults = () => setShowEmailModal(true);

  const generatePdfBlob = async () => {
    try {
      const pdfDoc = <ResultsPdf quizData={quizData} />;
      const blob = await pdf(pdfDoc).toBlob();
      return blob;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  };

  const handleSendEmail = async () => {
    if (!emailInput.trim()) { 
      toast.error('Please enter a valid email address'); 
      return; 
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) { 
      toast.error('Please enter a valid email address'); 
      return; 
    }

    setIsEmailSending(true);
    
    try {
      // Show generating PDF toast
      const pdfToast = toast.loading('Generating PDF...');
      
      // Generate PDF blob
      const pdfBlob = await generatePdfBlob();
      
      toast.dismiss(pdfToast);
      const emailToast = toast.loading('Sending email...');
      
      // Create FormData for the email request
      const formData = new FormData();
      formData.append('to', emailInput);
      formData.append('subject', `Neocortex Quiz Results - ${percentage}% Score`);
      formData.append('body', `Hi there!

Your Neocortex quiz results are attached to this email.

Quiz Summary:
- Score: ${score}/${totalQuestions} (${percentage}%)
- Grade: ${grade.grade}
- Time Spent: ${formatTime(timeSpent)}
- Topics Covered: ${topicStats.map(t => t.topic).join(', ')}

Keep up the great work with your learning journey!

Best regards,
Neocortex Team`);
      
      // Create a File object from the blob
      const pdfFile = new File([pdfBlob], 'quiz-results.pdf', { type: 'application/pdf' });
      formData.append('file', pdfFile);

      // Send email request to backend
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/send-email`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      toast.dismiss(emailToast);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        toast.success(`Results sent to ${emailInput}!`, { duration: 3000 });
        setShowEmailModal(false);
        setEmailInput('');
      } else {
        throw new Error(result.message || 'Failed to send email');
      }
      
    } catch (error) {
      console.error('Email error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          toast.error('Email request timed out. Please try again.');
        } else {
          toast.error(error.message || 'Failed to send email');
        }
      } else {
        toast.error('Failed to send email');
      }
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleDownloadPDF = () => { toast.success('PDF downloaded successfully!', { duration: 1500 }); };

  const optionLabels = ['A', 'B', 'C', 'D'];
  const generateExplanation = (question: any, correctIndex: number) => {
    const topic = question.topic || 'the topic';
    const correctText = question.options?.[correctIndex] || 'the correct option';
    return `The correct choice emphasizes key principles of ${topic}. "${correctText}" best matches the definition or behavior asked. Compare it against the distractors — they either partially address the idea, invert cause/effect, or add irrelevant conditions.`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16 fade-in-up">
        <div className="w-32 h-32 mx-auto glass-panel rounded-full flex items-center justify-center mb-8 floating-card">
          <Trophy className="w-16 h-16 text-yellow-400" />
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 rounded-full animate-pulse"></div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 bg-clip-text text-transparent">
          Quiz Complete!
        </h1>
        <p className="text-2xl text-slate-300 max-w-3xl mx-auto">
          {grade.message} Here's how you performed on your quiz.
        </p>
      </div>

      {/* Main Results */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {/* Score Display */}
        <div className="lg:col-span-2">
          <div className="glass-panel-strong p-8 md:p-12 rounded-3xl text-center mb-8 fade-in-up">
            <div className="relative mb-8">
              {/* Ambient glow */}
              <div className="absolute -inset-6 blur-3xl bg-gradient-to-r from-blue-500/10 via-cyan-400/10 to-indigo-500/10 rounded-full" />

              {/* Circular Progress (premium) */}
              <svg className="w-80 h-80 mx-auto transform -rotate-90 relative" viewBox="0 0 100 100">
                {/* Subtle outer ring */}
                <circle cx="50" cy="50" r="47" stroke="rgba(148,163,184,0.25)" strokeWidth="1" fill="none" />

                {/* Background track */}
                <circle cx="50" cy="50" r="45" stroke="rgba(59,130,246,0.18)" strokeWidth="8" fill="none" />

                {/* Inner dashed ring for texture */}
                <circle cx="50" cy="50" r="38" stroke="rgba(148,163,184,0.25)" strokeWidth="1" fill="none" strokeDasharray="1 3" />

                {/* Tick marks */}
                {Array.from({ length: 40 }).map((_, i) => {
                  const a = (i / 40) * Math.PI * 2;
                  const x1 = 50 + Math.cos(a) * 41.5;
                  const y1 = 50 + Math.sin(a) * 41.5;
                  const x2 = 50 + Math.cos(a) * (i % 5 === 0 ? 45 : 43);
                  const y2 = 50 + Math.sin(a) * (i % 5 === 0 ? 45 : 43);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 5 === 0 ? 'rgba(148,163,184,0.45)' : 'rgba(148,163,184,0.25)'} strokeWidth={i % 5 === 0 ? 1.2 : 0.6} />;
                })}

                {/* Progress arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(59,130,246,0.45)]"
                />

                {/* Moving head dot on the arc */}
                <circle
                  cx={50 + 45 * Math.cos((percentage / 100) * 2 * Math.PI)}
                  cy={50 + 45 * Math.sin((percentage / 100) * 2 * Math.PI)}
                  r="2.5"
                  fill="#06b6d4"
                  className="drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]"
                />

                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center summary */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-extrabold text-white mb-1 tracking-tight">{percentage}%</div>
                  <div className="text-sm text-slate-400 mb-3">Accuracy</div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-400/20">{score} Correct</span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">{totalQuestions} Questions</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className={`inline-block px-6 py-3 rounded-full text-xl font-bold bg-gradient-to-r ${grade.color} text-white mb-4`}>
                Grade: {grade.grade}
              </div>
              <p className="text-slate-300 text-lg">{grade.message}</p>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-4 rounded-xl">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2 text-cyan-400" />
            Performance
            </h4>
            <div className="space-y-3">
              {topicStats.map((topic) => (
                <div key={topic.topic} className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">{topic.topic}</span>
                  <div className="text-right">
                    <div className="text-white font-semibold">{topic.correct}/{topic.total}</div>
                    <div className={`text-sm ${topic.percent < 50 ? 'text-rose-400' : 'text-cyan-400'}`}>{topic.percent}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-400" />
              Time Analysis
            </h4>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {formatTime(timeSpent)}
              </div>
              <div className="text-sm text-slate-400">
                {timeSpent > 0 ? `${Math.round(timeSpent / totalQuestions)}s per question` : 'No time data'}
              </div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl">
            <h4 className="text-lg font-semibold text-white mb-3">Difficulty Analysis</h4>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400 mb-1">
                {quizData.difficulty.charAt(0).toUpperCase() + quizData.difficulty.slice(1)}
              </div>
              <div className="text-sm text-slate-400">
                {percentage >= 70 ? 'Mastered' : percentage >= 50 ? 'Progressing' : 'Needs Practice'}
              </div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-green-400" />
              Quiz Topics
            </h4>
            <div className="space-y-2">
              {/* Show only the topics user selected for this quiz */}
              {(() => {
                const selectedTopics = quizData.topics || [];
                
                if (selectedTopics.length === 0) {
                  return <div className="text-slate-400 text-sm text-center">No topics selected</div>;
                }
                
                return selectedTopics.map((topic: string, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm truncate">{topic}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Retake Actions */}
      <div className="flex flex-wrap justify-center gap-4 mb-10 fade-in-up">
        <button onClick={handleRetakeSameTopics} className="premium-button px-6 py-3 flex items-center space-x-2" title="Use the same topics from this test">
          <Repeat className="w-5 h-5" />
          <span>Take test on same topics</span>
        </button>
        <button onClick={handleRetakeFailedTopics} className="glass-panel px-6 py-3 rounded-2xl flex items-center space-x-2 text-slate-300 hover:text-white transition-all duration-300 hover:scale-105" title="Only include topics below 50%">
          <Repeat className="w-5 h-5" />
          <span>Take test on failed topics</span>
        </button>
      </div>

      {/* Collapsible Detailed Report */}
      {Array.isArray(quizData.questions) && quizData.questions.length > 0 && (
        <div className="glass-panel-strong rounded-3xl mb-12 fade-in-up stagger-3 overflow-hidden">
          <button onClick={() => setShowDetailedReport(!showDetailedReport)} className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors duration-200">
            <div className="flex items-center">
              <FileText className="w-6 h-6 mr-3 text-cyan-400" />
              <h3 className="text-2xl font-bold text-white">Detailed Report</h3>
            </div>
            {showDetailedReport ? <ChevronUp className="w-6 h-6 text-slate-400" /> : <ChevronDown className="w-6 h-6 text-slate-400" />}
          </button>
          {showDetailedReport && (
            <div className="px-6 pb-6 space-y-6 border-t border-slate-700">
              {quizData.questions.map((q: any, idx: number) => {
                const userAnswer = quizData.answers?.[q.id];
                const correctAnswer = q.correct_answer || q.correctAnswer;
                const isCorrect = userAnswer === correctAnswer;
                return (
                  <div key={q.id} className="glass-panel p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-slate-400">Question {idx + 1}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isCorrect ? 'bg-green-500/15 text-green-400' : 'bg-rose-500/15 text-rose-400'}`}>{isCorrect ? 'Correct' : 'Incorrect'}</span>
                    </div>
                    <div className="text-white font-semibold mb-4">{q.question}</div>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className={`${userAnswer === undefined ? 'bg-slate-800/40' : isCorrect ? 'bg-green-500/10' : 'bg-rose-500/10'} p-4 rounded-xl`}>
                        <div className="text-xs text-slate-400 mb-1">Your Answer</div>
                        <div className="text-slate-200 text-sm">
                          {userAnswer === undefined ? <span className="text-slate-400">Not answered</span> : (<>
                            <span className="font-semibold text-slate-300 mr-2">{userAnswer}.</span>
                            {q.options?.[userAnswer]}
                          </>)}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-blue-500/10">
                        <div className="text-xs text-slate-400 mb-1">Correct Answer</div>
                        <div className="text-slate-200 text-sm">
                          <span className="font-semibold text-slate-300 mr-2">{correctAnswer}.</span>
                          {q.options?.[correctAnswer]}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                      <div className="text-xs text-slate-400 mb-1">Explanation</div>
                      <p className="text-slate-300 text-sm leading-relaxed">{`The correct choice emphasizes key principles of ${q.topic || 'the topic'}.`}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons (top row) */}
      <div className="flex flex-wrap justify-center gap-6 mb-4 fade-in-up stagger-3">
        <PDFDownloadLink document={<ResultsPdf quizData={quizData} />} fileName="quiz-report.pdf">
          {({ loading, error }) => (
            <button className="glass-panel px-8 py-4 rounded-2xl flex items-center space-x-3 text-slate-300 hover:text-white transition-all duration-300 hover:scale-105" disabled={loading} onClick={handleDownloadPDF}>
              <Download className="w-5 h-5" />
              <span>{loading ? 'Preparing...' : error ? 'Error' : 'Download Report'}</span>
            </button>
          )}
        </PDFDownloadLink>
        
        <button onClick={handleEmailResults} className="glass-panel px-8 py-4 rounded-2xl flex items-center space-x-3 text-slate-300 hover:text-white transition-all duration-300 hover:scale-105">
          <Mail className="w-5 h-5" />
          <span>Email Results</span>
        </button>
      </div>

      {/* Bottom single action */}
      <div className="flex justify-center mb-12 fade-in-up">
        <button onClick={handleDifferentPdf} className="premium-button px-8 py-4 flex items-center space-x-3">
          <RotateCcw className="w-5 h-5" />
          <span>Take quiz on different PDF</span>
        </button>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel-strong p-8 rounded-3xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Send Results</h3>
              <button onClick={() => { setShowEmailModal(false); setEmailInput(''); }} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-6">
              <label htmlFor="email" className="block text-slate-300 mb-2 font-medium">Email Address</label>
              <input type="email" id="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="Enter email address" className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none transition-all duration-300" onKeyDown={(e) => { if (e.key === 'Enter') { handleSendEmail(); } }} />
            </div>
            <div className="flex gap-4">
              <button onClick={() => { setShowEmailModal(false); setEmailInput(''); }} className="flex-1 glass-panel px-6 py-3 rounded-xl text-slate-300 hover:text-white transition-all duration-300">Cancel</button>
              <button onClick={handleSendEmail} disabled={isEmailSending || !emailInput.trim()} className="flex-1 premium-button px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">{isEmailSending ? 'Sending...' : 'Send'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Motivational Message */}
      <div className="glass-panel-strong p-8 rounded-3xl text-center fade-in-up stagger-4">
        <div className="text-4xl mb-4">{percentage >= 80 ? '🎉' : percentage >= 60 ? '💪' : '📚'}</div>
        <h3 className="text-2xl font-bold text-white mb-4">{percentage >= 80 ? 'Excellent Work!' : percentage >= 60 ? 'Keep Going!' : 'Keep Learning!'}</h3>
        <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">{percentage >= 80 ? "You've demonstrated strong mastery of the material. Consider challenging yourself with harder questions or exploring advanced topics." : percentage >= 60 ? "You're making good progress! Review the areas where you struggled and try again to reinforce your learning." : "Every quiz is a learning opportunity. Focus on understanding the concepts and don't hesitate to study the material before retaking."}</p>
      </div>
    </div>
  );
};

export default ResultsStage;