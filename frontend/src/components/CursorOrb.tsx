import React, { useEffect, useRef } from 'react';

// Full-screen soft light centered at the cursor with no lag
const CursorOrb: React.FC = () => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    const update = (x: number, y: number) => {
      // Large, feathered gradient simulating light pool
      el.style.background = `radial-gradient(
        180px 180px at ${x}px ${y}px,
        rgba(255,255,255,0.22) 0%,
        rgba(255,255,255,0.16) 24%,
        rgba(34,211,238,0.12) 42%,
        rgba(124,58,237,0.10) 58%,
        rgba(255,255,255,0.0) 75%
      )`;
    };

    const onMove = (e: MouseEvent) => update(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        update(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onTouch, { passive: true });
    // Initialize at center
    update(window.innerWidth / 2, window.innerHeight / 2);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 pointer-events-none z-[60]"
      style={{ mixBlendMode: 'screen', willChange: 'background' }}
    />
  );
};

export default CursorOrb;


