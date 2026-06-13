import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  Wallet,
  TrendingDown,
  Timer,
  PauseCircle,
  Ban,
  ClipboardCheck,
  AlertTriangle,
  Phone,
} from 'lucide-react'
import { Card, Chip, Button, EmptyState } from '@/components/ui/Primitives'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/shared'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

// ── Local neon toggle ──────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200',
        checked
          ? 'border-neon-green/50 bg-neon-green/25 shadow-[0_0_14px_-2px_rgba(57,255,158,0.6)]'
          : 'border-white/10 bg-white/5'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4 w-4 rounded-full transition-all duration-200',
          checked ? 'left-[1.5rem] bg-neon-green' : 'left-0.5 bg-zinc-400'
        )}
      />
    </button>
  )
}

const QUESTIONS = [
  '¿Juegas más tiempo o más fichas de lo que tenías pensado?',
  '¿Has discutido con alguien por el tiempo o el dinero que dedicas al juego?',
  '¿Vuelves a jugar para recuperar lo que has perdido?',
  '¿Te sientes inquieto o irritable cuando no puedes jugar?',
  '¿Has descuidado obligaciones o relaciones por jugar?',
  '¿Has ocultado a alguien cuánto juegas?',
]

const SELF_EXCLUDE = [
  { id: '24h', label: '24 horas' },
  { id: '1w', label: '1 semana' },
  { id: '1m', label: '1 mes' },
  { id: '6m', label: '6 meses' },
  { id: 'perm', label: 'Permanente' },
]

const SIGNALS = [
  'Pensar en el juego de forma constante.',
  'Apostar cantidades cada vez mayores para sentir lo mismo.',
  'Intentar dejarlo sin conseguirlo.',
  'Pedir dinero prestado o mentir para seguir jugando.',
  'Jugar para escapar de problemas o de un estado de ánimo bajo.',
  'Perder interés por aficiones o personas de tu entorno.',
]

const RESOURCES = [
  { name: 'Línea de atención al jugador', detail: '900 200 225 · gratuita, anónima, 24/7' },
  { name: 'FEJAR (Federación de Jugadores de Azar Rehabilitados)', detail: 'Apoyo y grupos de ayuda en toda España' },
  { name: 'Tu centro de salud', detail: 'Pide cita con tu médico de cabecera si lo necesitas' },
]

export default function Responsible() {
  const toast = useStore((s) => s.toast)

  const [limits, setLimits] = useState({ daily: '', weekly: '', monthly: '', loss: '' })
  const [sessionOn, setSessionOn] = useState(false)
  const [sessionMins, setSessionMins] = useState('60')
  const [pauseOn, setPauseOn] = useState(false)
  const [exclude, setExclude] = useState<string | null>(null)
  const [excludeOpen, setExcludeOpen] = useState(false)
  const [answers, setAnswers] = useState<boolean[]>(Array(QUESTIONS.length).fill(false))
  const [showResult, setShowResult] = useState(false)

  const score = useMemo(() => answers.filter(Boolean).length, [answers])

  const verdict = useMemo(() => {
    if (score <= 1) return { tone: 'green' as const, title: 'Sin señales de alarma', body: 'Tus respuestas no muestran indicios de un problema. Mantén tus límites y sigue jugando con cabeza.' }
    if (score <= 3) return { tone: 'amber' as const, title: 'Conviene estar atento', body: 'Algunas respuestas sugieren que el juego empieza a pesar. Considera fijar límites o tomarte una pausa.' }
    return { tone: 'red' as const, title: 'Te recomendamos buscar apoyo', body: 'Varias señales apuntan a una relación poco sana con el juego. Habla con alguien de confianza y consulta los recursos de ayuda.' }
  }, [score])

  const saveLimits = () => toast({ tone: 'success', title: 'Límites guardados', body: 'Tus límites de juego se han actualizado.' })

  const confirmExclude = () => {
    setExcludeOpen(false)
    const label = SELF_EXCLUDE.find((s) => s.id === exclude)?.label ?? ''
    toast({ tone: 'info', title: 'Autoexclusión activada', body: `Has pausado tu acceso al juego (${label}).` })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Tu bienestar primero"
        title="Juego responsable"
        subtitle="El juego debe ser un entretenimiento, nunca una salida. Aquí tienes herramientas para mantener el control."
      />

      {/* Intro / compromiso */}
      <Card className="mb-6 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-neon-green/15 text-neon-green">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Nuestro compromiso</h2>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">
              En Juégatela queremos que disfrutes de los retos y las porras con tus amigos sin que el juego se
              convierta en un problema. Ponemos a tu disposición límites, recordatorios y herramientas de
              autocontrol, y te animamos a usarlas. Recuerda que estás en modo demo con fichas ficticias: aquí no
              hay dinero real en juego, pero los buenos hábitos se entrenan desde ahora.
            </p>
            <div className="mt-3">
              <Chip tone="amber">Solo +18</Chip>
            </div>
          </div>
        </div>
      </Card>

      {/* Límites */}
      <section className="mb-6">
        <h2 className="neon-title mb-4 text-2xl text-zinc-100">Tus límites</h2>
        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Wallet size={18} className="text-neon-blue" />
              <h3 className="font-bold text-zinc-100">Límites de depósito</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">Diario</label>
                <input className="input" type="number" min={0} placeholder="Sin límite" value={limits.daily} onChange={(e) => setLimits({ ...limits, daily: e.target.value })} />
              </div>
              <div>
                <label className="label">Semanal</label>
                <input className="input" type="number" min={0} placeholder="Sin límite" value={limits.weekly} onChange={(e) => setLimits({ ...limits, weekly: e.target.value })} />
              </div>
              <div>
                <label className="label">Mensual</label>
                <input className="input" type="number" min={0} placeholder="Sin límite" value={limits.monthly} onChange={(e) => setLimits({ ...limits, monthly: e.target.value })} />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <TrendingDown size={18} className="text-neon-red" />
              <h3 className="font-bold text-zinc-100">Límite de pérdidas</h3>
            </div>
            <div className="sm:max-w-xs">
              <label className="label">Pérdida máxima por semana (fichas)</label>
              <input className="input" type="number" min={0} placeholder="Sin límite" value={limits.loss} onChange={(e) => setLimits({ ...limits, loss: e.target.value })} />
            </div>
            <p className="mt-2 text-[11px] text-zinc-500">Cuando alcances el límite, no podrás iniciar nuevos retos hasta el siguiente periodo.</p>
          </Card>

          <Card className="p-5">
            <div className="mb-1 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Timer size={18} className="text-neon-amber" />
                <h3 className="font-bold text-zinc-100">Límite de tiempo de sesión</h3>
              </div>
              <Toggle checked={sessionOn} onChange={setSessionOn} />
            </div>
            <p className="text-sm text-zinc-400">Te avisamos cuando lleves demasiado tiempo seguido jugando.</p>
            {sessionOn && (
              <div className="mt-3 sm:max-w-xs">
                <label className="label">Aviso cada (minutos)</label>
                <input className="input" type="number" min={5} value={sessionMins} onChange={(e) => setSessionMins(e.target.value)} />
              </div>
            )}
          </Card>

          <div>
            <Button onClick={saveLimits}>Guardar límites</Button>
          </div>
        </div>
      </section>

      {/* Pausa y autoexclusión */}
      <section className="mb-6">
        <h2 className="neon-title mb-4 text-2xl text-zinc-100">Tomar distancia</h2>
        <div className="grid gap-4">
          <Card className="p-5">
            <div className="mb-1 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <PauseCircle size={18} className="text-neon-blue" />
                <h3 className="font-bold text-zinc-100">Pausa temporal</h3>
              </div>
              <Toggle checked={pauseOn} onChange={(v) => { setPauseOn(v); toast({ tone: 'info', title: v ? 'Pausa activada' : 'Pausa desactivada', body: v ? 'No recibirás invitaciones a retos por ahora.' : 'Vuelves a estar disponible.' }) }} />
            </div>
            <p className="text-sm text-zinc-400">Oculta retos y porras y silencia las invitaciones durante un tiempo. Puedes reactivarlo cuando quieras.</p>
          </Card>

          <Card className="border-neon-red/30 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Ban size={18} className="text-neon-red" />
              <h3 className="font-bold text-zinc-100">Autoexclusión</h3>
            </div>
            <p className="mb-3 text-sm text-zinc-400">
              Bloquea por completo tu acceso al juego durante el periodo que elijas. Es una medida seria: durante ese
              tiempo no podrás revertirla.
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {SELF_EXCLUDE.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setExclude(s.id)}
                  className={cn(
                    'chip transition',
                    exclude === s.id
                      ? 'border border-neon-red/40 bg-neon-red/15 text-neon-red'
                      : 'border border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-200'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <Button
              className="!bg-none !bg-neon-red/15 !text-neon-red border border-neon-red/30"
              disabled={!exclude}
              onClick={() => setExcludeOpen(true)}
            >
              Activar autoexclusión
            </Button>
          </Card>
        </div>
      </section>

      {/* Test de autoevaluación */}
      <section className="mb-6">
        <h2 className="neon-title mb-4 text-2xl text-zinc-100">Test de autoevaluación</h2>
        <Card className="p-5 sm:p-6">
          <div className="mb-2 flex items-center gap-2">
            <ClipboardCheck size={18} className="text-neon-purple" />
            <p className="text-sm text-zinc-400">Responde con sinceridad. Es anónimo y solo para ti.</p>
          </div>
          <div className="divide-y divide-white/5">
            {QUESTIONS.map((q, i) => (
              <label key={i} className="flex cursor-pointer items-center justify-between gap-4 py-3">
                <span className="text-sm text-zinc-200">{q}</span>
                <input
                  type="checkbox"
                  checked={answers[i]}
                  onChange={(e) => {
                    const next = [...answers]
                    next[i] = e.target.checked
                    setAnswers(next)
                    setShowResult(false)
                  }}
                  className="h-5 w-5 shrink-0 accent-neon-purple"
                />
              </label>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="ghost" onClick={() => setShowResult(true)}>Ver recomendación</Button>
          </div>
          {showResult && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <Card className={cn(
                'p-4',
                verdict.tone === 'green' && 'border-neon-green/30',
                verdict.tone === 'amber' && 'border-neon-amber/30',
                verdict.tone === 'red' && 'border-neon-red/30'
              )}>
                <div className="flex items-center gap-2">
                  <Chip tone={verdict.tone}>{score} de {QUESTIONS.length}</Chip>
                  <h3 className="font-bold text-zinc-100">{verdict.title}</h3>
                </div>
                <p className="mt-2 text-sm text-zinc-400">{verdict.body}</p>
              </Card>
            </motion.div>
          )}
        </Card>
      </section>

      {/* Señales de alerta */}
      <section className="mb-6">
        <h2 className="neon-title mb-4 text-2xl text-zinc-100">Señales de alerta</h2>
        <Card className="p-5">
          <ul className="space-y-2.5">
            {SIGNALS.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-zinc-300">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-neon-amber" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Recursos de ayuda */}
      <section className="mb-6">
        <h2 className="neon-title mb-4 text-2xl text-zinc-100">Recursos y ayuda</h2>
        {RESOURCES.length === 0 ? (
          <EmptyState icon="🤝" title="Sin recursos cargados" body="Pronto añadiremos organizaciones de apoyo." />
        ) : (
          <div className="space-y-3">
            {RESOURCES.map((r) => (
              <Card key={r.name} className="flex items-start gap-3 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-neon-green/15 text-neon-green">
                  <Phone size={18} />
                </div>
                <div>
                  <div className="font-bold text-zinc-100">{r.name}</div>
                  <div className="text-sm text-zinc-400">{r.detail}</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Aviso final */}
      <Card glow="shadow-neon-amber/20" className="border-neon-amber/30 p-5 text-center">
        <p className="text-sm text-zinc-300">
          Solo para mayores de 18 años. En Juégatela juegas con fichas demo: no se mueve dinero real. Si en algún
          momento necesitas ayuda, pídela. Pedirla es de valientes.
        </p>
        <div className="mt-3">
          <Link to="/soporte" className="btn-ghost">Hablar con soporte</Link>
        </div>
      </Card>

      {/* Modal confirmación autoexclusión */}
      <Modal
        open={excludeOpen}
        onClose={() => setExcludeOpen(false)}
        title="Confirmar autoexclusión"
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setExcludeOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1 !bg-none !bg-neon-red/15 !text-neon-red border border-neon-red/30"
              onClick={confirmExclude}
            >
              Confirmar
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Ban size={20} className="text-neon-red" />
            <p className="font-bold text-zinc-100">
              {SELF_EXCLUDE.find((s) => s.id === exclude)?.label}
            </p>
          </div>
          <p className="text-sm text-zinc-300">
            Vas a bloquear tu acceso al juego durante este periodo. No podrás iniciar retos ni porras y la medida no
            se puede revertir antes de tiempo. ¿Quieres continuar?
          </p>
        </div>
      </Modal>
    </div>
  )
}
