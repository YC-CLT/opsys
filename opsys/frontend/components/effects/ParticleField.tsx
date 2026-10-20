'use client'

import { useMemo, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

interface Particle {
  id: number
  label: string
  position: [number, number, number]
  velocity: [number, number, number]
  basePosition: [number, number, number]
  color: string
  size: number
  phase: number
}

const OS_CONCEPTS = [
  { label: 'process', color: '#22c55e' },
  { label: 'thread', color: '#3b82f6' },
  { label: 'memory', color: '#a855f7' },
  { label: 'file', color: '#f59e0b' },
  { label: 'pipe', color: '#06b6d4' },
  { label: 'signal', color: '#ef4444' },
  { label: 'mutex', color: '#ec4899' },
  { label: 'fork', color: '#84cc16' },
  { label: 'exec', color: '#f97316' },
  { label: 'wait', color: '#14b8a6' },
  { label: 'sched', color: '#8b5cf6' },
  { label: 'page', color: '#eab308' },
]

function generateParticles(): Particle[] {
  const particles: Particle[] = []
  for (let i = 0; i < 24; i++) {
    const concept = OS_CONCEPTS[i % OS_CONCEPTS.length]
    const x = (Math.random() - 0.5) * 14
    const y = (Math.random() - 0.5) * 8
    const z = Math.random() * 6 - 3
    particles.push({
      id: i,
      label: concept.label,
      position: [x, y, z],
      velocity: [(Math.random() - 0.5) * 0.15, (Math.random() - 0.5) * 0.08, 0],
      basePosition: [x, y, z],
      color: concept.color,
      size: 0.3 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
    })
  }
  return particles
}

type ParticleMode = 'idle' | 'gather' | 'scatter' | 'shiftLeft'

interface ParticleFieldProps {
  mode?: ParticleMode
}

function Particles({ mode = 'idle' }: { mode: ParticleMode }) {
  const particles = useMemo(() => generateParticles(), [])
  const modeRef = useRef(mode)
  modeRef.current = mode
  const gatherTimer = useRef(0)
  const scatterTimer = useRef(0)

  useFrame((_, delta) => {
    gatherTimer.current += delta
    scatterTimer.current += delta

    for (const p of particles) {
      p.position[0] += p.velocity[0]
      p.position[1] += p.velocity[1]
      p.position[2] += p.velocity[2]

      if (Math.abs(p.position[0]) > 7) p.velocity[0] *= -1
      if (Math.abs(p.position[1]) > 4) p.velocity[1] *= -1

      const t = gatherTimer.current
      const s = scatterTimer.current

      switch (modeRef.current) {
        case 'gather':
          p.position[0] += (0 - p.position[0]) * 0.02
          p.position[1] += (0 - p.position[1]) * 0.02
          p.position[2] += (-1 - p.position[2]) * 0.02
          break
        case 'scatter':
          p.position[0] += (p.velocity[0] * 3) * delta
          p.position[1] += (p.velocity[1] * 3) * delta
          break
        case 'shiftLeft':
          p.position[0] -= 0.02
          break
        default:
          // idle — gentle drift toward base
          if (Math.abs(gatherTimer.current) > 3) {
            p.position[0] += (p.basePosition[0] - p.position[0]) * 0.002
            p.position[1] += (p.basePosition[1] - p.position[1]) * 0.002
          }
          break
      }
    }
  })

  return (
    <group>
      {particles.map((p) => (
        <Text
          key={p.id}
          position={p.position}
          fontSize={p.size}
          color={p.color}
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.6}
        >
          {p.label}
        </Text>
      ))}
    </group>
  )
}

export default function ParticleField({ mode = 'idle' }: ParticleFieldProps) {
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  useEffect(() => {
    const updateSize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight })
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-15">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ width: canvasSize.width, height: canvasSize.height, pointerEvents: 'none' }}
        gl={{ alpha: true, antialias: false }}
      >
        <ambientLight intensity={0.5} />
        <Particles mode={mode} />
      </Canvas>
    </div>
  )
}

export type { ParticleMode }