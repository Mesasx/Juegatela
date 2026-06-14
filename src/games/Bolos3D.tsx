import { useRef, useState, useMemo, useEffect, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import type { GameComponentProps } from './types'

// ---- Constants ----
const FRAMES = 3 // frames per player
const LANE_LENGTH = 22
const LANE_WIDTH = 4
const PIN_Z = -8 // pins live near the far end
const BALL_START_Z = 7 // ball starts near the camera
const PIN_COLOR = '#39ff9e'

// 10-pin triangular formation (x, z offsets relative to head pin)
const PIN_LAYOUT: [number, number][] = [
  [0, 0], // 1 (head)
  [-0.55, -0.95], [0.55, -0.95], // 2,3
  [-1.1, -1.9], [0, -1.9], [1.1, -1.9], // 4,5,6
  [-1.65, -2.85], [-0.55, -2.85], [0.55, -2.85], [1.65, -2.85], // 7,8,9,10
]

type PinState = {
  standing: boolean
  // current animated transform values
  fall: number // 0 standing .. 1 fully toppled
  fallDir: [number, number] // horizontal direction of topple
}

// ---- Pin mesh ----
function Pin({
  base,
  state,
}: {
  base: [number, number]
  state: React.MutableRefObject<PinState>
}) {
  const group = useRef<THREE.Group>(null)
  const mat = useRef<THREE.MeshStandardMaterial>(null)

  useFrame((_, dtRaw) => {
    if (!group.current) return
    const dt = Math.min(0.05, dtRaw)
    const s = state.current
    // animate fall value toward target (1 if knocked, 0 if standing)
    const target = s.standing ? 0 : 1
    s.fall += (target - s.fall) * Math.min(1, dt * 8)
    const f = s.fall
    // topple: rotate around base, drift in fall direction
    const angle = f * (Math.PI / 2) * 1.05
    group.current.rotation.x = s.fallDir[1] * angle
    group.current.rotation.z = -s.fallDir[0] * angle
    group.current.position.x = base[0] + s.fallDir[0] * f * 0.9
    group.current.position.z = base[1] + s.fallDir[1] * f * 0.9
    group.current.position.y = 0.6 - f * 0.45
    if (mat.current) mat.current.emissiveIntensity = 0.6 + (s.standing ? 0.4 : 0)
  })

  return (
    <group ref={group} position={[base[0], 0.6, base[1]]}>
      {/* bowling pin: stacked cylinders for a pin-ish silhouette */}
      <mesh castShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 1.0, 16]} />
        <meshStandardMaterial ref={mat} color="#ffffff" emissive={PIN_COLOR} emissiveIntensity={0.7} roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh castShadow position={[0, 0.78, 0]}>
        <sphereGeometry args={[0.17, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive={PIN_COLOR} emissiveIntensity={0.7} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* neon ring */}
      <mesh position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.03, 8, 24]} />
        <meshStandardMaterial color="#ff2d55" emissive="#ff2d55" emissiveIntensity={1.4} />
      </mesh>
    </group>
  )
}

// ---- Ball ----
function Ball({ ballRef }: { ballRef: React.MutableRefObject<THREE.Group | null> }) {
  return (
    <group ref={ballRef} position={[0, 0.5, BALL_START_Z]}>
      <mesh castShadow>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial color="#2dd4ff" emissive="#2dd4ff" emissiveIntensity={0.8} roughness={0.15} metalness={0.6} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshBasicMaterial color="#5cc8ff" wireframe transparent opacity={0.3} />
      </mesh>
      <pointLight intensity={5} distance={4} color="#2dd4ff" />
    </group>
  )
}

// ---- Ball animation driver ----
type Throw = { aim: number; power: number; active: boolean } | null

function BallDriver({
  ballRef,
  throwRef,
  onArrive,
}: {
  ballRef: React.MutableRefObject<THREE.Group | null>
  throwRef: React.MutableRefObject<Throw>
  onArrive: (aim: number, power: number) => void
}) {
  const t = useRef(0)
  const fired = useRef(false)

  useFrame((_, dtRaw) => {
    const ball = ballRef.current
    if (!ball) return
    const dt = Math.min(0.05, dtRaw)
    const th = throwRef.current
    if (!th || !th.active) {
      // idle: rest at start
      t.current = 0
      fired.current = false
      ball.position.set(0, 0.5, BALL_START_Z)
      return
    }
    // travel time scales (faster with more power)
    const duration = 1.3 - th.power * 0.5
    t.current += dt / duration
    const k = Math.min(1, t.current)
    // ease-in for accelerating roll
    const ek = k * k * (1.4 - 0.4 * k)
    const z = BALL_START_Z + (PIN_Z + 1 - BALL_START_Z) * ek
    // aim: lateral target at the pins; ball curves toward it
    const targetX = th.aim * (LANE_WIDTH / 2 - 0.6)
    ball.position.set(targetX * ek, 0.5, z)
    ball.rotation.x -= dt * 12 * (0.6 + th.power)
    if (k >= 1 && !fired.current) {
      fired.current = true
      onArrive(th.aim, th.power)
    }
  })
  return null
}

function Scene({
  pins,
  ballRef,
  throwRef,
  onArrive,
}: {
  pins: React.MutableRefObject<PinState>[]
  ballRef: React.MutableRefObject<THREE.Group | null>
  throwRef: React.MutableRefObject<Throw>
  onArrive: (aim: number, power: number) => void
}) {
  return (
    <>
      <color attach="background" args={['#070509']} />
      <fog attach="fog" args={['#070509', 16, 40]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 7, 4]} intensity={60} color="#b14bff" />
      <pointLight position={[-3, 6, -6]} intensity={55} color="#2dd4ff" />
      <pointLight position={[0, 5, PIN_Z]} intensity={45} color="#39ff9e" />
      <pointLight position={[0, 4, 6]} intensity={35} color="#ff2d55" />

      {/* lane floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]} receiveShadow>
        <planeGeometry args={[LANE_WIDTH, LANE_LENGTH]} />
        <meshStandardMaterial color="#0c0910" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* gutters / edge glow */}
      {[-LANE_WIDTH / 2, LANE_WIDTH / 2].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, -2]}>
          <planeGeometry args={[0.12, LANE_LENGTH]} />
          <meshStandardMaterial color="#b14bff" emissive="#b14bff" emissiveIntensity={1.6} />
        </mesh>
      ))}
      {/* center guide line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -2]}>
        <planeGeometry args={[0.05, LANE_LENGTH]} />
        <meshStandardMaterial color="#2dd4ff" emissive="#2dd4ff" emissiveIntensity={1} />
      </mesh>
      {/* back wall */}
      <mesh position={[0, 2, PIN_Z - 3.5]}>
        <planeGeometry args={[LANE_WIDTH + 1, 4]} />
        <meshStandardMaterial color="#0c0910" emissive="#b14bff" emissiveIntensity={0.25} side={THREE.DoubleSide} />
      </mesh>

      {PIN_LAYOUT.map((p, i) => (
        <Pin key={i} base={[p[0], PIN_Z + p[1]]} state={pins[i]} />
      ))}
      <Ball ballRef={ballRef} />
      <BallDriver ballRef={ballRef} throwRef={throwRef} onArrive={onArrive} />

      <ContactShadows position={[0, 0.001, -2]} opacity={0.45} scale={20} blur={2.2} far={5} />
      <gridHelper args={[40, 40, '#3a2150', '#1a1322']} position={[0, -0.01, -2]} />
      <Environment preset="night" />
    </>
  )
}

// pure scoring: how many of the currently standing pins fall given aim + power
function knockPins(standing: boolean[], aim: number, power: number, rng: () => number): number[] {
  // ideal aim is 0 (center). offset = distance from pocket
  const offset = Math.abs(aim)
  // accuracy quality 1 (perfect center) → 0 (edge)
  let quality = 1 - offset * 1.05
  quality = Math.max(0, quality)
  // power sweet spot ~0.7; too little leaves pins, too much can skid
  const powerQuality = 1 - Math.abs(power - 0.72) * 1.1
  const score = quality * 0.7 + Math.max(0, powerQuality) * 0.3
  // base number of pins to knock from the standing set
  const remaining = standing.filter(Boolean).length
  // expected fraction with some randomness
  const frac = Math.min(1, Math.max(0, score * (0.85 + rng() * 0.3)))
  let toKnock = Math.round(remaining * frac)
  // strike chance bonus when very well placed
  if (score > 0.9 && rng() > 0.25) toKnock = remaining
  toKnock = Math.max(0, Math.min(remaining, toKnock))

  // pick which pins fall: prefer pins nearest the aim line, plus chain knock-ons
  const standingIdx = standing.map((s, i) => (s ? i : -1)).filter((i) => i >= 0)
  const aimX = aim * (LANE_WIDTH / 2 - 0.6)
  standingIdx.sort((a, b) => {
    const da = Math.abs(PIN_LAYOUT[a][0] - aimX) + PIN_LAYOUT[a][1] * 0.05
    const db = Math.abs(PIN_LAYOUT[b][0] - aimX) + PIN_LAYOUT[b][1] * 0.05
    return da - db
  })
  return standingIdx.slice(0, toKnock)
}

export default function Bolos3D({ difficulty = 2, onScore, onResult, resetKey }: GameComponentProps) {
  // pin refs (animation state lives in refs to avoid re-renders)
  const pinRefs = useMemo(
    () => PIN_LAYOUT.map(() => ({ current: { standing: true, fall: 0, fallDir: [0, -1] } as PinState })),
    []
  )
  const ballRef = useRef<THREE.Group | null>(null)
  const throwRef = useRef<Throw>(null)
  const finished = useRef(false)
  const standingRef = useRef<boolean[]>(PIN_LAYOUT.map(() => true))

  const [turn, setTurn] = useState<'you' | 'ai'>('you')
  const [frame, setFrame] = useState(1)
  const [ball, setBall] = useState<1 | 2>(1) // which ball of the frame
  const [score, setScore] = useState({ you: 0, opp: 0 })
  const [aim, setAim] = useState(0) // -1..1
  const [powerOsc, setPowerOsc] = useState(0.5) // displayed oscillating power
  const [phase, setPhase] = useState<'aim' | 'rolling' | 'between'>('aim')
  const [msg, setMsg] = useState('Apunta y lanza')
  const [frameFell, setFrameFell] = useState(0) // pins knocked this frame (for HUD)

  // power oscillation animation (HTML, requestAnimationFrame)
  const powerDir = useRef(1)
  const rafRef = useRef<number>(0)
  useEffect(() => {
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      setPowerOsc((p) => {
        let np = p + powerDir.current * dt * 1.3
        if (np > 1) { np = 1; powerDir.current = -1 }
        if (np < 0) { np = 0; powerDir.current = 1 }
        return np
      })
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const resetPins = useCallback(() => {
    standingRef.current = PIN_LAYOUT.map(() => true)
    pinRefs.forEach((r) => {
      r.current.standing = true
      r.current.fall = 0
      r.current.fallDir = [0, -1]
    })
  }, [pinRefs])

  // full reset on resetKey
  useMemo(() => {
    setTurn('you')
    setFrame(1)
    setBall(1)
    setScore({ you: 0, opp: 0 })
    setAim(0)
    setPhase('aim')
    setMsg('Apunta y lanza')
    setFrameFell(0)
    finished.current = false
    throwRef.current = null
    resetPins()
    onScore?.(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  // schedule cleanup of pending timeouts
  const timers = useRef<number[]>([])
  useEffect(() => {
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t))
    }
  }, [])
  const after = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms)
    timers.current.push(id)
  }, [])

  // advance to next ball / frame / player, called after pins settle
  const advance = useCallback(
    (knockedThisThrow: number) => {
      const totalDownThisFrame = standingRef.current.filter((s) => !s).length
      setFrameFell(totalDownThisFrame)

      // add knocked count to the active player's score
      const isYou = turn === 'you'
      setScore((prev) => {
        const next = isYou
          ? { ...prev, you: prev.you + knockedThisThrow }
          : { ...prev, opp: prev.opp + knockedThisThrow }
        onScore?.(next.you, next.opp)
        return next
      })

      const allDown = standingRef.current.every((s) => !s)
      const isSecondBall = ball === 2

      if (allDown || isSecondBall) {
        // frame over for this player
        if (turn === 'you') {
          // hand off to AI for the same frame number
          setMsg('Turno del rival…')
          after(1100, () => {
            resetPins()
            setTurn('ai')
            setBall(1)
            setFrameFell(0)
            setPhase('rolling')
            runAiThrow(1)
          })
        } else {
          // AI finished its frame → advance frame number or end game
          if (frame >= FRAMES) {
            // game over
            after(900, () => {
              if (finished.current) return
              finished.current = true
              setScore((prev) => {
                setMsg(prev.you > prev.opp ? '¡Ganaste la partida!' : prev.you === prev.opp ? '¡Empate!' : 'Gana el rival…')
                after(700, () => {
                  if (!finished.current) return
                  onResult({ youWin: prev.you > prev.opp, youScore: prev.you, oppScore: prev.opp })
                })
                return prev
              })
            })
          } else {
            setMsg('Nuevo frame, ¡tu turno!')
            after(1100, () => {
              resetPins()
              setFrame((f) => f + 1)
              setTurn('you')
              setBall(1)
              setFrameFell(0)
              setPhase('aim')
            })
          }
        }
      } else {
        // second ball for the same player
        setMsg(turn === 'you' ? 'Segundo tiro' : 'Rival: segundo tiro')
        after(900, () => {
          setBall(2)
          throwRef.current = null
          if (turn === 'you') setPhase('aim')
          else {
            setPhase('rolling')
            runAiThrow(2)
          }
        })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [turn, ball, frame, onScore, onResult, after, resetPins]
  )

  // when the ball reaches the pins → resolve knockdown
  const onArrive = useCallback(
    (aimVal: number, power: number) => {
      const fell = knockPins(standingRef.current, aimVal, power, Math.random)
      fell.forEach((i) => {
        standingRef.current[i] = false
        // give a topple direction roughly away from aim line + spread
        const dirX = (PIN_LAYOUT[i][0] - aimVal * 1.5) * 0.4 + (Math.random() - 0.5) * 0.5
        pinRefs[i].current.standing = false
        pinRefs[i].current.fallDir = [Math.max(-1, Math.min(1, dirX)), -1]
      })
      after(700, () => {
        throwRef.current = null
        advance(fell.length)
      })
    },
    [pinRefs, after, advance]
  )

  // AI takes a throw
  const runAiThrow = useCallback(
    (whichBall: 1 | 2) => {
      // AI accuracy improves with difficulty
      const d = Math.max(1, Math.min(3, difficulty))
      const spread = 0.42 - d * 0.1 // higher difficulty → tighter aim
      const aiAim = (Math.random() - 0.5) * 2 * spread
      const aiPower = 0.72 + (Math.random() - 0.5) * (0.36 - d * 0.06)
      setMsg(`Rival lanzando (tiro ${whichBall})…`)
      after(700, () => {
        throwRef.current = { aim: aiAim, power: Math.max(0.1, Math.min(1, aiPower)), active: true }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [difficulty, after]
  )

  // player throws with current aim + the power locked from the oscillator
  const throwBall = useCallback(() => {
    if (phase !== 'aim' || turn !== 'you' || finished.current) return
    setPhase('rolling')
    setMsg('¡Allá va!')
    throwRef.current = { aim, power: powerOsc, active: true }
  }, [phase, turn, aim, powerOsc])

  const canControl = phase === 'aim' && turn === 'you' && !finished.current

  // keyboard: arrows to aim, space to throw
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!canControl) return
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        setAim((a) => Math.max(-1, a - 0.08))
        e.preventDefault()
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        setAim((a) => Math.min(1, a + 0.08))
        e.preventDefault()
      } else if (e.key === ' ' || e.key === 'Enter') {
        throwBall()
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canControl, throwBall])

  return (
    <div className="relative h-full w-full select-none" style={{ aspectRatio: '16/10' }}>
      <Canvas shadows camera={{ position: [0, 3.2, 11], fov: 48 }} className="rounded-xl">
        <Scene pins={pinRefs} ballRef={ballRef} throwRef={throwRef} onArrive={onArrive} />
      </Canvas>

      {/* HUD top: scoreboard */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3 text-sm font-bold">
        <span className="text-neon-blue">TÚ {score.you}</span>
        <span className="text-zinc-400">
          Frame {frame}/{FRAMES} · {turn === 'you' ? 'Tú' : 'Rival'} · {ball === 1 ? '1er' : '2º'} tiro
          {frameFell > 0 ? ` · ${frameFell}↓` : ''}
        </span>
        <span style={{ color: '#b14bff' }}>{score.opp} RIVAL</span>
      </div>

      {/* bottom controls */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-3">
        <span className="rounded-full bg-black/50 px-3 py-1 text-xs text-zinc-200 backdrop-blur">{msg}</span>

        {/* aim slider + power bar (only active on your turn) */}
        {turn === 'you' && (
          <div className="flex w-full max-w-sm flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-12 text-right text-[10px] text-zinc-400">PUNTERÍA</span>
              <input
                type="range"
                min={-100}
                max={100}
                value={Math.round(aim * 100)}
                onChange={(e) => setAim(Number(e.target.value) / 100)}
                disabled={!canControl}
                className="flex-1 accent-[#2dd4ff]"
                style={{ touchAction: 'none' }}
              />
            </div>
            {/* oscillating power meter */}
            <div className="flex items-center gap-2">
              <span className="w-12 text-right text-[10px] text-zinc-400">POTENCIA</span>
              <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-black/50">
                {/* sweet spot zone */}
                <div className="absolute inset-y-0 rounded-full" style={{ left: '62%', width: '20%', background: 'rgba(57,255,158,0.35)' }} />
                <div
                  className="h-full rounded-full"
                  style={{ width: `${powerOsc * 100}%`, background: 'linear-gradient(90deg,#2dd4ff,#b14bff,#ff2d55)' }}
                />
              </div>
            </div>
          </div>
        )}

        <button
          onClick={throwBall}
          disabled={!canControl}
          className="btn-primary px-6 py-2.5 disabled:opacity-40"
        >
          🎳 Lanzar
        </button>
      </div>
    </div>
  )
}
