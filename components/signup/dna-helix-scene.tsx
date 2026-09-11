'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment } from '@react-three/drei'
import * as THREE from 'three'

function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)
  
  // Create DNA helix geometry
  const { positions, colors } = useMemo(() => {
    const positions: number[] = []
    const colors: number[] = []
    const turns = 4
    const pointsPerTurn = 40
    const totalPoints = turns * pointsPerTurn
    const radius = 1.5
    const height = 8
    
    for (let i = 0; i < totalPoints; i++) {
      const t = i / totalPoints
      const angle = t * turns * Math.PI * 2
      
      // First strand
      const x1 = Math.cos(angle) * radius
      const y1 = (t - 0.5) * height
      const z1 = Math.sin(angle) * radius
      positions.push(x1, y1, z1)
      
      // Second strand (offset by PI)
      const x2 = Math.cos(angle + Math.PI) * radius
      const y2 = (t - 0.5) * height
      const z2 = Math.sin(angle + Math.PI) * radius
      positions.push(x2, y2, z2)
      
      // Colors - medical blue gradient
      const colorIntensity = 0.5 + Math.sin(t * Math.PI) * 0.5
      colors.push(0.2, 0.5 + colorIntensity * 0.3, 0.9) // Blue for first strand
      colors.push(0.3 + colorIntensity * 0.3, 0.8, 0.9) // Teal for second strand
    }
    
    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
    }
  }, [])
  
  // Create connecting bars
  const barPositions = useMemo(() => {
    const bars: number[] = []
    const turns = 4
    const pointsPerTurn = 40
    const totalPoints = turns * pointsPerTurn
    const radius = 1.5
    const height = 8
    
    for (let i = 0; i < totalPoints; i += 4) {
      const t = i / totalPoints
      const angle = t * turns * Math.PI * 2
      
      const x1 = Math.cos(angle) * radius
      const y1 = (t - 0.5) * height
      const z1 = Math.sin(angle) * radius
      
      const x2 = Math.cos(angle + Math.PI) * radius
      const z2 = Math.sin(angle + Math.PI) * radius
      
      bars.push(x1, y1, z1, x2, y1, z2)
    }
    
    return new Float32Array(bars)
  }, [])
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = -state.clock.elapsedTime * 0.05
    }
  })
  
  // Floating particles
  const particlePositions = useMemo(() => {
    const positions: number[] = []
    for (let i = 0; i < 200; i++) {
      positions.push(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      )
    }
    return new Float32Array(positions)
  }, [])
  
  return (
    <>
      <group ref={groupRef}>
        {/* DNA Strands */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              args={[positions, 3]}
              attach="attributes-position"
              count={positions.length / 3}
              array={positions}
              itemSize={3}
            />
            <bufferAttribute
              args={[colors, 3]}
              attach="attributes-color"
              count={colors.length / 3}
              array={colors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.15}
            vertexColors
            transparent
            opacity={0.9}
            sizeAttenuation
          />
        </points>
        
        {/* Connecting lines */}
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              args={[barPositions, 3]}
              attach="attributes-position"
              count={barPositions.length / 3}
              array={barPositions}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#4a90d9" transparent opacity={0.3} />
        </lineSegments>
      </group>
      
      {/* Background particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            args={[particlePositions, 3]}
            attach="attributes-position"
            count={particlePositions.length / 3}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#60a5fa"
          transparent
          opacity={0.4}
          sizeAttenuation
        />
      </points>
    </>
  )
}

function HeartBeat() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      // Heartbeat pulsing effect
      const beat = Math.sin(state.clock.elapsedTime * 4) * 0.5 + 0.5
      const scale = 1 + beat * 0.15
      meshRef.current.scale.setScalar(scale)
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[4, 2, -3]}>
        <icosahedronGeometry args={[0.8, 2]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={0.3}
          transparent
          opacity={0.7}
          wireframe
        />
      </mesh>
    </Float>
  )
}

function MedicalCross() {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.3 - 2
    }
  })
  
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef} position={[-4, -2, -2]}>
        {/* Vertical bar */}
        <mesh>
          <boxGeometry args={[0.3, 1.2, 0.1]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={0.2}
            transparent
            opacity={0.8}
          />
        </mesh>
        {/* Horizontal bar */}
        <mesh>
          <boxGeometry args={[1.2, 0.3, 0.1]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={0.2}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>
    </Float>
  )
}

export default function DNAHelixScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#030712']} />
        <fog attach="fog" args={['#030712', 8, 25]} />
        
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#60a5fa" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        <DNAHelix />
        <HeartBeat />
        <MedicalCross />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  )
}
