import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skull, Crosshair, Hand } from 'lucide-react'
import type { GameComponentProps } from './types'

type Rank = 'A' | 'K' | 'Q' | 'J' // J = comodín
interface Card { id: number; rank: Rank }
interface Player {
  id: number
  name: string
  avatar: string
  isYou: boolean
  hand: Card[]
  alive: boolean
  bulletPos: number // 0..5 chamber that fires
  pulls: number
}

const RANK_LABEL: Record<Exclude<Rank, 'J'>, string> = { A: 'ASES', K: 'REYES', Q: 'REINAS' }
const RANK_CHAR: Record<Rank, string> = { A: 'A', K: 'K', Q: 'Q', J: '★' }
const TABLE_RANKS: Exclude<Rank, 'J'>[] = ['A', 'K', 'Q']

let cardSeq = 1
function buildDeck(): Card[] {
  const d: Card[] = []
  for (const r of ['A', 'K', 'Q'] as Rank[]) for (let i = 0; i < 6; i++) d.push({ id: cardSeq++, rank: r })
  for (let i = 0; i < 2; i++) d.push({ id: cardSeq++, rank: 'J' })
  // shuffle
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[d[i], d[j]] = [d[j], d[i]]
  }
  return d
}

const AI_DEFS = [
  { name: 'El Zorro', avatar: '🦊' },
  { name: 'Lobita', avatar: '🐺' },
  { name: 'Águila', avatar: '🦅' },
]

export default function Mentiroso({ difficulty = 2, onScore, onResult, resetKey }: GameComponentProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [tableRank, setTableRank] = useState<Exclude<Rank, 'J'>>('Q')
  const [current, setCurrent] = useState(0)
  const [lastPlay, setLastPlay] = useState<{ player: number; cards: Card[] } | null>(null)
  const [selected, setSelected] = useState<number[]>([])
  const [phase, setPhase] = useState<'intro' | 'play' | 'reveal' | 'roulette' | 'over'>('intro')
  const [message, setMessage] = useState('La mesa está servida. ¿Te la juegas?')
  const [reveal, setReveal] = useState<{ cards: Card[]; truth: boolean } | null>(null)
  const [roulette, setRoulette] = useState<{ player: number; fired: boolean; dead: boolean } | null>(null)
  const finished = useRef(false)
  const timers = useRef<number[]>([])

  const after = useCallback((fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms)
    timers.current.push(t)
  }, [])

  const reset = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    finished.current = false
    const ps: Player[] = [
      { id: 0, name: 'Tú', avatar: '🎭', isYou: true, hand: [], alive: true, bulletPos: Math.floor(Math.random() * 6), pulls: 0 },
      ...AI_DEFS.map((a, i) => ({
        id: i + 1, name: a.name, avatar: a.avatar, isYou: false, hand: [], alive: true,
        bulletPos: Math.floor(Math.random() * 6), pulls: 0,
      })),
    ]
    setPlayers(ps)
    setLastPlay(null); setSelected([]); setReveal(null); setRoulette(null)
    setPhase('intro'); setCurrent(0)
    setMessage('La mesa está servida. ¿Te la juegas?')
    onScore?.(0, 0)
  }, [onScore])

  useEffect(() => { reset() /* eslint-disable-next-line */ }, [resetKey])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const aliveCount = (ps: Player[]) => ps.filter((p) => p.alive).length
  const nextAlive = (ps: Player[], from: number) => {
    for (let k = 1; k <= ps.length; k++) {
      const idx = (from + k) % ps.length
      if (ps[idx].alive) return idx
    }
    return from
  }

  // deal a fresh round to survivors
  const startRound = useCallback((ps: Player[], starter: number) => {
    const deck = buildDeck()
    const dealt = ps.map((p) => ({ ...p, hand: [] as Card[] }))
    let di = 0
    for (const p of dealt) {
      if (!p.alive) continue
      p.hand = deck.slice(di, di + 5).sort((a, b) => a.rank.localeCompare(b.rank))
      di += 5
    }
    const rank = TABLE_RANKS[Math.floor(Math.random() * 3)]
    setTableRank(rank)
    setPlayers(dealt)
    setLastPlay(null)
    setSelected([])
    setReveal(null)
    const s = dealt[starter]?.alive ? starter : nextAlive(dealt, starter)
    setCurrent(s)
    setPhase('play')
    setMessage(`Mesa de ${RANK_LABEL[rank]}. Empieza ${dealt[s].name}.`)
    if (!dealt[s].isYou) after(() => aiTurn(dealt, s, null, rank), 1100)
    // eslint-disable-next-line
  }, [after])

  // ── play cards ──
  const doPlay = (ps: Player[], playerIdx: number, cards: Card[], rank: Exclude<Rank, 'J'>) => {
    const np = ps.map((p) =>
      p.id === ps[playerIdx].id ? { ...p, hand: p.hand.filter((c) => !cards.find((x) => x.id === c.id)) } : p
    )
    const play = { player: playerIdx, cards }
    setPlayers(np)
    setLastPlay(play)
    const nxt = nextAlive(np, playerIdx)
    setCurrent(nxt)
    setMessage(`${ps[playerIdx].name} juega ${cards.length} carta${cards.length > 1 ? 's' : ''} boca abajo: "todas ${RANK_LABEL[rank]}".`)
    setPhase('play')
    if (!np[nxt].isYou) after(() => aiTurn(np, nxt, play, rank), 1200)
  }

  // ── challenge ──
  const doChallenge = (ps: Player[], challenger: number, play: { player: number; cards: Card[] }, rank: Exclude<Rank, 'J'>) => {
    const truth = play.cards.every((c) => c.rank === rank || c.rank === 'J')
    setReveal({ cards: play.cards, truth })
    setPhase('reveal')
    setMessage(
      `${ps[challenger].name} grita "¡MENTIROSO!"… ${truth ? 'pero eran verdad.' : '¡y lo pilla mintiendo!'}`
    )
    const loser = truth ? challenger : play.player
    after(() => triggerRoulette(ps, loser, challenger), 1900)
  }

  // ── roulette ──
  const triggerRoulette = (ps: Player[], loserIdx: number, challenger: number) => {
    setReveal(null)
    setRoulette({ player: loserIdx, fired: false, dead: false })
    setPhase('roulette')
    setMessage(`${ps[loserIdx].name} prueba suerte con el revólver del bar…`)
    after(() => {
      const loser = ps[loserIdx]
      const dead = loser.pulls === loser.bulletPos
      const np = ps.map((p) =>
        p.id === loser.id ? { ...p, pulls: p.pulls + 1, alive: dead ? false : p.alive } : p
      )
      setRoulette({ player: loserIdx, fired: true, dead })
      setPlayers(np)
      setMessage(dead ? `💥 ¡BANG! ${loser.name} queda fuera del bar.` : `…click. ${loser.name} respira y sigue.`)
      // score: rivals eliminated vs rivals remaining
      const rivalsDead = np.filter((p) => !p.isYou && !p.alive).length
      const rivalsAlive = np.filter((p) => !p.isYou && p.alive).length
      onScore?.(rivalsDead, rivalsAlive)

      after(() => {
        if (aliveCount(np) <= 1) {
          finished.current = true
          setPhase('over')
          const you = np[0]
          setMessage(you.alive ? '🏆 ¡Último en pie! Te llevas el bar.' : 'El bar se queda sin ti…')
          if (!finished.current) return
          onResult({ youWin: you.alive, youScore: rivalsDead, oppScore: rivalsAlive })
          return
        }
        // next round starts from the survivor after the loser (or loser if survived)
        const starter = dead ? nextAlive(np, loserIdx) : loserIdx
        startRound(np, starter)
      }, 1700)
    }, 1700)
  }

  // ── AI brain ──
  const aiTurn = (ps: Player[], idx: number, play: { player: number; cards: Card[] } | null, rank: Exclude<Rank, 'J'>) => {
    const me = ps[idx]
    if (!me || !me.alive) return
    // must challenge if no cards
    const canChallenge = !!play
    const matching = me.hand.filter((c) => c.rank === rank || c.rank === 'J')
    if (canChallenge && (me.hand.length === 0 || Math.random() < challengeProb(play!, me, rank))) {
      doChallenge(ps, idx, play!, rank)
      return
    }
    // play cards: prefer truth
    let cards: Card[]
    if (matching.length > 0) {
      const n = 1 + Math.floor(Math.random() * Math.min(3, matching.length))
      cards = matching.slice(0, n)
    } else {
      // forced bluff
      const n = 1 + Math.floor(Math.random() * Math.min(2, me.hand.length))
      cards = me.hand.slice(0, n)
    }
    doPlay(ps, idx, cards, rank)
  }

  const challengeProb = (play: { cards: Card[] }, me: Player, rank: Exclude<Rank, 'J'>) => {
    const known = me.hand.filter((c) => c.rank === rank).length
    // 6 of the rank exist; if AI holds many, fewer remain for the claim → more suspicious
    let p = 0.12 + 0.16 * (play.cards.length - 1) + difficulty * 0.06 + known * 0.05
    return Math.min(0.72, p)
  }

  // ── your actions ──
  const youPlay = () => {
    const me = players[0]
    const cards = me.hand.filter((c) => selected.includes(c.id))
    if (cards.length < 1 || cards.length > 3) return
    setSelected([])
    doPlay(players, 0, cards, tableRank)
  }
  const youChallenge = () => {
    if (!lastPlay) return
    doChallenge(players, 0, lastPlay, tableRank)
  }

  const yourTurn = phase === 'play' && current === 0 && players[0]?.alive
  const me = players[0]

  // ── render ──
  return (
    <div className="relative flex h-full flex-col" style={{ minHeight: 420 }}>
      {/* table rank banner */}
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="chip border border-neon-purple/40 bg-neon-purple/10 text-neon-purple">
          Mesa de <b className="ml-1">{phase === 'intro' ? '—' : RANK_LABEL[tableRank]}</b>
        </div>
        {lastPlay && phase === 'play' && (
          <span className="chip border border-white/10 bg-white/5 text-zinc-300">
            {players[lastPlay.player]?.name}: {lastPlay.cards.length} carta(s) boca abajo
          </span>
        )}
      </div>

      {/* rivals */}
      <div className="grid grid-cols-3 gap-2">
        {players.slice(1).map((p) => (
          <div
            key={p.id}
            className={`glass rounded-xl p-2 text-center transition ${current === p.id && phase === 'play' ? 'ring-1 ring-neon-red' : ''} ${!p.alive ? 'opacity-40 grayscale' : ''}`}
          >
            <div className="text-2xl">{p.avatar}</div>
            <div className="truncate text-xs font-bold text-zinc-200">{p.name}</div>
            <div className="text-[10px] text-zinc-500">{p.alive ? `${p.hand.length} cartas` : 'fuera'}</div>
            <Cylinder pulls={p.pulls} dead={!p.alive} />
          </div>
        ))}
      </div>

      {/* center message */}
      <div className="flex flex-1 items-center justify-center px-2 py-3 text-center">
        <AnimatePresence mode="wait">
          {reveal ? (
            <motion.div key="reveal" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2">
              <div className="flex gap-2">
                {reveal.cards.map((c) => <CardFace key={c.id} card={c} faceUp />)}
              </div>
              <div className={`text-sm font-bold ${reveal.truth ? 'text-neon-green' : 'text-neon-red'}`}>
                {reveal.truth ? 'Eran verdad ✓' : '¡Había trampa! ✗'}
              </div>
            </motion.div>
          ) : roulette ? (
            <motion.div key="roul" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-3">
              <motion.div
                animate={roulette.fired ? {} : { rotate: 360 }}
                transition={{ duration: 0.5, repeat: roulette.fired ? 0 : Infinity, ease: 'linear' }}
                className={`grid h-20 w-20 place-items-center rounded-full border-4 ${roulette.dead ? 'border-neon-red' : 'border-white/30'}`}
              >
                {roulette.fired ? (
                  roulette.dead ? <Skull className="text-neon-red" size={36} /> : <span className="text-xs font-bold text-zinc-300">click</span>
                ) : (
                  <Crosshair className="text-neon-amber" size={32} />
                )}
              </motion.div>
              <div className="text-sm font-bold text-zinc-200">{message}</div>
            </motion.div>
          ) : (
            <motion.div key="msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md text-sm text-zinc-300">
              {phase === 'intro' ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-zinc-400">
                    Faroleo al estilo del bar: juega cartas boca abajo afirmando que son todas la carta de la mesa.
                    Si te acusan y mentías —o acusas y era verdad— te toca <b className="text-neon-red">la ruleta del revólver</b>. Último en pie gana.
                  </p>
                  <button className="btn-primary" onClick={() => startRound(players, Math.floor(Math.random() * 4))}>
                    Repartir y empezar
                  </button>
                </div>
              ) : (
                <span>{message}</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* your hand + actions */}
      {me?.alive && phase !== 'intro' && phase !== 'over' && (
        <div className="rounded-xl border border-white/10 bg-ink-900/60 p-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-zinc-500">
              <Hand size={12} /> Tu mano
            </span>
            {yourTurn && <span className="text-[11px] text-neon-red">Tu turno</span>}
          </div>
          <div className="scrollbar-none flex gap-1.5 overflow-x-auto pb-1">
            {me.hand.map((c) => {
              const sel = selected.includes(c.id)
              return (
                <button
                  key={c.id}
                  disabled={!yourTurn}
                  onClick={() =>
                    setSelected((s) =>
                      sel ? s.filter((x) => x !== c.id) : s.length < 3 ? [...s, c.id] : s
                    )
                  }
                  className={`shrink-0 transition ${sel ? '-translate-y-2' : ''} ${!yourTurn ? 'opacity-60' : ''}`}
                >
                  <CardFace card={c} faceUp selected={sel} />
                </button>
              )
            })}
            {me.hand.length === 0 && <span className="px-2 text-xs text-zinc-500">Sin cartas: deberás acusar.</span>}
          </div>
          {yourTurn && (
            <div className="mt-2 flex gap-2">
              <button onClick={youPlay} disabled={selected.length < 1} className="btn-primary flex-1 py-2 text-sm disabled:opacity-40">
                Jugar {selected.length || ''} como {RANK_LABEL[tableRank]}
              </button>
              {lastPlay && (
                <button onClick={youChallenge} className="btn-ghost flex-1 py-2 text-sm text-neon-red">
                  ¡Mentiroso!
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CardFace({ card, faceUp, selected }: { card: Card; faceUp?: boolean; selected?: boolean }) {
  const color = card.rank === 'J' ? 'text-neon-amber' : card.rank === 'A' ? 'text-neon-red' : card.rank === 'K' ? 'text-neon-blue' : 'text-neon-green'
  return (
    <div
      className={`grid h-16 w-11 place-items-center rounded-lg border bg-gradient-to-b from-ink-700 to-ink-850 ${selected ? 'border-neon-red shadow-neon-red' : 'border-white/15'}`}
    >
      {faceUp ? (
        <span className={`neon-title text-2xl ${color}`}>{RANK_CHAR[card.rank]}</span>
      ) : (
        <span className="text-lg opacity-40">🂠</span>
      )}
    </div>
  )
}

function Cylinder({ pulls, dead }: { pulls: number; dead: boolean }) {
  return (
    <div className="mt-1 flex items-center justify-center gap-0.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${dead && i === pulls - 1 ? 'bg-neon-red' : i < pulls ? 'bg-zinc-600' : 'bg-white/20'}`}
        />
      ))}
    </div>
  )
}
