import { useEffect, useRef, useState } from 'react'
import type { GameComponentProps } from './types'

interface Ball {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  potted: boolean
  cue?: boolean
}

const R = 11 // ball radius (px in logical space)
const W = 600
const H = 360
const FRICTION = 0.986
const POCKET_R = 20

const POCKETS = [
  [18, 18], [W / 2, 12], [W - 18, 18],
  [18, H - 18], [W / 2, H - 12], [W - 18, H - 18],
]

export default function Billar({ difficulty = 1, onScore, onResult, resetKey }: GameComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [turn, setTurn] = useState<'you' | 'ai'>('you')
  const [you, setYou] = useState(0)
  const [opp, setOpp] = useState(0)
  const [aiming, setAiming] = useState(false)
  const [hint, setHint] = useState('Arrastra desde la bola blanca para apuntar y suelta para tirar')
  const balls = useRef<Ball[]>([])
  const moving = useRef(false)
  const drag = useRef<{ active: boolean; x: number; y: number } | null>(null)
  const turnRef = useRef<'you' | 'ai'>('you')
  const scoreRef = useRef({ you: 0, opp: 0 })
  const finished = useRef(false)

  const setupBalls = () => {
    const colors = ['#ff2d55', '#ffb627', '#2dd4ff', '#39ff9e', '#b14bff', '#ff3d81', '#22f5e0', '#ffd24c']
    const arr: Ball[] = [{ x: W * 0.25, y: H / 2, vx: 0, vy: 0, color: '#f4f4f5', potted: false, cue: true }]
    let i = 0
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col <= row; col++) {
        if (i >= colors.length) break
        arr.push({
          x: W * 0.62 + row * (R * 2 + 1),
          y: H / 2 + (col - row / 2) * (R * 2 + 1),
          vx: 0, vy: 0, color: colors[i], potted: false,
        })
        i++
      }
    }
    balls.current = arr
  }

  useEffect(() => {
    setupBalls()
    setYou(0); setOpp(0); setTurn('you'); turnRef.current = 'you'
    scoreRef.current = { you: 0, opp: 0 }
    moving.current = false; finished.current = false
    setHint('Arrastra desde la bola blanca para apuntar y suelta para tirar')
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
      if (Math.hypot(p.x - cue.x, p.y - cue.y) < R * 4) {
        drag.current = { active: true, x: p.x, y: p.y }
        setAiming(true)
      }
    }
    const moveTo = (cx: number, cy: number) => {
      if (drag.current?.active) {
        const p = toLogical(cx, cy)
        drag.current.x = p.x
        drag.current.y = p.y
      }
    }
    const up = () => {
      if (drag.current?.active) {
        const cue = balls.current[0]
        const dx = cue.x - drag.current.x
        const dy = cue.y - drag.current.y
        const power = Math.min(18, Math.hypot(dx, dy) / 6)
        const ang = Math.atan2(dy, dx)
        cue.vx = Math.cos(ang) * power
        cue.vy = Math.sin(ang) * power
        drag.current = null
        setAiming(false)
        moving.current = true
        setHint('')
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
      const cue = balls.current[0]
      const targets = balls.current.filter((b) => !b.cue && !b.potted)
      if (!targets.length) return
      const t = targets[Math.floor(Math.random() * targets.length)]
      const noise = (Math.random() - 0.5) * (0.5 - difficulty * 0.12)
      const ang = Math.atan2(t.y - cue.y, t.x - cue.x) + noise
      const power = 11 + Math.random() * 5
      cue.vx = Math.cos(ang) * power
      cue.vy = Math.sin(ang) * power
      moving.current = true
    }

    const settle = () => {
      // count pots this turn handled inline; switch turn / AI
      const remaining = balls.current.filter((b) => !b.cue && !b.potted).length
      if (remaining === 0 && !finished.current) {
        finished.current = true
        const sc = scoreRef.current
        setTimeout(() => onResult({ youWin: sc.you >= sc.opp, youScore: sc.you, oppScore: sc.opp }), 700)
        return
      }
      if (turnRef.current === 'ai' && !finished.current) {
        setHint('Turno del rival…')
        setTimeout(aiShoot, 700)
      } else {
        setHint('Tu turno: arrastra desde la blanca')
      }
    }

    let pottedThisTurn = false
    const loop = () => {
      const bs = balls.current
      if (moving.current) {
        let anyMoving = false
        for (const b of bs) {
          if (b.potted) continue
          b.x += b.vx
          b.y += b.vy
          b.vx *= FRICTION
          b.vy *= FRICTION
          if (Math.abs(b.vx) < 0.05) b.vx = 0
          if (Math.abs(b.vy) < 0.05) b.vy = 0
          if (b.vx || b.vy) anyMoving = true
          // walls
          if (b.x < R + 6) { b.x = R + 6; b.vx = Math.abs(b.vx) * 0.8 }
          if (b.x > W - R - 6) { b.x = W - R - 6; b.vx = -Math.abs(b.vx) * 0.8 }
          if (b.y < R + 6) { b.y = R + 6; b.vy = Math.abs(b.vy) * 0.8 }
          if (b.y > H - R - 6) { b.y = H - R - 6; b.vy = -Math.abs(b.vy) * 0.8 }
          // pockets
          for (const [px, py] of POCKETS) {
            if (Math.hypot(b.x - px, b.y - py) < POCKET_R) {
              if (b.cue) {
                // scratch: respot, no score, lose turn
                b.x = W * 0.25; b.y = H / 2; b.vx = 0; b.vy = 0
              } else {
                b.potted = true
                if (turnRef.current === 'you') {
                  scoreRef.current.you++
                  setYou(scoreRef.current.you)
                } else {
                  scoreRef.current.opp++
                  setOpp(scoreRef.current.opp)
                }
                onScore?.(scoreRef.current.you, scoreRef.current.opp)
                pottedThisTurn = true
              }
            }
          }
        }
        // collisions
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
              if (p > 0) {
                a.vx -= p * nx; a.vy -= p * ny
                c.vx += p * nx; c.vy += p * ny
                anyMoving = true
              }
            }
          }
        }
        if (!anyMoving) {
          moving.current = false
          if (!pottedThisTurn) {
            turnRef.current = turnRef.current === 'you' ? 'ai' : 'you'
            setTurn(turnRef.current)
          }
          pottedThisTurn = false
          settle()
        }
      }

      // draw
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const sx = canvas.width / W, sy = canvas.height / H
      ctx.save()
      ctx.scale(sx, sy)
      // wooden rail
      ctx.fillStyle = '#1a0f08'
      ctx.fillRect(0, 0, W, H)
      // felt with subtle vignette
      const grad = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * 0.62)
      grad.addColorStop(0, '#11402a')
      grad.addColorStop(1, '#082316')
      ctx.fillStyle = grad
      ctx.fillRect(14, 14, W - 28, H - 28)
      // cushions glow
      ctx.strokeStyle = 'rgba(57,255,158,0.30)'
      ctx.lineWidth = 3
      ctx.strokeRect(14, 14, W - 28, H - 28)
      // head string line
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(W * 0.25, 16)
      ctx.lineTo(W * 0.25, H - 16)
      ctx.stroke()
      // pockets with rim
      for (const [px, py] of POCKETS) {
        ctx.fillStyle = '#2a1a0c'
        ctx.beginPath()
        ctx.arc(px, py, POCKET_R, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#04060a'
        ctx.beginPath()
        ctx.arc(px, py, POCKET_R - 5, 0, Math.PI * 2)
        ctx.fill()
      }
      // aim line
      if (drag.current?.active) {
        const cue = bs[0]
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'
        ctx.lineWidth = 2
        ctx.setLineDash([6, 6])
        ctx.beginPath()
        ctx.moveTo(cue.x, cue.y)
        const dx = cue.x - drag.current.x
        const dy = cue.y - drag.current.y
        ctx.lineTo(cue.x + dx * 2.2, cue.y + dy * 2.2)
        ctx.stroke()
        ctx.setLineDash([])
      }
      // balls
      for (const b of bs) {
        if (b.potted) continue
        ctx.shadowBlur = b.cue ? 16 : 12
        ctx.shadowColor = b.color
        ctx.fillStyle = b.color
        ctx.beginPath()
        ctx.arc(b.x, b.y, R, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.shadowBlur = 0
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

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-sm font-bold">
        <span className={turn === 'you' ? 'text-neon-green' : 'text-zinc-500'}>TÚ {you} {turn === 'you' && '●'}</span>
        <span className="text-[11px] uppercase tracking-wide text-zinc-500">{aiming ? 'Apuntando…' : hint}</span>
        <span className={turn === 'ai' ? 'text-neon-blue' : 'text-zinc-500'}>{turn === 'ai' && '●'} {opp} RIVAL</span>
      </div>
      <canvas
        ref={canvasRef}
        width={W * 2}
        height={H * 2}
        className="w-full touch-none rounded-xl"
        style={{ aspectRatio: `${W}/${H}` }}
      />
    </div>
  )
}
