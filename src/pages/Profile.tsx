import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Pencil,
  Wallet,
  Settings,
  Flame,
  Trophy,
  Swords,
  Users,
  TrendingUp,
} from 'lucide-react'
import type { User, Badge as BadgeType } from '@/lib/types'
import { Avatar, Card, Chip, Stat, ProgressBar } from '@/components/ui/Primitives'
import { Modal } from '@/components/ui/Modal'
import { PageHeader, UserRow } from '@/components/shared'
import { ME, FRIENDS, BADGES, MATCH_HISTORY, RANKING } from '@/lib/mockData'
import { getGame } from '@/lib/games'
import { fichas, fmtDate, cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'

const rarityTone: Record<BadgeType['rarity'], 'zinc' | 'blue' | 'purple' | 'amber'> = {
  común: 'zinc',
  rara: 'blue',
  épica: 'purple',
  legendaria: 'amber',
}

const resultMeta: Record<string, { label: string; cls: string }> = {
  win: { label: 'Victoria', cls: 'text-neon-green' },
  loss: { label: 'Derrota', cls: 'text-neon-red' },
  draw: { label: 'Empate', cls: 'text-zinc-400' },
}

export default function Profile() {
  const { userId } = useParams()
  const toast = useStore((s) => s.toast)

  const user: User = useMemo(() => {
    if (!userId || userId === 'me') return ME
    return FRIENDS.find((f) => f.id === userId) ?? ME
  }, [userId])

  const isMe = user.id === ME.id
  const [editOpen, setEditOpen] = useState(false)
  const [displayName, setDisplayName] = useState(user.displayName)
  const [title, setTitle] = useState(user.title)

  const total = user.wins + user.losses
  const ratio = total ? Math.round((user.wins / total) * 100) : 0
  const nextLevelXp = (user.level + 1) * 350
  const myBadges = BADGES.filter((b) => user.badges.includes(b.id))
  const rankEntry = RANKING.find((r) => r.user.id === user.id)

  const saveProfile = () => {
    setEditOpen(false)
    toast({ tone: 'neon', title: 'Perfil actualizado', body: 'Tu carta de presentación en el bar luce mejor.' })
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <PageHeader
        eyebrow={isMe ? 'Tu ficha del bar' : 'Ficha de jugador'}
        title="Perfil"
        subtitle={isMe ? 'Así te ven los rivales antes de retarte.' : 'Estudia a tu rival antes de jugártela.'}
        action={
          isMe ? (
            <button className="btn-ghost" onClick={() => setEditOpen(true)}>
              <Pencil size={16} /> Editar perfil
            </button>
          ) : (
            <Link to="/retos/crear" className="btn-primary">
              <Swords size={16} /> Retar
            </Link>
          )
        }
      />

      {/* Banner + cabecera */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-red/20 via-neon-purple/15 to-transparent" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-neon-purple/30 blur-3xl" />
          <div className="relative flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:items-end sm:text-left">
            <Avatar seed={user.avatar} size={92} online={user.online} ring />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h2 className="neon-title text-3xl text-zinc-50">{user.displayName}</h2>
                {user.verified && <Chip tone="blue">✦ Verificado</Chip>}
              </div>
              <div className="mt-0.5 text-sm text-zinc-400">@{user.username}</div>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Chip tone="purple">{user.title}</Chip>
                <Chip tone="amber">Nivel {user.level}</Chip>
                {rankEntry && <Chip tone="green">#{rankEntry.rank} del ranking</Chip>}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Nivel + XP */}
      <Card className="mt-4 p-5">
        <div className="mb-2 flex items-end justify-between">
          <div className="text-sm font-bold text-zinc-200">Progreso de nivel</div>
          <div className="text-xs text-zinc-500">
            {user.xp.toLocaleString('es-ES')} / {nextLevelXp.toLocaleString('es-ES')} XP
          </div>
        </div>
        <ProgressBar value={user.xp} max={nextLevelXp} tone="from-neon-amber to-neon-red" />
        <div className="mt-1 text-[11px] text-zinc-500">
          Te faltan {Math.max(0, nextLevelXp - user.xp).toLocaleString('es-ES')} XP para el nivel {user.level + 1}.
        </div>
      </Card>

      {/* Estadísticas públicas */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Racha" value={<span className="flex items-center gap-1"><Flame size={16} className="text-neon-amber" />{user.streak}</span>} sub="seguidas" accent="text-neon-amber" />
        <Stat label="Ganadas" value={user.wins} accent="text-neon-green" />
        <Stat label="Perdidas" value={user.losses} accent="text-neon-red" />
        <Stat label="Ratio" value={`${ratio}%`} sub={`${user.wins}/${total}`} accent="text-neon-blue" />
        <Stat label="En juegos" value={fichas(user.gamesEarnings)} accent="text-neon-purple" />
        <Stat label="En retos" value={fichas(user.betsEarnings)} accent="text-neon-amber" />
      </div>

      {/* Insignias */}
      <section className="mt-6">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-zinc-100">
          <Trophy size={18} className="text-neon-amber" /> Insignias
        </h3>
        {myBadges.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {myBadges.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                title={b.description}
              >
                <Card hover className="p-4 text-center">
                  <div className="text-4xl">{b.emoji}</div>
                  <div className="mt-2 truncate text-sm font-bold text-zinc-100">{b.name}</div>
                  <div className="mt-1 flex justify-center">
                    <Chip tone={rarityTone[b.rarity]}>{b.rarity}</Chip>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="p-5 text-center text-sm text-zinc-500">
            Aún sin insignias. Hay que sudar la barra para presumir.
          </Card>
        )}
      </section>

      {/* Historial + amigos */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section>
          <h3 className="mb-3 text-lg font-bold text-zinc-100">Historial reciente</h3>
          <div className="space-y-2">
            {MATCH_HISTORY.map((m, i) => {
              const meta = resultMeta[m.result]
              const game = getGame(m.gameId)
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="flex items-center justify-between p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{game?.emoji ?? '🎮'}</span>
                        <span className="truncate text-sm font-semibold text-zinc-200">
                          {game?.name ?? m.gameId} · vs {m.opponent}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-zinc-500">{fmtDate(m.date)}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className={cn('text-sm font-bold', meta.cls)}>{meta.label}</div>
                      <div className={cn('text-[11px]', m.delta > 0 ? 'text-neon-green' : m.delta < 0 ? 'text-neon-red' : 'text-zinc-500')}>
                        {m.delta > 0 ? '+' : ''}{m.delta} fichas
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </section>

        <section>
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-zinc-100">
            <Users size={18} className="text-neon-blue" /> Amigos del bar
          </h3>
          <div className="space-y-2">
            {FRIENDS.slice(0, 5).map((f) => (
              <UserRow key={f.id} user={f} to={`/perfil/${f.id}`} />
            ))}
          </div>
        </section>
      </div>

      {/* Ranking */}
      {rankEntry && (
        <Card glow="shadow-neon-amber/30" className="mt-6 flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-neon-amber/15 text-neon-amber">
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="text-sm font-bold text-zinc-100">Puesto #{rankEntry.rank} en el ranking global</div>
              <div className="text-xs text-zinc-500">{rankEntry.points.toLocaleString('es-ES')} puntos de barra</div>
            </div>
          </div>
          <Link to="/ranking" className="btn-neon">Ver ranking</Link>
        </Card>
      )}

      {/* Bloque privado (solo perfil propio) */}
      {isMe && (
        <section className="mt-6">
          <h3 className="mb-3 text-lg font-bold text-zinc-100">Zona privada</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link to="/wallet">
              <Card hover className="flex items-center gap-3 p-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-neon-green/15 text-neon-green">
                  <Wallet size={20} />
                </div>
                <div>
                  <div className="font-bold text-zinc-100">Tu cartera</div>
                  <div className="text-xs text-zinc-500">Saldo, bloqueos y movimientos</div>
                </div>
              </Card>
            </Link>
            <Link to="/ajustes">
              <Card hover className="flex items-center gap-3 p-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-neon-purple/15 text-neon-purple">
                  <Settings size={20} />
                </div>
                <div>
                  <div className="font-bold text-zinc-100">Ajustes</div>
                  <div className="text-xs text-zinc-500">Cuenta, privacidad y límites</div>
                </div>
              </Card>
            </Link>
          </div>
        </section>
      )}

      {/* Modal editar */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar perfil"
        footer={
          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => setEditOpen(false)}>Cancelar</button>
            <button className="btn-primary flex-1" onClick={saveProfile}>Guardar</button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Nombre visible</label>
            <input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Tu nombre de bar" />
          </div>
          <div>
            <label className="label">Título</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Tiburón de barra" />
          </div>
          <p className="text-[11px] text-zinc-500">Es solo demo: tu identidad ficticia, sin datos reales.</p>
        </div>
      </Modal>
    </div>
  )
}
