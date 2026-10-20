'use client'

import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { Text, Float, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
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
  [1, 2], [1, 3], [1, 4], [1, 5], [1, 6],
  [2, 3], [2, 4], [2, 5], [2, 6],
  [3, 4], [3, 5], [3, 6],
  [4, 5], [4, 6],
  [5, 6],
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
  const timeRef = useRef(0)
  const [hovered, setHovered] = useState(false)
  const unlocked = level.id === 1 || progress.includes(level.id - 1)
  const completed = progress.includes(level.id)

  useFrame((_, delta) => {
    timeRef.current += delta
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003
      meshRef.current.rotation.x = Math.sin(timeRef.current * 0.5) * 0.1
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
          <icosahedronGeometry args={[hovered ? 0.4 : 0.3, 0]} />
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
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([...la.pos, ...lb.pos]), 3))
      const mat = new THREE.LineBasicMaterial({
        color: bothUnlocked ? '#a78bfa' : '#222',
        transparent: true,
        opacity: bothUnlocked ? 0.3 : 0.1,
      })
      const lineObj = new THREE.Line(geo, mat)
      lineObj.name = `${a}-${b}`
      return lineObj
    })
  }, [progress])

  return (
    <>
      {lines.map((lineObj) => (
        <primitive key={lineObj.name} object={lineObj} />
      ))}
    </>
  )
}

function StarField() {
  const starsRef = useRef<THREE.Points>(null)
  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const arr = new Float32Array(600)
    for (let i = 0; i < 600; i++) {
      arr[i] = (Math.random() - 0.5) * 30
    }
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    const m = new THREE.PointsMaterial({ size: 0.03, color: '#fff', transparent: true, opacity: 0.6, sizeAttenuation: true })
    return { geo: g, mat: m }
  }, [])

  useFrame(() => {
    if (starsRef.current) starsRef.current.rotation.y += 0.0003
  })

  return (
    <points ref={starsRef} geometry={geo} material={mat} />
  )
}

interface StarMapProps {
  progress: number[]
  onSelectLevel: (level: number) => void
}

export default function StarMap({ progress, onSelectLevel }: StarMapProps) {
  return (
    <div className="w-full h-[480px] md:h-[600px] cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 5, 5]} intensity={1} color="#a78bfa" />
        <pointLight position={[0, -5, -5]} intensity={0.5} color="#6366f1" />
        <pointLight position={[4, 0, 2]} intensity={0.3} color="#c084fc" />
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableDamping
          dampingFactor={0.08}
          autoRotate
          autoRotateSpeed={0.15}
          minDistance={3}
          maxDistance={15}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 4}
        />

        <StarField />
        <ConnectionLines progress={progress} />

        {LEVELS.map((level) => (
          <Node key={level.id} level={level} progress={progress} onSelect={onSelectLevel} />
        ))}

        {/* Current unlocked level indicator */}
        {(() => {
          const nextLevel = LEVELS.find((l) => !progress.includes(l.id) && (l.id === 1 || progress.includes(l.id - 1)))
          if (!nextLevel) return null
          return (
            <Float speed={1.5} rotationIntensity={0} floatIntensity={0.2}>
              <Text
                position={[nextLevel.pos[0], nextLevel.pos[1] - 1.1, nextLevel.pos[2]]}
                fontSize={0.18}
                color={nextLevel.color}
                anchorX="center"
                anchorY="middle"
                fillOpacity={0.7}
              >
                {'> NEXT <'}
              </Text>
            </Float>
          )
        })()}

        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.4}
            luminanceThreshold={0.3}
            luminanceSmoothing={0.6}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}