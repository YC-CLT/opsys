'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Float, Ring } from '@react-three/drei'
import * as THREE from 'three'

function RingLayer({
  radius,
  color,
  label,
  labelColor,
  rotationSpeed,
}: {
  radius: number
  color: string
  label: string
  labelColor: string
  rotationSpeed: number
}) {
  const ringRef = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += rotationSpeed * delta
    }
  })

  return (
    <group>
      <mesh ref={ringRef}>
        <torusGeometry args={[radius, 0.04, 16, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      <Float speed={0.8} floatIntensity={0.05}>
        <Text
          position={[radius + 0.4, 0, 0]}
          fontSize={0.22}
          color={labelColor}
          anchorX="left"
          anchorY="middle"
          fillOpacity={0.7}
        >
          {label}
        </Text>
      </Float>
    </group>
  )
}

function TransitionArrow() {
  const arrowRef = useRef<THREE.Group>(null)
  const timeRef = useRef(0)
  useFrame((_, delta) => {
    timeRef.current += delta
    if (arrowRef.current) {
      arrowRef.current.rotation.z = Math.sin(timeRef.current * 0.3) * 0.05
      arrowRef.current.position.y = Math.sin(timeRef.current * 0.5) * 0.1
    }
  })

  return (
    <group ref={arrowRef} position={[0, 0, 0]}>
      <Float speed={1} floatIntensity={0.2} rotationIntensity={0}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.5}
          color="#a78bfa"
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.6}
        >
          ↑
        </Text>
      </Float>
      <Text
        position={[0.8, 0.3, 0]}
        fontSize={0.14}
        color="#888"
        anchorX="left"
      >
        trap
      </Text>
      <Text
        position={[-0.8, 0.3, 0]}
        fontSize={0.14}
        color="#888"
        anchorX="right"
      >
        syscall
      </Text>
    </group>
  )
}

export default function SyscallScene() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 3]} intensity={0.5} color="#a78bfa" />

        {/* Ring 3 - User Space */}
        <RingLayer radius={2.4} color="#ef4444" label="Ring 3" labelColor="#ef4444" rotationSpeed={0.1} />
        <Float speed={0.6} floatIntensity={0.08}>
          <Text
            position={[0, 1.8, 0]}
            fontSize={0.18}
            color="#ef4444"
            anchorX="center"
            fillOpacity={0.5}
          >
            用户态 (目态)
          </Text>
        </Float>

        {/* Ring 0 - Kernel Space */}
        <RingLayer radius={1.0} color="#22c55e" label="Ring 0" labelColor="#22c55e" rotationSpeed={-0.15} />
        <Float speed={0.6} floatIntensity={0.08}>
          <Text
            position={[0, 0.5, 0]}
            fontSize={0.18}
            color="#22c55e"
            anchorX="center"
            fillOpacity={0.5}
          >
            内核态 (管态)
          </Text>
        </Float>

        {/* Core */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial
            color="#a78bfa"
            emissive="#a78bfa"
            emissiveIntensity={0.8}
          />
        </mesh>

        <TransitionArrow />
      </Canvas>
    </div>
  )
}