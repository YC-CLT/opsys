'use client'

import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { Text, Float } from '@react-three/drei'
import * as THREE from 'three'

const LEVELS = [
  { id: 1, name: '引论', subtitle: 'OS 定义与目标', pos: [-3, 2.5, 0], color: '#a78bfa' },
  { id: 2, name: '发展历程', subtitle: '从无到有的演进', pos: [0, 3.5, -1], color: '#7c3aed' },
  { id: 3, name: '基本特性', subtitle: '并发·共享·虚拟·异步', pos: [3, 2.5, 0], color: '#6366f1' },
  { id: 4, name: '运行环境', subtitle: '管态·中断·系统调用', pos: [2, -0.5, 1], color: '#8b5cf6' },
  { id: 5, name: '体系结构', subtitle: '内核架构演进', pos: [-2, -0.5, 1], color: '#a78bfa' },
  { id: 6, name: '系统调用', subtitle: '用户态→内核态', pos: [0, -1.5, 2], color: '#c084fc' },
]

const CONNECTIONS = [
  [1, 2], [1, 3], [1, 4], [1, 5],
  [2, 6], [3, 6], [4, 6], [5, 6],
]

function Node({
  level,
  progress,
  onSelect,
}: {
  level: (typeof LEVELS)[0]
  progress: number[]
  onSelect: (id: number) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const unlocked = level.id === 1 || progress.includes(level.id - 1)
  const completed = progress.includes(level.id)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (unlocked) onSelect(level.id)
  }

  return (
    <group>
      {/* Outer glow ring */}
      <mesh
        position={level.pos as [number, number, number]}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <torusGeometry args={[hovered ? 0.7 : 0.55, 0.04, 16, 32]} />
        <meshBasicMaterial color={unlocked ? level.color : '#333'} transparent opacity={unlocked ? 0.8 : 0.3} />
      </mesh>

      {/* Core sphere */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh
          ref={meshRef}
          position={level.pos as [number, number, number]}
          onClick={handleClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <icosahedronGeometry args={[hovered ? 0.4 : 0.3, 1]} />
          <meshStandardMaterial
            color={unlocked ? level.color : '#444'}
            emissive={unlocked ? level.color : '#111'}
            emissiveIntensity={completed ? 1.5 : hovered ? 1.2 : 0.6}
            transparent
            opacity={unlocked ? 1 : 0.4}
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>
      </Float>

      {/* Level number */}
      <Text
        position={[level.pos[0], level.pos[1] + 0.7, level.pos[2]]}
        fontSize={0.35}
        color={unlocked ? '#e4e4f0' : '#555'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000"
      >
        {`Lv.${level.id}`}
      </Text>

      {/* Level name on hover */}
      {hovered && (
        <>
          <Text
            position={[level.pos[0], level.pos[1] + 1.2, level.pos[2]]}
            fontSize={0.25}
            color={level.color}
            anchorX="center"
            anchorY="middle"
          >
            {level.name}
          </Text>
          <Text
            position={[level.pos[0], level.pos[1] + 0.95, level.pos[2]]}
            fontSize={0.15}
            color="#888"
            anchorX="center"
            anchorY="middle"
          >
            {unlocked ? level.subtitle : '🔒 未解锁'}
          </Text>
        </>
      )}
    </group>
  )
}

function ConnectionLines({ progress }: { progress: number[] }) {
  const lines = useMemo(() => {
    return CONNECTIONS.map(([a, b]) => {
      const la = LEVELS[a - 1]
      const lb = LEVELS[b - 1]
      const bothUnlocked = (a === 1 || progress.includes(a - 1)) && (b === 1 || progress.includes(b - 1))

      const mid: [number, number, number] = [
        (la.pos[0] + lb.pos[0]) / 2,
        (la.pos[1] + lb.pos[1]) / 2,
        (la.pos[2] + lb.pos[2]) / 2,
      ]

      return { a: la.pos, b: lb.pos, mid, bothUnlocked, key: `${a}-${b}` }
    })
  }, [progress])

  return (
    <>
      {lines.map((line) => (
        <line key={line.key}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...line.a, ...line.b])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={line.bothUnlocked ? '#a78bfa' : '#222'} transparent opacity={line.bothUnlocked ? 0.3 : 0.1} />
        </line>
      ))}
    </>
  )
}

function StarField() {
  const starsRef = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(600)
    for (let i = 0; i < 600; i++) {
      arr[i] = (Math.random() - 0.5) * 30
    }
    return arr
  }, [])

  useFrame(() => {
    if (starsRef.current) starsRef.current.rotation.y += 0.0003
  })

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={200} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#fff" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

interface StarMapProps {
  progress: number[]
  onSelectLevel: (level: number) => void
}

export default function StarMap({ progress, onSelectLevel }: StarMapProps) {
  return (
    <div className="w-full h-[420px] md:h-[520px] cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 5, 5]} intensity={1} color="#a78bfa" />
        <pointLight position={[0, -5, -5]} intensity={0.5} color="#6366f1" />

        <StarField />
        <ConnectionLines progress={progress} />

        {LEVELS.map((level) => (
          <Node key={level.id} level={level} progress={progress} onSelect={onSelectLevel} />
        ))}
      </Canvas>
    </div>
  )
}