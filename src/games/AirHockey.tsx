import { useEffect, useRef, useState } from 'react'
import type { GameComponentProps } from './types'

// Logical table dimensions (vertical orientation). You at bottom, AI at top.
const W = 360
const H = 600
const WIN = 7
const PUCK_R = 13
const MALLET_R = 26
const GOAL_W = 150 // width of the goal opening
const FRICTION = 0.992
const MAX_PUCK_SPEED = 16

interface Vec {
  x: number
  y: number
}

interface Trail {
  x: number
  y: number
  a: number
}

export default function AirHockey({ difficulty = 1, onScore, onResult, resetKey }: GameComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [you, setYou] = useState(0)
  const [opp, setOpp] = useState(0)
  const [msg, setMsg] = useState('Arrastra tu mazo para empezar')

  const puck = useRef<Vec & { vx: number; vy: number }>({ x: W / 2, y: H / 2, vx: 0, vy: 0 })
  const player = useRef<Vec & { px: number; py: number }>({ x: W / 2, y: H * 0.82, px: W / 2, py: H * 0.82 })
  const ai = useRef<Vec>({ x: W / 2, y: H * 0.18 })
  const trail = useRef<Trail[]>([])
  const scoreRef = useRef({ you: 0, opp: 0 })
  const finished = useRef(false)
  const paused = useRef(false)
  const flash = useRef<{ text: string; t: number } | null>(null)

  useEffect(() => {
    scoreRef.current = { you: 0, opp: 0 }
    setYou(0)
    setOpp(0)
    setMsg('Arrastra tu mazo para empezar')
    finished.current = false
    paused.current = false
    flash.current = null
    trail.current = []
    player.current = { x: W / 2, y: H * 0.82, px: W / 2, py: H * 0.82 }
    ai.current = { x: W / 2, y: H * 0.18 }
    puck.current = { x: W / 2, y: H / 2, vx: 0, vy: 0 }
    onScore?.(0, 0)

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0
    let resetTimer = 0

    const toLogical = (cx: number, cy: number): Vec => {
      const r = canvas.getBoundingClientRect()
      return { x: ((cx - r.left) / r.width) * W, y: ((cy - r.top) / r.height) * H }
    }

    const dragging = { active: false }
    const msgWasIntro = { value: true }
    const setTarget = (cx: number, cy: number) => {
      const p = toLogical(cx, cy)
      // confine player to its own half (bottom)
      const minY = H / 2 + MALLET_R
      player.current.x = Math.max(MALLET_R, Math.min(W - MALLET_R, p.x))
      player.current.y = Math.max(minY, Math.min(H - MALLET_R, p.y))
    }

    const down = (cx: number, cy: number) => {
      dragging.active = true
      setTarget(cx, cy)
      if (msgWasIntro.value) {
        msgWasIntro.value = false
        setMsg('')
      }
    }
    const move = (cx: number, cy: number) => {
      if (dragging.active) setTarget(cx, cy)
    }
    const up = () => {
      dragging.active = false
    }

    const md = (e: MouseEvent) => down(e.clientX, e.clientY)
    const mm = (e: MouseEvent) => move(e.clientX, e.clientY)
    const mu = () => up()
    const td = (e: TouchEvent) => {
      if (e.touches[0]) down(e.touches[0].clientX, e.touches[0].clientY)
    }
    const tm = (e: TouchEvent) => {
      if (e.touches[0]) move(e.touches[0].clientX, e.touches[0].clientY)
    }
    const tu = () => up()

    canvas.addEventListener('mousedown', md)
    window.addEventListener('mousemove', mm)
    window.addEventListener('mouseup', mu)
    canvas.addEventListener('touchstart', td, { passive: true })
    canvas.addEventListener('touchmove', tm, { passive: true })
    window.addEventListener('touchend', tu)

    const resetPuck = (towardYou: boolean) => {
      puck.current = {
        x: W / 2,
        y: H / 2,
        vx: (Math.random() - 0.5) * 2,
        vy: towardYou ? 2.5 : -2.5,
      }
      ai.current = { x: W / 2, y: H * 0.18 }
      paused.current = false
    }

    const scoreGoal = (youScored: boolean) => {
      if (youScored) {
        scoreRef.current.you++
        setYou(scoreRef.current.you)
      } else {
        scoreRef.current.opp++
        setOpp(scoreRef.current.opp)
      }
      onScore?.(scoreRef.current.you, scoreRef.current.opp)
      flash.current = { text: youScored ? '¡GOL!' : 'ENCAJAS', t: 1 }
      paused.current = true

      if (!finished.current && (scoreRef.current.you >= WIN || scoreRef.current.opp >= WIN)) {
        finished.current = true
        const sc = scoreRef.current
        setMsg(sc.you > sc.opp ? '¡Ganaste la partida!' : 'Perdiste la partida')
        resetTimer = window.setTimeout(
          () => onResult({ youWin: sc.you > sc.opp, youScore: sc.you, oppScore: sc.opp }),
          900,
        )
        return
      }
      resetTimer = window.setTimeout(() => resetPuck(!youScored), 800)
    }

    // collide puck with a mallet (elastic-ish, transfers mallet velocity)
    const collideMallet = (mx: number, my: number, mvx: number, mvy: number) => {
      const p = puck.current
      const dx = p.x - mx
      const dy = p.y - my
      const dist = Math.hypot(dx, dy)
      const minDist = PUCK_R + MALLET_R
      if (dist > 0 && dist < minDist) {
        const nx = dx / dist
        const ny = dy / dist
        // separate
        p.x = mx + nx * minDist
        p.y = my + ny * minDist
        // reflect puck velocity about normal
        const vDotN = p.vx * nx + p.vy * ny
        p.vx -= 2 * vDotN * nx
        p.vy -= 2 * vDotN * ny
        // add mallet momentum
        p.vx = p.vx * 0.7 + mvx * 1.1 + nx * 2.5
        p.vy = p.vy * 0.7 + mvy * 1.1 + ny * 2.5
      }
    }

    const aiSpeed = 2.6 + difficulty * 1.6
    const aiError = 0.22 - difficulty * 0.05

    const loop = () => {
      const p = puck.current
      const pl = player.current

      // player mallet velocity (for momentum transfer)
      const pmvx = pl.x - pl.px
      const pmvy = pl.y - pl.py
      pl.px = pl.x
      pl.py = pl.y

      if (!paused.current) {
        // AI logic: defend goal, attack when puck is in its half
        const target: Vec = { x: W / 2, y: H * 0.18 }
        if (p.y < H * 0.55) {
          // puck near AI half: chase and strike
          target.x = p.x + (Math.random() - 0.5) * aiError * W
          target.y = Math.min(H * 0.42, p.y - 4)
        } else {
          // return to defensive position, track puck x loosely
          target.x = W / 2 + (p.x - W / 2) * 0.5
          target.y = H * 0.16
        }
        target.x = Math.max(MALLET_R, Math.min(W - MALLET_R, target.x))
        target.y = Math.max(MALLET_R, Math.min(H / 2 - MALLET_R, target.y))
        const adx = target.x - ai.current.x
        const ady = target.y - ai.current.y
        const adist = Math.hypot(adx, ady)
        const aprevx = ai.current.x
        const aprevy = ai.current.y
        if (adist > 0) {
          const step = Math.min(aiSpeed, adist)
          ai.current.x += (adx / adist) * step
          ai.current.y += (ady / adist) * step
        }
        const amvx = ai.current.x - aprevx
        const amvy = ai.current.y - aprevy

        // puck physics
        p.x += p.vx
        p.y += p.vy
        p.vx *= FRICTION
        p.vy *= FRICTION
        const sp = Math.hypot(p.vx, p.vy)
        if (sp > MAX_PUCK_SPEED) {
          p.vx = (p.vx / sp) * MAX_PUCK_SPEED
          p.vy = (p.vy / sp) * MAX_PUCK_SPEED
        }

        // side walls
        if (p.x < PUCK_R) {
          p.x = PUCK_R
          p.vx = Math.abs(p.vx) * 0.95
        }
        if (p.x > W - PUCK_R) {
          p.x = W - PUCK_R
          p.vx = -Math.abs(p.vx) * 0.95
        }

        const goalLeft = (W - GOAL_W) / 2
        const goalRight = (W + GOAL_W) / 2

        // top wall / AI goal
        if (p.y < PUCK_R) {
          if (p.x > goalLeft && p.x < goalRight) {
            scoreGoal(true) // you scored on AI
          } else {
            p.y = PUCK_R
            p.vy = Math.abs(p.vy) * 0.95
          }
        }
        // bottom wall / your goal
        if (p.y > H - PUCK_R) {
          if (p.x > goalLeft && p.x < goalRight) {
            scoreGoal(false) // AI scored on you
          } else {
            p.y = H - PUCK_R
            p.vy = -Math.abs(p.vy) * 0.95
          }
        }

        collideMallet(pl.x, pl.y, pmvx, pmvy)
        collideMallet(ai.current.x, ai.current.y, amvx, amvy)

        // trail
        trail.current.push({ x: p.x, y: p.y, a: 1 })
        if (trail.current.length > 14) trail.current.shift()
      }
      for (const t of trail.current) t.a *= 0.86

      // ===== draw =====
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const sx = canvas.width / W
      const sy = canvas.height / H
      ctx.save()
      ctx.scale(sx, sy)

      // table
      ctx.fillStyle = '#0c0910'
      ctx.fillRect(0, 0, W, H)
      // border glow
      ctx.shadowBlur = 14
      ctx.shadowColor = '#b14bff'
      ctx.strokeStyle = 'rgba(177,75,255,0.55)'
      ctx.lineWidth = 4
      ctx.strokeRect(4, 4, W - 8, H - 8)
      ctx.shadowBlur = 0

      // center line + circle
      ctx.strokeStyle = 'rgba(45,212,255,0.35)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(8, H / 2)
      ctx.lineTo(W - 8, H / 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(W / 2, H / 2, 56, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(W / 2, H / 2, 5, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(45,212,255,0.5)'
      ctx.fill()

      const goalLeft = (W - GOAL_W) / 2
      const goalRight = (W + GOAL_W) / 2
      // goals (lit)
      ctx.lineWidth = 6
      ctx.shadowBlur = 18
      // top goal (AI) - blue
      ctx.strokeStyle = '#2dd4ff'
      ctx.shadowColor = '#2dd4ff'
      ctx.beginPath()
      ctx.moveTo(goalLeft, 6)
      ctx.lineTo(goalRight, 6)
      ctx.stroke()
      // bottom goal (you) - red
      ctx.strokeStyle = '#ff2d55'
      ctx.shadowColor = '#ff2d55'
      ctx.beginPath()
      ctx.moveTo(goalLeft, H - 6)
      ctx.lineTo(goalRight, H - 6)
      ctx.stroke()
      ctx.shadowBlur = 0

      // puck trail
      for (const t of trail.current) {
        ctx.fillStyle = `rgba(57,255,158,${t.a * 0.4})`
        ctx.beginPath()
        ctx.arc(t.x, t.y, PUCK_R * 0.7, 0, Math.PI * 2)
        ctx.fill()
      }

      // AI mallet (blue)
      drawMallet(ctx, ai.current.x, ai.current.y, '#2dd4ff')
      // player mallet (red)
      drawMallet(ctx, pl.x, pl.y, '#ff2d55')

      // puck (green)
      ctx.shadowBlur = 20
      ctx.shadowColor = '#39ff9e'
      ctx.fillStyle = '#39ff9e'
      ctx.beginPath()
      ctx.arc(p.x, p.y, PUCK_R, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      ctx.beginPath()
      ctx.arc(p.x - 3, p.y - 3, PUCK_R * 0.4, 0, Math.PI * 2)
      ctx.fill()

      // flash text
      if (flash.current) {
        flash.current.t -= 0.012
        if (flash.current.t <= 0) {
          flash.current = null
        } else {
          ctx.globalAlpha = Math.min(1, flash.current.t * 1.5)
          ctx.fillStyle = '#ffb627'
          ctx.shadowBlur = 24
          ctx.shadowColor = '#ffb627'
          ctx.font = 'bold 54px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(flash.current.text, W / 2, H / 2)
          ctx.shadowBlur = 0
          ctx.globalAlpha = 1
        }
      }

      ctx.restore()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(resetTimer)
      canvas.removeEventListener('mousedown', md)
      window.removeEventListener('mousemove', mm)
      window.removeEventListener('mouseup', mu)
      canvas.removeEventListener('touchstart', td)
      canvas.removeEventListener('touchmove', tm)
      window.removeEventListener('touchend', tu)
    }
  }, [resetKey, difficulty, onResult, onScore])

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-sm font-bold">
        <span className="text-neon-blue">{opp} RIVAL</span>
        <span className="text-[11px] uppercase tracking-wide text-zinc-500">{msg || `Primero a ${WIN}`}</span>
        <span className="text-neon-red">TÚ {you}</span>
      </div>
      <canvas
        ref={canvasRef}
        width={W * 2}
        height={H * 2}
        className="mx-auto h-full touch-none rounded-xl"
        style={{ aspectRatio: `${W}/${H}`, maxHeight: '100%' }}
      />
    </div>
  )
}

function drawMallet(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.shadowBlur = 18
  ctx.shadowColor = color
  ctx.strokeStyle = color
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(x, y, MALLET_R, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, MALLET_R * 0.45, 0, Math.PI * 2)
  ctx.fill()
}
