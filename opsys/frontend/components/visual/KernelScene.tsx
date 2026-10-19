'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function KernelScene() {
  const ballRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  useFrame((_, delta) => {
    timeRef.current += delta
    const t = timeRef.current
    if (ballRef.current) {
      // Oscillate across the barrier: user space (left) ↔ kernel space (right)
      ballRef.current.position.x = Math.sin(t * 1.5) * 1.8
    }
  })

  return (
    <group>
      {/* Barrier */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.08, 3.2, 0.8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>

      {/* User space – left */}
      <mesh position={[-1.4, 0.6, 0]}>
        <boxGeometry args={[2.2, 2.6, 0.6]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.15} metalness={0.2} roughness={0.6} transparent opacity={0.3} />
      </mesh>

      {/* Kernel space – right */}
      <mesh position={[1.4, 0.6, 0]}>
        <boxGeometry args={[2.2, 2.6, 0.6]} />
        <meshStandardMaterial color="#312e81" emissive="#312e81" emissiveIntensity={0.2} metalness={0.2} roughness={0.6} transparent opacity={0.5} />
      </mesh>

      {/* System-call ball */}
      <mesh ref={ballRef} position={[0, 0, 0.4]}>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.7} metalness={0.1} roughness={0.2} />
      </mesh>
    </group>
  )
}