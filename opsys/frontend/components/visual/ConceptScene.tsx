'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text3D, Float } from '@react-three/drei'
import * as THREE from 'three'
import MemoryScene from './MemoryScene'

function OSStack() {
  const groupRef = useRef<THREE.Group>(null)
  const layers = [
    { name: '用户', y: 2.5, color: '#4ade80', w: 3.2 },
    { name: '应用程序', y: 1.5, color: '#60a5fa', w: 3.0 },
    { name: 'OS 内核', y: 0.5, color: '#f472b6', w: 3.4 },
    { name: '硬件', y: -0.5, color: '#fbbf24', w: 2.8 },
  ]

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.2
  })

  const glowMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#00ff88',
    emissive: '#00ff88',
    emissiveIntensity: 0.4,
    metalness: 0.2,
    roughness: 0.5,
    transparent: true,
    opacity: 0.85,
  }), [])

  return (
    <group ref={groupRef}>
      {layers.map((l, i) => (
        <Float key={i} speed={1.5} rotationIntensity={0.05} floatIntensity={0.001} position={[0, l.y, 0]}>
          <mesh>
            <boxGeometry args={[l.w, 0.7, 1.2]} />
            <meshStandardMaterial
              color={l.color}
              emissive={l.color}
              emissiveIntensity={0.3 + i * 0.1}
              metalness={0.3}
              roughness={0.4}
              transparent
              opacity={0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

function OSEvolution() {
  const ringRef = useRef<THREE.Group>(null)
  const items = ['批处理', '分时', '实时', '现代']
  const r = 2.2

  useFrame((_, delta) => {
    if (ringRef.current) ringRef.current.rotation.y += delta * 0.15
  })

  const lineObjs = useMemo(() => {
    const objs: THREE.Line[] = []
    for (let i = 0; i < items.length; i++) {
      const j = (i + 1) % items.length
      const a0 = (i / items.length) * Math.PI * 2
      const a1 = (j / items.length) * Math.PI * 2
      const points = [
        new THREE.Vector3(Math.cos(a0) * r, 0, Math.sin(a0) * r),
        new THREE.Vector3(Math.cos(a1) * r, 0, Math.sin(a1) * r),
      ]
      const geo = new THREE.BufferGeometry().setFromPoints(points)
      const mat = new THREE.LineBasicMaterial({ color: '#00ff88', transparent: true, opacity: 0.3 })
      objs.push(new THREE.Line(geo, mat))
    }
    return objs
  }, [])

  return (
    <group ref={ringRef}>
      {items.map((item, i) => {
        const angle = (i / items.length) * Math.PI * 2
        const x = Math.cos(angle) * r
        const z = Math.sin(angle) * r
        return (
          <Float key={i} speed={2} rotationIntensity={0.1} floatIntensity={0.15} position={[x, 0, z]}>
            <mesh>
              <sphereGeometry args={[0.35, 16, 16]} />
              <meshStandardMaterial
                color={`hsl(${i * 70}, 70%, 60%)`}
                emissive={`hsl(${i * 70}, 70%, 60%)`}
                emissiveIntensity={0.5}
                metalness={0.4}
                roughness={0.3}
              />
            </mesh>
          </Float>
        )
      })}
      {lineObjs.map((obj, i) => (
        <primitive key={`l-${i}`} object={obj} />
      ))}
    </group>
  )
}

function ConcurrencyParallel() {
  const gBallRef = useRef<THREE.Mesh>(null)
  const yBallRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  useFrame((_, delta) => {
    timeRef.current += delta
    const t = timeRef.current
    if (gBallRef.current) gBallRef.current.position.x = Math.sin(t * 2.5) * 1.8
    if (yBallRef.current) yBallRef.current.position.x = Math.sin(t * 2.5 + Math.PI) * 1.8
  })

  return (
    <group>
      <mesh ref={gBallRef} position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={0.6} metalness={0.2} roughness={0.2} />
      </mesh>
      <mesh ref={yBallRef} position={[0, -0.4, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.6} metalness={0.2} roughness={0.2} />
      </mesh>
    </group>
  )
}

function CombinedLevel3() {
  return (
    <group>
      <group position={[-1.2, 0, 0]}>
        <ConcurrencyParallel />
      </group>
      <group position={[1.2, 0, 0]}>
        <MemoryScene />
      </group>
    </group>
  )
}

function InterruptKernelMode() {
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 1.2
      ringRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.08)
    }
  })

  return (
    <group>
      <mesh ref={ringRef}>
        <torusGeometry args={[1.2, 0.15, 16, 32]} />
        <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.8} metalness={0.3} roughness={0.2} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.5} metalness={0.1} roughness={0.3} />
      </mesh>
    </group>
  )
}

function OSStructure() {
  const groupRef = useRef<THREE.Group>(null)
  const rings = ['简单', '模块', '分层', '微内核', '外核']

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.z += delta * 0.25
  })

  return (
    <group ref={groupRef}>
      {rings.map((_, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5 + i * 0.35, 0.06, 8, 48]} />
          <meshStandardMaterial
            color={`hsl(${260 + i * 30}, 70%, 55%)`}
            emissive={`hsl(${260 + i * 30}, 70%, 55%)`}
            emissiveIntensity={0.3 + i * 0.12}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

function PentagonRadar() {
  const groupRef = useRef<THREE.Group>(null)
  const corners = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2
      pts.push(new THREE.Vector3(Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0))
    }
    return pts
  }, [])

  const lineObjs = useMemo(() => {
    const objs: THREE.Line[] = []
    const edgeMat = new THREE.LineBasicMaterial({ color: '#00ff88', transparent: true, opacity: 0.5 })
    const radialMat = new THREE.LineBasicMaterial({ color: '#00ff88', transparent: true, opacity: 0.15 })
    for (let i = 0; i < corners.length; i++) {
      const next = corners[(i + 1) % corners.length]
      const geo1 = new THREE.BufferGeometry().setFromPoints([corners[i], next])
      objs.push(new THREE.Line(geo1, edgeMat))
    }
    for (const p of corners) {
      const geo2 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), p])
      objs.push(new THREE.Line(geo2, radialMat))
    }
    return objs
  }, [corners])

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3
  })

  return (
    <group ref={groupRef}>
      {corners.map((p, i) => (
        <Float key={i} speed={2 + i * 0.3} rotationIntensity={0.08} floatIntensity={0.12} position={p}>
          <mesh>
            <dodecahedronGeometry args={[0.25, 0]} />
            <meshStandardMaterial
              color={`hsl(${i * 60}, 70%, 60%)`}
              emissive={`hsl(${i * 60}, 70%, 60%)`}
              emissiveIntensity={0.5}
              metalness={0.3}
              roughness={0.2}
            />
          </mesh>
        </Float>
      ))}
      {lineObjs.map((obj, i) => (
        <primitive key={`radar-l-${i}`} object={obj} />
      ))}
    </group>
  )
}

function SceneContent({ levelId }: { levelId: number }) {
  switch (levelId) {
    case 1: return <OSStack />
    case 2: return <OSEvolution />
    case 3: return <CombinedLevel3 />
    case 4: return <InterruptKernelMode />
    case 5: return <OSStructure />
    case 6: return <PentagonRadar />
    default: return <OSStack />
  }
}

function StarField() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const count = 400
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [])

  return (
    <points geometry={geo}>
      <pointsMaterial size={0.015} color="#ffffff" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

const LEVEL_LABELS: Record<number, string> = {
  1: 'OS 分层结构',
  2: 'OS 发展历程',
  3: '并发与并行',
  4: '中断与内核态',
  5: 'OS 体系结构',
  6: '五大管理功能',
}

export default function ConceptScene({ levelId, height = 260 }: { levelId: number; height?: number }) {
  return (
    <div className="relative rounded-xl overflow-hidden border border-zinc-700/30" style={{ height }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-3, -1, 3]} intensity={0.3} color="#00ff88" />
        <StarField />
        <SceneContent levelId={levelId} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4}
        />
      </Canvas>
      <div className="absolute bottom-2 left-3 text-xs text-zinc-500 bg-zinc-900/60 px-2 py-0.5 rounded">
        {LEVEL_LABELS[levelId] || `Lv.${levelId}`}
      </div>
    </div>
  )
}