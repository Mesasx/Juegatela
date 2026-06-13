import { useEffect, useRef } from 'react'
import type { GameComponentProps } from './types'

const WIN = 7

export default function Pong({ difficulty = 1, onScore, onResult, resetKey }: GameComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({
    you: 0,
    opp: 0,
    paddleY: 0.5, // 0..1
    aiY: 0.5,
    ballX: 0.5,
    ballY: 0.5,
    vx: 0.006,
    vy: 0.004,
    targetY: 0.5,
    over: false,
  })

  useEffect(() => {
    const s = stateRef.current
    Object.assign(s, {
      you: 0, opp: 0, paddleY: 0.5, aiY: 0.5, ballX: 0.5, ballY: 0.5,
      vx: Math.random() > 0.5 ? 0.006 : -0.006, vy: 0.004, targetY: 0.5, over: false,
    })
    onScore?.(0, 0)

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0

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
      s.targetY = Math.min(0.92, Math.max(0.08, (clientY - r.top) / r.height))
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

    const resetBall = (dir: number) => {
      s.ballX = 0.5
      s.ballY = 0.5
      s.vx = dir * (0.006 + difficulty * 0.0008)
      s.vy = (Math.random() - 0.5) * 0.008
    }

    const loop = () => {
      // keyboard control
      if (keys['ArrowUp'] || keys['w']) s.targetY -= 0.02
      if (keys['ArrowDown'] || keys['s']) s.targetY += 0.02
      s.targetY = Math.min(0.92, Math.max(0.08, s.targetY))
      s.paddleY += (s.targetY - s.paddleY) * 0.35

      // AI follows ball with imperfection
      const err = (Math.random() - 0.5) * (0.12 - difficulty * 0.02)
      const goal = s.ballX > 0.5 ? s.ballY + err : 0.5
      s.aiY += Math.sign(goal - s.aiY) * Math.min(aiSpeed, Math.abs(goal - s.aiY))
      s.aiY = Math.min(0.92, Math.max(0.08, s.aiY))

      // ball
      s.ballX += s.vx
      s.ballY += s.vy
      if (s.ballY < 0.02 || s.ballY > 0.98) s.vy *= -1

      // left paddle (you)
      if (s.ballX < 0.06 && Math.abs(s.ballY - s.paddleY) < PADDLE_H / 2 && s.vx < 0) {
        s.vx = Math.abs(s.vx) * 1.04
        s.vy += (s.ballY - s.paddleY) * 0.04
      }
      // right paddle (ai)
      if (s.ballX > 0.94 && Math.abs(s.ballY - s.aiY) < PADDLE_H / 2 && s.vx > 0) {
        s.vx = -Math.abs(s.vx) * 1.04
        s.vy += (s.ballY - s.aiY) * 0.04
      }

      if (s.ballX < 0) {
        s.opp++
        onScore?.(s.you, s.opp)
        resetBall(1)
      } else if (s.ballX > 1) {
        s.you++
        onScore?.(s.you, s.opp)
        resetBall(-1)
      }

      // draw
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)
      // center line
      ctx.strokeStyle = 'rgba(177,75,255,0.25)'
      ctx.setLineDash([10, 14])
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(w / 2, 0)
      ctx.lineTo(w / 2, h)
      ctx.stroke()
      ctx.setLineDash([])

      const ph = PADDLE_H * h
      // your paddle (red)
      ctx.shadowBlur = 18
      ctx.shadowColor = '#ff2d55'
      ctx.fillStyle = '#ff2d55'
      ctx.fillRect(w * 0.03, s.paddleY * h - ph / 2, w * 0.012, ph)
      // ai paddle (blue)
      ctx.shadowColor = '#2dd4ff'
      ctx.fillStyle = '#2dd4ff'
      ctx.fillRect(w * 0.955, s.aiY * h - ph / 2, w * 0.012, ph)
      // ball (green)
      ctx.shadowColor = '#39ff9e'
      ctx.fillStyle = '#39ff9e'
      ctx.beginPath()
      ctx.arc(s.ballX * w, s.ballY * h, w * 0.012, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      if (!s.over && (s.you >= WIN || s.opp >= WIN)) {
        s.over = true
        onResult({ youWin: s.you > s.opp, youScore: s.you, oppScore: s.opp })
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
