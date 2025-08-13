import React, { useEffect, useRef } from 'react';

// Medium interactive starfield + network grid
const Background3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    type Star = { x: number; y: number; z: number; size: number; speed: number; twinkle: number; originalX: number; originalY: number };
    let stars: Star[] = [];

    const makeStar = (): Star => ({
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: Math.random(),
      size: Math.random() * 1.6 + 0.4,
      speed: Math.random() * 0.004 + 0.0015,
      twinkle: Math.random() * Math.PI * 2,
      originalX: Math.random() * window.innerWidth,
      originalY: Math.random() * window.innerHeight,
    });

    // Enhanced grid data
    type GridNode = { bx: number; by: number; phase: number; originalX: number; originalY: number };
    let grid: GridNode[][] = [];
    let cols = 0;
    let rows = 0;
    let spacing = 64;

    const init = () => {
      const count = Math.min(550, Math.max(140, Math.floor((window.innerWidth * window.innerHeight) / 4500)));
      stars = Array.from({ length: count }, makeStar);

      // Init grid sized to canvas
      const w = canvas.width;
      const h = canvas.height;
      spacing = Math.max(48, Math.min(84, Math.round(Math.min(w, h) / 18)));
      cols = Math.ceil(w / spacing) + 2;
      rows = Math.ceil(h / spacing) + 2;
      grid = [];
      for (let y = 0; y < rows; y++) {
        const row: GridNode[] = [];
        for (let x = 0; x < cols; x++) {
          row.push({ 
            bx: x * spacing - spacing, 
            by: y * spacing - spacing, 
            phase: Math.random() * Math.PI * 2,
            originalX: x * spacing - spacing,
            originalY: y * spacing - spacing,
          });
        }
        grid.push(row);
      }
    };

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', onMove);

    // Calculate distance between two points
    const distance = (x1: number, y1: number, x2: number, y2: number) => {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    };

    // Medium interaction function
    const getInteractionStrength = (x: number, y: number, maxDistance: number = 150) => {
      const dist = distance(mouse.x, mouse.y, x, y);
      if (dist > maxDistance) return 0;
      return 1 - (dist / maxDistance);
    };

    const draw = () => {
      const { width, height } = canvas;
      const cx = width / 2;
      const cy = height / 2;
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      // Medium star rendering with cursor interaction
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.z -= s.speed;
        s.twinkle += 0.02;
        if (s.z <= 0.02) {
          stars[i] = makeStar();
          continue;
        }

        const fov = 300;
        const scale = fov / (fov * s.z);
        const sx = s.x * width * 0.5 * scale + cx;
        const sy = s.y * height * 0.5 * scale + cy;
        if (sx < -50 || sx > width + 50 || sy < -50 || sy > height + 50) continue;

        // Medium cursor interaction for stars
        const interaction = getInteractionStrength(sx, sy, 120);
        const cursorPullX = (mouse.x - sx) * interaction * 0.15;
        const cursorPullY = (mouse.y - sy) * interaction * 0.15;
        
        const finalX = sx + cursorPullX;
        const finalY = sy + cursorPullY;

        const brightness = 0.6 + Math.sin(s.twinkle) * 0.4 + interaction * 0.2;
        const r = Math.max(0.5, s.size * scale * (1 + interaction * 0.3));

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${0.45 * brightness})`;
        ctx.arc(finalX, finalY, r, 0, Math.PI * 2);
        ctx.fill();

        // Medium glow effect based on interaction
        const glowIntensity = r * 2.2 * (1 + interaction * 1.2);
        ctx.shadowColor = `rgba(255,255,255,${0.6 + interaction * 0.2})`;
        ctx.shadowBlur = glowIntensity;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Medium network grid overlay with cursor interaction
      const parallaxX = ((mouse.x - width / 2) / width) * 18; // Reduced from 25
      const parallaxY = ((mouse.y - height / 2) / height) * 18; // Reduced from 25
      
      ctx.lineWidth = 1;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const node = grid[y][x];
          const wobbleX = Math.sin(time * 0.8 + node.phase) * 3;
          const wobbleY = Math.cos(time * 0.9 + node.phase) * 3;
          
          // Medium cursor interaction for grid nodes
          const interaction = getInteractionStrength(node.bx + parallaxX, node.by + parallaxY, 140);
          const cursorPullX = (mouse.x - (node.bx + parallaxX)) * interaction * 0.4;
          const cursorPullY = (mouse.y - (node.by + parallaxY)) * interaction * 0.4;
          
          const nx = node.bx + wobbleX + parallaxX + cursorPullX;
          const ny = node.by + wobbleY + parallaxY + cursorPullY;
          
          if (x + 1 < cols) {
            const n2 = grid[y][x + 1];
            const n2Interaction = getInteractionStrength(n2.bx + parallaxX, n2.by + parallaxY, 140);
            const n2CursorPullX = (mouse.x - (n2.bx + parallaxX)) * n2Interaction * 0.4;
            const n2CursorPullY = (mouse.y - (n2.by + parallaxY)) * n2Interaction * 0.4;
            
            const n2x = n2.bx + Math.sin(time * 0.8 + n2.phase) * 3 + parallaxX + n2CursorPullX;
            const n2y = n2.by + Math.cos(time * 0.9 + n2.phase) * 3 + parallaxY + n2CursorPullY;
            
            const pulse = 0.35 + 0.35 * Math.sin(time + node.phase);
            const lineInteraction = Math.max(interaction, n2Interaction);
            const enhancedAlpha = 0.06 + pulse * 0.06 + lineInteraction * 0.08;
            ctx.strokeStyle = `rgba(66, 211, 255, ${enhancedAlpha})`;
            ctx.lineWidth = 1 + lineInteraction * 1.2;
            ctx.beginPath();
            ctx.moveTo(nx, ny);
            ctx.lineTo(n2x, n2y);
            ctx.stroke();
          }
          
          if (y + 1 < rows) {
            const n3 = grid[y + 1][x];
            const n3Interaction = getInteractionStrength(n3.bx + parallaxX, n3.by + parallaxY, 140);
            const n3CursorPullX = (mouse.x - (n3.bx + parallaxX)) * n3Interaction * 0.4;
            const n3CursorPullY = (mouse.y - (n3.by + parallaxY)) * n3Interaction * 0.4;
            
            const n3x = n3.bx + Math.sin(time * 0.8 + n3.phase) * 3 + parallaxX + n3CursorPullX;
            const n3y = n3.by + Math.cos(time * 0.9 + n3.phase) * 3 + parallaxY + n3CursorPullY;
            
            const pulse = 0.35 + 0.35 * Math.cos(time + node.phase);
            const lineInteraction = Math.max(interaction, n3Interaction);
            const enhancedAlpha = 0.06 + pulse * 0.06 + lineInteraction * 0.08;
            ctx.strokeStyle = `rgba(124, 58, 237, ${enhancedAlpha})`;
            ctx.lineWidth = 1 + lineInteraction * 1.2;
            ctx.beginPath();
            ctx.moveTo(nx, ny);
            ctx.lineTo(n3x, n3y);
            ctx.stroke();
          }
          
          // Medium node rendering
          const nodeAlpha = 0.35 + 0.35 * Math.sin(time * 1.2 + node.phase);
          const enhancedNodeAlpha = nodeAlpha + interaction * 0.35;
          const nodeSize = 1.2 + interaction * 1.8;
          
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,255,255,${0.12 + enhancedNodeAlpha * 0.12})`;
          ctx.arc(nx, ny, nodeSize, 0, Math.PI * 2);
          ctx.fill();
          
          // Add subtle glow effect to nodes near cursor
          if (interaction > 0.2) {
            ctx.shadowColor = `rgba(66, 211, 255,${interaction * 0.4})`;
            ctx.shadowBlur = interaction * 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    const onResize = () => {
      resize();
    };

    onResize();
    window.addEventListener('resize', onResize);
    draw();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
  );
};

export default Background3D;