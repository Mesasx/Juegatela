import { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import type { GameComponentProps } from './types'

const ROUNDS = 5
const ROLL_MS = 1500

// Face layout on the box material array [ +x, -x, +y, -y, +z, -z ]:
// right=3, left=4, top=1, bottom=6, front=2, back=5
// Euler rotation that brings a given value to the top (+y):
const TOP_ROT: Record<number, [number, number, number]> = {
  1: [0, 0, 0],
  6: [Math.PI, 0, 0],
  2: [-Math.PI / 2, 0, 0],
  5: [Math.PI / 2, 0, 0],
  3: [0, 0, Math.PI / 2],
  4: [0, 0, -Math.PI / 2],
}

// Draw a neon pip face on a canvas → texture
function faceTexture(value: number, color: string) {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const x = c.getContext('2d')!
  x.fillStyle = '#0c0910'
  x.fillRect(0, 0, 128, 128)
  x.fillStyle = '#1a1322'
  x.fillRect(6, 6, 116, 116)
  const pts: Record<number, [number, number][]> = {
    1: [[64, 64]],
    2: [[40, 40], [88, 88]],
    3: [[36, 36], [64, 64], [92, 92]],
    4: [[40, 40], [88, 40], [40, 88], [88, 88]],
    5: [[40, 40], [88, 40], [64, 64], [40, 88], [88, 88]],
    6: [[40, 36], [88, 36], [40, 64], [88, 64], [40, 92], [88, 92]],
  }
  x.shadowBlur = 14
  x.shadowColor = color
  x.fillStyle = color
  for (const [px, py] of pts[value]) {
    x.beginPath()
    x.arc(px, py, 11, 0, Math.PI * 2)
    x.fill()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.anisotropy = 4
  return tex
}

function Die({
  rollId,
  value,
  position,
  color,
}: {
  rollId: number
  value: number
  position: [number, number, number]
  color: string
}) {
  const ref = useRef<THREE.Group>(null)
  const start = useRef<number>(-1)
  const lastRoll = useRef(0)
  const spin = useRef<[number, number, number]>([0, 0, 0])

  const materials = useMemo(() => {
    const faces = [3, 4, 1, 6, 2, 5] // matches [+x,-x,+y,-y,+z,-z]
    return faces.map(
      (f) =>
        new THREE.MeshStandardMaterial({
          map: faceTexture(f, color),
          roughness: 0.35,
          metalness: 0.2,
        })
    )
  }, [color])

  useFrame((state) => {
    if (!ref.current) return
    if (rollId !== lastRoll.current) {
      lastRoll.current = rollId
      start.current = state.clock.elapsedTime
      spin.current = [
        6 + Math.random() * 6,
        6 + Math.random() * 6,
        6 + Math.random() * 6,
      ]
    }
    const target = new THREE.Euler(...TOP_ROT[value])
    if (start.current < 0) {
      ref.current.rotation.copy(target)
      return
    }
    const t = (state.clock.elapsedTime - start.current) * 1000
    if (t < ROLL_MS) {
      const k = t / ROLL_MS
      const decay = 1 - k
      ref.current.rotation.x += spin.current[0] * 0.05 * decay
      ref.current.rotation.y += spin.current[1] * 0.05 * decay
      ref.current.rotation.z += spin.current[2] * 0.05 * decay
      ref.current.position.y = position[1] + Math.abs(Math.sin(k * Math.PI * 3)) * (1 - k) * 0.8
    } else {
      // ease to the resolved face
      ref.current.rotation.x += (target.x - ref.current.rotation.x) * 0.2
      ref.current.rotation.y += (target.y - ref.current.rotation.y) * 0.2
      ref.current.rotation.z += (target.z - ref.current.rotation.z) * 0.2
      ref.current.position.y += (position[1] - ref.current.position.y) * 0.2
    }
  })

  return (
    <group ref={ref} position={position}>
      <RoundedBox args={[1, 1, 1]} radius={0.12} smoothness={4} material={materials} castShadow />
    </group>
  )
}

function Scene({ rollId, you, ai }: { rollId: number; you: [number, number]; ai: [number, number] }) {
  return (
    <>
      <color attach="background" args={['#070509']} />
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 6, 4]} intensity={60} color="#b14bff" />
      <pointLight position={[-4, 4, -2]} intensity={50} color="#2dd4ff" />
      <pointLight position={[0, 3, 5]} intensity={40} color="#ff2d55" />
      {/* your dice (red) */}
      <Die rollId={rollId} value={you[0]} position={[-2.4, 0.5, 1.4]} color="#ff5277" />
      <Die rollId={rollId} value={you[1]} position={[-1.0, 0.5, 1.4]} color="#ff5277" />
      {/* ai dice (blue) */}
      <Die rollId={rollId} value={ai[0]} position={[1.0, 0.5, -1.0]} color="#5cc8ff" />
      <Die rollId={rollId} value={ai[1]} position={[2.4, 0.5, -1.0]} color="#5cc8ff" />
      <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={14} blur={2.4} far={4} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[26, 26]} />
        <meshStandardMaterial color="#0c0910" roughness={0.6} metalness={0.3} />
      </mesh>
      <gridHelper args={[26, 26, '#3a2150', '#1a1322']} position={[0, 0, 0]} />
      <Environment preset="night" />
    </>
  )
}

export default function Dados3D({ onScore, onResult, resetKey }: GameComponentProps) {
  const [you, setYou] = useState<[number, number]>([1, 1])
  const [ai, setAi] = useState<[number, number]>([1, 1])
  const [rollId, setRollId] = useState(0)
  const [score, setScore] = useState({ you: 0, opp: 0 })
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'rolling' | 'done'>('idle')
  const [msg, setMsg] = useState('Pulsa para lanzar los dados')
  const finished = useRef(false)

  // reset on resetKey
  useEffect(() => {
    setYou([1, 1]); setAi([1, 1]); setRollId(0); setScore({ you: 0, opp: 0 })
    setRound(0); setPhase('idle'); setMsg('Pulsa para lanzar los dados')
    finished.current = false
    onScore?.(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  function roll() {
    if (phase === 'rolling' || finished.current) return
    const y: [number, number] = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]
    const a: [number, number] = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]
    setYou(y); setAi(a)
    setRollId((r) => r + 1)
    setPhase('rolling')
    setMsg('Rodando…')
    window.setTimeout(() => {
      const sy = y[0] + y[1]
      const sa = a[0] + a[1]
      const youWon = sy > sa
      const tie = sy === sa
      const ns = { you: score.you + (youWon ? 1 : 0), opp: score.opp + (!youWon && !tie ? 1 : 0) }
      setScore(ns)
      onScore?.(ns.you, ns.opp)
      const r = round + 1
      setRound(r)
      setMsg(tie ? `Empate a ${sy}. ¡Otra!` : youWon ? `¡Ganas la ronda! ${sy} vs ${sa}` : `Pierdes la ronda. ${sy} vs ${sa}`)
      setPhase('idle')
      if (r >= ROUNDS || ns.you > ROUNDS / 2 || ns.opp > ROUNDS / 2) {
        finished.current = true
        setPhase('done')
        window.setTimeout(() => onResult({ youWin: ns.you > ns.opp, youScore: ns.you, oppScore: ns.opp }), 900)
      }
    }, ROLL_MS + 250)
  }

  return (
    <div className="relative h-full w-full" style={{ aspectRatio: '16/10' }}>
      <Canvas shadows camera={{ position: [0, 6.5, 7], fov: 42 }} className="rounded-xl">
        <Scene rollId={rollId} you={you} ai={ai} />
      </Canvas>

      {/* HUD overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3 text-sm font-bold">
        <span className="text-neon-red">TÚ {score.you}</span>
        <span className="text-zinc-400">Ronda {Math.min(round + (phase === 'rolling' ? 1 : 0), ROUNDS)}/{ROUNDS}</span>
        <span className="text-neon-blue">{score.opp} RIVAL</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-4">
        <span className="rounded-full bg-black/50 px-3 py-1 text-xs text-zinc-200 backdrop-blur">{msg}</span>
        <button
          onClick={roll}
          disabled={phase !== 'idle'}
          className="btn-primary px-6 py-2.5 disabled:opacity-40"
        >
          🎲 Lanzar dados
        </button>
      </div>
    </div>
  )
}
