import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Check, Flag, ShieldCheck, Upload, X } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { PageHeader, useAuthGate } from '@/components/shared'
import { Card, Chip, EmptyState } from '@/components/ui/Primitives'
import { Modal } from '@/components/ui/Modal'
import { challengeStatus, kindLabel, verifyLabel } from '@/lib/status'
import { FRIENDS, ME } from '@/lib/mockData'
import { cn, fichas, fmtDate, countdown } from '@/lib/utils'
import type { Challenge } from '@/lib/types'

const TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'active', label: 'Activos' },
  { id: 'verifying', label: 'Verificación' },
  { id: 'closed', label: 'Cerrados' },
]

const closedStates = ['won', 'lost', 'cancelled', 'refunded']

export default function Challenges() {
  const challenges = useStore((s) => s.challenges)
  const updateChallenge = useStore((s) => s.updateChallenge)
  const lockFunds = useStore((s) => s.lockFunds)
  const releaseToMe = useStore((s) => s.releaseToMe)
  const settleLoss = useStore((s) => s.settleLoss)
  const pushNotification = useStore((s) => s.pushNotification)
  const toast = useStore((s) => s.toast)
  const { guard, gate } = useAuthGate()

  const [tab, setTab] = useState('all')
  const [detail, setDetail] = useState<Challenge | null>(null)

  const filtered = challenges.filter((c) => {
    if (tab === 'all') return true
    if (tab === 'closed') return closedStates.includes(c.status)
    return c.status === tab
  })

  function userName(id?: string) {
    if (!id) return 'Rival'
    if (id === 'me') return 'Tú'
    return FRIENDS.find((f) => f.id === id)?.displayName ?? 'Rival'
  }

  function accept(c: Challenge) {
    guard(() => {
      const ok = lockFunds(c.stake, `Aceptar reto: ${c.title}`, c.id)
      if (!ok) return
      updateChallenge(c.id, { status: 'active' })
      pushNotification({ type: 'challenge_accepted', title: 'Reto aceptado', body: `Aceptaste "${c.title}". Fondos bloqueados.` })
      setDetail(null)
    })
  }

  function resolve(c: Challenge, iWin: boolean) {
    if (iWin) {
      releaseToMe(c.stake, `Reto ganado: ${c.title}`, c.id)
      updateChallenge(c.id, { status: 'won', winnerId: 'me' })
      pushNotification({ type: 'funds_released', title: 'Dinero liberado', body: `Ganaste "${c.title}". +${c.stake * 2} fichas.` })
    } else {
      settleLoss(c.stake, `Reto perdido: ${c.title}`, c.id)
      updateChallenge(c.id, { status: 'lost', winnerId: c.rivalId === 'me' ? c.creatorId : c.rivalId })
    }
    setDetail(null)
  }

  function dispute(c: Challenge) {
    updateChallenge(c.id, { status: 'disputed' })
    pushNotification({ type: 'dispute_open', title: 'Disputa abierta', body: `Has disputado "${c.title}". Pasa a revisión.` })
    toast({ tone: 'info', title: 'Disputa abierta', body: 'Un árbitro revisará el resultado.' })
    setDetail(null)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Apuestas privadas"
        title="Retos"
        subtitle="El dinero se habla antes, se bloquea al aceptar y se paga al ganar."
        action={<Link to="/retos/crear" className="btn-primary"><Plus size={16} /> Crear reto</Link>}
      />

      <div className="scrollbar-none mb-5 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'chip whitespace-nowrap border transition',
              tab === t.id ? 'border-neon-red/50 bg-neon-red/15 text-neon-red' : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="🤝"
          title="No hay retos aquí"
          body="Lanza el primero. ¿Te apuestas algo con un amigo?"
          action={<Link to="/retos/crear" className="btn-primary"><Plus size={16} /> Crear reto</Link>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((c) => {
            const st = challengeStatus[c.status]
            return (
              <Card key={c.id} hover className="p-4" >
                <div onClick={() => setDetail(c)}>
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    <Chip tone="purple">{kindLabel[c.kind]}</Chip>
                    <Chip tone={st.tone}>{st.label}</Chip>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-zinc-100">{c.title}</h3>
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-neon-amber">{c.stake}</div>
                      <div className="text-[10px] uppercase text-zinc-500">fichas</div>
                    </div>
                  </div>
                  <p className="line-clamp-1 text-sm text-zinc-400">{c.description}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>{userName(c.creatorId)} vs {userName(c.rivalId)}</span>
                    <span>{c.status === 'pending' ? `Acepta en ${countdown(c.acceptBy)}` : fmtDate(c.eventDate)}</span>
                  </div>
                </div>
                {/* inline actions */}
                {c.status === 'pending' && c.rivalId === 'me' && (
                  <button onClick={() => accept(c)} className="btn-primary mt-3 w-full py-2 text-sm"><Check size={14} /> Aceptar y bloquear {fichas(c.stake)}</button>
                )}
                {c.status === 'verifying' && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button onClick={() => resolve(c, true)} className="btn-ghost py-2 text-xs text-neon-green">Gané</button>
                    <button onClick={() => resolve(c, false)} className="btn-ghost py-2 text-xs text-neon-red">Perdí</button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* detail modal */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.title}
        size="lg"
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              <Chip tone="purple">{kindLabel[detail.kind]}</Chip>
              <Chip tone={challengeStatus[detail.status].tone}>{challengeStatus[detail.status].label}</Chip>
              <Chip tone="zinc">{detail.visibility === 'private' ? 'Privada' : detail.visibility === 'group' ? 'Grupo' : 'Pública'}</Chip>
            </div>
            <p className="text-sm text-zinc-300">{detail.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-neon-green/20 bg-neon-green/5 p-3">
                <div className="text-[11px] uppercase text-zinc-500">Defiende {userName(detail.creatorId)}</div>
                <div className="font-semibold text-neon-green">{detail.creatorSide}</div>
              </div>
              <div className="rounded-xl border border-neon-red/20 bg-neon-red/5 p-3">
                <div className="text-[11px] uppercase text-zinc-500">Rival {userName(detail.rivalId)}</div>
                <div className="font-semibold text-neon-red">{detail.rivalSide}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <Info label="Cada uno pone" value={fichas(detail.stake)} />
              <Info label="Bote" value={fichas(detail.stake * 2)} />
              <Info label="Verificación" value={verifyLabel[detail.verify]} />
              <Info label="Evento" value={fmtDate(detail.eventDate)} />
            </div>
            {detail.rules && (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-zinc-400">
                <span className="font-semibold text-zinc-200">Reglas: </span>{detail.rules}
              </div>
            )}

            <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
              {detail.status === 'pending' && detail.rivalId === 'me' && (
                <button onClick={() => accept(detail)} className="btn-primary flex-1"><Check size={16} /> Aceptar reto</button>
              )}
              {detail.status === 'pending' && detail.creatorId === 'me' && (
                <Chip tone="amber">Esperando a que {userName(detail.rivalId)} acepte</Chip>
              )}
              {detail.status === 'active' && (
                <>
                  <button onClick={() => resolve(detail, true)} className="btn-ghost flex-1 text-neon-green"><ShieldCheck size={16} /> Declarar victoria</button>
                  <button onClick={() => resolve(detail, false)} className="btn-ghost flex-1 text-neon-red">Declarar derrota</button>
                </>
              )}
              {detail.status === 'verifying' && (
                <>
                  <button className="btn-ghost flex-1"><Upload size={16} /> Subir prueba</button>
                  <button onClick={() => resolve(detail, true)} className="btn-primary flex-1">Confirmar resultado</button>
                </>
              )}
              {['active', 'verifying', 'won', 'lost'].includes(detail.status) && (
                <button onClick={() => dispute(detail)} className="btn-ghost text-neon-amber"><Flag size={16} /> Disputar</button>
              )}
              {detail.status === 'disputed' && (
                <div className="flex items-center gap-2 text-sm text-neon-amber"><Flag size={16} /> En revisión por un árbitro.</div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {gate}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
      <div className="text-[11px] uppercase text-zinc-500">{label}</div>
      <div className="font-semibold text-zinc-100">{value}</div>
    </div>
  )
}
