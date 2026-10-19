'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

export default function MemoryScene() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3
  })

  const gridLines = useMemo(() => {
    const lines: THREE.Line[] = []
    const mat = new THREE.LineBasicMaterial({ color: '#a78bfa', transparent: true, opacity: 0.4 })
    for (let i = -1; i <= 1; i += 2) {
      for (let j = -1; j <= 1; j++) {
        const h = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(i * 1.2, 0, j * 1.2),
          new THREE.Vector3(i * 0.5, -1.5, j * 0.5),
        ])
        lines.push(new THREE.Line(h, mat))
      }
    }
    const hLines = [-0.6, 0, 0.6]
    for (const y of hLines) {
      const hGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-1.5, y, -0.8),
        new THREE.Vector3(1.5, y, -0.8),
      ])
      lines.push(new THREE.Line(hGeo, new THREE.LineBasicMaterial({ color: '#a78bfa', transparent: true, opacity: 0.3 })))
    }
    return lines
  }, [])

  return (
    <group ref={groupRef}>
      {/* Physical block */}
      <Float speed={2} rotationIntensity={0.05} floatIntensity={0.1} position={[0, 1.2, -1.2]}>
        <mesh>
          <boxGeometry args={[2.5, 1.2, 2]} />
          <meshStandardMaterial
            color="#60a5fa"
            emissive="#60a5fa"
            emissiveIntensity={0.5}
            metalness={0.3}
            roughness={0.2}
            transparent
            opacity={0.85}
          />
        </mesh>
      </Float>

      {/* Grid mapping lines */}
      {gridLines.map((line, i) => (
        <primitive key={`gl-${i}`} object={line} />
      ))}

      {/* Logical blocks (grid split) */}
      {[-1, 0, 1].map((x) =>
        [-1, 0, 1].map((z) => (
          <Float key={`${x}-${z}`} speed={1.5 + (x + z) * 0.2} rotationIntensity={0.08} floatIntensity={0.08} position={[x * 0.65, -1.8, z * 0.65 + 1.2]}>
            <mesh>
              <boxGeometry args={[0.55, 0.55, 0.55]} />
              <meshStandardMaterial
                color="#f472b6"
                emissive="#f472b6"
                emissiveIntensity={0.4}
                metalness={0.2}
                roughness={0.3}
                wireframe={false}
              />
            </mesh>
          </Float>
        ))
      )}
    </group>
  )
}