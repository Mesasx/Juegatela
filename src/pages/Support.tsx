import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search,
  ChevronDown,
  LifeBuoy,
  Scale,
  Flag,
  HeartHandshake,
  Send,
  Phone,
} from 'lucide-react'
import { Card, Chip, Button, EmptyState } from '@/components/ui/Primitives'
import { PageHeader } from '@/components/shared'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

type Faq = { q: string; a: string; cat: string }

const FAQS: Faq[] = [
  {
    cat: 'Retos',
    q: '¿Cómo funciona un reto entre amigos?',
    a: 'Creas un reto con un título, lo que defiendes tú y lo que defiende tu rival, una apuesta en fichas y una fecha. Cuando tu rival lo acepta, ambos bloqueáis las fichas. Al resolverse, el ganador se lleva el bote según el método de verificación elegido.',
  },
  {
    cat: 'Porras',
    q: '¿Qué es una porra y cómo se reparte el bote?',
    a: 'Una porra es una apuesta de grupo: cada participante elige una opción y paga su entrada. Cuando se cierra y se confirma el resultado, el bote se reparte entre quienes acertaron. Si nadie acierta, se reembolsa según las reglas de la porra.',
  },
  {
    cat: 'Saldo',
    q: '¿Por qué se bloquea mi saldo al aceptar un reto?',
    a: 'Al entrar en un reto o porra, tus fichas pasan a estado "bloqueado" para garantizar que el bote existe. No las pierdes: se liberan a tu favor si ganas, o se transfieren al ganador si pierdes. Puedes ver el detalle en tu cartera.',
  },
  {
    cat: 'Verificación',
    q: '¿Cómo se verifica el resultado de un reto?',
    a: 'Depende del método: automático (para eventos con resultado público), por consenso de ambas partes, por prueba (foto o vídeo), por votación del grupo o por revisión de un moderador. Lo eliges al crear el reto para evitar discusiones después.',
  },
  {
    cat: 'Disputas',
    q: 'No estoy de acuerdo con un resultado. ¿Qué hago?',
    a: 'Abre una disputa desde el reto o la porra afectada. El saldo queda retenido mientras se revisa. Aporta pruebas (capturas, enlaces, testigos del grupo) y un moderador tomará una decisión. Mientras dura la disputa, nadie cobra el bote.',
  },
  {
    cat: 'Saldo',
    q: '¿Puedo retirar mis fichas?',
    a: 'En modo demo las fichas son ficticias y las retiradas son simuladas: no se mueve dinero real. Para jugar con dinero real harían falta licencias, verificación de identidad (KYC) y métodos de pago verificados, que no están activos en este prototipo.',
  },
  {
    cat: 'Modo demo',
    q: '¿Esto es dinero real?',
    a: 'No. Juégatela funciona en modo seguro con fichas demo. Sirve para probar la experiencia, los retos y las porras entre amigos sin riesgo económico. Puedes reiniciar tu saldo demo desde Ajustes cuando quieras.',
  },
  {
    cat: 'Cuenta',
    q: '¿Cómo verifico mi cuenta?',
    a: 'En el prototipo basta con crear tu cuenta para explorar. La verificación de identidad completa (documento y edad) sería obligatoria antes de cualquier operación con dinero real en una versión licenciada.',
  },
  {
    cat: 'Seguridad',
    q: '¿Cuál es la edad mínima para usar Juégatela?',
    a: 'Es obligatorio ser mayor de 18 años. Apostar es una actividad para adultos. Si detectamos cuentas de menores, se cierran. Consulta también nuestra sección de juego responsable.',
  },
  {
    cat: 'Cuenta',
    q: '¿Cómo reinicio mi progreso demo?',
    a: 'Ve a Ajustes y entra en la "Zona de reinicio". Restaurarás tu saldo de fichas demo, retos, porras y notificaciones a su estado inicial sin borrar tu cuenta.',
  },
]

const CATEGORIES = ['General', 'Retos', 'Porras', 'Saldo', 'Cuenta', 'Disputas', 'Verificación', 'Otro']

const CHANNELS = [
  { icon: LifeBuoy, color: 'text-neon-blue', bg: 'bg-neon-blue/15', title: 'Centro de ayuda', body: 'Guías y respuestas rápidas.', to: undefined },
  { icon: Scale, color: 'text-neon-amber', bg: 'bg-neon-amber/15', title: 'Disputas', body: 'Revisa o abre una reclamación.', to: undefined },
  { icon: Flag, color: 'text-neon-red', bg: 'bg-neon-red/15', title: 'Reportar problema', body: 'Avísanos de fallos o abusos.', to: undefined },
  { icon: HeartHandshake, color: 'text-neon-green', bg: 'bg-neon-green/15', title: 'Juego responsable', body: 'Límites y ayuda.', to: '/juego-responsable' },
]

export default function Support() {
  const toast = useStore((s) => s.toast)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<number | null>(0)
  const [form, setForm] = useState({ subject: '', category: 'General', message: '' })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return FAQS
    return FAQS.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q) || f.cat.toLowerCase().includes(q))
  }, [query])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({ tone: 'success', title: 'Ticket enviado', body: 'Te responderemos por aquí lo antes posible.' })
    setForm({ subject: '', category: 'General', message: '' })
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="La barra de ayuda"
        title="Soporte"
        subtitle="¿Dudas con un reto, una porra o tu saldo? Aquí te echamos un cable."
      />

      {/* Buscador */}
      <Card className="mb-6 p-4">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-900/80 px-4 py-2.5">
          <Search size={18} className="shrink-0 text-zinc-500" />
          <input
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 outline-none"
            placeholder="Busca en la ayuda: retos, saldo bloqueado, disputas…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Canales */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {CHANNELS.map((c, i) => {
          const Icon = c.icon
          const inner = (
            <Card hover className="h-full p-4">
              <div className={cn('grid h-11 w-11 place-items-center rounded-xl', c.bg, c.color)}>
                <Icon size={20} />
              </div>
              <div className="mt-3 font-bold text-zinc-100">{c.title}</div>
              <div className="text-xs text-zinc-500">{c.body}</div>
            </Card>
          )
          return (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {c.to ? <Link to={c.to}>{inner}</Link> : inner}
            </motion.div>
          )
        })}
      </div>

      {/* FAQs */}
      <section className="mb-8">
        <h2 className="neon-title mb-4 text-2xl text-zinc-100">Preguntas frecuentes</h2>
        {filtered.length === 0 ? (
          <EmptyState
            icon="🤔"
            title="No encontramos esa respuesta"
            body="Prueba con otras palabras o escríbenos directamente con el formulario de abajo."
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((f, i) => {
              const isOpen = open === i
              return (
                <Card key={f.q} className="overflow-hidden">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Chip tone="purple">{f.cat}</Chip>
                      <span className="font-semibold text-zinc-100">{f.q}</span>
                    </span>
                    <ChevronDown
                      size={18}
                      className={cn('shrink-0 text-zinc-400 transition-transform', isOpen && 'rotate-180')}
                    />
                  </button>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="border-t border-white/5 px-4 py-3 text-sm leading-relaxed text-zinc-400"
                    >
                      {f.a}
                    </motion.div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Banner ayuda urgente */}
      <Card glow="shadow-neon-amber/20" className="mb-8 flex flex-col items-start gap-3 border-neon-amber/30 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-neon-amber/15 text-neon-amber">
            <Phone size={20} />
          </div>
          <div>
            <div className="font-bold text-zinc-100">¿El juego te preocupa a ti o a alguien cercano?</div>
            <div className="text-sm text-zinc-400">Línea de atención al jugador: 900 200 225 · gratuita y confidencial.</div>
          </div>
        </div>
        <Link to="/juego-responsable" className="btn-ghost shrink-0">
          Juego responsable
        </Link>
      </Card>

      {/* Formulario de contacto */}
      <section>
        <h2 className="neon-title mb-4 text-2xl text-zinc-100">Escríbenos</h2>
        <Card className="p-5 sm:p-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Asunto</label>
                <input
                  className="input"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Resumen breve del problema"
                />
              </div>
              <div>
                <label className="label">Categoría</label>
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Mensaje</label>
              <textarea
                className="input min-h-[120px] resize-y"
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Cuéntanos qué ha pasado con todo el detalle que puedas."
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-zinc-500">Estás en modo demo: ningún dato real se procesa.</p>
              <Button type="submit">
                <Send size={16} /> Enviar ticket
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </div>
  )
}
