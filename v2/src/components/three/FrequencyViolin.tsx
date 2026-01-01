"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Float, Line } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";

// Layer configuration
const LAYERS = {
  human: {
    texts: ["안녕", "음악", "연결", "사람", "목소리", "마음", "소리"],
    color: "#FFFDD0", // cream
    frequency: 0.5, // slow, smooth
    amplitude: 0.3,
    waveType: "sine" as const,
  },
  ai: {
    texts: ["01", "10", "function", "const", "return", "async", "await", "=>"],
    color: "#D4AF37", // gold
    frequency: 2.0, // fast, digital
    amplitude: 0.2,
    waveType: "square" as const,
  },
  music: {
    texts: ["♩", "♪", "♫", "♬", "𝄞", "♭", "♯"],
    color: "#65000B", // rosewood
    frequency: 1.0, // pure
    amplitude: 0.25,
    waveType: "sine" as const,
  },
};

// Generate violin outline points
function generateViolinOutline(pointCount: number = 100): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];

  for (let i = 0; i < pointCount; i++) {
    const t = (i / pointCount) * Math.PI * 2;

    // Violin body shape using parametric equations
    let x, y;

    if (t < Math.PI) {
      // Upper body
      const bodyT = t / Math.PI;
      x = Math.sin(t) * (1.2 + 0.3 * Math.sin(t * 2));
      y = Math.cos(t) * 1.5 + 0.5;
    } else {
      // Lower body
      const bodyT = (t - Math.PI) / Math.PI;
      x = Math.sin(t) * (1.0 + 0.2 * Math.sin(t * 2));
      y = Math.cos(t) * 1.2 - 0.3;
    }

    points.push(new THREE.Vector3(x, y, 0));
  }

  return points;
}

// Single floating text particle
interface TextParticleProps {
  text: string;
  position: [number, number, number];
  color: string;
  frequency: number;
  amplitude: number;
  waveType: "sine" | "square";
  delay: number;
}

function TextParticle({
  text,
  position,
  color,
  frequency,
  amplitude,
  waveType,
  delay
}: TextParticleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime + delay;

    // Apply different wave patterns based on type
    let wave: number;
    if (waveType === "square") {
      // Square wave for AI (digital feel)
      wave = Math.sign(Math.sin(time * frequency)) * amplitude;
    } else {
      // Sine wave for Human and Music (organic feel)
      wave = Math.sin(time * frequency) * amplitude;
    }

    meshRef.current.position.y = initialY + wave;

    // Subtle rotation
    meshRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;

    // Subtle scale pulse
    const scale = 1 + Math.sin(time * frequency * 0.5) * 0.05;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <Float
      speed={1}
      rotationIntensity={0.2}
      floatIntensity={0.3}
    >
      <Text
        ref={meshRef}
        position={position}
        fontSize={0.15}
        color={color}
        anchorX="center"
        anchorY="middle"
        font="/fonts/NotoSansKR-Regular.woff"
      >
        {text}
      </Text>
    </Float>
  );
}

// Waveform line
interface WaveformProps {
  points: THREE.Vector3[];
  color: string;
  frequency: number;
  amplitude: number;
}

function Waveform({ points, color, frequency, amplitude }: WaveformProps) {
  const animatedPoints = useRef<THREE.Vector3[]>(points.map(p => p.clone()));

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    for (let i = 0; i < points.length; i++) {
      const wave = Math.sin(time * frequency + i * 0.1) * amplitude * 0.1;
      animatedPoints.current[i].z = wave;
    }
  });

  const linePoints = useMemo(() =>
    points.map(p => [p.x, p.y, p.z] as [number, number, number]),
    [points]
  );

  return (
    <Line
      points={linePoints}
      color={color}
      lineWidth={2}
      transparent
      opacity={0.6}
    />
  );
}

// Main scene content
function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  // Generate particle positions within violin shape
  const particles = useMemo(() => {
    const allParticles: Array<{
      text: string;
      position: [number, number, number];
      color: string;
      frequency: number;
      amplitude: number;
      waveType: "sine" | "square";
      delay: number;
    }> = [];

    // Distribute particles for each layer
    Object.entries(LAYERS).forEach(([layerName, layer], layerIndex) => {
      layer.texts.forEach((text, textIndex) => {
        // Position particles in violin-like distribution
        const angle = (textIndex / layer.texts.length) * Math.PI * 2;
        const radius = 0.5 + Math.random() * 0.8;
        const x = Math.cos(angle) * radius * 0.8;
        const y = Math.sin(angle) * radius * 1.2;
        const z = (layerIndex - 1) * 0.2; // Slight depth separation

        allParticles.push({
          text,
          position: [x, y, z],
          color: layer.color,
          frequency: layer.frequency,
          amplitude: layer.amplitude,
          waveType: layer.waveType,
          delay: textIndex * 0.3 + layerIndex * 0.5,
        });
      });
    });

    return allParticles;
  }, []);

  // Violin outline points
  const violinPoints = useMemo(() => generateViolinOutline(80), []);

  // Rotate scene slightly based on mouse
  useFrame((state) => {
    if (!groupRef.current) return;

    const { mouse } = state;
    groupRef.current.rotation.y = mouse.x * 0.1;
    groupRef.current.rotation.x = mouse.y * 0.05;
  });

  // Scale based on viewport
  const scale = Math.min(viewport.width, viewport.height) * 0.35;

  return (
    <group ref={groupRef} scale={scale}>
      {/* Violin outline waveform */}
      <Waveform
        points={violinPoints}
        color="#D4AF37"
        frequency={1}
        amplitude={0.5}
      />

      {/* Text particles */}
      {particles.map((particle, index) => (
        <TextParticle
          key={`${particle.text}-${index}`}
          {...particle}
        />
      ))}

      {/* Center glow */}
      <mesh position={[0, 0, -0.5]}>
        <circleGeometry args={[0.8, 32]} />
        <meshBasicMaterial
          color="#D4AF37"
          transparent
          opacity={0.05}
        />
      </mesh>
    </group>
  );
}

// Main exported component
export default function FrequencyViolin() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
        }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <Scene />
      </Canvas>
    </div>
  );
}
