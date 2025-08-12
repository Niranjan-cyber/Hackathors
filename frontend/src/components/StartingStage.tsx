import React, { useEffect, useRef } from 'react';
import { Brain } from 'lucide-react';

interface StartingStageProps {
  quizData: any;
  setQuizData: (data: any) => void;
  currentStage: string;
  setCurrentStage: (stage: any) => void;
}

const StartingStage: React.FC<StartingStageProps> = ({ quizData, setQuizData, setCurrentStage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check if questions are ready and proceed to test
  useEffect(() => {
    const checkQuestionsAndProceed = async () => {
      // If questions are ready, check if translation is needed
      if (quizData.questions && quizData.questions.length > 0) {
        console.log('Questions ready, checking if translation is needed');
        console.log('Current language:', quizData.language);
        
        // If language is not English, translate the questions
        if (quizData.language && quizData.language !== 'en') {
          try {
            console.log('Translating questions to:', quizData.language);
            
            const formData = new FormData();
            formData.append('questions', JSON.stringify(quizData.questions));
            formData.append('target_language', quizData.language);
            
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/translate-questions/`, {
              method: 'POST',
              body: formData,
            });
            
            if (response.ok) {
              const translatedQuestions = await response.json();
              console.log('Questions translated successfully:', translatedQuestions.length);
              
              // Update quiz data with translated questions
              setQuizData((prev: any) => ({
                ...prev,
                questions: translatedQuestions
              }));
            } else {
              console.error('Translation failed, continuing with English questions');
            }
          } catch (error) {
            console.error('Error translating questions:', error);
            // Continue with English questions if translation fails
          }
        }
        
        // Proceed to test after a short delay
        setTimeout(() => setCurrentStage('test'), 3000); // 3 second delay for "Get Ready" page
      } else {
        console.log('Questions not ready yet, waiting...');
        // Check again in 2 seconds
        setTimeout(checkQuestionsAndProceed, 2000);
      }
    };

    checkQuestionsAndProceed();
  }, [quizData.questions, quizData.language, setCurrentStage, setQuizData]);

  // Full-screen aurora ribbons animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let time = 0;
    const mouse = { x: 0.5, y: 0.5 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', onMove);

    const colors = [
      'rgba(34, 211, 238, 0.20)',
      'rgba(124, 58, 237, 0.20)',
      'rgba(244, 63, 94, 0.18)',
      'rgba(59, 130, 246, 0.16)',
    ];

    const drawRibbon = (
      phase: number,
      amplitude: number,
      freq: number,
      color: string,
      verticalOffset: number
    ) => {
      const { width, height } = canvas;
      const h = height;
      const w = width;
      const baseY = h * verticalOffset;

      ctx.beginPath();
      ctx.moveTo(0, baseY);
      const step = Math.max(12, Math.floor(w / 140));
      for (let x = 0; x <= w; x += step) {
        const t = (x / w) * Math.PI * 2 * freq + time * 0.8 + phase + mouse.x * 1.2;
        const y = baseY + Math.sin(t) * amplitude * (0.7 + mouse.y * 0.6);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();

      // Fill with soft color and add a subtle highlight stroke
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = color.replace('0.2', '0.35').replace('0.18', '0.3').replace('0.16', '0.26');
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    const draw = () => {
      const { width, height } = canvas;
      time += 0.016;

      // Clear with transparent to preserve page gradient and star bg
      ctx.clearRect(0, 0, width, height);

      // Soft vignette
      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        0,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.6
      );
      vignette.addColorStop(0, 'rgba(15,23,42,0.0)');
      vignette.addColorStop(1, 'rgba(15,23,42,0.18)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'screen';

      // Multiple layered ribbons
      drawRibbon(0.0, height * 0.12, 1.0, colors[0], 0.35);
      drawRibbon(1.2, height * 0.10, 1.4, colors[1], 0.50);
      drawRibbon(2.1, height * 0.09, 1.8, colors[2], 0.62);
      drawRibbon(3.4, height * 0.11, 1.2, colors[3], 0.78);

      ctx.globalCompositeOperation = 'source-over';

      raf = requestAnimationFrame(draw);
    };

    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Show loading page if questions are not ready
  if (!quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="glass-panel-strong p-12 rounded-3xl">
          <div className="animate-spin w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-4">Generating Questions</h2>
          <p className="text-slate-400 mb-6">Our AI is creating personalized questions for you...</p>
          <div className="space-y-2 text-sm text-slate-500">
            <p>• Analyzing your selected topics</p>
            <p>• Creating questions based on difficulty level</p>
            <p>• This may take a few minutes</p>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="relative min-h-screen">
      {/* Full-screen aurora backdrop */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Overlay content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 text-center">
        <div>
          <div className="relative w-24 h-24 mx-auto mb-5 glass-panel rounded-full flex items-center justify-center floating-card">
            <Brain className="w-12 h-12 text-cyan-400 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-conic from-cyan-400/25 via-purple-400/25 to-cyan-400/25 rounded-full animate-spin"></div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-[1.2] inline-block pb-1 bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            Get Ready
          </h1>
          <p className="mt-2 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Setting up your test experience. This will be automatic.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StartingStage;