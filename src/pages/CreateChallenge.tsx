import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Coins, Check, Trophy, Activity, User as UserIcon, Sparkles } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { PageHeader, useAuthGate } from '@/components/shared'
import { Card, Avatar, Chip } from '@/components/ui/Primitives'
import { FRIENDS } from '@/lib/mockData'
import { cn, fichas, uid } from '@/lib/utils'
import type { ChallengeKind, VerifyMethod, Visibility } from '@/lib/types'

const KINDS: { id: ChallengeKind; label: string; icon: typeof Trophy }[] = [
  { id: 'sport', label: 'Deporte', icon: Trophy },
  { id: 'event', label: 'Evento real', icon: Activity },
  { id: 'personal', label: 'Reto personal', icon: UserIcon },
  { id: 'prediction', label: 'Predicción libre', icon: Sparkles },
]
const VERIFY: { id: VerifyMethod; label: string }[] = [
  { id: 'auto', label: 'Automática (fuente externa)' },
  { id: 'consensus', label: 'Consenso entre ambos' },
  { id: 'proof', label: 'Subir prueba' },
  { id: 'vote', label: 'Votación del grupo' },
  { id: 'admin', label: 'Árbitro de Juégatela' },
]

export default function CreateChallenge() {
  const navigate = useNavigate()
  const addChallenge = useStore((s) => s.addChallenge)
  const lockFunds = useStore((s) => s.lockFunds)
  const pushNotification = useStore((s) => s.pushNotification)
  const { guard, gate } = useAuthGate()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    title: '',
    description: '',
    kind: 'sport' as ChallengeKind,
    creatorSide: '',
    rivalSide: '',
    stake: 5,
    rivalId: FRIENDS[0].id,
    verify: 'consensus' as VerifyMethod,
    visibility: 'private' as Visibility,
    eventDate: '',
    rules: '',
  })

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }))
  const canNext = step === 1 ? form.title.trim().length > 2 : step === 2 ? form.creatorSide && form.rivalSide : true

  function publish() {
    guard(() => {
      const id = uid()
      addChallenge({
        id,
        title: form.title,
        description: form.description || 'Sin descripción',
        kind: form.kind,
        creatorSide: form.creatorSide,
        rivalSide: form.rivalSide,
        stake: form.stake,
        currency: 'demo',
        acceptBy: new Date(Date.now() + 2 * 864e5).toISOString(),
        eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : new Date(Date.now() + 3 * 864e5).toISOString(),
        verify: form.verify,
        visibility: form.visibility,
        rules: form.rules,
        status: 'pending',
        creatorId: 'me',
        rivalId: form.rivalId,
        createdAt: new Date().toISOString(),
      })
      lockFunds(form.stake, `Reto creado: ${form.title}`, id)
      pushNotification({ type: 'challenge_received', title: 'Reto enviado', body: `Esperando a que ${FRIENDS.find((f) => f.id === form.rivalId)?.displayName} acepte.` })
      navigate('/retos')
    })
  }

  const rival = FRIENDS.find((f) => f.id === form.rivalId)!

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={() => navigate('/retos')} className="btn-ghost mb-4 px-3 py-2"><ArrowLeft size={16} /> Retos</button>
      <PageHeader eyebrow="Nuevo reto" title="Crea tu apuesta" subtitle="Define las reglas claras antes de empezar. La casa no decide." />

      {/* steps */}
      <div className="mb-6 flex items-center gap-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex flex-1 items-center gap-2">
            <div className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold', step >= n ? 'bg-neon-red text-white' : 'bg-white/5 text-zinc-500')}>
              {step > n ? <Check size={14} /> : n}
            </div>
            {n < 3 && <div className={cn('h-0.5 flex-1 rounded', step > n ? 'bg-neon-red' : 'bg-white/10')} />}
          </div>
        ))}
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
        <Card className="p-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="label">Título de la apuesta</label>
                <input className="input" placeholder="Ej: España gana el lunes a Cabo Verde" value={form.title} onChange={(e) => set({ title: e.target.value })} />
              </div>
              <div>
                <label className="label">Descripción</label>
                <textarea className="input min-h-[80px]" placeholder="Explica de qué va el reto…" value={form.description} onChange={(e) => set({ description: e.target.value })} />
              </div>
              <div>
                <label className="label">Tipo</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {KINDS.map((k) => (
                    <button key={k.id} onClick={() => set({ kind: k.id })} className={cn('rounded-xl border p-3 text-center transition', form.kind === k.id ? 'border-neon-purple/50 bg-neon-purple/10 text-neon-purple' : 'border-white/10 text-zinc-300 hover:bg-white/5')}>
                      <k.icon size={18} className="mx-auto" />
                      <div className="mt-1 text-[11px] font-semibold">{k.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="label">Resultado que defiendes tú</label>
                <input className="input" placeholder="Ej: Gana España" value={form.creatorSide} onChange={(e) => set({ creatorSide: e.target.value })} />
              </div>
              <div>
                <label className="label">Resultado que acepta el rival</label>
                <input className="input" placeholder="Ej: Empate o gana Cabo Verde" value={form.rivalSide} onChange={(e) => set({ rivalSide: e.target.value })} />
              </div>
              <div>
                <label className="label">Reta a</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {FRIENDS.map((f) => (
                    <button key={f.id} onClick={() => set({ rivalId: f.id })} className={cn('flex items-center gap-2 rounded-xl border p-2 text-left transition', form.rivalId === f.id ? 'border-neon-red/50 bg-neon-red/10' : 'border-white/10 hover:bg-white/5')}>
                      <Avatar seed={f.avatar} size={32} online={f.online} />
                      <span className="truncate text-xs font-semibold text-zinc-200">{f.displayName}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Fecha del evento</label>
                <input type="datetime-local" className="input" value={form.eventDate} onChange={(e) => set({ eventDate: e.target.value })} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="label">Cantidad que pone cada uno</label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 20, 50].map((s) => (
                    <button key={s} onClick={() => set({ stake: s })} className={cn('rounded-xl border py-2.5 font-bold transition', form.stake === s ? 'border-neon-amber/60 bg-neon-amber/15 text-neon-amber' : 'border-white/10 text-zinc-300')}>{s}</button>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-zinc-500">Bote total {fichas(form.stake * 2)} · se bloquea al crear.</p>
              </div>
              <div>
                <label className="label">Método de verificación</label>
                <select className="input" value={form.verify} onChange={(e) => set({ verify: e.target.value as VerifyMethod })}>
                  {VERIFY.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Visibilidad</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['private', 'group', 'public'] as Visibility[]).map((v) => (
                    <button key={v} onClick={() => set({ visibility: v })} className={cn('rounded-xl border py-2 text-sm font-semibold capitalize transition', form.visibility === v ? 'border-neon-blue/50 bg-neon-blue/10 text-neon-blue' : 'border-white/10 text-zinc-300')}>
                      {v === 'private' ? 'Privada' : v === 'group' ? 'Grupo' : 'Pública'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Reglas (opcional)</label>
                <textarea className="input min-h-[60px]" placeholder="Matices, plazos, qué cuenta y qué no…" value={form.rules} onChange={(e) => set({ rules: e.target.value })} />
              </div>

              <div className="rounded-xl border border-neon-red/20 bg-neon-red/5 p-3">
                <div className="text-xs font-bold uppercase tracking-wide text-neon-red">Resumen</div>
                <div className="mt-1 text-sm text-zinc-300">
                  Retas a <span className="font-semibold text-zinc-100">{rival.displayName}</span> · pones <span className="font-semibold text-neon-amber">{fichas(form.stake)}</span> · bote <span className="font-semibold text-neon-amber">{fichas(form.stake * 2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* nav buttons */}
          <div className="mt-6 flex justify-between">
            {step > 1 ? (
              <button onClick={() => setStep((s) => s - 1)} className="btn-ghost"><ArrowLeft size={16} /> Atrás</button>
            ) : <span />}
            {step < 3 ? (
              <button onClick={() => canNext && setStep((s) => s + 1)} disabled={!canNext} className="btn-primary">Siguiente <ArrowRight size={16} /></button>
            ) : (
              <button onClick={publish} className="btn-primary"><Coins size={16} /> Crear y bloquear {fichas(form.stake)}</button>
            )}
          </div>
        </Card>
      </motion.div>

      <p className="mt-4 text-center text-[11px] text-zinc-600">
        Al crear el reto se bloquean tus fichas demo. El rival debe aceptar y bloquear las suyas para activarlo.
      </p>

      {gate}
    </div>
  )
}
