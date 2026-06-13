import { useEffect, useRef, useState } from 'react'
import type { GameComponentProps } from './types'

const ROUNDS = 5
type Phase = 'idle' | 'waiting' | 'go' | 'result'

export default function Reflejos({ difficulty = 1, onScore, onResult, resetKey }: GameComponentProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [you, setYou] = useState(0)
  const [opp, setOpp] = useState(0)
  const [round, setRound] = useState(0)
  const [msg, setMsg] = useState('Pulsa para empezar la ronda')
  const [yourTime, setYourTime] = useState<number | null>(null)
  const [oppTime, setOppTime] = useState<number | null>(null)
  const goAt = useRef(0)
  const timer = useRef<number>()
  const finished = useRef(false)

  useEffect(() => {
    setPhase('idle'); setYou(0); setOpp(0); setRound(0)
    setMsg('Pulsa para empezar la ronda'); setYourTime(null); setOppTime(null)
    finished.current = false
    onScore?.(0, 0)
    return () => clearTimeout(timer.current)
  }, [resetKey])

  const aiReaction = () => 380 - difficulty * 70 + Math.random() * 160 // ms

  function startRound() {
    if (round >= ROUNDS || finished.current) return
    setPhase('waiting')
    setMsg('Espera al verde…')
    setYourTime(null)
    setOppTime(null)
    const delay = 1200 + Math.random() * 2600
    timer.current = window.setTimeout(() => {
      goAt.current = performance.now()
      setPhase('go')
      setMsg('¡YA! ¡Dispara!')
    }, delay)
  }

  function handlePress() {
    if (phase === 'idle' || phase === 'result') {
      startRound()
      return
    }
    if (phase === 'waiting') {
      // false start -> lose round
      clearTimeout(timer.current)
      resolveRound(null, aiReaction(), 'Te adelantaste. Ronda perdida.')
      return
    }
    if (phase === 'go') {
      const rt = Math.round(performance.now() - goAt.current)
      const ai = Math.round(aiReaction())
      resolveRound(rt, ai)
    }
  }

  function resolveRound(yourRt: number | null, oppRt: number, forced?: string) {
    setYourTime(yourRt)
    setOppTime(oppRt)
    const youWon = yourRt !== null && yourRt < oppRt
    const newYou = you + (youWon ? 1 : 0)
    const newOpp = opp + (youWon ? 0 : 1)
    setYou(newYou)
    setOpp(newOpp)
    onScore?.(newYou, newOpp)
    const r = round + 1
    setRound(r)
    setPhase('result')
    setMsg(
      forced
        ? forced
        : youWon
        ? `¡Mano fría! ${yourRt}ms vs ${oppRt}ms`
        : yourRt === null
        ? `Rival: ${oppRt}ms. Ronda perdida.`
        : `Demasiado lento: ${yourRt}ms vs ${oppRt}ms`
    )
    if (r >= ROUNDS || newYou > ROUNDS / 2 || newOpp > ROUNDS / 2) {
      finished.current = true
      setTimeout(() => onResult({ youWin: newYou > newOpp, youScore: newYou, oppScore: newOpp }), 900)
    }
  }

  const bg =
    phase === 'go'
      ? 'bg-neon-green/20 border-neon-green shadow-neon-green'
      : phase === 'waiting'
      ? 'bg-neon-red/15 border-neon-red/60'
      : 'bg-ink-900 border-white/10'

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-2">
      <div className="flex w-full max-w-md justify-between text-sm font-bold">
        <span className="text-neon-red">TÚ {you}</span>
        <span className="text-zinc-500">Ronda {Math.min(round + (phase !== 'result' ? 1 : 0), ROUNDS)}/{ROUNDS}</span>
        <span className="text-neon-blue">{opp} RIVAL</span>
      </div>
      <button
        onClick={handlePress}
        className={`flex aspect-video w-full max-w-md flex-col items-center justify-center rounded-2xl border-2 text-center transition-colors ${bg}`}
      >
        <span className="neon-title text-4xl text-zinc-50">
          {phase === 'go' ? '¡YA!' : phase === 'waiting' ? '...' : '⚡'}
        </span>
        <span className="mt-2 max-w-[80%] text-sm text-zinc-300">{msg}</span>
        {(yourTime !== null || oppTime !== null) && phase === 'result' && (
          <span className="mt-3 text-xs text-zinc-500">
            Tú: {yourTime ?? '✗'}ms · Rival: {oppTime}ms
          </span>
        )}
      </button>
      <p className="text-center text-xs text-zinc-500">
        Cuando el panel se ponga <span className="text-neon-green">verde</span>, pulsa o toca lo más rápido posible.
        Adelantarte pierde la ronda.
      </p>
    </div>
  )
}
