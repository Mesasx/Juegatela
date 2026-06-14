import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, ContactShadows, Text } from '@react-three/drei'
import * as THREE from 'three'

// ───────────────────────────────────────────────────────────────────────────
// Public contract (integrated by the parent)
// ───────────────────────────────────────────────────────────────────────────
export interface RoomSeat {
  id: number
  name: string
  color: string // base character color (hex)
  alive: boolean
  current: boolean // is it their turn
  cards: number // number of cards in hand
}

type CenterState = 'intro' | 'play' | 'reveal' | 'roulette' | 'dead' | 'over'

interface MentirosoRoom3DProps {
  opponents: RoomSeat[] // the 3 rivals (NOT the player); left→right order
  rankLabel: string // 'ASES' | 'REYES' | 'REINAS' | '' (table card)
  centerState: CenterState
  yourTurn: boolean // highlight the table ring in green
}

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────
const GREEN = '#39ff9e'
const AMBER = '#ffb070'
const NEON = '#ff2d6b'

// Darken / desaturate a hex color (for eliminated characters)
function grayed(hex: string): string {
  const c = new THREE.Color(hex)
  c.lerp(new THREE.Color('#2a2622'), 0.78)
  return `#${c.getHexString()}`
}

// ───────────────────────────────────────────────────────────────────────────
// Stylized animal-ish character built from primitives
// ───────────────────────────────────────────────────────────────────────────
function Character({
  color,
  alive,
  current,
  seed,
  // when true the figure leans toward the table (reveal / serving)
  lean = false,
  bartender = false,
}: {
  color: string
  alive: boolean
  current: boolean
  seed: number
  lean?: boolean
  bartender?: boolean
}) {
  const group = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)

  const bodyColor = alive ? color : grayed(color)
  const matRough = 0.7

  useFrame((state, dtRaw) => {
    const dt = Math.min(0.05, dtRaw)
    const t = state.clock.elapsedTime
    if (group.current) {
      if (!alive) {
        // slumped / toppled over the table
        group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, 0.55, 4, dt)
        group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, 0.35, 4, dt)
        group.current.position.y = THREE.MathUtils.damp(group.current.position.y, -0.22, 4, dt)
      } else {
        // gentle idle breathing / sway, desynced by seed
        const sway = Math.sin(t * 1.1 + seed) * 0.035
        const breathe = Math.sin(t * 1.7 + seed * 2) * 0.02
        group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, sway, 5, dt)
        group.current.position.y = THREE.MathUtils.damp(group.current.position.y, breathe, 5, dt)
        // lean toward the table when it's their turn or during reveal
        const leanX = lean || current ? 0.18 : 0
        group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, leanX, 4, dt)
      }
    }
    if (head.current && alive) {
      head.current.rotation.y = Math.sin(t * 0.6 + seed * 3) * 0.12
    }
    if (armR.current && bartender && alive) {
      // bartender pours: subtle arm motion
      armR.current.rotation.x = -0.4 + Math.sin(t * 1.6) * 0.25
    }
  })

  return (
    <group ref={group}>
      {/* torso */}
      <mesh castShadow position={[0, 0.72, 0]}>
        <capsuleGeometry args={[0.34, 0.46, 6, 14]} />
        <meshStandardMaterial color={bodyColor} roughness={matRough} metalness={0.05} />
      </mesh>
      {/* shoulders / chest plate */}
      <mesh castShadow position={[0, 0.96, 0.04]}>
        <boxGeometry args={[0.74, 0.34, 0.42]} />
        <meshStandardMaterial color={bodyColor} roughness={matRough} metalness={0.05} />
      </mesh>

      {/* head group */}
      <group ref={head} position={[0, 1.42, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.3, 22, 22]} />
          <meshStandardMaterial color={bodyColor} roughness={0.6} metalness={0.05} />
        </mesh>
        {/* snout */}
        <mesh castShadow position={[0, -0.04, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.13, 0.26, 14]} />
          <meshStandardMaterial color={bodyColor} roughness={0.6} />
        </mesh>
        {/* nose tip */}
        <mesh position={[0, -0.04, 0.4]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color="#1a1310" roughness={0.4} />
        </mesh>
        {/* ears */}
        <mesh castShadow position={[-0.18, 0.26, 0]} rotation={[0, 0, 0.25]}>
          <coneGeometry args={[0.1, 0.32, 12]} />
          <meshStandardMaterial color={bodyColor} roughness={0.6} />
        </mesh>
        <mesh castShadow position={[0.18, 0.26, 0]} rotation={[0, 0, -0.25]}>
          <coneGeometry args={[0.1, 0.32, 12]} />
          <meshStandardMaterial color={bodyColor} roughness={0.6} />
        </mesh>
        {/* eyes (glowing dots) */}
        <mesh position={[-0.11, 0.04, 0.24]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color="#fff4d6" emissive="#ffdf9e" emissiveIntensity={alive ? 1.4 : 0.1} />
        </mesh>
        <mesh position={[0.11, 0.04, 0.24]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color="#fff4d6" emissive="#ffdf9e" emissiveIntensity={alive ? 1.4 : 0.1} />
        </mesh>
      </group>

      {/* arms resting on the table (reaching forward toward +Z, the table side) */}
      <mesh castShadow position={[-0.42, 0.8, 0.34]} rotation={[1.15, 0, 0.2]}>
        <capsuleGeometry args={[0.12, 0.5, 6, 12]} />
        <meshStandardMaterial color={bodyColor} roughness={matRough} />
      </mesh>
      <group ref={armR} position={[0.42, 0.92, 0.18]}>
        <mesh castShadow position={[0, -0.25, 0.16]} rotation={[1.15, 0, -0.2]}>
          <capsuleGeometry args={[0.12, 0.5, 6, 12]} />
          <meshStandardMaterial color={bodyColor} roughness={matRough} />
        </mesh>
      </group>

      {/* turn halo + spotlight above the head */}
      {current && alive && (
        <group>
          <mesh position={[0, 1.95, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.34, 0.04, 10, 28]} />
            <meshStandardMaterial color={GREEN} emissive={GREEN} emissiveIntensity={2.4} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 2.3, 0.3]} intensity={9} distance={4} color={GREEN} />
        </group>
      )}
    </group>
  )
}

// Floating label + card-count pips above a seat
function SeatLabel({ name, cards, alive }: { name: string; cards: number; alive: boolean }) {
  const pips = Math.max(0, Math.min(5, cards))
  return (
    <group position={[0, 2.4, 0]}>
      <Text
        fontSize={0.2}
        color={alive ? '#ffe7c2' : '#7a7066'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#1a0d08"
      >
        {name}
      </Text>
      <group position={[0, -0.26, 0]}>
        {Array.from({ length: pips }).map((_, i) => (
          <mesh key={i} position={[(i - (pips - 1) / 2) * 0.16, 0, 0]}>
            <boxGeometry args={[0.1, 0.14, 0.012]} />
            <meshStandardMaterial
              color="#f4ead2"
              emissive={alive ? AMBER : '#000000'}
              emissiveIntensity={0.4}
              roughness={0.5}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// Round table in the foreground + center emissive ring
// ───────────────────────────────────────────────────────────────────────────
function Table({
  active,
  label,
  yourTurn,
}: {
  active: boolean
  label: string
  yourTurn: boolean
}) {
  const ring = useRef<THREE.MeshStandardMaterial>(null)
  const ringColor = active ? GREEN : AMBER

  useFrame((state) => {
    if (ring.current) {
      const base = active ? 2.6 : 1.0
      ring.current.emissiveIntensity = base + Math.sin(state.clock.elapsedTime * 3) * 0.25
    }
  })

  const text = yourTurn ? 'TU TURNO' : label ? `MESA: ${label}` : ''

  return (
    <group position={[0, 0, 0.55]}>
      {/* table top */}
      <mesh castShadow receiveShadow position={[0, 0.92, 0]}>
        <cylinderGeometry args={[1.55, 1.55, 0.12, 48]} />
        <meshStandardMaterial color="#5a3a22" roughness={0.55} metalness={0.1} />
      </mesh>
      {/* felt inlay */}
      <mesh position={[0, 0.985, 0]}>
        <cylinderGeometry args={[1.32, 1.32, 0.012, 48]} />
        <meshStandardMaterial color="#1f3a2c" roughness={0.9} />
      </mesh>
      {/* rim */}
      <mesh position={[0, 0.92, 0]}>
        <torusGeometry args={[1.55, 0.07, 12, 48]} />
        <meshStandardMaterial color="#3a2414" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* pedestal + base */}
      <mesh castShadow position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.28, 0.36, 0.9, 20]} />
        <meshStandardMaterial color="#3a2414" roughness={0.6} />
      </mesh>
      <mesh receiveShadow position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.08, 24]} />
        <meshStandardMaterial color="#2a1810" roughness={0.7} />
      </mesh>

      {/* center emissive ring */}
      <mesh position={[0, 1.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.045, 12, 40]} />
        <meshStandardMaterial
          ref={ring}
          color={ringColor}
          emissive={ringColor}
          emissiveIntensity={active ? 2.6 : 1.0}
          toneMapped={false}
        />
      </mesh>

      {/* center floating text */}
      {text && (
        <Text
          position={[0, 1.18, 0]}
          rotation={[-0.5, 0, 0]}
          fontSize={0.18}
          color={yourTurn ? GREEN : '#ffe7c2'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.012}
          outlineColor="#1a0d08"
        >
          {text}
        </Text>
      )}

      {/* a couple of cards on the felt */}
      <mesh castShadow position={[-0.35, 1.0, 0.5]} rotation={[-Math.PI / 2, 0, 0.3]}>
        <boxGeometry args={[0.26, 0.38, 0.01]} />
        <meshStandardMaterial color="#f2ead4" roughness={0.55} />
      </mesh>
      <mesh castShadow position={[-0.1, 1.0, 0.46]} rotation={[-Math.PI / 2, 0, -0.15]}>
        <boxGeometry args={[0.26, 0.38, 0.01]} />
        <meshStandardMaterial color="#3a1422" roughness={0.55} />
      </mesh>

      {/* poker chips stacked */}
      {[0, 0.05, 0.1].map((y, i) => (
        <mesh key={i} castShadow position={[0.55, 1.0 + y, 0.45]}>
          <cylinderGeometry args={[0.12, 0.12, 0.045, 18]} />
          <meshStandardMaterial
            color={i === 1 ? '#c2342f' : '#1a1a1a'}
            emissive={NEON}
            emissiveIntensity={0.12}
            roughness={0.4}
          />
        </mesh>
      ))}

      {/* candle on the table */}
      <group position={[0.62, 1.0, -0.35]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.22, 12]} />
          <meshStandardMaterial color="#e8d9b0" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.17, 0]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#ffd27a" emissive="#ffb24a" emissiveIntensity={3} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 0.2, 0]} intensity={2.2} distance={2.2} color="#ffb24a" />
      </group>

      {/* two glasses */}
      {[-0.5, 0.2].map((x, i) => (
        <mesh key={i} position={[x, 1.06, -0.55]}>
          <cylinderGeometry args={[0.06, 0.05, 0.16, 14]} />
          <meshStandardMaterial color="#a8cfe0" transparent opacity={0.4} roughness={0.1} metalness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// Back bar: counter, shelves with bottles, bartender, stools
// ───────────────────────────────────────────────────────────────────────────
function BackBar() {
  const bottleColors = ['#39ff9e', '#ff2d6b', '#ffb070', '#7ad0ff', '#c89bff', '#ffe066', '#ff6a3d', '#8affc1']
  return (
    <group position={[0, 0, -7.2]}>
      {/* counter */}
      <mesh castShadow receiveShadow position={[0, 1.05, 0]}>
        <boxGeometry args={[9, 0.18, 0.9]} />
        <meshStandardMaterial color="#4a2e1a" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.5, 0.1]}>
        <boxGeometry args={[9, 1.0, 0.7]} />
        <meshStandardMaterial color="#2e1c10" roughness={0.7} />
      </mesh>
      {/* counter edge glow */}
      <mesh position={[0, 1.15, 0.42]}>
        <boxGeometry args={[9, 0.03, 0.03]} />
        <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={1.4} toneMapped={false} />
      </mesh>

      {/* back shelves */}
      {[2.0, 2.55, 3.1].map((y, row) => (
        <group key={row}>
          <mesh position={[0, y - 0.12, -0.7]} castShadow>
            <boxGeometry args={[8.2, 0.06, 0.4]} />
            <meshStandardMaterial color="#3a2414" roughness={0.6} />
          </mesh>
          {Array.from({ length: 11 }).map((_, i) => {
            const x = (i - 5) * 0.72
            const col = bottleColors[(i + row * 3) % bottleColors.length]
            return (
              <mesh key={i} position={[x, y, -0.7]} castShadow>
                <cylinderGeometry args={[0.07, 0.07, 0.34, 10]} />
                <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.7} roughness={0.3} />
              </mesh>
            )
          })}
        </group>
      ))}

      {/* bartender behind the counter */}
      <group position={[1.4, 0.55, -0.55]} scale={1.05}>
        <Character color="#6b5b95" alive current={false} seed={9.3} bartender />
      </group>

      {/* stools in front of the counter */}
      {[-3.2, -1.6, 1.6, 3.2].map((x) => (
        <group key={x} position={[x, 0, 1.6]}>
          <mesh castShadow position={[0, 0.62, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.08, 16]} />
            <meshStandardMaterial color="#5a2018" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.6, 10]} />
            <meshStandardMaterial color="#2a2020" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// Room shell: floor, walls, ceiling, neon sign
// ───────────────────────────────────────────────────────────────────────────
function Room() {
  return (
    <group>
      {/* plank floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]} receiveShadow>
        <planeGeometry args={[24, 28]} />
        <meshStandardMaterial color="#3a241a" roughness={0.85} metalness={0.05} />
      </mesh>
      {/* plank seams */}
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[(i - 5) * 1.0, 0.005, -2]}>
          <planeGeometry args={[0.03, 28]} />
          <meshStandardMaterial color="#241308" roughness={0.9} />
        </mesh>
      ))}

      {/* back brick wall */}
      <mesh position={[0, 4, -8.6]} receiveShadow>
        <planeGeometry args={[24, 9]} />
        <meshStandardMaterial color="#2a1410" roughness={0.95} />
      </mesh>
      {/* side walls */}
      <mesh position={[-9, 4, -2]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 9]} />
        <meshStandardMaterial color="#22100c" roughness={0.95} />
      </mesh>
      <mesh position={[9, 4, -2]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 9]} />
        <meshStandardMaterial color="#22100c" roughness={0.95} />
      </mesh>
      {/* ceiling */}
      <mesh position={[0, 6.4, -2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 20]} />
        <meshStandardMaterial color="#160c08" roughness={1} side={THREE.DoubleSide} />
      </mesh>

      {/* neon sign on the back wall */}
      <group position={[0, 4.7, -8.5]}>
        <Text
          fontSize={0.95}
          color={NEON}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
          font={undefined}
          outlineWidth={0.02}
          outlineColor="#ff8fb5"
          material-toneMapped={false}
        >
          EL GARITO
        </Text>
        {/* neon underline tube */}
        <mesh position={[0, -0.7, 0.05]}>
          <boxGeometry args={[4.4, 0.06, 0.06]} />
          <meshStandardMaterial color={NEON} emissive={NEON} emissiveIntensity={2.6} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 0, 1.2]} intensity={14} distance={9} color={NEON} />
      </group>
    </group>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// Flickering hanging lamps + state-driven mood lighting
// ───────────────────────────────────────────────────────────────────────────
function Lighting({ centerState }: { centerState: CenterState }) {
  const lamp1 = useRef<THREE.PointLight>(null)
  const lamp2 = useRef<THREE.PointLight>(null)
  const mood = useRef<THREE.PointLight>(null)
  const ambient = useRef<THREE.AmbientLight>(null)
  const flash = useRef(0)
  const lastState = useRef<CenterState>(centerState)

  // trigger a red flash when entering 'dead'
  if (centerState === 'dead' && lastState.current !== 'dead') flash.current = 1
  lastState.current = centerState

  useFrame((state, dtRaw) => {
    const dt = Math.min(0.05, dtRaw)
    const t = state.clock.elapsedTime
    if (lamp1.current) {
      lamp1.current.intensity = 26 + Math.sin(t * 9.0) * 2.4 + Math.sin(t * 23) * 1.0
    }
    if (lamp2.current) {
      lamp2.current.intensity = 22 + Math.sin(t * 7.3 + 2) * 2.2 + Math.sin(t * 31) * 0.8
    }
    // mood light: red tension during roulette, red flash on death
    flash.current = Math.max(0, flash.current - dt * 1.5)
    const tension = centerState === 'roulette' ? 1 : 0
    if (mood.current) {
      const target = tension * 16 + flash.current * 40
      mood.current.intensity = THREE.MathUtils.damp(mood.current.intensity, target, 6, dt)
    }
    if (ambient.current) {
      // lower ambient during roulette for tension
      const targetAmb = centerState === 'roulette' ? 0.12 : 0.26
      ambient.current.intensity = THREE.MathUtils.damp(ambient.current.intensity, targetAmb, 4, dt)
    }
  })

  return (
    <>
      <ambientLight ref={ambient} intensity={0.26} color="#ffcf9e" />
      {/* warm lamp hanging over the table */}
      <pointLight
        ref={lamp1}
        position={[0, 3.4, 0.5]}
        intensity={26}
        distance={9}
        color={AMBER}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* warm lamp over the bar */}
      <pointLight ref={lamp2} position={[0, 3.8, -6.5]} intensity={22} distance={10} color="#ff9a4a" />
      {/* fill */}
      <pointLight position={[-4, 3, 2]} intensity={8} distance={9} color="#ff7a30" />
      <pointLight position={[4, 3, 2]} intensity={8} distance={9} color="#ffaa55" />
      {/* mood / tension light (red), starts off */}
      <pointLight ref={mood} position={[0, 2.2, -2]} intensity={0} distance={12} color="#ff1830" />

      {/* hanging lamp shades over the table */}
      <group position={[0, 3.5, 0.5]}>
        <mesh>
          <coneGeometry args={[0.45, 0.4, 18, 1, true]} />
          <meshStandardMaterial
            color="#1a1008"
            emissive={AMBER}
            emissiveIntensity={0.6}
            side={THREE.DoubleSide}
            roughness={0.5}
          />
        </mesh>
        <mesh position={[0, 1.3, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 2.6, 6]} />
          <meshStandardMaterial color="#0a0604" />
        </mesh>
      </group>
    </>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// Soft volumetric "smoke" plane that drifts (cheap atmosphere)
// ───────────────────────────────────────────────────────────────────────────
function Haze() {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.4
    }
  })
  return (
    <group ref={ref} position={[0, 2.6, -4]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[(i - 1) * 2.4, i * 0.3, 0]} rotation={[0, 0, i * 0.4]}>
          <planeGeometry args={[5, 2.2]} />
          <meshBasicMaterial color="#ffb070" transparent opacity={0.04} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// Scene assembly
// ───────────────────────────────────────────────────────────────────────────
function Scene({ opponents, rankLabel, centerState, yourTurn }: MentirosoRoom3DProps) {
  // place up to 3 rivals across the far side of the table: left, center, right
  const seats = useMemo(() => {
    const slots: [number, number][] = [
      [-2.0, -1.7],
      [0, -2.2],
      [2.0, -1.7],
    ]
    const rots = [0.42, 0, -0.42] // turn to face the camera/center
    return opponents.slice(0, 3).map((s, i) => ({
      seat: s,
      pos: slots[i],
      rotY: rots[i],
    }))
  }, [opponents])

  const tableActive = yourTurn || centerState === 'play'
  const reveal = centerState === 'reveal'

  return (
    <>
      <color attach="background" args={['#140a08']} />
      <fog attach="fog" args={['#140a08', 7, 22]} />

      <Lighting centerState={centerState} />

      <Room />
      <BackBar />
      <Table active={tableActive} label={rankLabel} yourTurn={yourTurn} />

      {/* rivals */}
      {seats.map(({ seat, pos, rotY }) => (
        <group key={seat.id} position={[pos[0], 0, pos[1]]} rotation={[0, rotY, 0]}>
          {/* seat their stool */}
          <mesh position={[0, 0.34, -0.1]} castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.1, 18]} />
            <meshStandardMaterial color="#5a2018" roughness={0.6} />
          </mesh>
          <Character
            color={seat.color}
            alive={seat.alive}
            current={seat.current}
            seed={seat.id * 1.7 + 0.5}
            lean={reveal && seat.alive}
          />
          <SeatLabel name={seat.name} cards={seat.cards} alive={seat.alive} />
        </group>
      ))}

      <Haze />

      <ContactShadows position={[0, 0.02, -1.5]} opacity={0.55} scale={16} blur={2.6} far={6} />
      <Environment preset="warehouse" />
    </>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// Exported component
// ───────────────────────────────────────────────────────────────────────────
export function MentirosoRoom3D({ opponents, rankLabel, centerState, yourTurn }: MentirosoRoom3DProps) {
  return (
    <Canvas
      className="absolute inset-0"
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true }}
      camera={{ position: [0, 1.25, 2.4], fov: 55 }}
    >
      <Scene
        opponents={opponents}
        rankLabel={rankLabel}
        centerState={centerState}
        yourTurn={yourTurn}
      />
    </Canvas>
  )
}

export default MentirosoRoom3D
