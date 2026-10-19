'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function InterruptScene() {
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