import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Search, X, Check, Coins, Wifi, ShieldCheck } from 'lucide-react'
import { GAMES, getGame, accentClasses } from '@/lib/games'
import { useAuthGate } from '@/components/shared'
import { PageHeader } from '@/components/shared'
import { Avatar, Card, Chip } from '@/components/ui/Primitives'
import { useStore } from '@/store/useStore'
import { cn, fichas } from '@/lib/utils'

type Phase = 'config' | 'searching' | 'found'
const STAKES = [0, 5, 10, 20, 50]
const RIVAL_NAMES = ['NocheCerrada', 'ManoLista', 'ElTahúr', 'Relámpago', 'DobleFilo', 'Penumbra']
const RIVAL_AVATARS = ['🦂', '🐲', '🦇', '🐍', '🦅', '🐙']

export default function Matchmaking() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { guard, gate } = useAuthGate()
  const lockFunds = useStore((s) => s.lockFunds)

  const [gameId, setGameId] = useState(params.get('game') || 'pong')
  const [stake, setStake] = useState(5)
  const [competitive, setCompetitive] = useState(true)
  const [region, setRegion] = useState('Auto')
  const [phase, setPhase] = useState<Phase>('config')
  const [elapsed, setElapsed] = useState(0)
  const [rival, setRival] = useState({ name: '', avatar: '', level: 0, stake: 0 })
  const timer = useRef<number>()

  const game = getGame(gameId)!
  const a = accentClasses[game.accent]
  const playable = GAMES.filter((g) => g.playable)

  useEffect(() => () => clearInterval(timer.current), [])

  function startSearch() {
    const begin = () => {
      setPhase('searching')
      setElapsed(0)
      timer.current = window.setInterval(() => setElapsed((e) => e + 1), 1000)
      const wait = 2500 + Math.random() * 3000
      setTimeout(() => {
        clearInterval(timer.current)
        const idx = Math.floor(Math.random() * RIVAL_NAMES.length)
        const variance = competitive ? 0 : Math.round((Math.random() - 0.5) * 10)
        setRival({
          name: RIVAL_NAMES[idx],
          avatar: RIVAL_AVATARS[idx],
          level: 8 + Math.floor(Math.random() * 22),
          stake: Math.max(0, stake + variance),
        })
        setPhase('found')
      }, wait)
    }
    if (stake === 0) begin()
    else guard(begin)
  }

  function cancel() {
    clearInterval(timer.current)
    setPhase('config')
    setElapsed(0)
  }

  function confirmMatch() {
    if (stake > 0) {
      const ok = lockFunds(stake, `Matchmaking ${game.name} vs ${rival.name}`)
      if (!ok) return
    }
    navigate(`/jugar/${gameId}?mode=${stake > 0 ? 'aleatorio' : 'practica'}&stake=${stake}&rival=${encodeURIComponent(rival.name)}`)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Buscar rival"
        title="Emparejamiento"
        subtitle="Te cruzamos con alguien que arriesga lo mismo que tú. Mismo bote, mismas ganas."
      />

      <AnimatePresence mode="wait">
        {phase === 'config' && (
          <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              <Card className="p-5">
                <h3 className="mb-3 font-bold text-zinc-100">Elige juego</h3>
                <div className="grid grid-cols-3 gap-2">
                  {playable.map((g) => {
                    const ga = accentClasses[g.accent]
                    return (
                      <button
                        key={g.id}
                        onClick={() => setGameId(g.id)}
                        className={cn(
                          'rounded-xl border p-3 text-center transition',
                          gameId === g.id ? cn(ga.border, ga.bg) : 'border-white/10 bg-white/[0.02] hover:bg-white/5'
                        )}
                      >
                        <div className="text-2xl">{g.emoji}</div>
                        <div className={cn('mt-1 text-xs font-bold', gameId === g.id ? ga.text : 'text-zinc-300')}>{g.name}</div>
                      </button>
                    )
                  })}
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="mb-3 font-bold text-zinc-100">¿Cuánto arriesgas?</h3>
                <div className="grid grid-cols-5 gap-2">
                  {STAKES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStake(s)}
                      className={cn(
                        'rounded-xl border py-2.5 text-sm font-bold transition',
                        stake === s ? 'border-neon-amber/60 bg-neon-amber/15 text-neon-amber' : 'border-white/10 bg-white/5 text-zinc-300'
                      )}
                    >
                      {s === 0 ? 'Demo' : s}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-zinc-500">
                  {stake === 0 ? 'Partida casual sin bloquear fichas.' : `Bote total ${fichas(stake * 2)}. Se busca rival con la misma cantidad (±5).`}
                </p>
              </Card>
            </div>

            <div className="space-y-5">
              <Card className="p-5">
                <h3 className="mb-3 font-bold text-zinc-100">Preferencias</h3>
                <label className="label">Modo</label>
                <div className="mb-3 grid grid-cols-2 gap-2">
                  <button onClick={() => setCompetitive(false)} className={cn('rounded-xl border py-2 text-sm font-semibold', !competitive ? 'border-neon-blue/50 bg-neon-blue/10 text-neon-blue' : 'border-white/10 text-zinc-300')}>Casual</button>
                  <button onClick={() => setCompetitive(true)} className={cn('rounded-xl border py-2 text-sm font-semibold', competitive ? 'border-neon-red/50 bg-neon-red/10 text-neon-red' : 'border-white/10 text-zinc-300')}>Competitivo</button>
                </div>
                <label className="label">Región</label>
                <select value={region} onChange={(e) => setRegion(e.target.value)} className="input">
                  <option>Auto</option>
                  <option>Europa</option>
                  <option>Latinoamérica</option>
                  <option>Norteamérica</option>
                </select>
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-neon-green/20 bg-neon-green/5 p-2 text-[11px] text-neon-green">
                  <ShieldCheck size={14} /> Protección anti-trampas, anti-bots y anti-multicuenta activa.
                </div>
              </Card>
              <button onClick={startSearch} className="btn-primary w-full py-3.5 text-base">
                <Search size={18} /> Buscar rival
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'searching' && (
          <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-16">
            <div className="relative grid h-48 w-48 place-items-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={cn('absolute rounded-full border-2', a.border)}
                  initial={{ width: 60, height: 60, opacity: 0.8 }}
                  animate={{ width: 192, height: 192, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
                />
              ))}
              <div className={cn('grid h-20 w-20 place-items-center rounded-full text-4xl', a.bg)}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                  <Target className={a.text} size={36} />
                </motion.div>
              </div>
            </div>
            <h2 className="neon-title mt-6 text-3xl text-zinc-50">Buscando rival…</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {game.name} · {stake === 0 ? 'demo' : fichas(stake)} · {region}
            </p>
            <p className="mt-1 text-xs text-zinc-600">Tiempo de espera máx. 60s · {elapsed}s</p>
            {elapsed >= 8 && (
              <p className="mt-2 text-xs text-neon-amber">Ampliando margen de búsqueda (±5 fichas)…</p>
            )}
            <button onClick={cancel} className="btn-ghost mt-6"><X size={16} /> Cancelar búsqueda</button>
          </motion.div>
        )}

        {phase === 'found' && (
          <motion.div key="found" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-lg">
            <Card className={cn('overflow-hidden p-0', a.border)}>
              <div className={cn('bg-gradient-to-br p-6 text-center', a.from, 'to-transparent')}>
                <Chip tone="green"><Wifi size={12} /> Rival encontrado</Chip>
                <div className="mt-4 flex items-center justify-center gap-6">
                  <div className="text-center">
                    <Avatar seed="🎭" size={64} ring />
                    <div className="mt-2 text-sm font-bold text-neon-red">Tú</div>
                  </div>
                  <div className="neon-title text-3xl text-zinc-500">VS</div>
                  <div className="text-center">
                    <Avatar seed={rival.avatar} size={64} />
                    <div className="mt-2 text-sm font-bold text-neon-blue">{rival.name}</div>
                    <div className="text-[11px] text-zinc-500">Nivel {rival.level}</div>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <div className="text-[11px] uppercase text-zinc-500">Juego</div>
                    <div className="font-bold text-zinc-100">{game.name}</div>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <div className="text-[11px] uppercase text-zinc-500">En juego</div>
                    <div className="font-bold text-neon-amber">{stake === 0 ? 'Demo' : fichas(stake)}</div>
                  </div>
                </div>
                {stake > 0 && (
                  <p className="mt-3 text-center text-[11px] text-zinc-500">
                    Al confirmar se bloquearán {fichas(stake)}. El ganador se lleva {fichas(stake * 2)}.
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <button onClick={cancel} className="btn-ghost flex-1"><X size={16} /> Rechazar</button>
                  <button onClick={confirmMatch} className="btn-primary flex-1">
                    {stake > 0 ? <Coins size={16} /> : <Check size={16} />} {stake > 0 ? 'Bloquear y jugar' : 'Empezar'}
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {gate}
    </div>
  )
}
