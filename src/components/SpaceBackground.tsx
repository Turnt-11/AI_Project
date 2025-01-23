import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Earth from './Earth';
import MatrixRain from './MatrixRain';
import { useRef } from 'react';

function AnimatedStars() {
  const starsRef = useRef();

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    if (starsRef.current) {
      starsRef.current.rotation.y = elapsedTime * 0.01; // Slow rotation
      starsRef.current.rotation.x = Math.sin(elapsedTime * 0.1) * 0.05; // Slight up and down motion
    }
  });

  return (
    <Stars 
      ref={starsRef}
      radius={300}
      depth={100}
      count={7000}
      factor={4}
      saturation={0}
      fade
      speed={0.5}
    />
  );
}

export default function SpaceBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
      <div className="absolute inset-0 z-0">
        <MatrixRain />
      </div>
      <Canvas 
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: true }}
        className="relative z-10"
      >
        <AnimatedStars />
        
        {/* Enhanced lighting for Earth */}
        <ambientLight intensity={0.1} />
        <pointLight 
          position={[100, 10, -50]} 
          intensity={1.5}
          color="#ffffff"
        />
        
        <Earth />
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          rotateSpeed={0.3}
          zoomSpeed={0.5}
          minDistance={2}
          maxDistance={8}
          autoRotate={false}
        />
      </Canvas>
      <style>
        {`
          .space-background {
            position: fixed;
            inset: 0;
            background-color: black;
            animation: rotateBackground 120s linear infinite;
          }

          @keyframes rotateBackground {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}