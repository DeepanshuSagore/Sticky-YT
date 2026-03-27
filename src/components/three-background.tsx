"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 1500;
    const buffer = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const radius = 0.5 + pseudoRandom(i + 1) * 2.2;
      const theta = pseudoRandom(i + 31) * Math.PI * 2;
      const phi = Math.acos(2 * pseudoRandom(i + 97) - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      buffer[i * 3] = x;
      buffer[i * 3 + 1] = y;
      buffer[i * 3 + 2] = z;
    }

    return buffer;
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) {
      return;
    }

    const elapsed = clock.getElapsedTime();
    pointsRef.current.rotation.y = elapsed * 0.02;
    pointsRef.current.rotation.x = Math.sin(elapsed * 0.1) * 0.08;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ff3232"
        size={0.018}
        transparent
        opacity={0.4}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

export function ThreeBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-20 opacity-75">
      <Canvas camera={{ position: [0, 0, 2.2], fov: 58 }}>
        <ambientLight intensity={0.15} />
        <Particles />
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,60,60,0.14)_0%,rgba(0,0,0,0.65)_46%,rgba(0,0,0,0.92)_100%)]" />
    </div>
  );
}
