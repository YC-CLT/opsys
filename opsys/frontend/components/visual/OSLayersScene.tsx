'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

export default function OSLayersScene() {
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