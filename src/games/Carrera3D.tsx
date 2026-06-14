import { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import type { GameComponentProps } from './types'

// --- Track / gameplay constants ---
const LANES = [-2.2, 0, 2.2] as const // x positions of the 3 lanes
const RACE_DISTANCE = 1000 // arbitrary units to "drive" before finishing
const OBSTACLE_SPAWN_Z = -70 // far ahead (negative = into the screen)
const DESPAWN_Z = 6 // behind the camera
const NUM_OBSTACLES = 7

type Obstacle = {
  id: number
  z: number
  lane: number
  color: string
}

const OBS_COLORS = ['#ff2d55', '#b14bff', '#ffb627', '#2dd4ff']

// Difficulty tuning: AI speed multiplier + crash penalty severity
function tuning(difficulty: number) {
  const d = Math.max(1, Math.min(3, difficulty))
  return {
    aiSpeed: 26 + (d - 1) * 7, // units/sec the rival "drives"
    obstacleGap: 14 - (d - 1) * 2.5, // smaller gap = denser
  }
}

// ---------------- 3D pieces ----------------

function PlayerCar({ laneX, tilt }: { laneX: number; tilt: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (!ref.current) return
    const k = Math.min(1, dt * 12)
    ref.current.position.x += (laneX - ref.current.position.x) * k
    ref.current.rotation.z += (tilt - ref.current.rotation.z) * k
    // subtle hover bob
    ref.current.position.y = 0.5 + Math.sin(performance.now() / 220) * 0.04
  })
  return (
    <group ref={ref} position={[0, 0.5, 3.2]}>
      <RoundedBox args={[1.3, 0.55, 2.1]} radius={0.18} smoothness={4} castShadow>
        <meshStandardMaterial
          color="#ff2d55"
          emissive="#ff2d55"
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.5}
        />
      </RoundedBox>
      {/* cockpit */}
      <RoundedBox args={[0.8, 0.4, 0.9]} radius={0.12} smoothness={4} position={[0, 0.4, -0.1]}>
        <meshStandardMaterial color="#5cc8ff" emissive="#2dd4ff" emissiveIntensity={0.8} roughness={0.1} metalness={0.2} />
      </RoundedBox>
      {/* under-glow */}
      <pointLight position={[0, -0.2, 0]} intensity={6} color="#ff5277" distance={4} />
      {/* tail lights */}
      <mesh position={[0, 0.05, 1.05]}>
        <boxGeometry args={[1.1, 0.18, 0.06]} />
        <meshStandardMaterial color="#ff5277" emissive="#ff2d55" emissiveIntensity={2} />
      </mesh>
    </group>
  )
}

function RivalCar({ laneX, z }: { laneX: number; z: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (!ref.current) return
    const k = Math.min(1, dt * 10)
    ref.current.position.x += (laneX - ref.current.position.x) * k
    ref.current.position.z += (z - ref.current.position.z) * k
    ref.current.position.y = 0.5 + Math.sin(performance.now() / 260 + 1) * 0.04
  })
  return (
    <group ref={ref} position={[laneX, 0.5, z]}>
      <RoundedBox args={[1.3, 0.55, 2.1]} radius={0.18} smoothness={4} castShadow>
        <meshStandardMaterial
          color="#2dd4ff"
          emissive="#2dd4ff"
          emissiveIntensity={0.7}
          roughness={0.3}
          metalness={0.5}
          transparent
          opacity={0.85}
        />
      </RoundedBox>
      <RoundedBox args={[0.8, 0.4, 0.9]} radius={0.12} smoothness={4} position={[0, 0.4, -0.1]}>
        <meshStandardMaterial color="#b14bff" emissive="#b14bff" emissiveIntensity={0.9} roughness={0.1} />
      </RoundedBox>
      <pointLight position={[0, -0.2, 0]} intensity={6} color="#2dd4ff" distance={4} />
    </group>
  )
}

function ObstacleMesh({ obstacle }: { obstacle: Obstacle }) {
  return (
    <mesh position={[LANES[obstacle.lane], 0.6, obstacle.z]} castShadow>
      <boxGeometry args={[1.5, 1.1, 1.5]} />
      <meshStandardMaterial
        color={obstacle.color}
        emissive={obstacle.color}
        emissiveIntensity={0.9}
        roughness={0.25}
        metalness={0.4}
        wireframe={false}
      />
    </mesh>
  )
}

// Animated road: a long plane plus a grid we scroll toward the camera to fake speed.
function Road({ scroll }: { scroll: React.MutableRefObject<number> }) {
  const gridA = useRef<THREE.GridHelper>(null)
  const gridB = useRef<THREE.GridHelper>(null)
  const SEG = 40
  useFrame(() => {
    const s = scroll.current % SEG
    if (gridA.current) gridA.current.position.z = s - SEG
    if (gridB.current) gridB.current.position.z = s
  })
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -25]} receiveShadow>
        <planeGeometry args={[9, 160]} />
        <meshStandardMaterial color="#0c0910" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* lane dividers */}
      {[-1.1, 1.1].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, -25]}>
          <planeGeometry args={[0.08, 160]} />
          <meshStandardMaterial color="#b14bff" emissive="#b14bff" emissiveIntensity={1.4} />
        </mesh>
      ))}
      <gridHelper ref={gridA} args={[9, 9, '#2dd4ff', '#23163a']} position={[0, 0, -SEG]} />
      <gridHelper ref={gridB} args={[9, 9, '#2dd4ff', '#23163a']} position={[0, 0, 0]} />
    </group>
  )
}

function Scene({
  laneX,
  tilt,
  rivalLaneX,
  rivalZ,
  obstacles,
  scroll,
}: {
  laneX: number
  tilt: number
  rivalLaneX: number
  rivalZ: number
  obstacles: Obstacle[]
  scroll: React.MutableRefObject<number>
}) {
  return (
    <>
      <color attach="background" args={['#070509']} />
      <fog attach="fog" args={['#070509', 22, 75]} />
      <ambientLight intensity={0.45} />
      <pointLight position={[4, 8, 2]} intensity={70} color="#b14bff" />
      <pointLight position={[-5, 6, -10]} intensity={60} color="#2dd4ff" />
      <pointLight position={[0, 5, 6]} intensity={40} color="#ff2d55" />
      <Road scroll={scroll} />
      <PlayerCar laneX={laneX} tilt={tilt} />
      <RivalCar laneX={rivalLaneX} z={rivalZ} />
      {obstacles.map((o) => (
        <ObstacleMesh key={o.id} obstacle={o} />
      ))}
      <ContactShadows position={[0, 0, 1]} opacity={0.5} scale={20} blur={2.2} far={5} />
      <Environment preset="night" />
    </>
  )
}

// ---------------- The driver loop (runs inside Canvas) ----------------

function GameLoop({
  running,
  difficulty,
  laneRef,
  scroll,
  obstaclesRef,
  setLaneX,
  setTilt,
  setRivalLaneX,
  setRivalZ,
  setObstacles,
  progressRef,
  onProgress,
  onFinish,
}: {
  running: boolean
  difficulty: number
  laneRef: React.MutableRefObject<number>
  scroll: React.MutableRefObject<number>
  obstaclesRef: React.MutableRefObject<Obstacle[]>
  setLaneX: (x: number) => void
  setTilt: (t: number) => void
  setRivalLaneX: (x: number) => void
  setRivalZ: (z: number) => void
  setObstacles: (o: Obstacle[]) => void
  progressRef: React.MutableRefObject<{ you: number; opp: number }>
  onProgress: (you: number, opp: number) => void
  onFinish: (youWin: boolean, you: number, opp: number) => void
}) {
  const t = useMemo(() => tuning(difficulty), [difficulty])
  const speedRef = useRef(28) // current player speed (units/sec)
  const obsIdRef = useRef(1)
  const spawnTimer = useRef(0)
  const rivalLaneRef = useRef(1)
  const rivalLaneTimer = useRef(0)
  const lastReportRef = useRef(0)
  const crashFlash = useRef<number>(0)

  useFrame((_, rawDt) => {
    if (!running) return
    const dt = Math.min(0.05, rawDt) // clamp for stability

    // --- player speed: recover toward cruise speed ---
    const cruise = 30
    speedRef.current += (cruise - speedRef.current) * Math.min(1, dt * 1.5)
    if (crashFlash.current > 0) crashFlash.current -= dt

    // --- scroll the world toward camera ---
    scroll.current += speedRef.current * dt

    // --- advance player progress ---
    progressRef.current.you = Math.min(RACE_DISTANCE, progressRef.current.you + speedRef.current * dt)
    progressRef.current.opp = Math.min(RACE_DISTANCE, progressRef.current.opp + t.aiSpeed * dt)

    // --- visual lane + tilt ---
    const targetX = LANES[laneRef.current]
    setTilt(Math.max(-0.35, Math.min(0.35, (targetX - LANES[1]) * -0.06 + (laneRef.current - 1) * -0.18)))
    setLaneX(targetX)

    // --- rival lane shimmy + parallel z position based on progress diff ---
    rivalLaneTimer.current -= dt
    if (rivalLaneTimer.current <= 0) {
      rivalLaneTimer.current = 0.8 + Math.random() * 1.2
      rivalLaneRef.current = Math.floor(Math.random() * 3)
    }
    setRivalLaneX(LANES[rivalLaneRef.current])
    // z: ahead (negative) when rival leads, behind (positive) when player leads
    const diff = progressRef.current.opp - progressRef.current.you
    setRivalZ(Math.max(-30, Math.min(8, 3.2 - diff * 0.18)))

    // --- spawn / move obstacles ---
    spawnTimer.current -= dt
    let obs = obstaclesRef.current
    // move all toward camera
    obs = obs.map((o) => ({ ...o, z: o.z + speedRef.current * dt }))
    // collision check (player at z≈3.2, lane = laneRef)
    let crashed = false
    obs = obs.filter((o) => {
      const hit = Math.abs(o.z - 3.2) < 1.4 && o.lane === laneRef.current
      if (hit && crashFlash.current <= 0) {
        crashed = true
        return false // remove obstacle on hit
      }
      return o.z < DESPAWN_Z
    })
    if (crashed) {
      speedRef.current = 8 // slam the brakes
      crashFlash.current = 0.45
    }
    // spawn new ones if there's room
    if (spawnTimer.current <= 0 && obs.length < NUM_OBSTACLES) {
      spawnTimer.current = (t.obstacleGap / Math.max(speedRef.current, 6)) + 0.15
      const lane = Math.floor(Math.random() * 3)
      obs.push({ id: obsIdRef.current++, z: OBSTACLE_SPAWN_Z, lane, color: OBS_COLORS[Math.floor(Math.random() * OBS_COLORS.length)] })
    }
    obstaclesRef.current = obs
    setObstacles(obs)

    // --- report progress (throttled, integer %) ---
    const youPct = Math.round((progressRef.current.you / RACE_DISTANCE) * 100)
    const oppPct = Math.round((progressRef.current.opp / RACE_DISTANCE) * 100)
    lastReportRef.current += dt
    if (lastReportRef.current > 0.2) {
      lastReportRef.current = 0
      onProgress(youPct, oppPct)
    }

    // --- finish ---
    if (progressRef.current.you >= RACE_DISTANCE || progressRef.current.opp >= RACE_DISTANCE) {
      const youWin = progressRef.current.you >= progressRef.current.opp
      onFinish(youWin, Math.min(100, youPct), Math.min(100, oppPct))
    }
  })

  return null
}

// ---------------- Main component ----------------

export default function Carrera3D({ difficulty = 1, onScore, onResult, resetKey }: GameComponentProps) {
  const [phase, setPhase] = useState<'idle' | 'racing' | 'done'>('idle')
  const [laneX, setLaneX] = useState(0)
  const [tilt, setTilt] = useState(0)
  const [rivalLaneX, setRivalLaneX] = useState(0)
  const [rivalZ, setRivalZ] = useState(3.2)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [hud, setHud] = useState({ you: 0, opp: 0 })
  const [msg, setMsg] = useState('Esquiva los obstáculos. ¡Llega primero!')

  // refs that the in-Canvas loop mutates
  const laneRef = useRef(1) // 0,1,2
  const scroll = useRef(0)
  const obstaclesRef = useRef<Obstacle[]>([])
  const progressRef = useRef({ you: 0, opp: 0 })
  const finished = useRef(false)

  // reset everything on resetKey
  useMemo(() => {
    setPhase('idle')
    setLaneX(0)
    setTilt(0)
    setRivalLaneX(0)
    setRivalZ(3.2)
    setObstacles([])
    setHud({ you: 0, opp: 0 })
    setMsg('Esquiva los obstáculos. ¡Llega primero!')
    laneRef.current = 1
    scroll.current = 0
    obstaclesRef.current = []
    progressRef.current = { you: 0, opp: 0 }
    finished.current = false
    onScore?.(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  function moveLane(dir: -1 | 1) {
    laneRef.current = Math.max(0, Math.min(2, laneRef.current + dir))
  }

  // keyboard controls
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase !== 'racing') return
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        moveLane(-1)
        e.preventDefault()
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        moveLane(1)
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase])

  function start() {
    if (phase === 'racing') return
    laneRef.current = 1
    scroll.current = 0
    obstaclesRef.current = []
    progressRef.current = { you: 0, opp: 0 }
    finished.current = false
    setObstacles([])
    setHud({ you: 0, opp: 0 })
    setMsg('¡Ya! Usa ← → / A D o los botones')
    setPhase('racing')
  }

  function handleProgress(you: number, opp: number) {
    setHud({ you, opp })
    onScore?.(you, opp)
  }

  function handleFinish(youWin: boolean, you: number, opp: number) {
    if (finished.current) return
    finished.current = true
    setPhase('done')
    setHud({ you, opp })
    onScore?.(you, opp)
    setMsg(youWin ? '¡GANASTE LA CARRERA!' : 'El rival cruzó primero…')
    window.setTimeout(() => onResult({ youWin, youScore: you, oppScore: opp }), 700)
  }

  // pointer / swipe support on the canvas wrapper
  const swipeStart = useRef<number | null>(null)
  function onPointerDown(e: React.PointerEvent) {
    if (phase !== 'racing') return
    swipeStart.current = e.clientX
  }
  function onPointerUp(e: React.PointerEvent) {
    if (phase !== 'racing' || swipeStart.current === null) return
    const dx = e.clientX - swipeStart.current
    if (Math.abs(dx) > 24) moveLane(dx > 0 ? 1 : -1)
    swipeStart.current = null
  }

  return (
    <div className="relative h-full w-full select-none" style={{ aspectRatio: '16/10' }}>
      <div
        className="h-full w-full"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        style={{ touchAction: 'none' }}
      >
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} camera={{ position: [0, 3.4, 8.5], fov: 55 }} className="rounded-xl">
          <Scene
            laneX={laneX}
            tilt={tilt}
            rivalLaneX={rivalLaneX}
            rivalZ={rivalZ}
            obstacles={obstacles}
            scroll={scroll}
          />
          <GameLoop
            running={phase === 'racing'}
            difficulty={difficulty}
            laneRef={laneRef}
            scroll={scroll}
            obstaclesRef={obstaclesRef}
            setLaneX={setLaneX}
            setTilt={setTilt}
            setRivalLaneX={setRivalLaneX}
            setRivalZ={setRivalZ}
            setObstacles={setObstacles}
            progressRef={progressRef}
            onProgress={handleProgress}
            onFinish={handleFinish}
          />
        </Canvas>
      </div>

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 p-3 text-sm font-bold">
        <div className="flex items-center justify-between">
          <span className="text-neon-red">TÚ {hud.you}%</span>
          <span className="text-zinc-400">CARRERA DE CALLEJÓN</span>
          <span className="text-neon-blue">{hud.opp}% RIVAL</span>
        </div>
        {/* progress bars */}
        <div className="mt-2 space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/50">
            <div
              className="h-full rounded-full"
              style={{ width: `${hud.you}%`, background: 'linear-gradient(90deg,#ff2d55,#ff5277)' }}
            />
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/50">
            <div
              className="h-full rounded-full"
              style={{ width: `${hud.opp}%`, background: 'linear-gradient(90deg,#2dd4ff,#5cc8ff)' }}
            />
          </div>
        </div>
      </div>

      {/* bottom controls */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-4">
        <span className="rounded-full bg-black/50 px-3 py-1 text-xs text-zinc-200 backdrop-blur">{msg}</span>
        {phase === 'racing' ? (
          <div className="flex w-full max-w-sm items-center justify-between gap-4">
            <button
              onClick={() => moveLane(-1)}
              className="btn-ghost flex-1 py-3 text-2xl"
              aria-label="Izquierda"
            >
              ◀
            </button>
            <button
              onClick={() => moveLane(1)}
              className="btn-ghost flex-1 py-3 text-2xl"
              aria-label="Derecha"
            >
              ▶
            </button>
          </div>
        ) : (
          <button onClick={start} className="btn-primary px-6 py-2.5">
            {phase === 'done' ? '🏁 Carrera terminada' : '🏎️ Empezar'}
          </button>
        )}
      </div>
    </div>
  )
}
