import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User as UserIcon,
  Smile,
  ShieldCheck,
  Bell,
  Eye,
  SlidersHorizontal,
  AlertOctagon,
  LogOut,
} from 'lucide-react'
import { Card, Button, SectionTitle, Chip } from '@/components/ui/Primitives'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/shared'
import { useStore } from '@/store/useStore'
import { ME } from '@/lib/mockData'
import { cn } from '@/lib/utils'

// ── Local neon toggle ──────────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-2.5">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-zinc-200">{label}</span>
        {hint && <span className="block text-[11px] text-zinc-500">{hint}</span>}
      </span>
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
    </label>
  )
}

const AVATARS = ['🎭', '🦊', '🐺', '🐉', '🦅', '🐍', '🦂', '🐙', '🦈', '🐲', '🦇', '🐯', '🦁', '👑', '🃏', '🎰']

export default function SettingsPage() {
  const navigate = useNavigate()
  const toast = useStore((s) => s.toast)
  const resetDemo = useStore((s) => s.resetDemo)
  const logout = useStore((s) => s.logout)

  const [avatar, setAvatar] = useState(ME.avatar)
  const [twoFa, setTwoFa] = useState(false)
  const [notif, setNotif] = useState({ retos: true, porras: true, partidas: true, marketing: false })
  const [privacy, setPrivacy] = useState({ historial: false, perfil: true })
  const [prefs, setPrefs] = useState({ idioma: 'es', sonidos: true })
  const [resetOpen, setResetOpen] = useState(false)

  const saved = (msg = 'Guardamos tus cambios.') =>
    toast({ tone: 'success', title: 'Hecho', body: msg })

  const sectionCls = 'p-5 sm:p-6'

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Tu rincón del bar"
        title="Ajustes"
        subtitle="Configura tu cuenta, tu seguridad y cómo te avisamos. Estás en modo demo: nada de dinero real."
      />

      <div className="space-y-6">
        {/* Cuenta */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={sectionCls}>
            <SectionTitle eyebrow="Cuenta" title="Tus datos" action={<UserIcon className="text-neon-purple" size={22} />} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Nombre visible</label>
                <input className="input" defaultValue={ME.displayName} />
              </div>
              <div>
                <label className="label">Usuario</label>
                <input className="input" defaultValue={`@${ME.username}`} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" defaultValue="tu_alias@juegatela.demo" />
              </div>
              <div>
                <label className="label">País</label>
                <select className="input" defaultValue={ME.country}>
                  <option value="ES">España</option>
                  <option value="MX">México</option>
                  <option value="AR">Argentina</option>
                  <option value="CO">Colombia</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={() => saved('Datos de cuenta actualizados.')}>Guardar cambios</Button>
            </div>
          </Card>
        </motion.div>

        {/* Avatar */}
        <Card className={sectionCls}>
          <SectionTitle eyebrow="Identidad" title="Tu avatar" action={<Smile className="text-neon-blue" size={22} />} />
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={cn(
                  'grid h-12 w-12 place-items-center rounded-xl border text-2xl transition',
                  avatar === a
                    ? 'border-neon-purple/60 bg-neon-purple/15 shadow-[0_0_14px_-2px_rgba(177,75,255,0.6)]'
                    : 'border-white/10 bg-white/[0.03] hover:bg-white/10'
                )}
              >
                {a}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="ghost" onClick={() => saved('Avatar actualizado.')}>Usar este avatar</Button>
          </div>
        </Card>

        {/* Seguridad */}
        <Card className={sectionCls}>
          <SectionTitle eyebrow="Seguridad" title="Acceso y contraseña" action={<ShieldCheck className="text-neon-green" size={22} />} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Contraseña actual</label>
              <input className="input" type="password" placeholder="••••••••" />
            </div>
            <div>
              <label className="label">Nueva contraseña</label>
              <input className="input" type="password" placeholder="Mínimo 8 caracteres" />
            </div>
          </div>
          <div className="mt-2 divide-y divide-white/5 border-t border-white/5 pt-2">
            <Toggle
              checked={twoFa}
              onChange={setTwoFa}
              label="Verificación en dos pasos (2FA)"
              hint="Añade un código extra al iniciar sesión. Recomendado."
            />
          </div>
          <div className="mt-4">
            <Button onClick={() => saved('Seguridad actualizada.')}>Actualizar contraseña</Button>
          </div>
        </Card>

        {/* Notificaciones */}
        <Card className={sectionCls}>
          <SectionTitle eyebrow="Avisos" title="Notificaciones" action={<Bell className="text-neon-amber" size={22} />} />
          <div className="divide-y divide-white/5">
            <Toggle checked={notif.retos} onChange={(v) => setNotif({ ...notif, retos: v })} label="Retos" hint="Cuando alguien te reta o acepta un reto." />
            <Toggle checked={notif.porras} onChange={(v) => setNotif({ ...notif, porras: v })} label="Porras" hint="Cierres, resultados y nuevas porras de tu grupo." />
            <Toggle checked={notif.partidas} onChange={(v) => setNotif({ ...notif, partidas: v })} label="Partidas" hint="Resultados y emparejamientos." />
            <Toggle checked={notif.marketing} onChange={(v) => setNotif({ ...notif, marketing: v })} label="Novedades y promos" hint="Noticias del bar. Puedes desactivarlas sin problema." />
          </div>
        </Card>

        {/* Privacidad */}
        <Card className={sectionCls}>
          <SectionTitle eyebrow="Privacidad" title="Quién te ve" action={<Eye className="text-neon-purple" size={22} />} />
          <div className="divide-y divide-white/5">
            <Toggle checked={privacy.historial} onChange={(v) => setPrivacy({ ...privacy, historial: v })} label="Historial público" hint="Permite que otros vean tus partidas." />
            <Toggle checked={privacy.perfil} onChange={(v) => setPrivacy({ ...privacy, perfil: v })} label="Perfil visible" hint="Apareces en búsquedas y rankings." />
          </div>
        </Card>

        {/* Preferencias */}
        <Card className={sectionCls}>
          <SectionTitle eyebrow="Preferencias" title="Experiencia" action={<SlidersHorizontal className="text-neon-blue" size={22} />} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Idioma</label>
              <select
                className="input"
                value={prefs.idioma}
                onChange={(e) => setPrefs({ ...prefs, idioma: e.target.value })}
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>
            <div>
              <label className="label">Tema</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900/80 px-4 py-2.5 text-sm text-zinc-300">
                <span>Oscuro neón</span>
                <Chip tone="purple">fijo</Chip>
              </div>
            </div>
          </div>
          <div className="mt-2 divide-y divide-white/5 border-t border-white/5 pt-2">
            <Toggle checked={prefs.sonidos} onChange={(v) => setPrefs({ ...prefs, sonidos: v })} label="Sonidos y efectos" hint="Música de bar y efectos en las partidas." />
          </div>
        </Card>

        {/* Zona demo */}
        <Card className={cn(sectionCls, 'border-neon-amber/25')}>
          <SectionTitle eyebrow="Modo demo" title="Zona de reinicio" action={<AlertOctagon className="text-neon-amber" size={22} />} />
          <p className="mb-4 text-sm text-zinc-400">
            Reinicia tu saldo de fichas demo, retos, porras y notificaciones a su estado inicial. No afecta a tu cuenta.
          </p>
          <Button variant="ghost" onClick={() => setResetOpen(true)}>Reiniciar demo</Button>
        </Card>

        {/* Sesión */}
        <Card className={sectionCls}>
          <SectionTitle eyebrow="Sesión" title="Cerrar sesión" action={<LogOut className="text-neon-red" size={22} />} />
          <p className="mb-4 text-sm text-zinc-400">Saldrás del bar. Tus datos demo se conservan para la próxima.</p>
          <Button
            className="!bg-none !bg-neon-red/15 !text-neon-red border border-neon-red/30"
            onClick={() => {
              logout()
              toast({ tone: 'info', title: 'Hasta pronto', body: 'Has cerrado sesión.' })
              navigate('/')
            }}
          >
            Cerrar sesión
          </Button>
        </Card>
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="¿Reiniciar la demo?"
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setResetOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                resetDemo()
                setResetOpen(false)
              }}
            >
              Sí, reiniciar
            </Button>
          </div>
        }
      >
        <p className="text-sm text-zinc-300">
          Se restaurarán tu saldo de fichas demo, retos, porras y notificaciones al estado inicial. Esta acción no se
          puede deshacer.
        </p>
      </Modal>
    </div>
  )
}
