import { useEffect, useRef, useState } from 'react'
import type { GameComponentProps } from './types'

type BallType = 'cue' | 'solid' | 'eight' | 'stripe'
interface Ball {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  potted: boolean
  type: BallType
  color: string
  num: number
}

const W = 700
const H = 380
const R = 11
const FRICTION = 0.985
const POCKET_R = 21
const MAX_POWER = 19

const POCKETS = [
  [22, 22], [W / 2, 16], [W - 22, 22],
  [22, H - 22], [W / 2, H - 16], [W - 22, H - 22],
]

// classic pool colours (1..7 solids; 9..15 stripes share the hue)
const HUE: Record<number, string> = {
  1: '#f5c518', 2: '#1f5fd0', 3: '#e0322b', 4: '#7a3fb0',
  5: '#e07a1f', 6: '#1f9e4d', 7: '#7d2d22',
}
const ballColor = (n: number) => (n === 8 ? '#0b0b0b' : HUE[n > 8 ? n - 8 : n])

export default function Billar({ difficulty = 2, onScore, onResult, resetKey }: GameComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [turn, setTurn] = useState<'you' | 'ai'>('you')
  const [groups, setGroups] = useState<{ you: BallType | null; ai: BallType | null }>({ you: null, ai: null })
  const [score, setScore] = useState({ you: 0, opp: 0 })
  const [power, setPower] = useState(0)
  const [hint, setHint] = useState('Arrastra desde la bola blanca para apuntar; cuanto más estiras, más fuerza')
  const balls = useRef<Ball[]>([])
  const moving = useRef(false)
  const drag = useRef<{ active: boolean; x: number; y: number } | null>(null)
  const turnRef = useRef<'you' | 'ai'>('you')
  const groupRef = useRef<{ you: BallType | null; ai: BallType | null }>({ you: null, ai: null })
  const finished = useRef(false)
  const pottedShot = useRef<Ball[]>([])
  const scratch = useRef(false)

  const setupBalls = () => {
    const arr: Ball[] = [
      { id: 0, x: W * 0.25, y: H / 2, vx: 0, vy: 0, potted: false, type: 'cue', color: '#f4f4f5', num: 0 },
    ]
    // triangular rack (apex toward cue), 8-ball in the middle
    const rack = [
      [1],
      [9, 2],
      [3, 8, 10],
      [11, 4, 5, 12],
      [6, 13, 14, 7, 15],
    ]
    const dx = R * 1.74
    const x0 = W * 0.66
    rack.forEach((row, r) => {
      row.forEach((n, k) => {
        arr.push({
          id: n,
          x: x0 + r * dx,
          y: H / 2 + (k - r / 2) * (R * 2 + 0.5),
          vx: 0, vy: 0, potted: false,
          type: n === 8 ? 'eight' : n < 8 ? 'solid' : 'stripe',
          color: ballColor(n),
          num: n,
        })
      })
    })
    balls.current = arr
  }

  const clearedGroup = (who: 'you' | 'ai') => {
    const g = groupRef.current[who]
    if (!g) return false
    return balls.current.filter((b) => b.type === g && !b.potted).length === 0
  }

  const refreshScore = () => {
    const gy = groupRef.current.you
    const ga = groupRef.current.ai
    const you = gy ? balls.current.filter((b) => b.type === gy && b.potted).length : 0
    const opp = ga ? balls.current.filter((b) => b.type === ga && b.potted).length : 0
    scoreRef.current = { you, opp }
    setScore({ you, opp })
    onScore?.(you, opp)
  }
  const scoreRef = useRef({ you: 0, opp: 0 })

  useEffect(() => {
    setupBalls()
    setTurn('you'); turnRef.current = 'you'
    setGroups({ you: null, ai: null }); groupRef.current = { you: null, ai: null }
    setScore({ you: 0, opp: 0 }); scoreRef.current = { you: 0, opp: 0 }
    setPower(0)
    moving.current = false; finished.current = false; scratch.current = false
    pottedShot.current = []
    setHint('Arrastra desde la bola blanca para apuntar; cuanto más estiras, más fuerza')
    onScore?.(0, 0)

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0

    const toLogical = (cx: number, cy: number) => {
      const r = canvas.getBoundingClientRect()
      return { x: ((cx - r.left) / r.width) * W, y: ((cy - r.top) / r.height) * H }
    }

    const down = (cx: number, cy: number) => {
      if (moving.current || turnRef.current !== 'you' || finished.current) return
      const p = toLogical(cx, cy)
      const cue = balls.current[0]
      if (Math.hypot(p.x - cue.x, p.y - cue.y) < R * 6) {
        drag.current = { active: true, x: p.x, y: p.y }
      }
    }
    const moveTo = (cx: number, cy: number) => {
      if (drag.current?.active) {
        const p = toLogical(cx, cy)
        drag.current.x = p.x
        drag.current.y = p.y
        const cue = balls.current[0]
        const pw = Math.min(MAX_POWER, Math.hypot(cue.x - p.x, cue.y - p.y) / 6)
        setPower(pw / MAX_POWER)
      }
    }
    const up = () => {
      if (drag.current?.active) {
        const cue = balls.current[0]
        const dxv = cue.x - drag.current.x
        const dyv = cue.y - drag.current.y
        const pw = Math.min(MAX_POWER, Math.hypot(dxv, dyv) / 6)
        if (pw > 0.6) {
          const ang = Math.atan2(dyv, dxv)
          cue.vx = Math.cos(ang) * pw
          cue.vy = Math.sin(ang) * pw
          moving.current = true
          pottedShot.current = []
          scratch.current = false
          setHint('')
        }
        drag.current = null
        setPower(0)
      }
    }

    const md = (e: MouseEvent) => down(e.clientX, e.clientY)
    const mm = (e: MouseEvent) => moveTo(e.clientX, e.clientY)
    const mu = () => up()
    const td = (e: TouchEvent) => { if (e.touches[0]) down(e.touches[0].clientX, e.touches[0].clientY) }
    const tm = (e: TouchEvent) => { if (e.touches[0]) moveTo(e.touches[0].clientX, e.touches[0].clientY) }
    const tu = () => up()
    canvas.addEventListener('mousedown', md)
    window.addEventListener('mousemove', mm)
    window.addEventListener('mouseup', mu)
    canvas.addEventListener('touchstart', td, { passive: true })
    canvas.addEventListener('touchmove', tm, { passive: true })
    window.addEventListener('touchend', tu)

    const aiShoot = () => {
      if (finished.current) return
      const cue = balls.current[0]
      const g = groupRef.current.ai
      let targets = balls.current.filter((b) => !b.potted && b.id !== 0)
      if (g) {
        const own = targets.filter((b) => b.type === g)
        targets = clearedGroup('ai') ? targets.filter((b) => b.id === 8) : own.length ? own : targets
      } else {
        targets = targets.filter((b) => b.id !== 8)
      }
      if (!targets.length) targets = balls.current.filter((b) => !b.potted && b.id !== 0)
      // aim toward nearest pocket through the target
      const t = targets[Math.floor(Math.random() * targets.length)]
      let best = POCKETS[0], bestD = Infinity
      for (const p of POCKETS) {
        const d = Math.hypot(t.x - p[0], t.y - p[1])
        if (d < bestD) { bestD = d; best = p }
      }
      const aimX = t.x - (best[0] - t.x) * 0.12
      const aimY = t.y - (best[1] - t.y) * 0.12
      const noise = (Math.random() - 0.5) * (0.42 - difficulty * 0.1)
      const ang = Math.atan2(aimY - cue.y, aimX - cue.x) + noise
      const pw = 10 + Math.random() * 6
      cue.vx = Math.cos(ang) * pw
      cue.vy = Math.sin(ang) * pw
      moving.current = true
      pottedShot.current = []
      scratch.current = false
    }

    const resolveShot = () => {
      const shooter = turnRef.current
      const other = shooter === 'you' ? 'ai' : 'you'
      const potted = pottedShot.current.filter((b) => b.id !== 0)
      const eight = potted.find((b) => b.id === 8)

      // 8-ball decides the game: you win only if your group is fully cleared and no scratch
      if (eight) {
        const g = groupRef.current[shooter]
        const groupCleared = !!g && balls.current.filter((b) => b.type === g && !b.potted).length === 0
        const won = groupCleared && !scratch.current
        finished.current = true
        refreshScore()
        const sc = scoreRef.current
        const youWin = shooter === 'you' ? won : !won
        setHint(youWin ? '¡Negra metida, ganas!' : 'Negra fuera de tiempo…')
        setTimeout(() => onResult({ youWin, youScore: sc.you, oppScore: sc.opp }), 800)
        return
      }

      let keepTurn = false
      if (scratch.current) {
        // foul: respot cue, pass turn
        const cue = balls.current[0]
        cue.x = W * 0.22; cue.y = H / 2; cue.vx = 0; cue.vy = 0
        keepTurn = false
        setHint('Falta: bola blanca dentro. Pasa el turno.')
      } else if (potted.length === 0) {
        keepTurn = false
      } else if (!groupRef.current[shooter]) {
        const solids = potted.filter((b) => b.type === 'solid').length
        const stripes = potted.filter((b) => b.type === 'stripe').length
        if (solids > 0 && stripes === 0) {
          groupRef.current[shooter] = 'solid'; groupRef.current[other] = 'stripe'; keepTurn = true
        } else if (stripes > 0 && solids === 0) {
          groupRef.current[shooter] = 'stripe'; groupRef.current[other] = 'solid'; keepTurn = true
        } else {
          keepTurn = true // mixed on open table: keep shooting, table still open
        }
        setGroups({ ...groupRef.current })
      } else {
        const g = groupRef.current[shooter]!
        const mine = potted.filter((b) => b.type === g).length
        const opp = potted.filter((b) => b.type !== g && b.type !== 'cue').length
        keepTurn = mine > 0 && opp === 0
      }

      refreshScore()
      if (!keepTurn) {
        turnRef.current = other
        setTurn(other)
      }
      if (turnRef.current === 'ai') {
        setHint('Turno del rival…')
        setTimeout(aiShoot, 750)
      } else if (!scratch.current) {
        setHint('Tu turno: arrastra desde la blanca')
      }
    }

    const loop = () => {
      const bs = balls.current
      if (moving.current) {
        let anyMoving = false
        for (const b of bs) {
          if (b.potted) continue
          b.x += b.vx; b.y += b.vy
          b.vx *= FRICTION; b.vy *= FRICTION
          if (Math.abs(b.vx) < 0.04) b.vx = 0
          if (Math.abs(b.vy) < 0.04) b.vy = 0
          if (b.vx || b.vy) anyMoving = true
          if (b.x < R + 16) { b.x = R + 16; b.vx = Math.abs(b.vx) * 0.78 }
          if (b.x > W - R - 16) { b.x = W - R - 16; b.vx = -Math.abs(b.vx) * 0.78 }
          if (b.y < R + 16) { b.y = R + 16; b.vy = Math.abs(b.vy) * 0.78 }
          if (b.y > H - R - 16) { b.y = H - R - 16; b.vy = -Math.abs(b.vy) * 0.78 }
          for (const [px, py] of POCKETS) {
            if (Math.hypot(b.x - px, b.y - py) < POCKET_R) {
              if (b.id === 0) { scratch.current = true; b.x = px; b.y = py; b.vx = 0; b.vy = 0; b.potted = false; b.x = W * 0.22; b.y = H / 2 }
              else { b.potted = true; b.vx = 0; b.vy = 0; pottedShot.current.push(b) }
            }
          }
        }
        for (let i = 0; i < bs.length; i++) {
          for (let j = i + 1; j < bs.length; j++) {
            const a = bs[i], c = bs[j]
            if (a.potted || c.potted) continue
            const dx = c.x - a.x, dy = c.y - a.y
            const dist = Math.hypot(dx, dy)
            if (dist > 0 && dist < R * 2) {
              const nx = dx / dist, ny = dy / dist
              const overlap = R * 2 - dist
              a.x -= nx * overlap / 2; a.y -= ny * overlap / 2
              c.x += nx * overlap / 2; c.y += ny * overlap / 2
              const dvx = a.vx - c.vx, dvy = a.vy - c.vy
              const p = dvx * nx + dvy * ny
              if (p > 0) { a.vx -= p * nx; a.vy -= p * ny; c.vx += p * nx; c.vy += p * ny; anyMoving = true }
            }
          }
        }
        if (!anyMoving) { moving.current = false; resolveShot() }
      }

      // ── draw ──
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const sx = canvas.width / W, sy = canvas.height / H
      ctx.save()
      ctx.scale(sx, sy)
      // rail (wood)
      ctx.fillStyle = '#241007'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#3a1c0c'
      ctx.fillRect(4, 4, W - 8, H - 8)
      // felt
      const grad = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * 0.6)
      grad.addColorStop(0, '#125c38')
      grad.addColorStop(1, '#073a22')
      ctx.fillStyle = grad
      ctx.fillRect(15, 15, W - 30, H - 30)
      ctx.strokeStyle = 'rgba(57,255,158,0.22)'
      ctx.lineWidth = 2
      ctx.strokeRect(15, 15, W - 30, H - 30)
      // head string + spot
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.beginPath(); ctx.moveTo(W * 0.25, 16); ctx.lineTo(W * 0.25, H - 16); ctx.stroke()
      // pockets
      for (const [px, py] of POCKETS) {
        ctx.fillStyle = '#1c1208'
        ctx.beginPath(); ctx.arc(px, py, POCKET_R, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#040506'
        ctx.beginPath(); ctx.arc(px, py, POCKET_R - 6, 0, Math.PI * 2); ctx.fill()
      }
      // aim guide + power
      if (drag.current?.active) {
        const cue = bs[0]
        const dxv = cue.x - drag.current.x
        const dyv = cue.y - drag.current.y
        const ang = Math.atan2(dyv, dxv)
        ctx.strokeStyle = 'rgba(255,255,255,0.55)'
        ctx.lineWidth = 2
        ctx.setLineDash([7, 7])
        ctx.beginPath(); ctx.moveTo(cue.x, cue.y)
        ctx.lineTo(cue.x + Math.cos(ang) * 240, cue.y + Math.sin(ang) * 240)
        ctx.stroke(); ctx.setLineDash([])
        // cue stick behind
        ctx.strokeStyle = '#caa15a'; ctx.lineWidth = 4
        ctx.beginPath(); ctx.moveTo(cue.x - Math.cos(ang) * 18, cue.y - Math.sin(ang) * 18)
        ctx.lineTo(cue.x - Math.cos(ang) * 150, cue.y - Math.sin(ang) * 150); ctx.stroke()
      }
      // balls
      for (const b of bs) {
        if (b.potted) continue
        drawBall(ctx, b)
      }
      ctx.restore()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('mousedown', md)
      window.removeEventListener('mousemove', mm)
      window.removeEventListener('mouseup', mu)
      canvas.removeEventListener('touchstart', td)
      canvas.removeEventListener('touchmove', tm)
      window.removeEventListener('touchend', tu)
    }
  }, [resetKey, difficulty])

  const groupLabel = (g: BallType | null) => (g === 'solid' ? 'lisas' : g === 'stripe' ? 'rayas' : 'sin asignar')

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-sm font-bold">
        <span className={turn === 'you' ? 'text-neon-green' : 'text-zinc-500'}>
          {turn === 'you' && '● '}TÚ · {groupLabel(groups.you)} {score.you}/7
        </span>
        <span className="text-[11px] uppercase tracking-wide text-zinc-500">{hint}</span>
        <span className={turn === 'ai' ? 'text-neon-blue' : 'text-zinc-500'}>
          {score.opp}/7 {groupLabel(groups.ai)} · RIVAL{turn === 'ai' && ' ●'}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={W * 2}
        height={H * 2}
        className="w-full touch-none rounded-xl"
        style={{ aspectRatio: `${W}/${H}` }}
      />
      {/* power meter */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide text-zinc-500">Potencia</span>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full transition-[width] duration-75"
            style={{
              width: `${power * 100}%`,
              background: power > 0.8 ? 'linear-gradient(90deg,#ffb627,#ff2d55)' : 'linear-gradient(90deg,#39ff9e,#2dd4ff)',
            }}
          />
        </div>
        <span className="w-9 text-right text-[11px] font-bold text-zinc-300">{Math.round(power * 100)}%</span>
      </div>
    </div>
  )
}

function drawBall(ctx: CanvasRenderingContext2D, b: Ball) {
  ctx.save()
  // shadow
  ctx.shadowBlur = 8
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  if (b.type === 'stripe') {
    // white base
    ctx.fillStyle = '#f1f1f1'
    ctx.beginPath(); ctx.arc(b.x, b.y, R, 0, Math.PI * 2); ctx.fill()
    ctx.shadowBlur = 0
    // coloured band (clipped to circle)
    ctx.save()
    ctx.beginPath(); ctx.arc(b.x, b.y, R, 0, Math.PI * 2); ctx.clip()
    ctx.fillStyle = b.color
    ctx.fillRect(b.x - R, b.y - R * 0.52, R * 2, R * 1.04)
    ctx.restore()
  } else {
    ctx.fillStyle = b.color
    ctx.beginPath(); ctx.arc(b.x, b.y, R, 0, Math.PI * 2); ctx.fill()
  }
  ctx.shadowBlur = 0
  // glossy highlight
  const hl = ctx.createRadialGradient(b.x - R * 0.35, b.y - R * 0.4, 1, b.x, b.y, R)
  hl.addColorStop(0, 'rgba(255,255,255,0.55)')
  hl.addColorStop(0.35, 'rgba(255,255,255,0.05)')
  hl.addColorStop(1, 'rgba(0,0,0,0.15)')
  ctx.fillStyle = hl
  ctx.beginPath(); ctx.arc(b.x, b.y, R, 0, Math.PI * 2); ctx.fill()
  // number disc (not for cue)
  if (b.id !== 0) {
    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.arc(b.x, b.y, R * 0.46, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#111'
    ctx.font = `bold ${R * 0.7}px Inter, sans-serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(String(b.num), b.x, b.y + 0.5)
  }
  ctx.restore()
}
