import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search,
  Swords,
  Ticket,
  MessageCircle,
  Ban,
  Flag,
  MoreVertical,
  UserPlus,
  Users as UsersIcon,
  Check,
  X,
} from 'lucide-react'
import type { User, FriendRequest } from '@/lib/types'
import { Avatar, Card, Chip, Button, EmptyState } from '@/components/ui/Primitives'
import { Modal } from '@/components/ui/Modal'
import { PageHeader, UserRow } from '@/components/shared'
import { FRIENDS, FRIEND_REQUESTS } from '@/lib/mockData'
import { timeAgo, cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'

type Tab = 'amigos' | 'solicitudes' | 'buscar'

const TABS: { key: Tab; label: string }[] = [
  { key: 'amigos', label: 'Amigos' },
  { key: 'solicitudes', label: 'Solicitudes' },
  { key: 'buscar', label: 'Buscar' },
]

type ConfirmAction = { kind: 'block' | 'report'; user: User } | null

export default function Friends() {
  const toast = useStore((s) => s.toast)
  const [tab, setTab] = useState<Tab>('amigos')
  const [query, setQuery] = useState('')
  const [friends, setFriends] = useState<User[]>(FRIENDS)
  const [requests, setRequests] = useState<FriendRequest[]>(FRIEND_REQUESTS)
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<ConfirmAction>(null)

  const q = query.trim().toLowerCase()
  const filtered = friends.filter(
    (f) =>
      !q ||
      f.displayName.toLowerCase().includes(q) ||
      f.username.toLowerCase().includes(q)
  )

  const acceptRequest = (req: FriendRequest) => {
    setRequests((rs) => rs.filter((r) => r.id !== req.id))
    setFriends((fs) => (fs.some((f) => f.id === req.from.id) ? fs : [req.from, ...fs]))
    toast({ tone: 'success', title: 'Amistad aceptada', body: `${req.from.displayName} ya es de la pandilla.` })
  }

  const rejectRequest = (req: FriendRequest) => {
    setRequests((rs) => rs.filter((r) => r.id !== req.id))
    toast({ tone: 'info', title: 'Solicitud rechazada', body: `Le has dado calabazas a ${req.from.displayName}.` })
  }

  const confirmAction = () => {
    if (!confirm) return
    if (confirm.kind === 'block') {
      setFriends((fs) => fs.filter((f) => f.id !== confirm.user.id))
      toast({ tone: 'error', title: 'Jugador bloqueado', body: `${confirm.user.displayName} ya no puede retarte.` })
    } else {
      toast({ tone: 'info', title: 'Reporte enviado', body: 'Lo revisará la seguridad del local.' })
    }
    setConfirm(null)
  }

  const friendActions = (f: User) => (
    <div className="flex items-center gap-1.5">
      <Link to="/retos/crear" className="btn-ghost hidden px-2.5 py-1.5 text-xs sm:inline-flex">
        <Swords size={14} /> Retar
      </Link>
      <Link to="/porras/crear" className="btn-ghost hidden px-2.5 py-1.5 text-xs sm:inline-flex">
        <Ticket size={14} /> Porra
      </Link>
      <div className="relative">
        <button
          className="btn-ghost px-2 py-1.5"
          onClick={() => setMenuFor((m) => (m === f.id ? null : f.id))}
          aria-label="Más acciones"
        >
          <MoreVertical size={16} />
        </button>
        {menuFor === f.id && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuFor(null)} />
            <div className="glass absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl p-1 text-sm">
              <Link
                to="/retos/crear"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-200 hover:bg-white/5 sm:hidden"
                onClick={() => setMenuFor(null)}
              >
                <Swords size={14} /> Retar
              </Link>
              <Link
                to="/porras/crear"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-200 hover:bg-white/5 sm:hidden"
                onClick={() => setMenuFor(null)}
              >
                <Ticket size={14} /> Invitar a porra
              </Link>
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-zinc-200 hover:bg-white/5"
                onClick={() => {
                  setMenuFor(null)
                  toast({ tone: 'info', title: 'Mensaje', body: `Chat con ${f.displayName} (demo, sin envío real).` })
                }}
              >
                <MessageCircle size={14} /> Mensaje
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-neon-amber hover:bg-white/5"
                onClick={() => {
                  setMenuFor(null)
                  setConfirm({ kind: 'block', user: f })
                }}
              >
                <Ban size={14} /> Bloquear
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-neon-red hover:bg-white/5"
                onClick={() => {
                  setMenuFor(null)
                  setConfirm({ kind: 'report', user: f })
                }}
              >
                <Flag size={14} /> Reportar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <PageHeader
        eyebrow="La pandilla del bar"
        title="Amigos"
        subtitle="Tu gente para retar, montar porras y vaciarles las fichas con estilo."
        action={
          <Link to="/grupos" className="btn-neon">
            <UsersIcon size={16} /> Crear grupo
          </Link>
        }
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
            {t.key === 'solicitudes' && requests.length > 0 && (
              <span className="ml-1.5 rounded-full bg-neon-red/80 px-1.5 text-[10px] font-bold text-white">
                {requests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Buscador (amigos / buscar) */}
      {tab !== 'solicitudes' && (
        <div className="relative mb-5">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            className="input pl-9"
            placeholder={tab === 'buscar' ? 'Busca por alias o nombre…' : 'Filtra tus amigos…'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      {/* Amigos */}
      {tab === 'amigos' &&
        (filtered.length ? (
          <div className="space-y-2">
            {filtered.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <UserRow user={f} to={`/perfil/${f.id}`} right={friendActions(f)} />
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🫥"
            title={q ? 'Nadie con ese nombre' : 'Aún no tienes amigos'}
            body={q ? 'Prueba con otro alias o ve a la pestaña Buscar.' : 'Invita a tu gente y empieza a retar.'}
            action={
              <Button variant="neon" onClick={() => setTab('buscar')}>
                <UserPlus size={16} /> Buscar gente
              </Button>
            }
          />
        ))}

      {/* Solicitudes */}
      {tab === 'solicitudes' &&
        (requests.length ? (
          <div className="space-y-2">
            {requests.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <UserRow
                  user={req.from}
                  right={
                    <div className="flex items-center gap-1.5">
                      <span className="hidden text-[11px] text-zinc-500 sm:block">{timeAgo(req.date)}</span>
                      <button
                        className="grid h-9 w-9 place-items-center rounded-lg bg-neon-green/15 text-neon-green transition hover:bg-neon-green/25"
                        onClick={() => acceptRequest(req)}
                        aria-label="Aceptar"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        className="grid h-9 w-9 place-items-center rounded-lg bg-neon-red/15 text-neon-red transition hover:bg-neon-red/25"
                        onClick={() => rejectRequest(req)}
                        aria-label="Rechazar"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  }
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📭"
            title="Sin solicitudes"
            body="Cuando alguien quiera unirse a tu mesa, aparecerá aquí."
          />
        ))}

      {/* Buscar */}
      {tab === 'buscar' &&
        (filtered.length ? (
          <div className="space-y-2">
            {filtered.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <UserRow
                  user={f}
                  to={`/perfil/${f.id}`}
                  right={
                    <Chip tone="green">
                      <Check size={11} /> Ya es amigo
                    </Chip>
                  }
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🔍"
            title="Escribe para buscar"
            body="Encuentra jugadores por su alias y mándales solicitud."
          />
        ))}

      {/* Modal confirmación bloquear/reportar */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.kind === 'block' ? 'Bloquear jugador' : 'Reportar jugador'}
        size="sm"
        footer={
          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => setConfirm(null)}>
              Cancelar
            </button>
            <button className="btn-primary flex-1" onClick={confirmAction}>
              {confirm?.kind === 'block' ? 'Bloquear' : 'Reportar'}
            </button>
          </div>
        }
      >
        {confirm && (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <Avatar seed={confirm.user.avatar} size={64} ring />
            <p className="text-sm text-zinc-300">
              {confirm.kind === 'block' ? (
                <>
                  ¿Seguro que quieres bloquear a <span className="font-bold text-zinc-100">{confirm.user.displayName}</span>?
                  Dejará de poder retarte y saldrá de tu lista.
                </>
              ) : (
                <>
                  ¿Reportar a <span className="font-bold text-zinc-100">{confirm.user.displayName}</span> al equipo del local?
                  Solo si ha hecho trampas o se ha pasado de la raya.
                </>
              )}
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
