'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Float } from '@react-three/drei'
import * as THREE from 'three'

const ARCHITECTURES = [
  { label: '简单', desc: '无结构', pos: [-4, 0.5, 0], color: '#ef4444', ringCount: 0 },
  { label: '模块化', desc: '接口混乱', pos: [-2, -0.2, 0.5], color: '#f59e0b', ringCount: 1 },
  { label: '分层', desc: '自底向上', pos: [0, 0.8, -0.3], color: '#22c55e', ringCount: 2 },
  { label: '微内核', desc: '最小内核', pos: [2, -0.2, 0.5], color: '#3b82f6', ringCount: 1 },
  { label: '外核', desc: '只做隔离', pos: [4, 0.5, 0], color: '#a78bfa', ringCount: 0 },
]

function ArchNode({ arch, index }: { arch: typeof ARCHITECTURES[0]; index: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  useFrame((_, delta) => {
    timeRef.current += delta
    if (groupRef.current) {
      groupRef.current.position.y = arch.pos[1] + Math.sin(timeRef.current * 0.8 + index) * 0.15
    }
    if (glowRef.current) {
      const s = 1 + Math.sin(timeRef.current * 2 + index) * 0.1
      glowRef.current.scale.setScalar(s)
    }
  })

  const rings = []
  for (let i = 0; i < arch.ringCount; i++) {
    rings.push(
      <mesh key={i} position={arch.pos as [number, number, number]}>
        <torusGeometry args={[0.35 + i * 0.18, 0.03, 8, 24]} />
        <meshBasicMaterial color={arch.color} transparent opacity={0.4 - i * 0.1} />
      </mesh>
    )
  }

  return (
    <group ref={groupRef}>
      {rings}
      <mesh position={arch.pos as [number, number, number]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial
          color={arch.color}
          emissive={arch.color}
          emissiveIntensity={0.4}
          metalness={0.3}
          roughness={0.3}
        />
      </mesh>
      <mesh ref={glowRef} position={arch.pos as [number, number, number]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshBasicMaterial color={arch.color} transparent opacity={0.15} />
      </mesh>
      <Float speed={0.6} floatIntensity={0.1} rotationIntensity={0}>
        <Text
          position={[arch.pos[0], arch.pos[1] + 0.5, arch.pos[2]]}
          fontSize={0.2}
          color={arch.color}
          anchorX="center"
          anchorY="bottom"
        >
          {`${arch.label}\n${arch.desc}`}
        </Text>
      </Float>
    </group>
  )
}

export default function ArchitectureScene() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }} style={{ pointerEvents: 'none' }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 3, 4]} intensity={0.6} color="#a78bfa" />
        {ARCHITECTURES.map((arch, i) => (
          <ArchNode key={arch.label} arch={arch} index={i} />
        ))}
        <Float speed={0.5} floatIntensity={0.1}>
          <Text
            position={[0, 2, 0]}
            fontSize={0.3}
            color="#a78bfa"
            anchorX="center"
            fillOpacity={0.5}
          >
            OS 内核架构演进
          </Text>
        </Float>
      </Canvas>
    </div>
  )
}