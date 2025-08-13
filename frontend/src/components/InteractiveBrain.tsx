import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Brain as BrainIcon } from 'lucide-react';

type Rotation = { x: number; y: number };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const InteractiveBrain: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [targetRot, setTargetRot] = useState<Rotation>({ x: -10, y: 18 });
  const rotRef = useRef<Rotation>({ x: -10, y: 18 });
  const rafRef = useRef<number | null>(null);

  // Auto idle wobble
  const timeRef = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientY - rect.top) / rect.height - 0.5) * -36; // -18..18
      const ny = ((e.clientX - rect.left) / rect.width - 0.5) * 36;  // -18..18
      setTargetRot({ x: clamp(nx, -22, 22), y: clamp(ny, -22, 22) });
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    const tick = () => {
      timeRef.current += 0.016;
      // Idle wobble subtly influences rotation
      const wobbleX = Math.sin(timeRef.current * 0.8) * 2.5;
      const wobbleY = Math.cos(timeRef.current * 0.7) * 2.5;

      rotRef.current.x = lerp(rotRef.current.x, targetRot.x + wobbleX, 0.12);
      rotRef.current.y = lerp(rotRef.current.y, targetRot.y + wobbleY, 0.12);

      if (containerRef.current) {
        const inner = containerRef.current.querySelector<HTMLDivElement>('[data-brain-inner]');
        if (inner) {
          inner.style.transform = `rotateX(${rotRef.current.x}deg) rotateY(${rotRef.current.y}deg)`;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetRot]);

  const layers = 20;
  const size = 420; // base size for desktop
  const depthStep = 12; // px per layer

  const layerStyles = useMemo(() => {
    return Array.from({ length: layers }).map((_, i) => {
      const t = i / (layers - 1); // 0..1
      const z = (i - (layers - 1) / 2) * depthStep;
      // Interpolate color from cyan to violet
      const h = 190 + t * 220; // 190..410 -> wraps but fine for HSL
      const s = 90;
      const l = 60 - t * 18;
      const opacity = 0.18 + (1 - Math.abs((i - (layers - 1) / 2) / ((layers - 1) / 2))) * 0.65;
      const strokeWidth = 1.2 + (1 - t) * 2.2;
      return { z, color: `hsl(${h}deg ${s}% ${l}%)`, opacity, strokeWidth };
    });
  }, [layers]);

  return (
    <div className="relative" ref={containerRef} style={{ perspective: 1200 }}>
      {/* Core glow */}
      <div
        aria-hidden
        className="absolute inset-0 blur-3xl"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 50%, rgba(34,211,238,0.25), rgba(124,58,237,0.18), rgba(0,0,0,0) 70%)',
          transform: 'translateZ(0)'
        }}
      />

      <div
        data-brain-inner
        className="relative"
        style={{
          transformStyle: 'preserve-3d',
          width: size,
          height: size,
          transition: 'transform 120ms ease-out',
        }}
      >
        {layerStyles.map((ls, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `translateZ(${ls.z}px)`,
              opacity: ls.opacity,
              filter: 'drop-shadow(0 14px 50px rgba(34,211,238,0.20))',
            }}
          >
            <BrainIcon
              size={size}
              strokeWidth={ls.strokeWidth}
              style={{ color: ls.color }}
              className="drop-shadow-[0_8px_30px_rgba(124,58,237,0.25)]"
            />
          </div>
        ))}

        {/* Front highlight */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            margin: 'auto',
            width: size,
            height: size,
            transform: `translateZ(${(layers * depthStep) / 2 + 12}px)`,
            background:
              'radial-gradient(closest-side, rgba(255,255,255,0.28), rgba(255,255,255,0) 70%)',
            borderRadius: 32,
            mixBlendMode: 'screen',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};

export default InteractiveBrain;



