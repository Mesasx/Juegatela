import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Calendar, Globe, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

type Mode = 'login' | 'register' | 'recover'

export default function Auth({ mode }: { mode: Mode }) {
  const navigate = useNavigate()
  const login = useStore((s) => s.login)
  const enterGuest = useStore((s) => s.enterGuest)
  const toast = useStore((s) => s.toast)
  const [showPw, setShowPw] = useState(false)
  const [agree, setAgree] = useState(false)
  const [responsible, setResponsible] = useState(false)
  const [adult, setAdult] = useState(false)

  const titles: Record<Mode, string> = {
    login: 'Entrar al bar',
    register: 'Únete al bar',
    recover: 'Recuperar acceso',
  }
  const subtitles: Record<Mode, string> = {
    login: 'Tu mesa te está esperando.',
    register: 'Crea tu alias y empieza con fichas demo gratis.',
    recover: 'Te enviaremos un enlace para volver a entrar.',
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'recover') {
      toast({ tone: 'info', title: 'Correo enviado', body: 'Revisa tu bandeja (simulado en demo).' })
      navigate('/entrar')
      return
    }
    if (mode === 'register' && (!agree || !responsible || !adult)) {
      toast({ tone: 'error', title: 'Faltan confirmaciones', body: 'Acepta las condiciones, +18 y juego responsable.' })
      return
    }
    login()
    navigate('/app')
  }

  return (
    <div className="smoke relative grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/5 bg-ink-900/60 p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-neon-red/20 blur-[120px]" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-neon-blue/20 blur-[120px]" />
        </div>
        <Link to="/" className="relative flex items-center gap-2">
          <span className="neon-title text-3xl text-neon-red">JUÉGATELA</span>
          <span className="h-2 w-2 animate-pulse-glow rounded-full bg-neon-green shadow-neon-green" />
        </Link>
        <div className="relative">
          <h2 className="neon-title text-5xl leading-tight text-zinc-50">
            El dinero se habla antes,
            <br />
            <span className="text-neon-green">se bloquea al aceptar</span>
            <br />
            y se paga al ganar.
          </h2>
          <p className="mt-4 max-w-md text-zinc-400">
            Reta a tus amigos, monta porras y juega arcade. Sin Bizums que nunca llegan.
          </p>
        </div>
        <div className="relative flex items-center gap-3 text-xs text-zinc-500">
          <ShieldCheck size={16} className="text-neon-green" />
          Modo seguro · fichas ficticias · +18 · dinero real solo tras verificación
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <span className="neon-title text-2xl text-neon-red">JUÉGATELA</span>
            </Link>
          </div>

          {/* Tabs */}
          {mode !== 'recover' && (
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-ink-900/60 p-1">
              <Link
                to="/entrar"
                className={cn(
                  'rounded-lg py-2 text-center text-sm font-bold transition',
                  mode === 'login' ? 'bg-neon-red/15 text-neon-red' : 'text-zinc-400 hover:text-white'
                )}
              >
                Entrar
              </Link>
              <Link
                to="/registro"
                className={cn(
                  'rounded-lg py-2 text-center text-sm font-bold transition',
                  mode === 'register' ? 'bg-neon-red/15 text-neon-red' : 'text-zinc-400 hover:text-white'
                )}
              >
                Crear cuenta
              </Link>
            </div>
          )}

          <h1 className="neon-title text-4xl text-zinc-50">{titles[mode]}</h1>
          <p className="mt-1 text-sm text-zinc-400">{subtitles[mode]}</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === 'register' && (
              <Field icon={User} label="Nombre de usuario" placeholder="tu_alias" />
            )}
            <Field icon={Mail} label="Email" type="email" placeholder="tu@email.com" />
            {mode !== 'recover' && (
              <div>
                <label className="label">Contraseña</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <Field icon={Calendar} label="Fecha de nacimiento" type="date" />
                <div>
                  <label className="label">País / Región</label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <select className="input appearance-none pl-9">
                      <option>España</option>
                      <option>México</option>
                      <option>Argentina</option>
                      <option>Colombia</option>
                      <option>Chile</option>
                      <option>Otro</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-2 rounded-xl border border-white/10 bg-ink-900/50 p-3">
                <Check label={<>Soy mayor de edad (+18) y la información es veraz.</>} checked={adult} onChange={setAdult} />
                <Check label={<>Acepto los <Link to="/legal" className="text-neon-blue hover:underline">Términos</Link> y la <Link to="/legal" className="text-neon-blue hover:underline">Privacidad</Link>.</>} checked={agree} onChange={setAgree} />
                <Check label={<>He leído las normas de <Link to="/juego-responsable" className="text-neon-green hover:underline">juego responsable</Link>.</>} checked={responsible} onChange={setResponsible} />
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <Link to="/recuperar" className="text-xs font-semibold text-neon-blue hover:underline">
                  ¿Olvidaste la contraseña?
                </Link>
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3 text-base">
              {mode === 'login' ? 'Entrar' : mode === 'register' ? 'Crear cuenta' : 'Enviar enlace'}
              <ArrowRight size={18} />
            </button>
          </form>

          {mode !== 'recover' && (
            <>
              <div className="my-5 flex items-center gap-3 text-xs text-zinc-600">
                <div className="h-px flex-1 bg-white/10" /> o <div className="h-px flex-1 bg-white/10" />
              </div>
              <button
                onClick={() => {
                  enterGuest()
                  navigate('/app')
                }}
                className="btn-ghost w-full py-3"
              >
                Entrar como invitado
              </button>
              <p className="mt-3 text-center text-[11px] text-zinc-600">
                Como invitado puedes explorar y practicar. Para apostar necesitas cuenta y verificación.
              </p>
            </>
          )}

          {mode === 'recover' && (
            <p className="mt-5 text-center text-sm text-zinc-500">
              ¿Ya te acordaste? <Link to="/entrar" className="text-neon-red hover:underline">Entrar</Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function Field({
  icon: Icon,
  label,
  type = 'text',
  placeholder,
}: {
  icon: typeof Mail
  label: string
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input type={type} placeholder={placeholder} className="input pl-9" />
      </div>
    </div>
  )
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: React.ReactNode
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-xs text-zinc-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-neon-red"
      />
      <span>{label}</span>
    </label>
  )
}
