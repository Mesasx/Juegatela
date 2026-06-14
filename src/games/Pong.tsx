import { useEffect, useRef } from 'react'
import type { GameComponentProps } from './types'

const WIN = 7

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

export default function Pong({ difficulty = 1, onScore, onResult, resetKey }: GameComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const s = useRef({
    you: 0,
    opp: 0,
    paddleY: 0.5,
    aiY: 0.5,
    ballX: 0.5,
    ballY: 0.5,
    vx: 0.006,
    vy: 0.004,
    targetY: 0.5,
    over: false,
    serveAt: 0, // timestamp until which the ball is frozen (serve countdown)
    trail: [] as { x: number; y: number }[],
    sparks: [] as Spark[],
    shake: 0,
    flash: 0,
  })

  useEffect(() => {
    const st = s.current
    Object.assign(st, {
      you: 0, opp: 0, paddleY: 0.5, aiY: 0.5, ballX: 0.5, ballY: 0.5,
      vx: 0, vy: 0, targetY: 0.5, over: false, serveAt: performance.now() + 900,
      trail: [], sparks: [], shake: 0, flash: 0,
    })
    onScore?.(0, 0)

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0
    const baseDir = Math.random() > 0.5 ? 1 : -1

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      canvas.width = r.width * devicePixelRatio
      canvas.height = r.height * devicePixelRatio
    }
    resize()
    window.addEventListener('resize', resize)

    const PADDLE_H = 0.18
    const aiSpeed = 0.012 + difficulty * 0.006

    const move = (clientY: number) => {
      const r = canvas.getBoundingClientRect()
      st.targetY = Math.min(0.92, Math.max(0.08, (clientY - r.top) / r.height))
    }
    const onMouse = (e: MouseEvent) => move(e.clientY)
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) move(e.touches[0].clientY)
    }
    canvas.addEventListener('mousemove', onMouse)
    canvas.addEventListener('touchmove', onTouch, { passive: true })

    const keys: Record<string, boolean> = {}
    const kd = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'w', 's'].includes(e.key)) {
        keys[e.key] = true
        e.preventDefault()
      }
    }
    const ku = (e: KeyboardEvent) => (keys[e.key] = false)
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)

    let serveDir = baseDir
    const serve = (dir: number) => {
      serveDir = dir
      st.ballX = 0.5
      st.ballY = 0.5
      st.vx = 0
      st.vy = 0
      st.trail = []
      st.serveAt = performance.now() + 800
    }

    const spark = (x: number, y: number, color: string, n = 10) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2
        const sp = 1 + Math.random() * 3
        st.sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, color })
      }
    }

    const loop = () => {
      const now = performance.now()
      const w = canvas.width
      const h = canvas.height

      // launch when serve countdown finishes
      if (st.serveAt && now >= st.serveAt) {
        st.vx = serveDir * (0.006 + difficulty * 0.0008)
        st.vy = (Math.random() - 0.5) * 0.008
        st.serveAt = 0
      }

      // keyboard control
      if (keys['ArrowUp'] || keys['w']) st.targetY -= 0.02
      if (keys['ArrowDown'] || keys['s']) st.targetY += 0.02
      st.targetY = Math.min(0.92, Math.max(0.08, st.targetY))
      st.paddleY += (st.targetY - st.paddleY) * 0.35

      // AI follows ball with imperfection
      const err = (Math.random() - 0.5) * (0.12 - difficulty * 0.02)
      const goal = st.ballX > 0.5 && !st.serveAt ? st.ballY + err : 0.5
      st.aiY += Math.sign(goal - st.aiY) * Math.min(aiSpeed, Math.abs(goal - st.aiY))
      st.aiY = Math.min(0.92, Math.max(0.08, st.aiY))

      if (!st.serveAt) {
        st.ballX += st.vx
        st.ballY += st.vy
        // trail
        st.trail.push({ x: st.ballX, y: st.ballY })
        if (st.trail.length > 14) st.trail.shift()

        if (st.ballY < 0.02) { st.ballY = 0.02; st.vy = Math.abs(st.vy); spark(st.ballX * w, 0.02 * h, '#39ff9e', 5) }
        if (st.ballY > 0.98) { st.ballY = 0.98; st.vy = -Math.abs(st.vy); spark(st.ballX * w, 0.98 * h, '#39ff9e', 5) }

        // left paddle (you)
        if (st.ballX < 0.06 && Math.abs(st.ballY - st.paddleY) < PADDLE_H / 2 && st.vx < 0) {
          st.vx = Math.abs(st.vx) * 1.05
          st.vy += (st.ballY - st.paddleY) * 0.05
          spark(0.045 * w, st.ballY * h, '#ff2d55', 12)
        }
        // right paddle (ai)
        if (st.ballX > 0.94 && Math.abs(st.ballY - st.aiY) < PADDLE_H / 2 && st.vx > 0) {
          st.vx = -Math.abs(st.vx) * 1.05
          st.vy += (st.ballY - st.aiY) * 0.05
          spark(0.955 * w, st.ballY * h, '#2dd4ff', 12)
        }

        if (st.ballX < -0.02) {
          st.opp++
          onScore?.(st.you, st.opp)
          st.shake = 12
          st.flash = 1
          serve(1)
        } else if (st.ballX > 1.02) {
          st.you++
          onScore?.(st.you, st.opp)
          st.shake = 12
          st.flash = 1
          serve(-1)
        }
      }

      // ── draw ──
      ctx.clearRect(0, 0, w, h)
      ctx.save()
      const sh = st.shake
      if (sh > 0) {
        ctx.translate((Math.random() - 0.5) * sh, (Math.random() - 0.5) * sh)
        st.shake *= 0.85
        if (st.shake < 0.4) st.shake = 0
      }

      // court background
      ctx.fillStyle = '#05060a'
      ctx.fillRect(-20, -20, w + 40, h + 40)
      // outer frame
      ctx.strokeStyle = 'rgba(177,75,255,0.18)'
      ctx.lineWidth = 3
      ctx.strokeRect(6, 6, w - 12, h - 12)
      // center line
      ctx.strokeStyle = 'rgba(177,75,255,0.22)'
      ctx.setLineDash([12, 16])
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(w / 2, 0)
      ctx.lineTo(w / 2, h)
      ctx.stroke()
      ctx.setLineDash([])
      // center circle
      ctx.beginPath()
      ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.12, 0, Math.PI * 2)
      ctx.stroke()

      // ball trail
      st.trail.forEach((p, i) => {
        const a = i / st.trail.length
        ctx.globalAlpha = a * 0.5
        ctx.fillStyle = '#39ff9e'
        ctx.beginPath()
        ctx.arc(p.x * w, p.y * h, w * 0.012 * a, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1

      const ph = PADDLE_H * h
      // your paddle (red)
      ctx.shadowBlur = 20
      ctx.shadowColor = '#ff2d55'
      ctx.fillStyle = '#ff2d55'
      roundRect(ctx, w * 0.03, st.paddleY * h - ph / 2, w * 0.012, ph, w * 0.006)
      // ai paddle (blue)
      ctx.shadowColor = '#2dd4ff'
      ctx.fillStyle = '#2dd4ff'
      roundRect(ctx, w * 0.955, st.aiY * h - ph / 2, w * 0.012, ph, w * 0.006)
      // ball (green)
      ctx.shadowColor = '#39ff9e'
      ctx.fillStyle = '#39ff9e'
      ctx.beginPath()
      ctx.arc(st.ballX * w, st.ballY * h, w * 0.013, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // sparks
      st.sparks = st.sparks.filter((p) => p.life > 0)
      st.sparks.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.04
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.color
        ctx.fillRect(p.x, p.y, 3, 3)
      })
      ctx.globalAlpha = 1

      // serve countdown
      if (st.serveAt) {
        const remain = Math.ceil((st.serveAt - now) / 1000)
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ctx.font = `bold ${Math.min(w, h) * 0.18}px "Bebas Neue", Impact, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowBlur = 20
        ctx.shadowColor = '#ff2d55'
        ctx.fillText(remain > 0 ? String(remain) : '¡YA!', w / 2, h * 0.32)
        ctx.shadowBlur = 0
      }

      // score flash
      if (st.flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${st.flash * 0.18})`
        ctx.fillRect(0, 0, w, h)
        st.flash *= 0.88
        if (st.flash < 0.02) st.flash = 0
      }

      ctx.restore()

      if (!st.over && (st.you >= WIN || st.opp >= WIN)) {
        st.over = true
        onResult({ youWin: st.you > st.opp, youScore: st.you, oppScore: st.opp })
        return
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', onMouse)
      canvas.removeEventListener('touchmove', onTouch)
      window.removeEventListener('keydown', kd)
      window.removeEventListener('keyup', ku)
    }
  }, [resetKey, difficulty])

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full touch-none rounded-xl bg-ink-950"
      style={{ aspectRatio: '16/10' }}
    />
  )
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
  ctx.fill()
}
