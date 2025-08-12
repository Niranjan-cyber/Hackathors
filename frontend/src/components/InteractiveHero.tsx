import React, { useEffect, useRef, useState } from 'react';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const InteractiveHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: -12, y: 18 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -40; // -20..20
      const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 40;  // -20..20
      setRotation({ x: clamp(rx, -24, 24), y: clamp(ry, -24, 24) });
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const size = 360; // base size of the cube
  const half = size / 2;

  return (
    <div className="relative flex items-center justify-center">
      <div
        ref={containerRef}
        className="relative"
        style={{ width: size, height: size, perspective: 1200 }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: 'transform 120ms ease-out',
          }}
        >
          {[
            { t: `translateZ(${half}px)`, g: 'linear-gradient(135deg,#22d3ee,#7c3aed)' },
            { t: `rotateY(180deg) translateZ(${half}px)`, g: 'linear-gradient(135deg,#f472b6,#22d3ee)' },
            { t: `rotateY(90deg) translateZ(${half}px)`, g: 'linear-gradient(135deg,#a78bfa,#06b6d4)' },
            { t: `rotateY(-90deg) translateZ(${half}px)`, g: 'linear-gradient(135deg,#06b6d4,#ec4899)' },
            { t: `rotateX(90deg) translateZ(${half}px)`, g: 'linear-gradient(135deg,#7c3aed,#14b8a6)' },
            { t: `rotateX(-90deg) translateZ(${half}px)`, g: 'linear-gradient(135deg,#14b8a6,#22d3ee)' },
          ].map((f, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                inset: 0,
                margin: 'auto',
                width: size,
                height: size,
                transform: f.t,
                background: f.g,
                borderRadius: 24,
                boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.25), 0 16px 60px rgba(34,211,238,0.22)',
                opacity: 0.95,
              }}
            />
          ))}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              margin: 'auto',
              width: size,
              height: size,
              transform: `translateZ(${half}px)`,
              borderRadius: 24,
              background: 'radial-gradient(closest-side, rgba(255,255,255,0.35), rgba(255,255,255,0) 70%)',
              mixBlendMode: 'screen',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default InteractiveHero;


