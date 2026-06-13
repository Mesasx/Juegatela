import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, Minus, Crown } from 'lucide-react'
import type { RankingEntry } from '@/lib/types'
import { Avatar, Card, Chip } from '@/components/ui/Primitives'
import { PageHeader } from '@/components/shared'
import { RANKING, FRIENDS, ME } from '@/lib/mockData'
import { GAMES } from '@/lib/games'
import { cn } from '@/lib/utils'

type TabKey = 'global' | 'semanal' | 'mensual' | 'juego' | 'amigos'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'global', label: 'Global' },
  { key: 'semanal', label: 'Semanal' },
  { key: 'mensual', label: 'Mensual' },
  { key: 'juego', label: 'Por juego' },
  { key: 'amigos', label: 'Amigos' },
]

const friendIds = new Set([...FRIENDS.map((f) => f.id), ME.id])

const trendMeta = {
  up: { icon: ArrowUp, cls: 'text-neon-green' },
  down: { icon: ArrowDown, cls: 'text-neon-red' },
  same: { icon: Minus, cls: 'text-zinc-500' },
}

const podiumStyle = [
  { ring: 'ring-neon-amber/70', glow: 'shadow-neon-amber/40', text: 'text-neon-amber', label: '🥇 Oro', order: 'order-1 sm:order-2', scale: 'sm:scale-110' },
  { ring: 'ring-zinc-300/60', glow: 'shadow-[0_0_22px_rgba(200,200,210,0.4)]', text: 'text-zinc-200', label: '🥈 Plata', order: 'order-2 sm:order-1', scale: '' },
  { ring: 'ring-amber-700/70', glow: 'shadow-[0_0_22px_rgba(180,100,40,0.4)]', text: 'text-amber-600', label: '🥉 Bronce', order: 'order-3', scale: '' },
]

function reorder(tab: TabKey, gameId: string): RankingEntry[] {
  let list = [...RANKING]
  if (tab === 'amigos') {
    list = list.filter((r) => friendIds.has(r.user.id))
  } else if (tab === 'semanal') {
    list = [...list].sort((a, b) => (b.points % 1000) - (a.points % 1000))
  } else if (tab === 'mensual') {
    list = [...list].sort((a, b) => b.user.wins - a.user.wins)
  } else if (tab === 'juego') {
    // seudo-reordenado determinista por id de juego
    const salt = gameId.charCodeAt(0)
    list = [...list].sort((a, b) => ((b.points + salt * b.user.level) % 5000) - ((a.points + salt * a.user.level) % 5000))
  }
  return list.map((r, i) => ({ ...r, rank: i + 1 }))
}

export default function Ranking() {
  const [tab, setTab] = useState<TabKey>('global')
  const [gameId, setGameId] = useState(GAMES[0].id)

  const entries = useMemo(() => reorder(tab, gameId), [tab, gameId])
  const podium = entries.slice(0, 3)
  const rest = entries.slice(3)

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <PageHeader
        eyebrow="La barra de los mejores"
        title="Ranking"
        subtitle="Sube de puesto ganando retos, porras y partidas. Aquí no valen las excusas."
      />

      {/* Tabs */}
      <div className="scrollbar-none mb-5 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'chip shrink-0 px-4 py-1.5 transition',
              tab === t.key
                ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/40'
                : 'bg-white/5 text-zinc-400 border border-white/10 hover:text-white'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Selector de juego */}
      {tab === 'juego' && (
        <div className="scrollbar-none mb-5 flex gap-2 overflow-x-auto pb-1">
          {GAMES.map((g) => (
            <button
              key={g.id}
              onClick={() => setGameId(g.id)}
              className={cn(
                'chip shrink-0 gap-1.5 px-3 py-1.5 transition',
                gameId === g.id
                  ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/40'
                  : 'bg-white/5 text-zinc-400 border border-white/10 hover:text-white'
              )}
            >
              <span>{g.emoji}</span> {g.name}
            </button>
          ))}
        </div>
      )}

      {/* Podio */}
      <motion.div
        key={`${tab}-${gameId}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 grid grid-cols-3 items-end gap-2 sm:gap-4"
      >
        {podium.map((e, i) => {
          const s = podiumStyle[i]
          const isMe = e.user.id === ME.id
          return (
            <div key={e.user.id} className={cn('flex flex-col items-center', s.order, s.scale)}>
              <Card glow={s.glow} className={cn('relative w-full p-4 text-center ring-2', s.ring, isMe && 'border-neon-red/50')}>
                {i === 0 && <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 text-neon-amber" size={22} />}
                <div className="mx-auto mb-2 w-fit">
                  <Avatar seed={e.user.avatar} size={i === 0 ? 60 : 48} online={e.user.online} ring />
                </div>
                <div className={cn('text-[11px] font-bold uppercase tracking-wide', s.text)}>{s.label}</div>
                <div className="mt-0.5 truncate text-sm font-bold text-zinc-100">{e.user.displayName}</div>
                <div className={cn('mt-1 text-lg font-extrabold', s.text)}>{e.points.toLocaleString('es-ES')}</div>
                {isMe && <Chip tone="red" className="mt-1">Tú</Chip>}
              </Card>
            </div>
          )
        })}
      </motion.div>

      {/* Resto */}
      <div className="space-y-2">
        {rest.map((e, i) => {
          const isMe = e.user.id === ME.id
          const Trend = trendMeta[e.trend].icon
          return (
            <motion.div
              key={e.user.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link to={`/perfil/${e.user.id}`}>
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-2.5 transition hover:bg-white/5',
                    isMe
                      ? 'border-neon-red/40 bg-neon-red/10'
                      : 'border-white/5 bg-white/[0.02]'
                  )}
                >
                  <div className={cn('w-7 text-center text-sm font-extrabold', isMe ? 'text-neon-red' : 'text-zinc-500')}>
                    {e.rank}
                  </div>
                  <Avatar seed={e.user.avatar} size={40} online={e.user.online} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-bold text-zinc-100">{e.user.displayName}</span>
                      {isMe && <Chip tone="red">Tú</Chip>}
                      {e.user.verified && <span className="text-neon-blue" title="Verificado">✦</span>}
                    </div>
                    <div className="truncate text-[11px] text-zinc-500">@{e.user.username} · Nivel {e.user.level}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-zinc-100">{e.points.toLocaleString('es-ES')}</div>
                    <div className={cn('flex items-center justify-end gap-0.5 text-[11px]', trendMeta[e.trend].cls)}>
                      <Trend size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
