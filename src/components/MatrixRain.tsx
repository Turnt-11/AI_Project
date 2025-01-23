import { useEffect, useRef } from 'react';

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
    
    // Column setup
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];
    const delays: number[] = [];
    
    // Initialize drops and delays
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
      delays[i] = Math.random() * 100; // Random start delay for each column
    }

    const speed = 0.4; // Consistent fall speed
    let frame = 0;

    const draw = () => {
      // Semi-transparent black to create fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0';
      ctx.font = `${fontSize}px monospace`;

      frame++;

      // Drawing the characters
      for (let i = 0; i < drops.length; i++) {
        // Only start drawing if we've passed the column's delay
        if (frame > delays[i]) {
          // Random character
          const char = chars[Math.floor(Math.random() * chars.length)];
          
          // Varying opacity for visual interest
          const opacity = Math.random() * 0.5 + 0.5;
          ctx.fillStyle = `rgba(0, 255, 0, ${opacity})`;
          
          // Draw the character
          ctx.fillText(char, i * fontSize, drops[i] * fontSize);

          // Move the drop down
          drops[i] += speed;

          // Reset drop to top with a new delay when it reaches bottom
          if (drops[i] * fontSize > canvas.height) {
            drops[i] = 0;
            delays[i] = frame + Math.random() * 100;
          }
        }
      }

      requestAnimationFrame(draw);
    };

    const animation = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animation);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="opacity-40" // Reduced opacity to not overwhelm the scene
    />
  );
} 