import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Swords,
  Dices,
  Target,
  Gamepad2,
  Flame,
  Coins,
  TrendingUp,
  ChevronRight,
  Trophy,
  CheckCircle2,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { GAMES, accentClasses } from '@/lib/games'
import { FRIENDS, QUESTS, RANKING } from '@/lib/mockData'
import { ChallengeCard, PorraCard } from '@/components/shared'
import { Card, Avatar, ProgressBar, Chip } from '@/components/ui/Primitives'
import { cn, fichas } from '@/lib/utils'

export default function Home() {
  const auth = useStore((s) => s.auth)
  const user = useStore((s) => s.user)
  const wallet = useStore((s) => s.wallet)
  const challenges = useStore((s) => s.challenges)
  const porras = useStore((s) => s.porras)

  const activeChallenges = challenges.filter((c) => ['pending', 'active', 'verifying'].includes(c.status)).slice(0, 2)
  const openPorras = porras.filter((p) => p.status === 'open').slice(0, 1)
  const playable = GAMES.filter((g) => g.playable)
  const onlineFriends = FRIENDS.filter((f) => f.online)
  const xpForNext = 5000
  const myRank = RANKING.find((r) => r.user.id === 'me')

  const quickActions = [
    { to: '/retos/crear', label: 'Crear reto', icon: Swords, c: 'red' },
    { to: '/porras/crear', label: 'Nueva porra', icon: Dices, c: 'blue' },
    { to: '/matchmaking', label: 'Buscar rival', icon: Target, c: 'green' },
    { to: '/sala', label: 'Sala de Juegos', icon: Gamepad2, c: 'purple' },
  ]

  return (
    <div className="space-y-8">
      {/* Greeting + guest banner */}
      <div>
        <div className="flex items-center gap-3">
          <Avatar seed={user.avatar} size={52} online ring />
          <div>
            <h1 className="neon-title text-3xl text-zinc-50 sm:text-4xl">
              {auth === 'guest' ? 'Hola, invitado' : `Buenas, ${user.displayName}`}
            </h1>
            <p className="text-sm text-zinc-400">
              {auth === 'guest'
                ? 'El bar está abierto. Explora y practica gratis.'
                : 'El bar está caliente esta noche. ¿Te la juegas?'}
            </p>
          </div>
        </div>
      </div>

      {auth === 'guest' && (
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-neon-amber/30 bg-neon-amber/10 p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 text-sm text-neon-amber">
            <Coins size={20} />
            Estás en modo invitado con fichas demo. Crea tu cuenta para apostar, sumar amigos y guardar tu progreso.
          </div>
          <Link to="/registro" className="btn-primary shrink-0">Crear cuenta</Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((q, i) => {
          const a = accentClasses[q.c as 'red']
          return (
            <motion.div key={q.to} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={q.to} className={cn('glass glass-hover flex items-center gap-3 rounded-2xl p-4', a.border)}>
                <div className={cn('grid h-11 w-11 place-items-center rounded-xl', a.bg, a.text)}>
                  <q.icon size={20} />
                </div>
                <span className="font-bold text-zinc-100">{q.label}</span>
              </Link>
            </motion.div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* main col */}
        <div className="space-y-6 lg:col-span-2">
          {/* level/wallet card */}
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-zinc-500">Nivel {user.level} · {user.title}</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="neon-title text-3xl text-neon-amber">{fichas(wallet.available).replace(' fichas', '')}</span>
                  <span className="text-sm text-zinc-500">fichas demo</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/wallet" className="btn-neon">Wallet</Link>
                <Link to="/ranking" className="btn-ghost"><Trophy size={16} /> #{myRank?.rank ?? '—'}</Link>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[11px] text-zinc-500">
                <span>XP {user.xp}/{xpForNext}</span>
                <span>Nivel {user.level + 1}</span>
              </div>
              <ProgressBar value={user.xp} max={xpForNext} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <MiniStat icon={Flame} label="Racha" value={`${user.streak} 🔥`} c="text-neon-red" />
              <MiniStat icon={TrendingUp} label="Victorias" value={user.wins} c="text-neon-green" />
              <MiniStat icon={Coins} label="Bloqueado" value={wallet.locked} c="text-neon-amber" />
            </div>
          </Card>

          {/* active challenges */}
          <section>
            <SectionRow title="Tus retos activos" to="/retos" />
            <div className="grid gap-3 sm:grid-cols-2">
              {activeChallenges.map((c) => <ChallengeCard key={c.id} c={c} />)}
            </div>
          </section>

          {/* open porras */}
          <section>
            <SectionRow title="Porras abiertas" to="/porras" />
            <div className="grid gap-3 sm:grid-cols-2">
              {openPorras.map((p) => <PorraCard key={p.id} p={p} />)}
              <Link to="/porras/crear" className="glass glass-hover flex flex-col items-center justify-center gap-2 rounded-2xl border-dashed p-6 text-center">
                <Dices className="text-neon-blue" size={28} />
                <span className="font-bold text-zinc-200">Monta una porra</span>
                <span className="text-xs text-zinc-500">Resultado exacto, quién gana, quién llega tarde…</span>
              </Link>
            </div>
          </section>

          {/* play now */}
          <section>
            <SectionRow title="Juega ahora" to="/sala" />
            <div className="grid grid-cols-3 gap-3">
              {playable.map((g) => {
                const a = accentClasses[g.accent]
                return (
                  <Link key={g.id} to={`/sala/${g.id}`} className={cn('glass glass-hover rounded-2xl p-4 text-center', a.border)}>
                    <div className="text-3xl">{g.emoji}</div>
                    <div className={cn('mt-1 text-sm font-bold', a.text)}>{g.name}</div>
                  </Link>
                )
              })}
            </div>
          </section>
        </div>

        {/* side col */}
        <div className="space-y-6">
          {/* daily quests */}
          <Card className="p-5">
            <h3 className="neon-title text-xl text-zinc-100">Misiones diarias</h3>
            <p className="mb-3 text-xs text-zinc-500">Recompensas sin fomentar gasto. Solo por jugar.</p>
            <div className="space-y-3">
              {QUESTS.map((q) => (
                <div key={q.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className={cn('flex items-center gap-1.5', q.done ? 'text-neon-green line-through' : 'text-zinc-200')}>
                      {q.done && <CheckCircle2 size={14} />} {q.title}
                    </span>
                    <Chip tone={q.done ? 'green' : 'purple'}>{q.reward}</Chip>
                  </div>
                  <ProgressBar
                    className="mt-1.5"
                    value={q.progress}
                    max={q.goal}
                    tone={q.done ? 'from-neon-green to-neon-cyan' : 'from-neon-purple to-neon-blue'}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* friends online */}
          <Card className="p-5">
            <SectionRow title="Amigos en línea" to="/amigos" small />
            <div className="mt-2 space-y-2">
              {onlineFriends.map((f) => (
                <Link key={f.id} to={`/perfil/${f.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/5">
                  <Avatar seed={f.avatar} size={36} online />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-zinc-200">{f.displayName}</div>
                    <div className="truncate text-[11px] text-zinc-500">Nivel {f.level}</div>
                  </div>
                  <Link to="/retos/crear" className="chip border border-neon-red/30 bg-neon-red/10 text-neon-red">Retar</Link>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ icon: Icon, label, value, c }: { icon: typeof Flame; label: string; value: React.ReactNode; c: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
      <Icon size={16} className={cn('mx-auto', c)} />
      <div className={cn('mt-1 text-lg font-extrabold', c)}>{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</div>
    </div>
  )
}

function SectionRow({ title, to, small }: { title: string; to: string; small?: boolean }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className={cn('neon-title text-zinc-100', small ? 'text-lg' : 'text-2xl')}>{title}</h2>
      <Link to={to} className="flex items-center gap-0.5 text-xs font-semibold text-neon-red hover:underline">
        Ver todo <ChevronRight size={14} />
      </Link>
    </div>
  )
}
