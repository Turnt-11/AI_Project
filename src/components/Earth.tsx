import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Mesh, DoubleSide, Group, Color, Vector3 } from 'three';

export default function Earth() {
  const groupRef = useRef<Group>(null);
  const earthRef = useRef<Mesh>(null);
  const cloudsRef = useRef<Mesh>(null);
  const atmosphereRef = useRef<Mesh>(null);
  const gridRef = useRef<Mesh>(null);
  const grid2Ref = useRef<Mesh>(null);
  const grid3Ref = useRef<Mesh>(null);

  const [colorMap, normalMap, specularMap, cloudsMap] = useTexture([
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
  ]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const earthRotationSpeed = 0.15;
    
    if (earthRef.current) {
      earthRef.current.rotation.y = time * earthRotationSpeed;
    }

    if (gridRef.current) {
      gridRef.current.rotation.y = time * earthRotationSpeed;
    }
    if (grid2Ref.current) {
      grid2Ref.current.rotation.y = time * earthRotationSpeed;
    }
    if (grid3Ref.current) {
      grid3Ref.current.rotation.y = time * earthRotationSpeed;
    }

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = time * (earthRotationSpeed * 1.3);
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = time * earthRotationSpeed;
    }
  });

  return (
    <group ref={groupRef} scale={[1.5, 1.5, 1.5]}>
      {/* Earth Core */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          map={colorMap}
          normalMap={normalMap}
          specularMap={specularMap}
          shininess={5}
        />
      </mesh>

      {/* Grid layers */}
      <mesh ref={gridRef} scale={[1.01, 1.01, 1.01]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial
          color={new Color(0x00ff00)}
          wireframe={true}
          transparent={true}
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={grid2Ref} scale={[1.015, 1.015, 1.015]}>
        <icosahedronGeometry args={[1, 3]} />
        <meshBasicMaterial
          color={new Color(0x00ff00)}
          wireframe={true}
          transparent={true}
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={grid3Ref} scale={[1.02, 1.02, 1.02]}>
        <octahedronGeometry args={[1, 4]} />
        <meshBasicMaterial
          color={new Color(0x00ff00)}
          wireframe={true}
          transparent={true}
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* Clouds Layer */}
      <mesh ref={cloudsRef} scale={[1.003, 1.003, 1.003]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          map={cloudsMap}
          transparent={true}
          opacity={0.4}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>

      {/* Atmosphere Glow */}
      <mesh ref={atmosphereRef} scale={[1.02, 1.02, 1.02]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          color="#4444ff"
          transparent={true}
          opacity={0.1}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
}