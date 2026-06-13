import { type ReactNode, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, ShieldAlert, Clock, Users as UsersIcon, ChevronRight } from 'lucide-react'
import type { Challenge, Porra, Game, User } from '@/lib/types'
import { Avatar, Card, Chip } from '@/components/ui/Primitives'
import { Modal } from '@/components/ui/Modal'
import { challengeStatus, porraStatus, kindLabel } from '@/lib/status'
import { accentClasses } from '@/lib/games'
import { useStore } from '@/store/useStore'
import { cn, countdown, fichas } from '@/lib/utils'

// ── Page header ──────────────────────────────────────────────────────────
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-neon-purple/80">
            {eyebrow}
          </div>
        )}
        <h1 className="neon-title text-3xl text-zinc-50 sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-zinc-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Guest gate: blocks money actions unless logged in ──────────────────────
export function useAuthGate() {
  const auth = useStore((s) => s.auth)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const guard = (action: () => void) => {
    if (auth === 'authed') action()
    else setOpen(true)
  }

  const gate = (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="Necesitas una cuenta"
      size="sm"
      footer={
        <div className="flex gap-2">
          <button className="btn-ghost flex-1" onClick={() => setOpen(false)}>
            Ahora no
          </button>
          <button className="btn-primary flex-1" onClick={() => navigate('/registro')}>
            Crear cuenta
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="rounded-2xl bg-neon-purple/15 p-3 text-neon-purple">
          <ShieldAlert size={28} />
        </div>
        <p className="text-sm text-zinc-300">
          Para apostar, bloquear saldo o aceptar retos con fichas necesitas iniciar sesión y pasar
          las verificaciones. En modo invitado puedes explorar y practicar gratis.
        </p>
        <p className="text-[11px] text-zinc-500">
          Para jugar con dinero real es obligatorio ser mayor de edad y completar la verificación.
        </p>
      </div>
    </Modal>
  )

  return { guard, gate, isAuthed: auth === 'authed' }
}

// ── Challenge card ─────────────────────────────────────────────────────────
export function ChallengeCard({ c }: { c: Challenge }) {
  const st = challengeStatus[c.status]
  return (
    <Card hover className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <Chip tone="purple">{kindLabel[c.kind]}</Chip>
            <Chip tone={st.tone}>{st.label}</Chip>
            {c.visibility === 'private' && <Chip tone="zinc"><Lock size={10} /> privada</Chip>}
          </div>
          <h3 className="truncate text-base font-bold text-zinc-100">{c.title}</h3>
          <p className="line-clamp-2 text-sm text-zinc-400">{c.description}</p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-2xl font-extrabold text-neon-amber">{c.stake}</div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500">fichas c/u</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-neon-green/20 bg-neon-green/5 px-2 py-1.5">
          <span className="text-zinc-500">Defiende: </span>
          <span className="font-semibold text-neon-green">{c.creatorSide}</span>
        </div>
        <div className="rounded-lg border border-neon-red/20 bg-neon-red/5 px-2 py-1.5">
          <span className="text-zinc-500">Rival: </span>
          <span className="font-semibold text-neon-red">{c.rivalSide}</span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
        <span className="flex items-center gap-1">
          <Clock size={12} /> Acepta en {countdown(c.acceptBy)}
        </span>
        <span>Bote {c.stake * 2} fichas</span>
      </div>
    </Card>
  )
}

// ── Porra card ─────────────────────────────────────────────────────────────
export function PorraCard({ p }: { p: Porra }) {
  const st = porraStatus[p.status]
  const totalPicks = p.options.reduce((a, o) => a + o.picksBy.length, 0)
  const pot = totalPicks * p.entry
  return (
    <Card hover className="p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip tone="blue"><UsersIcon size={10} /> {p.groupName}</Chip>
          <Chip tone={st.tone}>{st.label}</Chip>
        </div>
        <div className="text-right">
          <div className="text-lg font-extrabold text-neon-amber">{pot}</div>
          <div className="text-[10px] uppercase text-zinc-500">bote</div>
        </div>
      </div>
      <h3 className="font-bold text-zinc-100">{p.title}</h3>
      <p className="mb-3 text-sm text-zinc-400">{p.description}</p>
      <div className="space-y-1.5">
        {p.options.slice(0, 3).map((o) => {
          const pct = totalPicks ? (o.picksBy.length / totalPicks) * 100 : 0
          const win = p.winningOptionId === o.id
          return (
            <div key={o.id} className="relative overflow-hidden rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5">
              <div
                className={cn('absolute inset-y-0 left-0', win ? 'bg-neon-green/20' : 'bg-neon-purple/10')}
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center justify-between text-sm">
                <span className={cn('font-semibold', win ? 'text-neon-green' : 'text-zinc-200')}>
                  {o.label} {win && '· ✓'}
                </span>
                <span className="text-xs text-zinc-500">{o.picksBy.length} apuestas</span>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
        <span>Entrada {fichas(p.entry)}</span>
        <span className="flex items-center gap-1"><Clock size={12} /> {countdown(p.closeDate)}</span>
      </div>
    </Card>
  )
}

// ── Game card ──────────────────────────────────────────────────────────────
export function GameCard({ g, index = 0 }: { g: Game; index?: number }) {
  const a = accentClasses[g.accent]
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link to={`/sala/${g.id}`}>
        <Card hover className={cn('relative overflow-hidden p-4', a.border)}>
          <div className={cn('absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br blur-2xl', a.from, 'to-transparent')} />
          <div className="relative flex items-start justify-between">
            <div className={cn('grid h-12 w-12 place-items-center rounded-xl text-2xl', a.bg)}>
              {g.emoji}
            </div>
            {!g.playable && <Chip tone="zinc">Próximamente</Chip>}
            {g.playable && <Chip tone="green">Jugable</Chip>}
          </div>
          <h3 className={cn('mt-3 text-lg font-bold', a.text)}>{g.name}</h3>
          <p className="text-xs text-zinc-400">{g.tagline}</p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
            <span>{g.players} · {'★'.repeat(g.difficulty)}</span>
            <span className="flex items-center gap-0.5">Jugar <ChevronRight size={12} /></span>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}

// ── User row ─────────────────────────────────────────────────────────────
export function UserRow({
  user,
  right,
  to,
}: {
  user: User
  right?: ReactNode
  to?: string
}) {
  const inner = (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 transition hover:bg-white/5">
      <Avatar seed={user.avatar} size={42} online={user.online} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-bold text-zinc-100">{user.displayName}</span>
          {user.verified && <span className="text-neon-blue" title="Verificado">✦</span>}
        </div>
        <div className="truncate text-[11px] text-zinc-500">@{user.username} · Nivel {user.level} · {user.title}</div>
      </div>
      {right}
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}
