import React, { useRef, useState } from 'react';
import { Upload, FileText, ArrowRight, Zap } from 'lucide-react';
import InteractiveOrb from './InteractiveOrb';

interface UploadStageProps {
  quizData: any;
  setQuizData: (data: any) => void;
  currentStage: string;
  setCurrentStage: (stage: any) => void;
}

const UploadStage: React.FC<UploadStageProps> = ({ quizData, setQuizData, setCurrentStage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf' || file.type === 'text/plain') {
      setQuizData({ ...quizData, file });
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => setCurrentStage('scanning'), 500);
        }
      }, 100);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Landing Hero: Centered brand + interactive 3D */}
      <div className="text-center mb-16 fade-in-up">
        <div className="flex justify-center mb-8 overflow-visible">
          <InteractiveOrb />
        </div>
        <h1 className="text-6xl md:text-8xl font-extrabold mb-6 bg-gradient-to-r from-cyan-200 via-white to-purple-300 bg-clip-text text-transparent leading-tight tracking-tight">
          Neocortex
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Precision learning, elevated by design and intelligence.
        </p>
      </div>

      {/* Secondary Heading */}
      <div className="text-center mb-12 fade-in-up stagger-2">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
          Upload & Transform
        </h2>
        <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Upload your study materials and let AI transform them into
          <span className="text-cyan-400 font-semibold"> interactive quizzes</span>
        </p>
      </div>

      {/* Upload Area */}
      <div className="relative mb-12 fade-in-up stagger-2">
        <div
          className={`
            relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-500 cursor-pointer
            ${dragOver 
              ? 'border-cyan-400 bg-cyan-400/5 scale-105' 
              : 'border-slate-600 hover:border-cyan-500'
            }
          `}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="glass-panel-strong p-12 md:p-20 text-center">
            <div className="relative mb-8">
              <div className={`
                w-20 h-20 mx-auto rounded-2xl flex items-center justify-center transition-all duration-500
                ${dragOver ? 'bg-cyan-400/20 scale-110' : 'bg-slate-700/50'}
              `}>
                <Upload className={`w-10 h-10 transition-colors duration-300 ${dragOver ? 'text-cyan-300' : 'text-slate-400'}`} />
              </div>
              {dragOver && (
                <div className="absolute inset-0 bg-cyan-400/20 rounded-2xl animate-ping"></div>
              )}
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {dragOver ? 'Drop your file here' : 'Drag & drop your study material'}
            </h3>
            <p className="text-lg text-slate-400 mb-8 max-w-md mx-auto">
              Upload PDF documents or text files. Our AI will analyze and create perfect quizzes.
            </p>

            <div className="premium-button inline-flex items-center space-x-3 text-white font-semibold">
              <FileText className="w-5 h-5" />
              <span>Choose File</span>
              <ArrowRight className="w-5 h-5" />
            </div>

            {/* Progress Bar */}
            {uploadProgress > 0 && (
              <div className="mt-8 max-w-md mx-auto">
                <div className="bg-slate-700/50 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-cyan-400 text-sm mt-2 font-medium">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
        />
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6 fade-in-up stagger-3">
        {[
          { icon: Zap, title: 'Instant Processing', desc: 'AI analyzes your content in seconds' },
          { icon: FileText, title: 'Smart Extraction', desc: 'Identifies key concepts automatically' },
          { icon: Upload, title: 'Any Format', desc: 'PDF, TXT, and more file types supported' }
        ].map((feature, index) => (
          <div key={index} className="glass-panel p-6 rounded-2xl group hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <feature.icon className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-slate-400">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadStage;