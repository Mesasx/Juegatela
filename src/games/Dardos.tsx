import { useEffect, useRef, useState } from 'react'
import type { GameComponentProps } from './types'

// Dartboard 301. You vs AI, turns of 3 darts. First to exactly 0 wins.
const SIZE = 420
const CX = SIZE / 2
const CY = SIZE / 2
const R = SIZE / 2 - 16 // outer double radius

// Standard dartboard number order (clockwise from top = 20)
const ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]

// ring radii as fraction of R
const R_BULLSEYE = 0.04
const R_BULL = 0.09
const R_TRIPLE_IN = 0.48
const R_TRIPLE_OUT = 0.55
const R_DOUBLE_IN = 0.92
const R_DOUBLE_OUT = 1.0

interface Hit {
  x: number
  y: number
  value: number
  label: string
}

type Turn = 'you' | 'ai'

function scoreAt(x: number, y: number): { value: number; label: string } {
  const dx = x - CX
  const dy = y - CY
  const dist = Math.hypot(dx, dy) / R
  if (dist <= R_BULLSEYE) return { value: 50, label: 'BULL 50' }
  if (dist <= R_BULL) return { value: 25, label: '25' }
  if (dist > R_DOUBLE_OUT) return { value: 0, label: 'Fuera' }
  // angle: 0 at top, clockwise
  let ang = Math.atan2(dy, dx) + Math.PI / 2 // shift so up=0
  ang = (ang + Math.PI * 2) % (Math.PI * 2)
  const idx = Math.floor(((ang + Math.PI / 20) / (Math.PI * 2)) * 20) % 20
  const base = ORDER[idx]
  if (dist >= R_TRIPLE_IN && dist <= R_TRIPLE_OUT) return { value: base * 3, label: `T${base}` }
  if (dist >= R_DOUBLE_IN && dist <= R_DOUBLE_OUT) return { value: base * 2, label: `D${base}` }
  return { value: base, label: `${base}` }
}

export default function Dardos({ difficulty = 1, onScore, onResult, resetKey }: GameComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [youRem, setYouRem] = useState(301)
  const [aiRem, setAiRem] = useState(301)
  const [turn, setTurn] = useState<Turn>('you')
  const [dartsLeft, setDartsLeft] = useState(3)
  const [msg, setMsg] = useState('Toca para lanzar cuando la mira pase por la zona buena')

  const youRef = useRef(301)
  const aiRef = useRef(301)
  const turnStart = useRef(301) // remaining at start of current turn (for bust)
  const turnRef = useRef<Turn>('you')
  const dartsRef = useRef(3)
  const hits = useRef<Hit[]>([])
  const finished = useRef(false)
  const aimRef = useRef({ x: CX, y: CY })
  const busy = useRef(false) // true during AI turn / animations

  useEffect(() => {
    youRef.current = 301
    aiRef.current = 301
    turnStart.current = 301
    turnRef.current = 'you'
    dartsRef.current = 3
    hits.current = []
    finished.current = false
    busy.current = false
    setYouRem(301)
    setAiRem(301)
    setTurn('you')
    setDartsLeft(3)
    setMsg('Toca/clic para lanzar cuando la mira esté donde quieras')
    onScore?.(301, 301)

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0
    const t0 = performance.now()

    // crosshair oscillation parameters scale with difficulty (faster/wider = harder)
    const ampX = R * (0.55 + difficulty * 0.08)
    const ampY = R * (0.5 + difficulty * 0.08)
    const freqX = 0.0011 + difficulty * 0.0006
    const freqY = 0.0017 + difficulty * 0.0008

    const throwDart = () => {
      if (turnRef.current !== 'you' || finished.current || busy.current || dartsRef.current <= 0) return
      const { x, y } = aimRef.current
      const sc = scoreAt(x, y)
      hits.current.push({ x, y, value: sc.value, label: sc.label })
      registerScore('you', sc.value, sc.label)
    }

    const onClick = () => throwDart()
    const onTouch = (e: TouchEvent) => {
      e.preventDefault?.()
      throwDart()
    }
    canvas.addEventListener('click', onClick)
    canvas.addEventListener('touchstart', onTouch)

    const registerScore = (who: Turn, value: number, label: string) => {
      const ref = who === 'you' ? youRef : aiRef
      const after = ref.current - value
      dartsRef.current -= 1
      setDartsLeft(dartsRef.current)

      if (after < 0 || after === 1) {
        // BUST: revert to start of turn, end turn
        setMsg(who === 'you' ? `¡Bust! (${label}) Te pasaste, vuelves a ${turnStart.current}` : `Rival se pasó (${label})`)
        ref.current = turnStart.current
        if (who === 'you') setYouRem(ref.current)
        else setAiRem(ref.current)
        onScore?.(youRef.current, aiRef.current)
        endTurn()
        return
      }

      ref.current = after
      if (who === 'you') setYouRem(after)
      else setAiRem(after)
      onScore?.(youRef.current, aiRef.current)
      setMsg(`${who === 'you' ? 'Tú' : 'Rival'}: ${label} (${value}) → quedan ${after}`)

      if (after === 0) {
        finishGame(who)
        return
      }
      if (dartsRef.current <= 0) {
        endTurn()
      }
    }

    const endTurn = () => {
      if (finished.current) return
      busy.current = true
      setTimeout(() => {
        // clear darts marks, switch turn
        hits.current = []
        const next: Turn = turnRef.current === 'you' ? 'ai' : 'you'
        turnRef.current = next
        setTurn(next)
        dartsRef.current = 3
        setDartsLeft(3)
        turnStart.current = next === 'you' ? youRef.current : aiRef.current
        if (next === 'ai') {
          setMsg('Turno del rival…')
          aiTurn()
        } else {
          busy.current = false
          setMsg('Tu turno: toca para lanzar')
        }
      }, 1100)
    }

    const aiThrow = () => {
      if (finished.current) return
      const rem = aiRef.current
      // pick a target value to aim for, prefer triple 20 unless low
      let target: { x: number; y: number }
      if (rem <= 50 && rem > 1) {
        // aim for a single that brings near 0 (try exact if possible via a number)
        const v = Math.min(rem, 20)
        const idx = ORDER.indexOf(v)
        const angle = (idx / 20) * Math.PI * 2 - Math.PI / 2
        const rr = R * 0.7
        target = { x: CX + Math.cos(angle) * rr, y: CY + Math.sin(angle) * rr }
      } else {
        // triple 20 region (top)
        target = { x: CX, y: CY - R * ((R_TRIPLE_IN + R_TRIPLE_OUT) / 2) }
      }
      // dispersion: higher difficulty = tighter
      const spread = R * (0.34 - difficulty * 0.08)
      const hx = target.x + (Math.random() - 0.5) * spread * 2
      const hy = target.y + (Math.random() - 0.5) * spread * 2
      const sc = scoreAt(hx, hy)
      hits.current.push({ x: hx, y: hy, value: sc.value, label: sc.label })
      registerScore('ai', sc.value, sc.label)
    }

    const aiTurn = () => {
      let n = 0
      const step = () => {
        if (finished.current || turnRef.current !== 'ai') return
        if (n >= 3 || dartsRef.current <= 0) return
        n++
        aiThrow()
        if (turnRef.current === 'ai' && dartsRef.current > 0 && !finished.current) {
          setTimeout(step, 850)
        }
      }
      setTimeout(step, 700)
    }

    const finishGame = (winner: Turn) => {
      if (finished.current) return
      finished.current = true
      busy.current = true
      setMsg(winner === 'you' ? '¡301 cerrado! Ganaste 🎯' : 'El rival cerró primero')
      setTimeout(
        () =>
          onResult({
            youWin: winner === 'you',
            youScore: youRef.current,
            oppScore: aiRef.current,
          }),
        900,
      )
    }

    // ---- drawing ----
    const sector = (
      c: CanvasRenderingContext2D,
      a0: number,
      a1: number,
      rin: number,
      rout: number,
      fill: string,
      glow = false,
    ) => {
      c.beginPath()
      c.arc(0, 0, rout, a0, a1)
      c.arc(0, 0, rin, a1, a0, true)
      c.closePath()
      c.shadowBlur = glow ? 8 : 0
      c.shadowColor = fill
      c.fillStyle = fill
      c.fill()
      c.shadowBlur = 0
    }

    const drawBoard = (c: CanvasRenderingContext2D) => {
      c.save()
      c.translate(CX, CY)
      for (let i = 0; i < 20; i++) {
        const a0 = (i / 20) * Math.PI * 2 - Math.PI / 2 - Math.PI / 20
        const a1 = a0 + Math.PI / 10
        const dark = i % 2 === 0
        const singleColor = dark ? '#0e1518' : '#e9dcb6' // black vs cream
        const ringColor = dark ? '#39ff9e' : '#ff2d55' // green vs red (neon)
        // outer single
        sector(c, a0, a1, R * R_TRIPLE_OUT, R * R_DOUBLE_IN, singleColor)
        // inner single
        sector(c, a0, a1, R * R_BULL, R * R_TRIPLE_IN, singleColor)
        // double ring
        sector(c, a0, a1, R * R_DOUBLE_IN, R * R_DOUBLE_OUT, ringColor, true)
        // triple ring
        sector(c, a0, a1, R * R_TRIPLE_IN, R * R_TRIPLE_OUT, ringColor, true)
      }
      c.restore()
    }

    const draw = () => {
      const now = performance.now()
      // crosshair (Lissajous) — only meaningful on your turn
      aimRef.current.x = CX + Math.sin((now - t0) * freqX) * ampX
      aimRef.current.y = CY + Math.cos((now - t0) * freqY) * ampY

      const sx = canvas.width / SIZE
      const sy = canvas.height / SIZE
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(sx, sy)

      // outer dark backing
      ctx.fillStyle = '#070509'
      ctx.fillRect(0, 0, SIZE, SIZE)
      ctx.beginPath()
      ctx.arc(CX, CY, R * 1.06, 0, Math.PI * 2)
      ctx.fillStyle = '#05060a'
      ctx.shadowBlur = 24
      ctx.shadowColor = '#b14bff'
      ctx.fill()
      ctx.shadowBlur = 0

      drawBoard(ctx)

      // bull and bullseye
      ctx.beginPath()
      ctx.arc(CX, CY, R * R_BULL, 0, Math.PI * 2)
      ctx.fillStyle = '#39ff9e'
      ctx.shadowBlur = 10
      ctx.shadowColor = '#39ff9e'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(CX, CY, R * R_BULLSEYE, 0, Math.PI * 2)
      ctx.fillStyle = '#ff2d55'
      ctx.shadowColor = '#ff2d55'
      ctx.fill()
      ctx.shadowBlur = 0

      // numbers
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.font = `bold ${Math.round(R * 0.085)}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2 - Math.PI / 2
        const nx = CX + Math.cos(angle) * R * 1.04
        const ny = CY + Math.sin(angle) * R * 1.04
        ctx.fillText(String(ORDER[i]), nx, ny)
      }

      // hit marks
      for (const h of hits.current) {
        ctx.beginPath()
        ctx.arc(h.x, h.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#ffb627'
        ctx.shadowBlur = 12
        ctx.shadowColor = '#ffb627'
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.strokeStyle = '#070509'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // crosshair (only on your live turn)
      if (turnRef.current === 'you' && !finished.current && !busy.current) {
        const { x, y } = aimRef.current
        ctx.strokeStyle = '#2dd4ff'
        ctx.shadowBlur = 14
        ctx.shadowColor = '#2dd4ff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x, y, 16, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x - 22, y)
        ctx.lineTo(x + 22, y)
        ctx.moveTo(x, y - 22)
        ctx.lineTo(x, y + 22)
        ctx.stroke()
        ctx.shadowBlur = 0
        ctx.beginPath()
        ctx.arc(x, y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = '#2dd4ff'
        ctx.fill()
      }

      ctx.restore()
      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('touchstart', onTouch)
    }
  }, [resetKey, difficulty])

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-sm font-bold">
        <span className={turn === 'you' ? 'text-neon-green' : 'text-zinc-500'}>
          {turn === 'you' && '●'} TÚ {youRem}
        </span>
        <span className="text-[11px] uppercase tracking-wide text-neon-amber">
          {turn === 'you' ? `Dardos: ${dartsLeft}` : 'Rival'}
        </span>
        <span className={turn === 'ai' ? 'text-neon-blue' : 'text-zinc-500'}>
          {aiRem} RIVAL {turn === 'ai' && '●'}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 justify-center">
        <canvas
          ref={canvasRef}
          width={SIZE * 2}
          height={SIZE * 2}
          className="h-full max-h-full touch-none rounded-xl bg-ink-950"
          style={{ aspectRatio: '1/1', maxWidth: '100%' }}
        />
      </div>
      <p className="text-center text-[11px] text-zinc-500">{msg}</p>
    </div>
  )
}
