'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Float, Line } from '@react-three/drei'
import * as THREE from 'three'

const MILESTONES = [
  { label: '无 OS', era: '1940s', desc: '人工操作', pos: [-5, 0.3, 0], color: '#666' },
  { label: '单道批处理', era: '1950s', desc: '监督程序', pos: [-2.5, 0.8, 0], color: '#f59e0b' },
  { label: '多道批处理', era: '1960s', desc: '中断+DMA', pos: [0, 0.3, 0], color: '#f97316' },
  { label: '分时系统', era: '1970s', desc: '时间片轮转', pos: [2.5, 0.8, 0], color: '#22c55e' },
  { label: '实时系统', era: '1980s+', desc: '截止时间', pos: [5, 0.3, 0], color: '#3b82f6' },
]

const TIMELINE_POINTS = MILESTONES.map((m) =>
  new THREE.Vector3(m.pos[0], -0.2, m.pos[2])
)

function TimelineLine() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setFromPoints(TIMELINE_POINTS)
    return g
  }, [])
  return (
    <Line
      points={TIMELINE_POINTS}
      color="#a78bfa"
      lineWidth={1}
      opacity={0.3}
      transparent
    />
  )
}

function MilestoneNode({ milestone, index }: { milestone: typeof MILESTONES[0]; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)
  useFrame((_, delta) => {
    timeRef.current += delta
    if (meshRef.current) {
      meshRef.current.position.y = milestone.pos[1] + Math.sin(timeRef.current * 1.5 + index) * 0.1
    }
  })

  return (
    <group>
      <mesh ref={meshRef} position={milestone.pos as [number, number, number]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color={milestone.color}
          emissive={milestone.color}
          emissiveIntensity={0.5}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
      <Float speed={1} floatIntensity={0.15} rotationIntensity={0}>
        <Text
          position={[milestone.pos[0], milestone.pos[1] + 0.5, milestone.pos[2]]}
          fontSize={0.22}
          color={milestone.color}
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.01}
          outlineColor="#000"
        >
          {milestone.label}
        </Text>
      </Float>
      <Text
        position={[milestone.pos[0], milestone.pos[1] + 0.8, milestone.pos[2]]}
        fontSize={0.14}
        color="#888"
        anchorX="center"
        anchorY="bottom"
      >
        {`${milestone.era} · ${milestone.desc}`}
      </Text>
    </group>
  )
}

export default function TimelineScene() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }} style={{ pointerEvents: 'none' }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 3, 3]} intensity={0.8} color="#a78bfa" />
        <TimelineLine />
        {MILESTONES.map((m, i) => (
          <MilestoneNode key={m.label} milestone={m} index={i} />
        ))}
        <Float speed={0.5} floatIntensity={0.1}>
          <Text
            position={[0, 1.6, 0]}
            fontSize={0.3}
            color="#a78bfa"
            anchorX="center"
            fillOpacity={0.5}
          >
            OS 发展历程
          </Text>
        </Float>
      </Canvas>
    </div>
  )
}