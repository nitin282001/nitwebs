/* eslint-disable react/no-unknown-property */
import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AtmosphereParticlesProps {
  count?: number;
  color?: string;
  velocityRef?: React.RefObject<number>;
}

function AtmosphereParticles({ count = 180, color = "#8b5cf6", velocityRef }: AtmosphereParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null!);

  const { positions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;     // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14; // z
    }
    return { positions: pos };
  }, [count]);

  useFrame((_state, delta) => {
    if (!pointsRef.current) return;
    const vel = velocityRef?.current || 0;
    pointsRef.current.rotation.y += delta * (0.04 + Math.abs(vel) * 0.12);
    pointsRef.current.rotation.x += delta * 0.015;
  });

  const particleTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.35, "rgba(168, 85, 247, 0.85)");
    gradient.addColorStop(0.75, "rgba(124, 58, 237, 0.25)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        color={color}
        map={particleTexture || undefined}
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export interface OrbitAtmosphereProps {
  velocityRef?: React.RefObject<number>;
  color?: string;
}

export default function OrbitAtmosphere({ velocityRef, color = "#8b5cf6" }: OrbitAtmosphereProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ powerPreference: "high-performance", antialias: false, alpha: true }}
      >
        <AtmosphereParticles count={180} color={color} velocityRef={velocityRef} />
      </Canvas>
    </div>
  );
}
