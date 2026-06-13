import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Swords,
  Trophy,
  XCircle,
  Lock,
  Coins,
  UserPlus,
  AlertTriangle,
  CheckCheck,
  Gamepad2,
  MessageCircle,
  Clock4,
  Bell,
} from 'lucide-react'
import type { NotificationType } from '@/lib/types'
import { Card, Chip, Button, EmptyState } from '@/components/ui/Primitives'
import { PageHeader } from '@/components/shared'
import { useStore } from '@/store/useStore'
import { cn, fmtDate, timeAgo } from '@/lib/utils'

type Meta = { icon: typeof Bell; color: string; ring: string; label: string }

const META: Record<NotificationType, Meta> = {
  challenge_received: { icon: Swords, color: 'text-neon-red', ring: 'bg-neon-red/15', label: 'Retos' },
  challenge_accepted: { icon: CheckCheck, color: 'text-neon-green', ring: 'bg-neon-green/15', label: 'Retos' },
  funds_locked: { icon: Lock, color: 'text-neon-amber', ring: 'bg-neon-amber/15', label: 'Saldo' },
  funds_released: { icon: Coins, color: 'text-neon-green', ring: 'bg-neon-green/15', label: 'Saldo' },
  match_found: { icon: Gamepad2, color: 'text-neon-blue', ring: 'bg-neon-blue/15', label: 'Partidas' },
  match_won: { icon: Trophy, color: 'text-neon-green', ring: 'bg-neon-green/15', label: 'Partidas' },
  match_lost: { icon: XCircle, color: 'text-neon-red', ring: 'bg-neon-red/15', label: 'Partidas' },
  result_pending: { icon: Clock4, color: 'text-neon-amber', ring: 'bg-neon-amber/15', label: 'Partidas' },
  dispute_open: { icon: AlertTriangle, color: 'text-neon-red', ring: 'bg-neon-red/15', label: 'Disputas' },
  friend_request: { icon: UserPlus, color: 'text-neon-blue', ring: 'bg-neon-blue/15', label: 'Amigos' },
  message: { icon: MessageCircle, color: 'text-neon-blue', ring: 'bg-neon-blue/15', label: 'Mensajes' },
  tournament: { icon: Trophy, color: 'text-neon-purple', ring: 'bg-neon-purple/15', label: 'Torneos' },
  limit_reached: { icon: AlertTriangle, color: 'text-neon-amber', ring: 'bg-neon-amber/15', label: 'Saldo' },
}

const FILTERS: { id: 'all' | string; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'Retos', label: 'Retos' },
  { id: 'Partidas', label: 'Partidas' },
  { id: 'Saldo', label: 'Saldo' },
  { id: 'Disputas', label: 'Disputas' },
  { id: 'Amigos', label: 'Amigos' },
  { id: 'Torneos', label: 'Torneos' },
]

function isToday(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  )
}

export default function Notifications() {
  const notifications = useStore((s) => s.notifications)
  const markAllRead = useStore((s) => s.markAllRead)
  const toast = useStore((s) => s.toast)
  const [filter, setFilter] = useState<string>('all')

  const unread = notifications.filter((n) => !n.read).length

  const filtered = useMemo(
    () =>
      notifications.filter((n) => filter === 'all' || META[n.type]?.label === filter),
    [notifications, filter]
  )

  const today = filtered.filter((n) => isToday(n.date))
  const earlier = filtered.filter((n) => !isToday(n.date))

  const handleMarkAll = () => {
    markAllRead()
    toast({ tone: 'success', title: 'Todo al día', body: 'Marcamos tus notificaciones como leídas.' })
  }

  const Group = ({ title, items }: { title: string; items: typeof notifications }) => {
    if (!items.length) return null
    return (
      <div className="space-y-2">
        <div className="px-1 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">{title}</div>
        {items.map((n, i) => {
          const meta = META[n.type] ?? META.message
          const Icon = meta.icon
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className={cn('flex items-start gap-3 p-3.5', !n.read && 'border-neon-purple/25')}>
                <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', meta.ring, meta.color)}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-bold text-zinc-100">{n.title}</h3>
                    {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-neon-red shadow-neon-red" />}
                  </div>
                  <p className="text-sm text-zinc-400">{n.body}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500">
                    <span>{timeAgo(n.date)}</span>
                    <span>·</span>
                    <span>{fmtDate(n.date)}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="El tablón del bar"
        title="Notificaciones"
        subtitle="Retos, partidas, movimientos de fichas y avisos del local."
        action={
          unread > 0 ? (
            <Button variant="ghost" onClick={handleMarkAll}>
              <CheckCheck size={16} /> Marcar todo como leído
            </Button>
          ) : undefined
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'chip transition',
              filter === f.id
                ? 'bg-neon-purple/15 text-neon-purple border border-neon-purple/40'
                : 'bg-white/5 text-zinc-400 border border-white/10 hover:text-zinc-200'
            )}
          >
            {f.label}
          </button>
        ))}
        {unread > 0 && <Chip tone="red">{unread} sin leer</Chip>}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="Todo tranquilo en la barra"
          body="No tienes notificaciones por aquí. Cuando llegue un reto o se mueva tu saldo, te avisamos."
        />
      ) : (
        <div className="space-y-6">
          <Group title="Hoy" items={today} />
          <Group title="Antes" items={earlier} />
        </div>
      )}
    </div>
  )
}
