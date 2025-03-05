import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Mesh, DoubleSide, Group, Color, Vector3 } from 'three';

// Define the type for capital cities
interface CapitalCity {
  name: string;
  lat: number;
  lng: number;
}

// Define the type for cities
interface City {
  name: string;
  lat: number;
  lng: number;
  size: number;
}

// Sample capital cities data (you can expand this)
const capitalCities: CapitalCity[] = [
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Paris", lat: 48.8566, lng: 2.3522 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { name: "Washington DC", lat: 38.8977, lng: -77.0365 },
  { name: "Beijing", lat: 39.9042, lng: 116.4074 },
  { name: "Moscow", lat: 55.7558, lng: 37.6173 },
  { name: "Berlin", lat: 52.5200, lng: 13.4050 },
  { name: "Rome", lat: 41.9028, lng: 12.4964 },
  // Add more capitals as needed
];

// City coordinates [latitude, longitude]
const cities: City[] = [
  // North America
  { name: "New York", lat: 40.7128, lng: -74.0060, size: 0.005 },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437, size: 0.005 },
  { name: "Chicago", lat: 41.8781, lng: -87.6298, size: 0.005 },
  { name: "Toronto", lat: 43.6532, lng: -79.3832, size: 0.005 },
  { name: "Mexico City", lat: 19.4326, lng: -99.1332, size: 0.005 },
  { name: "Vancouver", lat: 49.2827, lng: -123.1207, size: 0.005 },
  { name: "Miami", lat: 25.7617, lng: -80.1918, size: 0.005 },
  { name: "Dallas", lat: 32.7767, lng: -96.7970, size: 0.005 },
  
  // Europe
  { name: "London", lat: 51.5074, lng: -0.1278, size: 0.005 },
  { name: "Paris", lat: 48.8566, lng: 2.3522, size: 0.005 },
  { name: "Berlin", lat: 52.5200, lng: 13.4050, size: 0.005 },
  { name: "Rome", lat: 41.9028, lng: 12.4964, size: 0.005 },
  { name: "Madrid", lat: 40.4168, lng: -3.7038, size: 0.005 },
  { name: "Amsterdam", lat: 52.3676, lng: 4.9041, size: 0.005 },
  { name: "Brussels", lat: 50.8503, lng: 4.3517, size: 0.005 },
  { name: "Vienna", lat: 48.2082, lng: 16.3738, size: 0.005 },
  { name: "Stockholm", lat: 59.3293, lng: 18.0686, size: 0.005 },
  { name: "Athens", lat: 37.9838, lng: 23.7275, size: 0.005 },
  
  // Asia
  { name: "Tokyo", lat: 35.6762, lng: 139.6503, size: 0.005 },
  { name: "Beijing", lat: 39.9042, lng: 116.4074, size: 0.005 },
  { name: "New Delhi", lat: 28.6139, lng: 77.2090, size: 0.005 },
  { name: "Seoul", lat: 37.5665, lng: 126.9780, size: 0.005 },
  { name: "Bangkok", lat: 13.7563, lng: 100.5018, size: 0.005 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198, size: 0.005 },
  
  // Africa
  { name: "Cairo", lat: 30.0444, lng: 31.2357, size: 0.005 },
  { name: "Lagos", lat: 6.5244, lng: 3.3792, size: 0.005 },
  { name: "Nairobi", lat: 1.2921, lng: 36.8219, size: 0.005 },
  { name: "Cape Town", lat: -33.9249, lng: 18.4241, size: 0.005 },
  
  // South America
  { name: "São Paulo", lat: -23.5505, lng: -46.6333, size: 0.005 },
  { name: "Buenos Aires", lat: -34.6037, lng: -58.3816, size: 0.005 },
  { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729, size: 0.005 },
  { name: "Lima", lat: -12.0464, lng: -77.0428, size: 0.005 },
  { name: "Bogotá", lat: 4.7110, lng: -74.0721, size: 0.005 },
  
  // Australia/Oceania
  { name: "Sydney", lat: -33.8688, lng: 151.2093, size: 0.005 },
  { name: "Melbourne", lat: -37.8136, lng: 144.9631, size: 0.005 },
  { name: "Auckland", lat: -36.8509, lng: 174.7645, size: 0.005 }
];

// Helper function to convert lat/lng to 3D coordinates
function latLngToVector3(lat: number, lng: number, radius: number): Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new Vector3(x, y, z);
}

export default function Earth() {
  const groupRef = useRef<Group>(null);
  const earthRef = useRef<Mesh>(null);
  const cloudsRef = useRef<Mesh>(null);
  const atmosphereRef = useRef<Mesh>(null);
  const gridRefs = Array(5).fill(0).map(() => useRef<Mesh>(null));

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

    // Remove individual marker rotations since they'll rotate with the Earth mesh
    gridRefs.forEach((ref) => {
      if (ref.current) {
        ref.current.rotation.y = time * earthRotationSpeed;
      }
    });

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = time * (earthRotationSpeed * 1.3);
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = time * earthRotationSpeed;
    }
  });

  return (
    <group ref={groupRef} scale={[1.5, 1.5, 1.5]}>
      {/* Earth Core with Markers */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          map={colorMap}
          normalMap={normalMap}
          specularMap={specularMap}
          shininess={5}
        />
        
        {/* Capital City Markers - Now children of the Earth mesh */}
        {capitalCities.map((city) => {
          const position = latLngToVector3(city.lat, city.lng, 1.007);
          return (
            <group key={city.name} position={position}>
              {/* Marker dot */}
              <mesh>
                <sphereGeometry args={[0.005, 16, 16]} />
                <meshBasicMaterial color={new Color(0xff0000)} />
              </mesh>
              {/* Marker glow */}
              <mesh>
                <sphereGeometry args={[0.008, 16, 16]} />
                <meshBasicMaterial 
                  color={new Color(0xff0000)} 
                  transparent={true} 
                  opacity={0.3}
                />
              </mesh>
              {/* Vertical line connecting to surface */}
              <mesh>
                <cylinderGeometry args={[0.001, 0.001, 0.02, 8]} />
                <meshBasicMaterial 
                  color={new Color(0xff0000)}
                  transparent={true}
                  opacity={0.5}
                />
              </mesh>
            </group>
          );
        })}
        
        {/* City markers - Now as children of the Earth mesh so they rotate with it */}
        {cities.map((city, index) => {
          const position = latLngToVector3(city.lat, city.lng, 1.007);
          return (
            <mesh key={`city-${index}`} position={position}>
              <sphereGeometry args={[city.size, 16, 16]} />
              <meshBasicMaterial color="red" />
            </mesh>
          );
        })}
      </mesh>

      {/* Multiple Grid Layers */}
      {/* Main latitude/longitude grid */}
      <mesh ref={gridRefs[0]} scale={[1.001, 1.001, 1.001]}>
        <sphereGeometry args={[1, 72, 36]} />
        <meshBasicMaterial
          color={new Color(0x00ff00)}
          wireframe={true}
          transparent={true}
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>

      {/* Diagonal grid pattern */}
      <mesh ref={gridRefs[1]} scale={[1.002, 1.002, 1.002]}>
        <icosahedronGeometry args={[1, 4]} />
        <meshBasicMaterial
          color={new Color(0x00ff00)}
          wireframe={true}
          transparent={true}
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>

      {/* Dense triangular grid */}
      <mesh ref={gridRefs[2]} scale={[1.003, 1.003, 1.003]}>
        <icosahedronGeometry args={[1, 5]} />
        <meshBasicMaterial
          color={new Color(0x00ff00)}
          wireframe={true}
          transparent={true}
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* Additional geometric patterns */}
      <mesh ref={gridRefs[3]} scale={[1.004, 1.004, 1.004]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial
          color={new Color(0x00ff00)}
          wireframe={true}
          transparent={true}
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Fine detail grid */}
      <mesh ref={gridRefs[4]} scale={[1.005, 1.005, 1.005]}>
        <sphereGeometry args={[1, 96, 48]} />
        <meshBasicMaterial
          color={new Color(0x00ff00)}
          wireframe={true}
          transparent={true}
          opacity={0.05}
          depthWrite={false}
        />
      </mesh>

      {/* Clouds Layer */}
      <mesh ref={cloudsRef} scale={[1.006, 1.006, 1.006]}>
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