import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, Dices, Coins, Flame, Check } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { PageHeader, useAuthGate } from '@/components/shared'
import { Card, Chip } from '@/components/ui/Primitives'
import { cn, fichas, uid } from '@/lib/utils'
import type { PorraType } from '@/lib/types'
import { TRENDING_PORRAS, TRENDING_CATEGORIES, type TrendingPorra } from '@/lib/trending'

const TYPES: { id: PorraType; label: string; desc: string }[] = [
  { id: 'single', label: 'Ganador único', desc: 'Quien acierte se lleva todo el bote' },
  { id: 'multi', label: 'Varios ganadores', desc: 'El bote se reparte entre los acertantes' },
  { id: 'exact', label: 'Resultado exacto', desc: 'Marcador o cifra exacta' },
  { id: 'vote', label: 'Votación', desc: 'Decide el grupo' },
  { id: 'proportional', label: 'Reparto proporcional', desc: 'Según lo apostado' },
]
const GROUPS = ['Los del bar', 'Gamers', 'Cena viernes', 'Equipo fútbol']

export default function CreatePorra() {
  const navigate = useNavigate()
  const addPorra = useStore((s) => s.addPorra)
  const lockFunds = useStore((s) => s.lockFunds)
  const { guard, gate } = useAuthGate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<PorraType>('single')
  const [group, setGroup] = useState(GROUPS[0])
  const [entry, setEntry] = useState(5)
  const [options, setOptions] = useState(['', ''])
  const [closeDate, setCloseDate] = useState('')
  const [activeTpl, setActiveTpl] = useState<string | null>(null)
  const [cat, setCat] = useState<string>('Todos')

  const valid = title.trim().length > 2 && options.filter((o) => o.trim()).length >= 2

  const trending = useMemo(
    () => (cat === 'Todos' ? TRENDING_PORRAS : TRENDING_PORRAS.filter((t) => t.category === cat)),
    [cat]
  )

  function applyTemplate(t: TrendingPorra) {
    setActiveTpl(t.id)
    setTitle(t.title)
    setDescription(t.description)
    setType(t.type)
    setEntry(t.entry)
    setOptions(t.options.length >= 2 ? t.options : [...t.options, ''])
    // smooth-scroll the user down to the form
    setTimeout(() => document.getElementById('porra-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }

  function create() {
    guard(() => {
      const id = uid()
      const opts = options.filter((o) => o.trim()).map((label) => ({ id: uid(), label, picksBy: [] as string[] }))
      addPorra({
        id,
        title,
        description: description || 'Sin descripción',
        type,
        groupName: group,
        entry,
        currency: 'demo',
        options: opts,
        status: 'open',
        closeDate: closeDate ? new Date(closeDate).toISOString() : new Date(Date.now() + 2 * 864e5).toISOString(),
        creatorId: 'me',
        createdAt: new Date().toISOString(),
      })
      lockFunds(entry, `Crear porra: ${title}`, id)
      navigate('/porras')
    })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={() => navigate('/porras')} className="btn-ghost mb-4 px-3 py-2"><ArrowLeft size={16} /> Porras</button>
      <PageHeader eyebrow="Nueva porra" title="Monta una porra" subtitle="Elige el tipo, las opciones y la entrada. El bote se reparte solo al cerrar." />

      {/* ── Eventos en auge ── */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Flame className="text-neon-amber" size={18} />
          <h2 className="neon-title text-xl text-zinc-100">Eventos en auge ahora mismo</h2>
        </div>
        <div className="scrollbar-none mb-3 flex gap-2 overflow-x-auto pb-1">
          {['Todos', ...TRENDING_CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                'chip whitespace-nowrap border transition',
                cat === c ? 'border-neon-amber/50 bg-neon-amber/15 text-neon-amber' : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="scrollbar-none flex gap-3 overflow-x-auto pb-2">
          {trending.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => applyTemplate(t)}
              className={cn(
                'glass glass-hover relative w-56 shrink-0 rounded-2xl p-4 text-left',
                activeTpl === t.id ? 'border-neon-amber/60 shadow-[0_0_0_1px_rgba(255,182,39,0.4)]' : ''
              )}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-2xl">{t.emoji}</span>
                {t.hot ? <Chip tone="red"><Flame size={10} /> en auge</Chip> : <Chip tone="zinc">{t.category}</Chip>}
              </div>
              <div className="text-sm font-bold leading-tight text-zinc-100">{t.title}</div>
              <p className="mt-1 line-clamp-2 text-[11px] text-zinc-500">{t.description}</p>
              <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-neon-amber">
                {activeTpl === t.id ? <><Check size={12} /> Aplicada</> : <>Usar plantilla</>}
              </div>
            </motion.button>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-zinc-600">Toca una plantilla para rellenar la porra al instante. Luego puedes editarla.</p>
      </div>

      <Card id="porra-form" className="space-y-4 p-5">
        <div>
          <label className="label">Título</label>
          <input className="input" placeholder="Ej: Resultado exacto España-Cabo Verde" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">Descripción</label>
          <textarea className="input min-h-[70px]" placeholder="¿De qué va la porra?" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <label className="label">Tipo de porra</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {TYPES.map((t) => (
              <button key={t.id} onClick={() => setType(t.id)} className={cn('rounded-xl border p-3 text-left transition', type === t.id ? 'border-neon-blue/50 bg-neon-blue/10' : 'border-white/10 hover:bg-white/5')}>
                <div className={cn('text-sm font-bold', type === t.id ? 'text-neon-blue' : 'text-zinc-200')}>{t.label}</div>
                <div className="text-[11px] text-zinc-500">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Grupo</label>
            <select className="input" value={group} onChange={(e) => setGroup(e.target.value)}>
              {GROUPS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Entrada por persona</label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 5, 10, 20].map((s) => (
                <button key={s} onClick={() => setEntry(s)} className={cn('rounded-xl border py-2 text-sm font-bold transition', entry === s ? 'border-neon-amber/60 bg-neon-amber/15 text-neon-amber' : 'border-white/10 text-zinc-300')}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="label">Opciones</label>
          <div className="space-y-2">
            {options.map((o, i) => (
              <div key={i} className="flex gap-2">
                <input className="input" placeholder={`Opción ${i + 1}`} value={o} onChange={(e) => setOptions((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))} />
                {options.length > 2 && (
                  <button onClick={() => setOptions((arr) => arr.filter((_, j) => j !== i))} className="btn-ghost px-3"><Trash2 size={16} /></button>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => setOptions((arr) => [...arr, ''])} className="btn-ghost mt-2 text-sm"><Plus size={14} /> Añadir opción</button>
        </div>

        <div>
          <label className="label">Cierre de la porra</label>
          <input type="datetime-local" className="input" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} />
        </div>

        <div className="rounded-xl border border-neon-blue/20 bg-neon-blue/5 p-3 text-sm text-zinc-300">
          <Dices size={16} className="mr-1 inline text-neon-blue" /> Tu entrada de <span className="font-bold text-neon-amber">{fichas(entry)}</span> se bloquea al crear la porra.
        </div>

        <button onClick={create} disabled={!valid} className="btn-primary w-full py-3"><Coins size={16} /> Crear porra y bloquear {fichas(entry)}</button>
      </Card>

      {gate}
    </div>
  )
}
