'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function ConcurrencyScene() {
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