'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, OrbitControls, Float, Line } from '@react-three/drei'
import * as THREE from 'three'

// ──────────────────────────────────────
// Shared: Star field background
// ──────────────────────────────────────
function StarField() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const count = 400
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [])

  return (
    <points geometry={geo}>
      <pointsMaterial size={0.015} color="#ffffff" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

// ──────────────────────────────────────
// Lv.1 引论 — OS 核心概念环
// ──────────────────────────────────────
function OSCoreConcepts() {
  const ringRef = useRef<THREE.Group>(null)
  const concepts = [
    { label: '方便性', desc: '用户友好', color: '#22c55e', angle: 0 },
    { label: '有效性', desc: '资源管理', color: '#3b82f6', angle: Math.PI / 2 },
    { label: '可扩充性', desc: '模块化', color: '#f59e0b', angle: Math.PI },
    { label: '开放性', desc: '标准兼容', color: '#ef4444', angle: Math.PI * 1.5 },
  ]
  const r = 2.2

  useFrame((_, delta) => {
    if (ringRef.current) ringRef.current.rotation.y += delta * 0.2
  })

  return (
    <group>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.15}>
        <mesh>
          <icosahedronGeometry args={[0.4, 1]} />
          <meshStandardMaterial
            color="#a78bfa"
            emissive="#a78bfa"
            emissiveIntensity={0.8}
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>
      </Float>

      <group ref={ringRef}>
        {concepts.map((c) => {
          const x = Math.cos(c.angle) * r
          const z = Math.sin(c.angle) * r
          return (
            <group key={c.label}>
              <mesh position={[x, 0, z]}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial
                  color={c.color}
                  emissive={c.color}
                  emissiveIntensity={0.6}
                  metalness={0.3}
                  roughness={0.3}
                />
              </mesh>
              <Text
                position={[x, 0.55, z]}
                fontSize={0.25}
                color={c.color}
                anchorX="center"
                anchorY="bottom"
                outlineWidth={0.01}
                outlineColor="#000"
              >
                {c.label}
              </Text>
              <Text
                position={[x, -0.5, z]}
                fontSize={0.14}
                color="#888"
                anchorX="center"
                anchorY="top"
              >
                {c.desc}
              </Text>
            </group>
          )
        })}

        {concepts.map((c, i) => {
          const next = concepts[(i + 1) % concepts.length]
          const x1 = Math.cos(c.angle) * r
          const z1 = Math.sin(c.angle) * r
          const x2 = Math.cos(next.angle) * r
          const z2 = Math.sin(next.angle) * r
          return (
            <Line
              key={`edge-${i}`}
              points={[new THREE.Vector3(x1, 0, z1), new THREE.Vector3(x2, 0, z2)]}
              color={c.color}
              transparent
              opacity={0.2}
              lineWidth={0.5}
            />
          )
        })}
      </group>

      <Text position={[0, 1.5, 0]} fontSize={0.35} color="#a78bfa" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000">
        OS 四大目标
      </Text>
    </group>
  )
}

// ──────────────────────────────────────
// Lv.3 基本特性 — 四大特性柱状图
// ──────────────────────────────────────
function FourPillars() {
  const pillars = [
    { label: '并发', sub: '宏观并行', color: '#22c55e', x: -3 },
    { label: '共享', sub: '资源复用', color: '#3b82f6', x: -1 },
    { label: '虚拟', sub: '逻辑映射', color: '#f59e0b', x: 1 },
    { label: '异步', sub: '走走停停', color: '#ef4444', x: 3 },
  ]
  const pillarHeight = 2.5
  const pillarSpeeds = useMemo(() => [1.3, 1.6, 1.9, 2.2], [])
  const floatSpeeds = useMemo(() => [1.6, 2.0, 1.4, 2.4], [])

  return (
    <group>
      <Text position={[0, 2.0, 0]} fontSize={0.35} color="#a78bfa" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000">
        OS 四大基本特性
      </Text>

      {pillars.map((p, idx) => (
        <group key={p.label}>
          {/* 底座 */}
          <mesh position={[p.x, -pillarHeight / 2 - 0.25, 0]}>
            <cylinderGeometry args={[0.35, 0.45, 0.3, 16]} />
            <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.5} metalness={0.4} roughness={0.3} />
          </mesh>

          {/* 柱子 */}
          <Float speed={pillarSpeeds[idx]} rotationIntensity={0.02} floatIntensity={0.08}>
            <mesh position={[p.x, 0, 0]}>
              <cylinderGeometry args={[0.25, 0.3, pillarHeight, 16]} />
              <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.3} metalness={0.4} roughness={0.4} transparent opacity={0.85} />
            </mesh>
          </Float>

          {/* 顶部发光球 */}
          <Float speed={floatSpeeds[idx]} rotationIntensity={0.1} floatIntensity={0.2}>
            <mesh position={[p.x, pillarHeight / 2 + 0.25, 0]}>
              <sphereGeometry args={[0.28, 16, 16]} />
              <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.8} />
            </mesh>
          </Float>

          {/* 标签 */}
          <Text position={[p.x, pillarHeight / 2 + 0.7, 0]} fontSize={0.25} color={p.color} anchorX="center" anchorY="bottom" outlineWidth={0.01} outlineColor="#000">
            {p.label}
          </Text>
          <Text position={[p.x, -pillarHeight / 2 - 0.7, 0]} fontSize={0.14} color="#888" anchorX="center" anchorY="top">
            {p.sub}
          </Text>
        </group>
      ))}

      {/* 柱子之间的连接线 */}
      {pillars.map((p, i) => {
        if (i === pillars.length - 1) return null
        const next = pillars[i + 1]
        return (
          <Line
            key={`link-${i}`}
            points={[new THREE.Vector3(p.x, 0.4, 0), new THREE.Vector3(next.x, 0.4, 0)]}
            color="#444"
            transparent
            opacity={0.3}
            lineWidth={0.5}
          />
        )
      })}
    </group>
  )
}

// ──────────────────────────────────────
// Lv.4 运行环境 — 双态切换门
// ──────────────────────────────────────
function DualStateGate() {
  const ballRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const barrierRef = useRef<THREE.Group>(null)
  const timeRef = useRef(0)

  useFrame((_, delta) => {
    timeRef.current += delta
    const t = timeRef.current
    if (ballRef.current) {
      ballRef.current.position.x = Math.sin(t * 0.8) * 2.2
      ballRef.current.rotation.y += delta * 2
    }
    if (ringRef.current) {
      ringRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.15)
    }
    if (barrierRef.current) {
      barrierRef.current.position.y = Math.sin(t * 0.3) * 0.1
    }
  })

  return (
    <group>
      <Text position={[0, 2.0, 0]} fontSize={0.35} color="#a78bfa" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000">
        系统调用：用户态 → 内核态
      </Text>

      {/* Left: User Space */}
      <mesh position={[-2.5, 0, 0]}>
        <planeGeometry args={[2.5, 3.5]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      <Text position={[-2.5, 1.3, 0.01]} fontSize={0.22} color="#ef4444" anchorX="center" anchorY="middle">
        用户态 (目态)
      </Text>
      <Text position={[-2.5, 0.9, 0.01]} fontSize={0.12} color="#f87171" anchorX="center" anchorY="middle">
        Ring 3
      </Text>

      {/* Right: Kernel Space */}
      <mesh position={[2.5, 0, 0]}>
        <planeGeometry args={[2.5, 3.5]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      <Text position={[2.5, 1.3, 0.01]} fontSize={0.22} color="#22c55e" anchorX="center" anchorY="middle">
        内核态 (管态)
      </Text>
      <Text position={[2.5, 0.9, 0.01]} fontSize={0.12} color="#4ade80" anchorX="center" anchorY="middle">
        Ring 0
      </Text>

      {/* Center barrier */}
      <group ref={barrierRef}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.08, 3.5, 0.5]} />
          <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={0.4} transparent opacity={0.7} />
        </mesh>
        <Text position={[0.15, -0.3, 0]} fontSize={0.12} color="#a78bfa" anchorX="left" anchorY="middle">
          trap
        </Text>
        <Text position={[-0.15, -0.6, 0]} fontSize={0.12} color="#a78bfa" anchorX="right" anchorY="middle">
          iret
        </Text>
      </group>

      {/* Traveling ball — system call visualization */}
      <mesh ref={ballRef} position={[-2.2, 0, 0.3]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
      </mesh>

      {/* Interrupt trigger ring */}
      <mesh ref={ringRef} position={[2.2, -0.5, 0.3]}>
        <torusGeometry args={[0.35, 0.08, 16, 32]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.6} transparent opacity={0.8} />
      </mesh>
      <Text position={[2.2, -1.1, 0]} fontSize={0.14} color="#f59e0b" anchorX="center" anchorY="top">
        中断处理
      </Text>

      {/* User-space app icons */}
      <Float speed={1.5} floatIntensity={0.08}>
        <mesh position={[-3.5, -0.6, 0.2]}>
          <boxGeometry args={[0.25, 0.25, 0.08]} />
          <meshStandardMaterial color="#fca5a5" emissive="#fca5a5" emissiveIntensity={0.3} />
        </mesh>
      </Float>
      <Float speed={1.8} floatIntensity={0.06}>
        <mesh position={[-3.2, -1.1, 0.2]}>
          <boxGeometry args={[0.2, 0.2, 0.06]} />
          <meshStandardMaterial color="#fca5a5" emissive="#fca5a5" emissiveIntensity={0.2} />
        </mesh>
      </Float>

      {/* Kernel-space modules */}
      <Float speed={1.3} floatIntensity={0.06}>
        <mesh position={[3.3, -0.6, 0.2]}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color="#86efac" emissive="#86efac" emissiveIntensity={0.3} />
        </mesh>
      </Float>
      <Float speed={1.6} floatIntensity={0.08}>
        <mesh position={[3.5, -1.1, 0.2]}>
          <octahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial color="#86efac" emissive="#86efac" emissiveIntensity={0.2} />
        </mesh>
      </Float>
    </group>
  )
}

// ──────────────────────────────────────
// Router
// ──────────────────────────────────────
function SceneContent({ levelId }: { levelId: number }) {
  switch (levelId) {
    case 1: return <OSCoreConcepts />
    case 3: return <FourPillars />
    case 4: return <DualStateGate />
    default: return <OSCoreConcepts />
  }
}

interface VisualSceneProps {
  levelId: number
  bgOnly?: boolean
}

export default function VisualScene({ levelId, bgOnly }: VisualSceneProps) {
  return (
    <div className={`fixed inset-0 z-0 ${bgOnly ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-20'}`}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ alpha: true }}
        style={{ pointerEvents: bgOnly ? 'auto' : 'none' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-3, -1, 3]} intensity={0.3} color="#00ff88" />
        <StarField />
        <SceneContent levelId={levelId} />
        {bgOnly && (
          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            autoRotate
            autoRotateSpeed={0.3}
            minDistance={3}
            maxDistance={10}
            enableZoom={true}
            enablePan={true}
          />
        )}
      </Canvas>
    </div>
  )
}