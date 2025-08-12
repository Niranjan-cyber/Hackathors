import React, { useEffect, useRef, useState } from 'react';
import { Brain } from 'lucide-react';
import toast from 'react-hot-toast';

interface ScanningStageProps {
  quizData: any;
  setQuizData: (data: any) => void;
  currentStage: string;
  setCurrentStage: (stage: any) => void;
}

const ScanningStage: React.FC<ScanningStageProps> = ({ quizData, setQuizData, setCurrentStage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [extractionStatus, setExtractionStatus] = useState<string>('Initializing...');
  const [extractedTopics, setExtractedTopics] = useState<string[]>([]);

  // Extract topics from the uploaded file
  useEffect(() => {
    const extractTopics = async () => {
      if (!quizData.file) {
        setExtractionStatus('No file found');
        setTimeout(() => setCurrentStage('topics'), 2000);
        return;
      }

      try {
        setExtractionStatus('Uploading file...');
        
        const formData = new FormData();
        formData.append('file', quizData.file);

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/extract-topics/`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to extract topics');
        }

        const topics = await response.json();
        
        // Debug logging
        console.log('Backend response:', topics);
        console.log('Response type:', typeof topics);
        
        // Extract topics array from dictionary response
        const topicsArray = topics?.topics || [];
        setExtractedTopics(topicsArray);
        setExtractionStatus('Topics extracted successfully!');
        
        // Store extracted topics in quiz data
        setQuizData((prev: any) => ({
          ...prev,
          extractedTopics: topicsArray
        }));

        // Wait a bit to show success message, then proceed
        setTimeout(() => setCurrentStage('topics'), 2000);
        
      } catch (error) {
        console.error('Error extracting topics:', error);
        setExtractionStatus('Extraction failed, using default topics');
        toast.error('Failed to extract topics from file. Using default topics.');
        
        // Still proceed to topics stage with empty extracted topics
        setTimeout(() => setCurrentStage('topics'), 2000);
      }
    };

    // Start extraction after a short delay for visual effect
    const timer = setTimeout(extractTopics, 2000);
    return () => clearTimeout(timer);
  }, [quizData.file, setQuizData, setCurrentStage]);

  // Radar canvas animation (static, not tied to model)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let time = 0;

    const resize = () => {
      const side = Math.min(container.clientWidth, 520);
      canvas.width = side;
      canvas.height = side;
    };
    resize();

    const sparkles: Array<{ angle: number; radius: number; speed: number }> = [];
    for (let i = 0; i < 48; i++) {
      sparkles.push({ angle: Math.random() * Math.PI * 2, radius: 40 + Math.random() * 200, speed: 0.002 + Math.random() * 0.004 });
    }

    const draw = () => {
      const { width, height } = canvas;
      const cx = width / 2;
      const cy = height / 2;
      time += 1 / 60;

      ctx.clearRect(0, 0, width, height);

      // Background subtle glow
      const radial = ctx.createRadialGradient(cx, cy, 0, cx, cy, width / 2);
      radial.addColorStop(0, 'rgba(15, 23, 42, 0.0)');
      radial.addColorStop(1, 'rgba(15, 23, 42, 0.2)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);

      // Pulsing rings
      for (let i = 0; i < 4; i++) {
        const base = (time * 120 + i * 110) % (width);
        const r = 40 + base * 0.6;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        const alpha = 0.12 * (1 - (r / (width * 0.7)));
        ctx.strokeStyle = `rgba(34, 211, 238, ${Math.max(0, alpha)})`; // cyan
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Rotating sweep
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.9);
      const sweepAngle = Math.PI / 6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, width * 0.42, -sweepAngle / 2, sweepAngle / 2);
      ctx.closePath();
      const sweepGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, width * 0.42);
      sweepGrad.addColorStop(0, 'rgba(34, 211, 238, 0.35)');
      sweepGrad.addColorStop(1, 'rgba(34, 211, 238, 0.0)');
      ctx.fillStyle = sweepGrad;
      ctx.fill();
      ctx.restore();

      // Sparkles orbiting
      for (let i = 0; i < sparkles.length; i++) {
        const s = sparkles[i];
        s.angle += s.speed;
        const x = cx + Math.cos(s.angle) * s.radius;
        const y = cy + Math.sin(s.angle) * s.radius;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(124, 58, 237, 0.45)'; // purple
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Center node
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    const onResize = () => {
      resize();
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto text-center" ref={containerRef}>
      {/* Header */}
      <div className="mb-10 fade-in-up overflow-visible">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-28 h-28 glass-panel rounded-full flex items-center justify-center floating-card">
            <Brain className="w-14 h-14 text-cyan-400 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-conic from-cyan-400/25 via-purple-400/25 to-cyan-400/25 rounded-full animate-spin"></div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-[1.2] inline-block pb-2 bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            AI Processing
          </h1>
        </div>
        <p className="mt-2 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto pb-1">
          Relax while we prepare your interactive quiz experience.
        </p>
      </div>

      {/* Radar animation */}
      <div className="flex justify-center mb-16">
        <canvas ref={canvasRef} className="rounded-full shadow-[0_0_60px_rgba(34,211,238,0.15)]" />
      </div>

      {/* Status message */}
      <div className="glass-panel-strong p-6 rounded-2xl max-w-md mx-auto mb-8">
        <div className="text-cyan-400 font-semibold mb-2">Status</div>
        <div className="text-white">{extractionStatus}</div>
        {extractedTopics.length > 0 && (
          <div className="text-slate-400 text-sm mt-2">
            Found {extractedTopics.length} topics
          </div>
        )}
      </div>

      {/* Fun tag line (static) */}
      <div className="text-slate-400 text-sm">
        Tip: Hover around while the scanner sweeps — it looks cooler than it needs to.
      </div>
    </div>
  );
};

export default ScanningStage;