import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Ticket, Swords, Users as UsersIcon, Check } from 'lucide-react'
import type { User } from '@/lib/types'
import { Avatar, Card, Chip, Stat, Button, EmptyState } from '@/components/ui/Primitives'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/shared'
import { FRIENDS } from '@/lib/mockData'
import { uid, cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'

interface Group {
  id: string
  name: string
  emoji: string
  members: User[]
  activePorras: number
  activeChallenges: number
}

const INITIAL_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Los del bar',
    emoji: '🍻',
    members: [FRIENDS[0], FRIENDS[1], FRIENDS[3], FRIENDS[5]],
    activePorras: 3,
    activeChallenges: 2,
  },
  {
    id: 'g2',
    name: 'Gamers de medianoche',
    emoji: '🎮',
    members: [FRIENDS[0], FRIENDS[4], FRIENDS[5]],
    activePorras: 1,
    activeChallenges: 4,
  },
  {
    id: 'g3',
    name: 'Cena de los viernes',
    emoji: '🌙',
    members: [FRIENDS[1], FRIENDS[2], FRIENDS[3]],
    activePorras: 2,
    activeChallenges: 0,
  },
]

const EMOJIS = ['🍻', '🎮', '🌙', '🎱', '🔥', '🦊', '🎯', '🃏']

function MemberStack({ members }: { members: User[] }) {
  const shown = members.slice(0, 4)
  const extra = members.length - shown.length
  return (
    <div className="flex items-center">
      {shown.map((m, i) => (
        <div key={m.id} className={cn('rounded-xl ring-2 ring-ink-900', i > 0 && '-ml-3')}>
          <Avatar seed={m.avatar} size={34} online={m.online} />
        </div>
      ))}
      {extra > 0 && (
        <div className="-ml-3 grid h-[34px] w-[34px] place-items-center rounded-xl bg-white/10 text-xs font-bold text-zinc-300 ring-2 ring-ink-900">
          +{extra}
        </div>
      )}
    </div>
  )
}

export default function Groups() {
  const toast = useStore((s) => s.toast)
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(EMOJIS[0])
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const reset = () => {
    setName('')
    setEmoji(EMOJIS[0])
    setSelected([])
  }

  const createGroup = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast({ tone: 'error', title: 'Falta el nombre', body: 'Tu cuadrilla necesita un nombre.' })
      return
    }
    const members = FRIENDS.filter((f) => selected.includes(f.id))
    setGroups((gs) => [
      { id: uid(), name: trimmed, emoji, members, activePorras: 0, activeChallenges: 0 },
      ...gs,
    ])
    toast({ tone: 'neon', title: 'Grupo creado', body: `"${trimmed}" ya está en marcha con ${members.length} miembros.` })
    setOpen(false)
    reset()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <PageHeader
        eyebrow="Tus cuadrillas"
        title="Grupos"
        subtitle="Reúne a tu gente para montar porras y retos en serie. La picadora de fichas, en compañía."
        action={
          <Button variant="neon" onClick={() => setOpen(true)}>
            <Plus size={16} /> Crear grupo
          </Button>
        }
      />

      {groups.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover className="relative overflow-hidden p-5">
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-neon-purple/20 blur-3xl" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/5 text-2xl">{g.emoji}</div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-100">{g.name}</h3>
                      <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                        <UsersIcon size={12} /> {g.members.length} miembros
                      </div>
                    </div>
                  </div>
                  <MemberStack members={g.members} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Stat label="Porras activas" value={g.activePorras} accent="text-neon-blue" />
                  <Stat label="Retos activos" value={g.activeChallenges} accent="text-neon-red" />
                </div>

                <div className="mt-4 flex gap-2">
                  <Link to="/porras/crear" className="btn-ghost flex-1 justify-center text-sm">
                    <Ticket size={14} /> Nueva porra
                  </Link>
                  <Link to="/retos/crear" className="btn-primary flex-1 justify-center text-sm">
                    <Swords size={14} /> Nuevo reto
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="👥"
          title="Aún no tienes grupos"
          body="Crea tu primera cuadrilla y empieza a montar porras y retos con tu gente."
          action={
            <Button variant="neon" onClick={() => setOpen(true)}>
              <Plus size={16} /> Crear grupo
            </Button>
          }
        />
      )}

      {/* Modal crear grupo */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo grupo"
        footer={
          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button className="btn-primary flex-1" onClick={createGroup}>
              Crear grupo
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Nombre del grupo</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Los del bar"
            />
          </div>

          <div>
            <label className="label">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={cn(
                    'grid h-10 w-10 place-items-center rounded-xl border text-xl transition',
                    emoji === e
                      ? 'border-neon-purple/60 bg-neon-purple/15'
                      : 'border-white/10 bg-white/[0.02] hover:bg-white/5'
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">
              Invitar amigos{selected.length > 0 && <span className="text-neon-purple"> · {selected.length}</span>}
            </label>
            <div className="space-y-1.5">
              {FRIENDS.map((f) => {
                const on = selected.includes(f.id)
                return (
                  <button
                    key={f.id}
                    onClick={() => toggle(f.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border p-2 text-left transition',
                      on ? 'border-neon-purple/50 bg-neon-purple/10' : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                    )}
                  >
                    <Avatar seed={f.avatar} size={36} online={f.online} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-zinc-100">{f.displayName}</div>
                      <div className="truncate text-[11px] text-zinc-500">@{f.username}</div>
                    </div>
                    <span
                      className={cn(
                        'grid h-6 w-6 place-items-center rounded-md border transition',
                        on ? 'border-neon-purple bg-neon-purple text-white' : 'border-white/20 text-transparent'
                      )}
                    >
                      <Check size={14} />
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {FRIENDS.filter((f) => selected.includes(f.id)).map((f) => (
                <Chip key={f.id} tone="purple">
                  {f.avatar} {f.displayName}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
