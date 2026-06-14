import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Users, Target, Trophy, BookOpen, ArrowLeft, Coins, ChevronRight } from 'lucide-react'
import { getGame, accentClasses } from '@/lib/games'
import { useAuthGate } from '@/components/shared'
import { Card, Chip } from '@/components/ui/Primitives'
import { Modal } from '@/components/ui/Modal'
import { useStore } from '@/store/useStore'
import { MATCH_HISTORY } from '@/lib/mockData'
import { cn, fichas, fmtDate } from '@/lib/utils'

const MODES = [
  { id: 'practica', label: 'Práctica', icon: BookOpen, desc: 'Sin saldo. Aprende y calienta.', needAuth: false },
  { id: 'amigo', label: 'Contra amigo', icon: Users, desc: 'Reta a alguien de tu lista.', needAuth: true },
  { id: 'aleatorio', label: 'Rival aleatorio', icon: Target, desc: 'Emparejamiento por fichas.', needAuth: true },
  { id: 'torneo', label: 'Torneo', icon: Trophy, desc: 'Bracket nocturno por el bote.', needAuth: true },
]

const STAKES = [5, 10, 20, 50]

export default function GameDetail() {
  const { gameId = '' } = useParams()
  const navigate = useNavigate()
  const game = getGame(gameId)
  const { guard, gate } = useAuthGate()
  const lockFunds = useStore((s) => s.lockFunds)
  const [tutorial, setTutorial] = useState(false)
  const [stakeModal, setStakeModal] = useState<{ mode: string } | null>(null)
  const [stake, setStake] = useState(5)

  if (!game) {
    return (
      <div className="py-20 text-center text-zinc-400">
        Juego no encontrado. <Link to="/sala" className="text-neon-red">Volver</Link>
      </div>
    )
  }
  const a = accentClasses[game.accent]
  const history = MATCH_HISTORY.filter((m) => m.gameId === gameId)

  function pickMode(mode: string, needAuth: boolean) {
    if (!game!.playable) return
    if (mode === 'practica') {
      navigate(`/jugar/${gameId}?mode=practica`)
      return
    }
    const go = () => {
      if (mode === 'aleatorio') {
        navigate(`/matchmaking?game=${gameId}`)
      } else {
        setStakeModal({ mode })
      }
    }
    needAuth ? guard(go) : go()
  }

  function startStaked() {
    if (!stakeModal) return
    const ok = lockFunds(stake, `Partida ${game!.name} (${stakeModal.mode})`)
    if (ok) {
      navigate(`/jugar/${gameId}?mode=${stakeModal.mode}&stake=${stake}&rival=${stakeModal.mode === 'amigo' ? 'El Zorro' : 'Rival'}`)
      setStakeModal(null)
    }
  }

  return (
    <div>
      <button onClick={() => navigate('/sala')} className="btn-ghost mb-4 px-3 py-2">
        <ArrowLeft size={16} /> Sala de Juegos
      </button>

      <div className={cn('glass relative overflow-hidden rounded-3xl p-6 sm:p-8', a.border)}>
        <div className={cn('absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br blur-3xl', a.from, 'to-transparent')} />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className={cn('grid h-24 w-24 shrink-0 place-items-center rounded-2xl text-6xl', a.bg)}>
            {game.emoji}
          </div>
          <div className="flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              {game.playable ? <Chip tone="green">● Jugable</Chip> : <Chip tone="zinc">Próximamente</Chip>}
              <Chip tone="purple">{game.players}</Chip>
              <Chip tone="amber">Dificultad {'★'.repeat(game.difficulty)}</Chip>
            </div>
            <h1 className={cn('neon-title text-4xl sm:text-5xl', a.text)}>{game.name}</h1>
            <p className="mt-1 text-zinc-300">{game.description}</p>
          </div>
          <button onClick={() => setTutorial(true)} className="btn-ghost shrink-0">
            <BookOpen size={16} /> Tutorial
          </button>
        </div>
      </div>

      {/* modes */}
      <h2 className="neon-title mt-8 text-2xl text-zinc-100">Elige modo</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MODES.map((m) => (
          <motion.button
            key={m.id}
            whileHover={{ y: game.playable ? -3 : 0 }}
            onClick={() => pickMode(m.id, m.needAuth)}
            disabled={!game.playable}
            className={cn(
              'glass rounded-2xl p-4 text-left transition disabled:opacity-40',
              game.playable && 'glass-hover'
            )}
          >
            <div className={cn('grid h-11 w-11 place-items-center rounded-xl', a.bg, a.text)}>
              <m.icon size={20} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-bold text-zinc-100">{m.label}</span>
              <ChevronRight size={16} className="text-zinc-600" />
            </div>
            <p className="text-xs text-zinc-500">{m.desc}</p>
          </motion.button>
        ))}
      </div>

      {!game.playable && (
        <div className="mt-4 rounded-xl border border-neon-amber/30 bg-neon-amber/10 p-3 text-sm text-neon-amber">
          Este juego está en construcción. Mientras tanto, prueba Neón Pong, Billar de Trastienda o Mano Fría.
        </div>
      )}

      <div className="mt-5 flex justify-center">
        {game.playable && (
          <button onClick={() => navigate(`/jugar/${gameId}?mode=practica`)} className="btn-primary px-7 py-3 text-base">
            <Play size={18} /> Jugar práctica ahora
          </button>
        )}
      </div>

      {/* history */}
      {history.length > 0 && (
        <>
          <h2 className="neon-title mt-10 text-2xl text-zinc-100">Tu historial aquí</h2>
          <div className="mt-3 space-y-2">
            {history.map((h) => (
              <Card key={h.id} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'grid h-8 w-8 place-items-center rounded-lg text-xs font-bold',
                      h.result === 'win' ? 'bg-neon-green/15 text-neon-green' : h.result === 'loss' ? 'bg-neon-red/15 text-neon-red' : 'bg-white/5 text-zinc-400'
                    )}
                  >
                    {h.result === 'win' ? 'V' : h.result === 'loss' ? 'D' : 'E'}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-zinc-200">vs {h.opponent}</div>
                    <div className="text-[11px] text-zinc-500">{fmtDate(h.date)}</div>
                  </div>
                </div>
                <span className={cn('text-sm font-bold', h.delta > 0 ? 'text-neon-green' : h.delta < 0 ? 'text-neon-red' : 'text-zinc-400')}>
                  {h.delta > 0 ? '+' : ''}{h.delta} fichas
                </span>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* tutorial modal */}
      <Modal open={tutorial} onClose={() => setTutorial(false)} title={`Cómo jugar · ${game.name}`}>
        <div className="space-y-3 text-sm text-zinc-300">
          <p>{game.description}</p>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="mb-1 font-bold text-zinc-100">Controles</div>
            <p className="text-zinc-400">
              {gameId === 'pong' && 'Mueve la pala con el ratón, el dedo o las teclas ↑/↓ (o W/S). Primero en llegar a 7 gana.'}
              {gameId === 'reflejos' && 'Espera a que el panel se ponga verde y pulsa lo más rápido posible. Adelantarte pierde la ronda. Al mejor de 5.'}
              {gameId === 'billar' && 'Arrastra desde la bola blanca hacia atrás para apuntar y regular la fuerza, y suelta para tirar. Mete más bolas que el rival.'}
              {gameId === 'airhockey' && 'Arrastra tu mazo (mitad inferior) para golpear el disco. Mete 7 goles en la portería rival antes que él.'}
              {gameId === 'dardos' && 'La mira se mueve sola: pulsa o toca para clavar el dardo. Empiezas en 301 y debes llegar justo a 0. Si te pasas, pierdes el turno.'}
              {gameId === 'penaltis' && 'Tanda al mejor de 5: cuando tiras, elige zona de la portería (toca o teclas 1-6); cuando paras, elige hacia dónde te lanzas.'}
              {gameId === 'dados' && 'Juego 3D: pulsa "Lanzar dados". Gana la ronda quien saque la suma más alta. Al mejor de 5 rondas.'}
              {gameId === 'carreras' && 'Juego 3D: cambia de carril con ←/→, A/D o los botones táctiles, esquiva los obstáculos de neón y llega antes que el rival.'}
              {gameId === 'bolos' && 'Juego 3D: ajusta la puntería con el deslizador y para la barra de potencia en la zona verde para lanzar. Más bolos que el rival gana.'}
              {!['pong', 'reflejos', 'billar', 'airhockey', 'dardos', 'penaltis', 'dados', 'carreras', 'bolos'].includes(gameId) && 'Próximamente disponible para jugar.'}
            </p>
          </div>
          <p className="text-[11px] text-zinc-500">
            En modo práctica no se mueve saldo. Para jugar con fichas necesitas cuenta y verificación.
          </p>
        </div>
      </Modal>

      {/* stake modal */}
      <Modal
        open={!!stakeModal}
        onClose={() => setStakeModal(null)}
        title="Confirmar apuesta"
        size="sm"
        footer={
          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => setStakeModal(null)}>Cancelar</button>
            <button className="btn-primary flex-1" onClick={startStaked}>
              <Coins size={16} /> Bloquear {fichas(stake)}
            </button>
          </div>
        }
      >
        <p className="mb-3 text-sm text-zinc-400">
          Se bloquearán tus fichas hasta el final de la partida. El ganador se lleva el bote ({fichas(stake * 2)}).
        </p>
        <div className="grid grid-cols-4 gap-2">
          {STAKES.map((s) => (
            <button
              key={s}
              onClick={() => setStake(s)}
              className={cn(
                'rounded-xl border py-2 text-sm font-bold transition',
                stake === s ? 'border-neon-amber/60 bg-neon-amber/15 text-neon-amber' : 'border-white/10 bg-white/5 text-zinc-300'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </Modal>

      {gate}
    </div>
  )
}
