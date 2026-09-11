'use client'

import { Environment } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function SceneCameraRig() {
  const { camera, pointer, viewport } = useThree()
  const targetX = viewport.width < 7 ? 0 : 0.25

  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.4, 0.028)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.2, 0.028)
    camera.lookAt(targetX, 0, 0)
  })

  return null
}

function OrbitalNode({
  angleOffset,
  radius,
  speed,
  verticalOffset,
  color,
  size,
}: {
  angleOffset: number
  radius: number
  speed: number
  verticalOffset: number
  color: string
  size: number
}) {
  const nodeRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!nodeRef.current) {
      return
    }

    const t = clock.elapsedTime * speed + angleOffset
    nodeRef.current.position.x = Math.cos(t) * radius
    nodeRef.current.position.z = Math.sin(t) * radius
    nodeRef.current.position.y = verticalOffset + Math.sin(t * 1.8) * 0.15
  })

  return (
    <mesh ref={nodeRef}>
      <sphereGeometry args={[size, 18, 18]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.82}
        metalness={0.38}
        roughness={0.18}
      />
    </mesh>
  )
}

function OrbitalRing({
  rotation,
  radius,
  color,
  tube = 0.012,
  opacity = 0.42,
}: {
  rotation: [number, number, number]
  radius: number
  color: string
  tube?: number
  opacity?: number
}) {
  return (
    <mesh rotation={rotation}>
      <torusGeometry args={[radius, tube, 14, 160]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={opacity}
        metalness={0.18}
        roughness={0.28}
      />
    </mesh>
  )
}

function OrbitalCluster() {
  const clusterRef = useRef<THREE.Group>(null)
  const shellRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)
  const { viewport } = useThree()

  const nodeConfig = useMemo(
    () => [
      { angleOffset: 0.15, radius: 1.95, speed: 0.28, verticalOffset: 0.1, color: '#7dd3fc', size: 0.095 },
      { angleOffset: 1.35, radius: 2.4, speed: 0.22, verticalOffset: -0.24, color: '#67e8f9', size: 0.105 },
      { angleOffset: 2.45, radius: 1.7, speed: 0.34, verticalOffset: 0.35, color: '#5eead4', size: 0.09 },
      { angleOffset: 3.8, radius: 2.85, speed: 0.18, verticalOffset: 0.08, color: '#c4f1ff', size: 0.115 },
      { angleOffset: 5.2, radius: 2.15, speed: 0.26, verticalOffset: -0.14, color: '#99f6e4', size: 0.1 },
    ],
    [],
  )
  const compactLayout = viewport.width < 8
  const targetPositionX = compactLayout ? 0 : -0.4
  const targetScale = compactLayout ? 0.78 : Math.min(1.02, viewport.width / 11)

  useFrame(({ clock, pointer }) => {
    const elapsed = clock.elapsedTime

    if (clusterRef.current) {
      clusterRef.current.rotation.y = elapsed * 0.12
      clusterRef.current.rotation.x = Math.sin(elapsed * 0.4) * 0.08 - pointer.y * 0.05
      clusterRef.current.scale.setScalar(targetScale * (1 + Math.sin(elapsed * 1.1) * 0.035))
      clusterRef.current.position.x = THREE.MathUtils.lerp(
        clusterRef.current.position.x,
        targetPositionX + pointer.x * (compactLayout ? 0.08 : 0.18),
        0.025,
      )
      clusterRef.current.position.y = THREE.MathUtils.lerp(
        clusterRef.current.position.y,
        (compactLayout ? 0.05 : 0) + pointer.y * 0.12,
        0.025,
      )
    }

    if (shellRef.current) {
      shellRef.current.rotation.y = -elapsed * 0.16
      shellRef.current.rotation.z = Math.sin(elapsed * 0.35) * 0.1
    }

    if (innerRef.current) {
      innerRef.current.rotation.x = elapsed * 0.08
      innerRef.current.rotation.z = elapsed * 0.06
    }
  })

  return (
    <group ref={clusterRef} position={[-0.25, 0, 0]}>
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.72, 1]} />
        <meshStandardMaterial
          color="#07131f"
          emissive="#22d3ee"
          emissiveIntensity={0.12}
          transparent
          opacity={0.42}
          metalness={0.25}
          roughness={0.28}
        />
      </mesh>

      <mesh ref={shellRef}>
        <icosahedronGeometry args={[1.45, 2]} />
        <meshStandardMaterial
          color="#d7f6ff"
          emissive="#6ee7f9"
          emissiveIntensity={0.18}
          transparent
          opacity={0.22}
          wireframe
        />
      </mesh>

      <OrbitalRing rotation={[0.36, 0.18, 0.82]} radius={2.15} color="#84e7ff" opacity={0.26} />
      <OrbitalRing rotation={[1.12, 0.82, -0.2]} radius={2.95} color="#69e3d2" opacity={0.2} />
      <OrbitalRing rotation={[0.82, 1.38, 0.06]} radius={3.65} color="#b6dcff" opacity={0.15} />

      {nodeConfig.map((node) => (
        <OrbitalNode key={`${node.angleOffset}-${node.radius}`} {...node} />
      ))}
    </group>
  )
}

function BackgroundParticles() {
  const pointsRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const values: number[] = []

    for (let index = 0; index < 180; index += 1) {
      values.push(
        (Math.random() - 0.5) * 26,
        (Math.random() - 0.5) * 16,
        -1 - Math.random() * 18,
      )
    }

    return new Float32Array(values)
  }, [])

  useFrame(({ clock }) => {
    if (!pointsRef.current) {
      return
    }

    pointsRef.current.rotation.y = clock.elapsedTime * 0.012
    pointsRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.05) * 0.03
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#a5f3fc"
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.5}
      />
    </points>
  )
}

function PageOrbitSet() {
  const { viewport } = useThree()
  const compactLayout = viewport.width < 8
  const scale = compactLayout ? 0.72 : 1
  const positionX = compactLayout ? 0 : 0.15

  return (
    <group position={[positionX, compactLayout ? 0.25 : 0, -3.6]} scale={scale}>
      <OrbitalRing rotation={[0.24, 0.16, 0.74]} radius={5.1} color="#8be9ff" opacity={0.14} tube={0.01} />
      <OrbitalRing rotation={[1.28, 0.62, -0.2]} radius={6.3} color="#6ee7d8" opacity={0.12} tube={0.01} />
      <OrbitalRing rotation={[0.88, 1.4, 0.12]} radius={7.1} color="#b4ddff" opacity={0.1} tube={0.01} />
    </group>
  )
}

function AtmospherePlanes() {
  return (
    <>
      <mesh position={[-4.8, 1.2, -7.4]} rotation={[0.08, 0.4, 0]}>
        <planeGeometry args={[8.4, 10.5]} />
        <meshBasicMaterial color="#0d2437" transparent opacity={0.24} />
      </mesh>
      <mesh position={[5.2, -1.6, -7.8]} rotation={[0, -0.35, 0]}>
        <planeGeometry args={[6.4, 9.2]} />
        <meshBasicMaterial color="#0b2030" transparent opacity={0.18} />
      </mesh>
    </>
  )
}

export function Login3DScene() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 0, 10], fov: 39 }}
        dpr={[1, 1.15]}
        gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
        performance={{ min: 0.8 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#04111f', 1)
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault()
          })
        }}
      >
        <color attach="background" args={['#04111f']} />
        <fog attach="fog" args={['#04111f', 9, 21]} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 5, 3]} intensity={1} color="#eff6ff" />
        <pointLight position={[-4, 1.5, 2]} intensity={1.15} color="#14b8a6" />
        <pointLight position={[4, -2.5, 4]} intensity={1} color="#38bdf8" />

        <SceneCameraRig />
        <BackgroundParticles />
        <AtmospherePlanes />
        <PageOrbitSet />
        <OrbitalCluster />
        <Environment preset="city" resolution={32} />
      </Canvas>
    </div>
  )
}

export default Login3DScene
