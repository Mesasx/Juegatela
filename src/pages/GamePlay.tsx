import { useState, useMemo, lazy, Suspense, type ComponentType } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, RotateCcw, LogOut, Send, Trophy, Frown, Info, Loader2 } from 'lucide-react'
import { getGame, accentClasses } from '@/lib/games'
import { useStore } from '@/store/useStore'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Primitives'
import { cn, fichas } from '@/lib/utils'
import type { GameResult, GameComponentProps } from '@/games/types'

const QUICK_CHAT = ['¡Buena!', 'Suerte', 'Uff…', 'Revancha 😏', 'GG', 'Mírame ahora']

// Lazy-loaded so the 3D engines (three.js) stay in their own chunks.
const ENGINES: Record<string, ComponentType<GameComponentProps>> = {
  pong: lazy(() => import('@/games/Pong')),
  reflejos: lazy(() => import('@/games/Reflejos')),
  billar: lazy(() => import('@/games/Billar')),
  airhockey: lazy(() => import('@/games/AirHockey')),
  dardos: lazy(() => import('@/games/Dardos')),
  penaltis: lazy(() => import('@/games/Penaltis')),
  dados: lazy(() => import('@/games/Dados3D')),
  carreras: lazy(() => import('@/games/Carrera3D')),
  bolos: lazy(() => import('@/games/Bolos3D')),
}

// Which games are 3D (affects loading copy)
const IS_3D = new Set(['dados', 'carreras', 'bolos'])


export default function GamePlay() {
  const { gameId = '' } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const game = getGame(gameId)
  const Engine = ENGINES[gameId]

  const mode = params.get('mode') ?? 'practica' // practica | amigo | aleatorio | torneo
  const stake = Number(params.get('stake') ?? 0)
  const rival = params.get('rival') ?? 'Rival'

  const wallet = useStore((s) => s.wallet)
  const releaseToMe = useStore((s) => s.releaseToMe)
  const settleLoss = useStore((s) => s.settleLoss)
  const refund = useStore((s) => s.refund)
  const pushNotification = useStore((s) => s.pushNotification)

  const [resetKey, setResetKey] = useState(0)
  const [score, setScore] = useState({ you: 0, opp: 0 })
  const [result, setResult] = useState<GameResult | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [chat, setChat] = useState<{ me: boolean; text: string }[]>([])
  const [abandon, setAbandon] = useState(false)
  const settled = useMemo(() => ({ done: false }), [resetKey])

  const a = game ? accentClasses[game.accent] : accentClasses.blue

  if (!game || !Engine) {
    return (
      <div className="py-20 text-center">
        <p className="text-zinc-400">Este juego todavía no está disponible para jugar.</p>
        <Link to="/sala" className="btn-neon mt-4">Volver a la sala</Link>
      </div>
    )
  }

  function handleResult(r: GameResult) {
    setResult(r)
    if (settled.done) return
    settled.done = true
    if (stake > 0 && mode !== 'practica') {
      if (r.youWin) {
        releaseToMe(stake, `Victoria vs ${rival} · ${game!.name}`)
        pushNotification({ type: 'match_won', title: '¡Victoria!', body: `Ganaste a ${rival} en ${game!.name}. +${stake} fichas liberadas.` })
      } else {
        settleLoss(stake, `Derrota vs ${rival} · ${game!.name}`)
        pushNotification({ type: 'match_lost', title: 'Derrota', body: `${rival} te ganó en ${game!.name}.` })
      }
    }
  }

  function rematch() {
    setResult(null)
    setScore({ you: 0, opp: 0 })
    setResetKey((k) => k + 1)
  }

  function quit() {
    if (stake > 0 && mode !== 'practica' && !settled.done) {
      refund(stake, `Abandono · ${game!.name} (reembolso parcial demo)`)
    }
    navigate(`/sala/${gameId}`)
  }

  const modeLabel: Record<string, string> = {
    practica: 'Práctica',
    amigo: 'Contra amigo',
    aleatorio: 'Rival aleatorio',
    torneo: 'Torneo',
  }

  return (
    <div>
      {/* top bar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <button onClick={() => setAbandon(true)} className="btn-ghost px-3 py-2">
          <ArrowLeft size={16} /> Salir
        </button>
        <div className="text-center">
          <div className={cn('neon-title text-xl', a.text)}>{game.name}</div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500">
            {modeLabel[mode]} {stake > 0 && `· ${fichas(stake)} en juego`}
          </div>
        </div>
        <button onClick={rematch} className="btn-ghost px-3 py-2">
          <RotateCcw size={16} /> Reiniciar
        </button>
      </div>

      {/* scoreboard */}
      <div className="mb-3 grid grid-cols-3 items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
        <div className="flex items-center gap-2">
          <Avatar seed="🎭" size={36} />
          <div>
            <div className="text-xs font-bold text-zinc-200">Tú</div>
            <div className="text-2xl font-extrabold text-neon-red">{score.you}</div>
          </div>
        </div>
        <div className="text-center text-xs font-bold uppercase tracking-widest text-zinc-600">vs</div>
        <div className="flex items-center justify-end gap-2 text-right">
          <div>
            <div className="text-xs font-bold text-zinc-200">{mode === 'practica' ? 'CPU' : rival}</div>
            <div className="text-2xl font-extrabold text-neon-blue">{score.opp}</div>
          </div>
          <Avatar seed="🤖" size={36} />
        </div>
      </div>

      {/* game surface */}
      <div className="glass relative overflow-hidden rounded-2xl p-3">
        <div className="min-h-[320px]">
          <Suspense
            fallback={
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-zinc-400">
                <Loader2 className="animate-spin text-neon-purple" size={32} />
                <span className="text-sm">{IS_3D.has(gameId) ? 'Cargando motor 3D…' : 'Cargando juego…'}</span>
              </div>
            }
          >
            <Engine
              difficulty={game.difficulty}
              resetKey={resetKey}
              onScore={(you, opp) => setScore({ you, opp })}
              onResult={handleResult}
            />
          </Suspense>
        </div>
      </div>

      {/* controls help + quick chat */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
          <Info size={13} />
          {gameId === 'pong' && 'Ratón / dedo o ↑↓ (W/S) para mover la pala.'}
          {gameId === 'reflejos' && 'Pulsa o toca cuando se ponga verde.'}
          {gameId === 'billar' && 'Arrastra desde la bola blanca y suelta para tirar.'}
          {gameId === 'airhockey' && 'Arrastra tu mazo por tu mitad para golpear el disco.'}
          {gameId === 'dardos' && 'Pulsa o toca para lanzar el dardo donde esté la mira.'}
          {gameId === 'penaltis' && 'Toca una zona de la portería (o teclas 1-6) para tirar y parar.'}
          {gameId === 'dados' && 'Pulsa "Lanzar dados" y suma más que el rival. Al mejor de 5.'}
          {gameId === 'carreras' && 'Cambia de carril con ←/→ (o A/D) y esquiva los obstáculos.'}
          {gameId === 'bolos' && 'Ajusta puntería y para la barra de potencia en el punto verde.'}
        </div>
        <button onClick={() => setShowChat((v) => !v)} className="btn-ghost px-3 py-1.5 text-xs">
          Chat rápido
        </button>
      </div>

      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="glass rounded-xl p-3">
              <div className="mb-2 flex max-h-28 flex-col gap-1 overflow-y-auto">
                {chat.length === 0 && <span className="text-[11px] text-zinc-600">Manda un mensaje rápido al rival.</span>}
                {chat.map((m, i) => (
                  <span
                    key={i}
                    className={cn(
                      'max-w-[70%] rounded-lg px-2 py-1 text-xs',
                      m.me ? 'self-end bg-neon-red/20 text-neon-red' : 'self-start bg-white/5 text-zinc-300'
                    )}
                  >
                    {m.text}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_CHAT.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setChat((c) => [...c, { me: true, text: q }])
                      setTimeout(() => setChat((c) => [...c, { me: false, text: QUICK_CHAT[Math.floor(Math.random() * QUICK_CHAT.length)] }]), 900)
                    }}
                    className="chip border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                  >
                    <Send size={10} /> {q}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* result modal */}
      <Modal
        open={!!result}
        onClose={() => {}}
        size="sm"
        footer={
          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={quit}>Salir</button>
            <button className="btn-primary flex-1" onClick={rematch}>
              <RotateCcw size={16} /> Revancha
            </button>
          </div>
        }
      >
        {result && (
          <div className="flex flex-col items-center gap-3 py-3 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                'grid h-20 w-20 place-items-center rounded-2xl text-4xl',
                result.youWin ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-red/20 text-neon-red'
              )}
            >
              {result.youWin ? <Trophy size={40} /> : <Frown size={40} />}
            </motion.div>
            <h2 className="neon-title text-4xl text-zinc-50">
              {result.youWin ? '¡Victoria!' : 'Derrota'}
            </h2>
            <p className="text-zinc-400">
              {result.youScore} — {result.oppScore} {mode !== 'practica' ? `· vs ${rival}` : '· práctica'}
            </p>
            {stake > 0 && mode !== 'practica' && (
              <div
                className={cn(
                  'rounded-xl border px-4 py-2 text-sm font-bold',
                  result.youWin
                    ? 'border-neon-green/30 bg-neon-green/10 text-neon-green'
                    : 'border-neon-red/30 bg-neon-red/10 text-neon-red'
                )}
              >
                {result.youWin ? `+${fichas(stake)} liberadas a tu favor` : `-${fichas(stake)} (fondos liberados al rival)`}
              </div>
            )}
            {mode === 'practica' && (
              <p className="text-[11px] text-zinc-600">Modo práctica · no se mueve saldo.</p>
            )}
          </div>
        )}
      </Modal>

      {/* abandon confirm */}
      <Modal
        open={abandon}
        onClose={() => setAbandon(false)}
        title="¿Abandonar la partida?"
        size="sm"
        footer={
          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => setAbandon(false)}>Seguir jugando</button>
            <button className="btn-primary flex-1" onClick={quit}><LogOut size={16} /> Abandonar</button>
          </div>
        }
      >
        <p className="text-sm text-zinc-400">
          {stake > 0 && mode !== 'practica'
            ? 'Abandonar una partida con fichas puede penalizar tu fiabilidad. En modo demo se hará un reembolso parcial.'
            : 'Perderás el progreso de esta partida de práctica.'}
        </p>
      </Modal>
    </div>
  )
}
