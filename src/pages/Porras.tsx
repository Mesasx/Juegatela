import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Check, Trophy, Users } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { PageHeader, useAuthGate } from '@/components/shared'
import { Card, Chip, EmptyState } from '@/components/ui/Primitives'
import { Modal } from '@/components/ui/Modal'
import { porraStatus } from '@/lib/status'
import { cn, fichas, countdown, fmtDate } from '@/lib/utils'
import type { Porra } from '@/lib/types'

const TABS = [
  { id: 'all', label: 'Todas' },
  { id: 'open', label: 'Abiertas' },
  { id: 'locked', label: 'Cerradas' },
  { id: 'settled', label: 'Repartidas' },
]

export default function Porras() {
  const porras = useStore((s) => s.porras)
  const pick = useStore((s) => s.pickPorraOption)
  const lockFunds = useStore((s) => s.lockFunds)
  const releaseToMe = useStore((s) => s.releaseToMe)
  const addPorraStatus = useStore((s) => s.addPorra) // not used for status, placeholder
  const toast = useStore((s) => s.toast)
  const { guard, gate } = useAuthGate()
  const [tab, setTab] = useState('all')
  const [detail, setDetail] = useState<Porra | null>(null)

  const filtered = porras.filter((p) => tab === 'all' || p.status === tab)
  const current = detail ? porras.find((p) => p.id === detail.id) ?? detail : null

  function choose(p: Porra, optId: string) {
    guard(() => {
      const already = p.options.some((o) => o.picksBy.includes('me'))
      pick(p.id, optId)
      if (!already) lockFunds(p.entry, `Porra: ${p.title}`, p.id)
      toast({ tone: 'neon', title: 'Apuesta registrada', body: `Elegiste tu opción en "${p.title}".` })
    })
  }

  return (
    <div>
      <PageHeader
        eyebrow="Porras grupales"
        title="Porras"
        subtitle="Monta una porra para tu grupo y reparte el bote automáticamente al cerrar."
        action={<Link to="/porras/crear" className="btn-primary"><Plus size={16} /> Crear porra</Link>}
      />

      <div className="scrollbar-none mb-5 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn('chip whitespace-nowrap border transition', tab === t.id ? 'border-neon-blue/50 bg-neon-blue/15 text-neon-blue' : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white')}>
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🎲" title="Sin porras todavía" body="Crea una y reta a tu grupo." action={<Link to="/porras/crear" className="btn-primary"><Plus size={16} /> Crear porra</Link>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((p) => {
            const st = porraStatus[p.status]
            const totalPicks = p.options.reduce((a, o) => a + o.picksBy.length, 0)
            const myPick = p.options.find((o) => o.picksBy.includes('me'))
            return (
              <Card key={p.id} hover className="p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <Chip tone="blue"><Users size={10} /> {p.groupName}</Chip>
                    <Chip tone={st.tone}>{st.label}</Chip>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-neon-amber">{totalPicks * p.entry}</div>
                    <div className="text-[10px] uppercase text-zinc-500">bote</div>
                  </div>
                </div>
                <h3 className="font-bold text-zinc-100">{p.title}</h3>
                <p className="mb-3 text-sm text-zinc-400">{p.description}</p>
                <div className="space-y-1.5">
                  {p.options.map((o) => {
                    const pct = totalPicks ? (o.picksBy.length / totalPicks) * 100 : 0
                    const win = p.winningOptionId === o.id
                    const mine = o.picksBy.includes('me')
                    return (
                      <button
                        key={o.id}
                        disabled={p.status !== 'open'}
                        onClick={() => choose(p, o.id)}
                        className={cn('relative w-full overflow-hidden rounded-lg border px-3 py-2 text-left transition disabled:cursor-default', mine ? 'border-neon-purple/50' : 'border-white/5', p.status === 'open' && 'hover:border-white/20')}
                      >
                        <div className={cn('absolute inset-y-0 left-0', win ? 'bg-neon-green/20' : mine ? 'bg-neon-purple/15' : 'bg-white/[0.04]')} style={{ width: `${pct}%` }} />
                        <div className="relative flex items-center justify-between text-sm">
                          <span className={cn('font-semibold', win ? 'text-neon-green' : mine ? 'text-neon-purple' : 'text-zinc-200')}>
                            {mine && <Check size={12} className="mr-1 inline" />}{o.label} {win && '· ✓ ganadora'}
                          </span>
                          <span className="text-xs text-zinc-500">{o.picksBy.length}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Entrada {fichas(p.entry)}</span>
                  <button onClick={() => setDetail(p)} className="font-semibold text-neon-blue hover:underline">Detalles · {countdown(p.closeDate)}</button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={!!current} onClose={() => setDetail(null)} title={current?.title} size="lg">
        {current && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              <Chip tone="blue"><Users size={10} /> {current.groupName}</Chip>
              <Chip tone={porraStatus[current.status].tone}>{porraStatus[current.status].label}</Chip>
            </div>
            <p className="text-sm text-zinc-300">{current.description}</p>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5"><div className="text-[11px] uppercase text-zinc-500">Entrada</div><div className="font-bold text-zinc-100">{fichas(current.entry)}</div></div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5"><div className="text-[11px] uppercase text-zinc-500">Participantes</div><div className="font-bold text-zinc-100">{current.options.reduce((a, o) => a + o.picksBy.length, 0)}</div></div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5"><div className="text-[11px] uppercase text-zinc-500">Cierra</div><div className="font-bold text-zinc-100">{fmtDate(current.closeDate)}</div></div>
            </div>
            {current.status === 'settled' && current.winningOptionId && (
              <div className="flex items-center gap-2 rounded-xl border border-neon-green/30 bg-neon-green/10 p-3 text-sm text-neon-green">
                <Trophy size={18} /> Opción ganadora: <span className="font-bold">{current.options.find((o) => o.id === current.winningOptionId)?.label}</span>. Bote repartido.
              </div>
            )}
            {current.status === 'open' && (
              <p className="text-[11px] text-zinc-500">Elige tu opción en la tarjeta. Al elegir se bloquea tu entrada hasta el cierre.</p>
            )}
          </div>
        )}
      </Modal>

      {gate}
    </div>
  )
}
