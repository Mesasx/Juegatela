import { useEffect, useRef, useState } from 'react'
import type { GameComponentProps } from './types'

// Penalty shootout. You shoot AND you save (alternating). Best of 5, then sudden death.
const W = 480
const H = 360

// 6 zones: 3 columns (L,C,R) x 2 rows (top, bottom)
const COLS = 3
const ROWS = 2
const ZONES = COLS * ROWS

type Phase = 'shoot' | 'save' | 'anim' | 'over'
type Mode = 'shoot' | 'save'

interface ZoneRect {
  x: number
  y: number
  w: number
  h: number
  cx: number
  cy: number
}

// Goal frame in logical space
const GOAL = { x: W * 0.13, y: H * 0.18, w: W * 0.74, h: H * 0.46 }

function zoneRects(): ZoneRect[] {
  const rects: ZoneRect[] = []
  const zw = GOAL.w / COLS
  const zh = GOAL.h / ROWS
  for (let r = 0; r < ROWS; r++) {
    for (let col = 0; col < COLS; col++) {
      const x = GOAL.x + col * zw
      const y = GOAL.y + r * zh
      rects.push({ x, y, w: zw, h: zh, cx: x + zw / 2, cy: y + zh / 2 })
    }
  }
  return rects
}

const RECTS = zoneRects()

export default function Penaltis({ difficulty = 1, onScore, onResult, resetKey }: GameComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [you, setYou] = useState(0)
  const [opp, setOpp] = useState(0)
  const [round, setRound] = useState(1)
  const [mode, setMode] = useState<Mode>('shoot')
  const [msg, setMsg] = useState('Tu turno: toca una zona de la portería para chutar')
  const [flash, setFlash] = useState<{ text: string; color: string } | null>(null)

  const youRef = useRef(0)
  const oppRef = useRef(0)
  const shotsYou = useRef(0) // shots you have taken
  const shotsOpp = useRef(0) // shots AI has taken (you saving)
  const phaseRef = useRef<Phase>('shoot')
  const modeRef = useRef<Mode>('shoot')
  const finished = useRef(false)
  // animation state
  const anim = useRef({
    active: false,
    t: 0,
    ballFrom: { x: W / 2, y: H * 0.86 },
    ballTo: { x: W / 2, y: H / 2 },
    keeperFrom: GOAL.x + GOAL.w / 2,
    keeperTo: GOAL.x + GOAL.w / 2,
    keeperDive: 0, // 0 top stand .. 1 dive low
    goal: false,
  })
  const keeperX = useRef(GOAL.x + GOAL.w / 2)
  const keeperDiveR = useRef(0)
  const hoverZone = useRef(-1)

  useEffect(() => {
    youRef.current = 0
    oppRef.current = 0
    shotsYou.current = 0
    shotsOpp.current = 0
    phaseRef.current = 'shoot'
    modeRef.current = 'shoot'
    finished.current = false
    anim.current.active = false
    keeperX.current = GOAL.x + GOAL.w / 2
    keeperDiveR.current = 0
    hoverZone.current = -1
    setYou(0)
    setOpp(0)
    setRound(1)
    setMode('shoot')
    setMsg('Tu turno: toca una zona de la portería para chutar')
    setFlash(null)
    onScore?.(0, 0)

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0

    const toLogical = (cx: number, cy: number) => {
      const r = canvas.getBoundingClientRect()
      return { x: ((cx - r.left) / r.width) * W, y: ((cy - r.top) / r.height) * H }
    }

    const zoneAt = (x: number, y: number): number => {
      for (let i = 0; i < RECTS.length; i++) {
        const z = RECTS[i]
        if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) return i
      }
      return -1
    }

    const handlePick = (cx: number, cy: number) => {
      if (finished.current || phaseRef.current === 'anim') return
      const p = toLogical(cx, cy)
      const z = zoneAt(p.x, p.y)
      if (z < 0) return
      if (phaseRef.current === 'shoot') doShoot(z)
      else if (phaseRef.current === 'save') doSave(z)
    }

    const handleHover = (cx: number, cy: number) => {
      if (phaseRef.current === 'anim') {
        hoverZone.current = -1
        return
      }
      const p = toLogical(cx, cy)
      hoverZone.current = zoneAt(p.x, p.y)
    }

    const onClick = (e: MouseEvent) => handlePick(e.clientX, e.clientY)
    const onMove = (e: MouseEvent) => handleHover(e.clientX, e.clientY)
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) handlePick(e.touches[0].clientX, e.touches[0].clientY)
    }
    // keyboard: map keys 1-6 to zones
    const onKey = (e: KeyboardEvent) => {
      const n = parseInt(e.key, 10)
      if (n >= 1 && n <= ZONES && !finished.current && phaseRef.current !== 'anim') {
        const z = n - 1
        if (phaseRef.current === 'shoot') doShoot(z)
        else if (phaseRef.current === 'save') doSave(z)
      }
    }
    canvas.addEventListener('click', onClick)
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('keydown', onKey)

    // AI keeper guess accuracy (chance to pick correct column band)
    const keeperSmart = 0.12 + difficulty * 0.13
    const shooterSmart = 0.18 + difficulty * 0.16

    const doShoot = (zone: number) => {
      phaseRef.current = 'anim'
      hoverZone.current = -1
      const target = RECTS[zone]
      // AI keeper picks a zone
      let keeperZone: number
      if (Math.random() < keeperSmart) {
        keeperZone = zone // perfect read
      } else {
        // guess: bias same column sometimes
        keeperZone = Math.floor(Math.random() * ZONES)
      }
      const saved = keeperZone === zone
      startAnim(target, RECTS[keeperZone], saved, () => {
        if (saved) {
          showFlash('¡PARADA DEL PORTERO!', '#2dd4ff')
          setMsg('El portero paró tu tiro')
        } else {
          youRef.current++
          setYou(youRef.current)
          onScore?.(youRef.current, oppRef.current)
          showFlash('¡GOOOL!', '#39ff9e')
          setMsg('¡Marcaste!')
        }
        shotsYou.current++
        afterShot()
      })
    }

    const doSave = (zone: number) => {
      phaseRef.current = 'anim'
      hoverZone.current = -1
      // AI picks where to shoot
      const aiZone = Math.floor(Math.random() * ZONES)
      // your dive = zone you picked; you save if same band (column + row close)
      const saved = aiZone === zone
      startAnim(RECTS[aiZone], RECTS[zone], saved, () => {
        if (saved) {
          showFlash('¡PARADÓN!', '#39ff9e')
          setMsg('¡Adivinaste y paraste!')
        } else {
          oppRef.current++
          setOpp(oppRef.current)
          onScore?.(youRef.current, oppRef.current)
          showFlash('Gol del rival', '#ff2d55')
          setMsg('El rival marcó')
        }
        shotsOpp.current++
        afterShot()
      }, true)
    }

    const showFlash = (text: string, color: string) => {
      setFlash({ text, color })
      setTimeout(() => setFlash(null), 1100)
    }

    const startAnim = (
      ballTo: ZoneRect,
      keeperZone: ZoneRect,
      saved: boolean,
      onDone: () => void,
      aiShooting = false,
    ) => {
      anim.current = {
        active: true,
        t: 0,
        ballFrom: { x: W / 2, y: H * 0.86 },
        ballTo: { x: ballTo.cx, y: ballTo.cy },
        keeperFrom: keeperX.current,
        keeperTo: keeperZone.cx,
        keeperDive: keeperZone.cy > GOAL.y + GOAL.h / 2 ? 1 : 0,
        goal: !saved,
      }
      void aiShooting
      animDone = onDone
    }

    let animDone: (() => void) | null = null

    const afterShot = () => {
      setTimeout(() => {
        if (checkWinner()) return
        // switch mode
        const next: Mode = modeRef.current === 'shoot' ? 'save' : 'shoot'
        modeRef.current = next
        setMode(next)
        phaseRef.current = next
        // round number = total completed pairs / 2 + 1
        const totalShots = shotsYou.current + shotsOpp.current
        setRound(Math.floor(totalShots / 2) + 1)
        keeperX.current = GOAL.x + GOAL.w / 2
        keeperDiveR.current = 0
        if (next === 'shoot') {
          setMsg('Tu turno: toca una zona para chutar (o teclas 1-6)')
        } else {
          setMsg('Te toca PARAR: toca la zona a la que lanzarte')
        }
      }, 1200)
    }

    const checkWinner = (): boolean => {
      const y = youRef.current
      const o = oppRef.current
      const sy = shotsYou.current
      const so = shotsOpp.current
      const baseLeftYou = 5 - sy
      const baseLeftOpp = 5 - so
      // within first 5 each: decided if a lead can't be overturned
      if (sy <= 5 && so <= 5) {
        if (y > o + baseLeftOpp) return finish(true)
        if (o > y + baseLeftYou) return finish(false)
        if (sy === 5 && so === 5 && y !== o) return finish(y > o)
      }
      // sudden death: both have taken equal shots beyond 5
      if (sy >= 5 && so >= 5 && sy === so && y !== o) {
        return finish(y > o)
      }
      return false
    }

    const finish = (win: boolean): boolean => {
      if (finished.current) return true
      finished.current = true
      phaseRef.current = 'over'
      setMsg(win ? '¡Ganaste la tanda! 🏆' : 'Perdiste la tanda')
      setTimeout(() => onResult({ youWin: win, youScore: youRef.current, oppScore: oppRef.current }), 1000)
      return true
    }

    // ---- draw helpers ----
    const ease = (t: number) => t * t * (3 - 2 * t)

    const loop = () => {
      const a = anim.current
      if (a.active) {
        a.t += 0.022
        const e = ease(Math.min(1, a.t))
        // keeper moves slightly behind ball timing for save feel
        const ke = ease(Math.min(1, a.t * 1.05))
        keeperX.current = a.keeperFrom + (a.keeperTo - a.keeperFrom) * ke
        keeperDiveR.current = a.keeperDive * ke
        if (a.t >= 1) {
          a.active = false
          if (animDone) {
            const d = animDone
            animDone = null
            d()
          }
        }
      }
      draw(ctx, canvas)
      raf = requestAnimationFrame(loop)
    }

    const draw = (c: CanvasRenderingContext2D, cv: HTMLCanvasElement) => {
      const sx = cv.width / W
      const sy = cv.height / H
      c.clearRect(0, 0, cv.width, cv.height)
      c.save()
      c.scale(sx, sy)

      // sky / night
      const grad = c.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, '#0c0910')
      grad.addColorStop(1, '#070509')
      c.fillStyle = grad
      c.fillRect(0, 0, W, H)

      // grass
      c.fillStyle = '#06140d'
      c.fillRect(0, H * 0.62, W, H * 0.38)
      c.strokeStyle = 'rgba(57,255,158,0.12)'
      c.lineWidth = 1
      for (let i = 0; i < 6; i++) {
        const y = H * 0.64 + i * (H * 0.36) / 6
        c.beginPath()
        c.moveTo(0, y)
        c.lineTo(W, y)
        c.stroke()
      }

      // goal frame
      c.strokeStyle = '#b14bff'
      c.shadowBlur = 18
      c.shadowColor = '#b14bff'
      c.lineWidth = 6
      c.strokeRect(GOAL.x, GOAL.y, GOAL.w, GOAL.h)
      c.shadowBlur = 0
      // net
      c.strokeStyle = 'rgba(177,75,255,0.18)'
      c.lineWidth = 1
      const cells = 10
      for (let i = 1; i < cells; i++) {
        const x = GOAL.x + (GOAL.w * i) / cells
        c.beginPath()
        c.moveTo(x, GOAL.y)
        c.lineTo(x, GOAL.y + GOAL.h)
        c.stroke()
      }
      for (let i = 1; i < 5; i++) {
        const y = GOAL.y + (GOAL.h * i) / 5
        c.beginPath()
        c.moveTo(GOAL.x, y)
        c.lineTo(GOAL.x + GOAL.w, y)
        c.stroke()
      }

      // interactive zones (highlight on hover / waiting input)
      const interactive = phaseRef.current === 'shoot' || phaseRef.current === 'save'
      if (interactive && !finished.current) {
        for (let i = 0; i < RECTS.length; i++) {
          const z = RECTS[i]
          const hot = hoverZone.current === i
          c.fillStyle = hot ? 'rgba(45,212,255,0.22)' : 'rgba(45,212,255,0.05)'
          c.fillRect(z.x + 2, z.y + 2, z.w - 4, z.h - 4)
          c.strokeStyle = hot ? '#2dd4ff' : 'rgba(45,212,255,0.25)'
          c.lineWidth = hot ? 2.5 : 1
          c.shadowBlur = hot ? 14 : 0
          c.shadowColor = '#2dd4ff'
          c.strokeRect(z.x + 2, z.y + 2, z.w - 4, z.h - 4)
          c.shadowBlur = 0
          // zone number
          c.fillStyle = 'rgba(255,255,255,0.4)'
          c.font = 'bold 16px sans-serif'
          c.textAlign = 'center'
          c.textBaseline = 'middle'
          c.fillText(String(i + 1), z.cx, z.cy)
        }
      }

      // keeper
      const kx = keeperX.current
      const kdive = keeperDiveR.current
      const baseY = GOAL.y + GOAL.h - 14
      drawKeeper(c, kx, baseY, kdive, kx - (GOAL.x + GOAL.w / 2))

      // ball
      if (anim.current.active) {
        const a = anim.current
        const e = ease(Math.min(1, a.t))
        const bx = a.ballFrom.x + (a.ballTo.x - a.ballFrom.x) * e
        const by = a.ballFrom.y + (a.ballTo.y - a.ballFrom.y) * e
        const scale = 1 - e * 0.5
        drawBall(c, bx, by, 14 * scale)
      } else {
        drawBall(c, W / 2, H * 0.86, 14)
      }

      c.restore()
    }

    const drawBall = (c: CanvasRenderingContext2D, x: number, y: number, r: number) => {
      // shadow
      c.fillStyle = 'rgba(0,0,0,0.4)'
      c.beginPath()
      c.ellipse(x, y + r * 0.9, r * 0.9, r * 0.3, 0, 0, Math.PI * 2)
      c.fill()
      c.beginPath()
      c.arc(x, y, r, 0, Math.PI * 2)
      c.fillStyle = '#f4f4f5'
      c.shadowBlur = 16
      c.shadowColor = '#ffffff'
      c.fill()
      c.shadowBlur = 0
      // pentagon hint
      c.fillStyle = '#11151a'
      c.beginPath()
      c.arc(x, y, r * 0.32, 0, Math.PI * 2)
      c.fill()
    }

    const drawKeeper = (
      c: CanvasRenderingContext2D,
      x: number,
      baseY: number,
      dive: number,
      lateral: number,
    ) => {
      c.save()
      c.translate(x, baseY)
      // tilt when diving sideways
      const tilt = Math.max(-0.5, Math.min(0.5, lateral / 120))
      c.rotate(tilt * 0.6)
      const armSpread = 18 + dive * 6
      c.strokeStyle = '#ffb627'
      c.fillStyle = '#ffb627'
      c.shadowBlur = 16
      c.shadowColor = '#ffb627'
      c.lineWidth = 7
      c.lineCap = 'round'
      // body
      const bodyTop = -55 + dive * 18
      c.beginPath()
      c.moveTo(0, 0)
      c.lineTo(0, bodyTop)
      c.stroke()
      // head
      c.beginPath()
      c.arc(0, bodyTop - 12, 9, 0, Math.PI * 2)
      c.fill()
      // arms (stretch up/out)
      const ay = bodyTop + 12
      c.beginPath()
      c.moveTo(0, ay)
      c.lineTo(-armSpread, ay - 14 + dive * 26)
      c.moveTo(0, ay)
      c.lineTo(armSpread, ay - 14 + dive * 26)
      c.stroke()
      // legs
      c.beginPath()
      c.moveTo(0, 0)
      c.lineTo(-12, 14 - dive * 4)
      c.moveTo(0, 0)
      c.lineTo(12, 14 - dive * 4)
      c.stroke()
      c.shadowBlur = 0
      c.restore()
    }

    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('touchstart', onTouch)
      window.removeEventListener('keydown', onKey)
    }
  }, [resetKey, difficulty])

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-sm font-bold">
        <span className="text-neon-green">TÚ {you}</span>
        <span className="text-[11px] uppercase tracking-wide text-neon-amber">
          Ronda {round} · {mode === 'shoot' ? 'TIRAS' : 'PARAS'}
        </span>
        <span className="text-neon-red">{opp} RIVAL</span>
      </div>
      <div className="relative flex min-h-0 flex-1 justify-center">
        <canvas
          ref={canvasRef}
          width={W * 2}
          height={H * 2}
          className="h-full max-h-full touch-none rounded-xl bg-ink-950"
          style={{ aspectRatio: `${W}/${H}`, maxWidth: '100%' }}
        />
        {flash && (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{ color: flash.color }}
          >
            <span
              className="neon-title text-4xl font-extrabold"
              style={{ textShadow: `0 0 18px ${flash.color}` }}
            >
              {flash.text}
            </span>
          </div>
        )}
      </div>
      <p className="text-center text-[11px] text-zinc-500">{msg}</p>
    </div>
  )
}
