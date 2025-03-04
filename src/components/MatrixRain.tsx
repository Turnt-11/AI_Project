import { useEffect, useRef } from 'react';

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Matrix characters
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
    
    // Column setup
    const fontSize = 14;
    let columns = 0;
    let drops: number[] = [];
    let delays: number[] = [];
    
    // Initialize drops and delays
    const initializeArrays = () => {
      const { width } = container.getBoundingClientRect();
      columns = Math.floor(width / fontSize);
      drops = new Array(columns).fill(1);
      delays = new Array(columns).fill(0).map(() => Math.random() * 100);
    };

    // Set canvas size to container size
    const resizeCanvas = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      initializeArrays(); // Reinitialize arrays when canvas size changes
    };
    
    // Create a ResizeObserver to watch container size changes
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(container);
    
    // Initial setup
    resizeCanvas();
    initializeArrays();

    const speed = 0.4;
    let frame = 0;
    let animationId: number;

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0';
      ctx.font = `${fontSize}px monospace`;

      frame++;

      for (let i = 0; i < drops.length; i++) {
        if (frame > delays[i]) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          const opacity = Math.random() * 0.5 + 0.5;
          ctx.fillStyle = `rgba(0, 255, 0, ${opacity})`;
          ctx.fillText(char, i * fontSize, drops[i] * fontSize);

          drops[i] += speed;

          if (drops[i] * fontSize > canvas.height) {
            drops[i] = 0;
            delays[i] = frame + Math.random() * 100;
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0">
      <canvas
        ref={canvasRef}
        className="opacity-40"
      />
    </div>
  );
} 