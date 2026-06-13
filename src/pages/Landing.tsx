import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Swords,
  Dices,
  Gamepad2,
  Lock,
  ShieldCheck,
  Trophy,
  ArrowRight,
  Coins,
  Users,
  CheckCircle2,
} from 'lucide-react'
import { GAMES, accentClasses } from '@/lib/games'
import { cn } from '@/lib/utils'

function Neon({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('neon-title', className)}>{children}</span>
}

export default function Landing() {
  return (
    <div className="smoke min-h-screen overflow-hidden">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Neon className="text-2xl text-neon-red">JUÉGATELA</Neon>
            <span className="h-2 w-2 animate-pulse-glow rounded-full bg-neon-green shadow-neon-green" />
          </div>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-zinc-400 md:flex">
            <a href="#como" className="hover:text-white">Cómo funciona</a>
            <a href="#juegos" className="hover:text-white">Juegos</a>
            <a href="#seguridad" className="hover:text-white">Seguridad</a>
            <Link to="/explorar" className="hover:text-white">Explorar</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/entrar" className="btn-ghost hidden sm:inline-flex">Entrar</Link>
            <Link to="/registro" className="btn-primary">Crear cuenta</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-neon-red/20 blur-[120px]" />
          <div className="absolute right-1/4 top-32 h-72 w-72 rounded-full bg-neon-blue/20 blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-neon-purple/20 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-neon-green/30 bg-neon-green/10 px-4 py-1.5 text-xs font-semibold text-neon-green"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-green" />
            Prototipo en modo seguro · saldo 100% ficticio
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="neon-title text-5xl leading-[0.95] text-zinc-50 sm:text-7xl md:text-8xl"
          >
            Si te la juegas,
            <br />
            <span className="text-neon-red text-glow-red">que se pague.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mx-auto mt-5 max-w-2xl text-base text-zinc-400 sm:text-lg"
          >
            Reta a tus amigos, crea porras y juega arcade en el bar más clandestino de internet.
            El dinero se habla antes, se <span className="text-neon-amber font-semibold">bloquea al aceptar</span> y
            se <span className="text-neon-green font-semibold">paga al ganar</span>. Sin excusas. Sin Bizums que nunca llegan.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link to="/app" className="btn-primary w-full px-7 py-3 text-base sm:w-auto">
              Entrar al bar <ArrowRight size={18} />
            </Link>
            <Link to="/sala" className="btn-neon w-full px-7 py-3 text-base sm:w-auto">
              Probar juegos <Gamepad2 size={18} />
            </Link>
            <Link to="/registro" className="btn-ghost w-full px-7 py-3 text-base sm:w-auto">
              Crear cuenta
            </Link>
          </motion.div>
          <p className="mt-4 text-[11px] text-zinc-600">
            +18 · Juega con cabeza · El dinero real solo se activa tras verificación y cumplimiento legal.
          </p>

          {/* floating mock stats */}
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { k: '12.4k', v: 'retos pagados', i: Swords, c: 'text-neon-red' },
              { k: '3.1k', v: 'porras activas', i: Dices, c: 'text-neon-blue' },
              { k: '47', v: 'juegos y modos', i: Gamepad2, c: 'text-neon-green' },
              { k: '0€', v: 'que nunca llegan', i: Coins, c: 'text-neon-amber' },
            ].map((s, i) => (
              <motion.div
                key={s.v}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="glass rounded-2xl p-4"
              >
                <s.i className={cn('mx-auto mb-1', s.c)} size={20} />
                <div className={cn('text-2xl font-extrabold', s.c)}>{s.k}</div>
                <div className="text-[11px] uppercase tracking-wide text-zinc-500">{s.v}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <Section id="como" eyebrow="Cómo funciona" title="Cuatro pasos. Cero discusiones.">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { n: '01', t: 'Lanza el reto', d: 'Define la apuesta, qué defiende cada uno y cuánto se juega.', i: Swords, c: 'red' },
            { n: '02', t: 'Se bloquea el saldo', d: 'Al aceptar, las fichas de ambos quedan retenidas. Nadie toca el bote.', i: Lock, c: 'amber' },
            { n: '03', t: 'Se verifica el resultado', d: 'Auto, por consenso, prueba o árbitro. Reglas claras antes de empezar.', i: ShieldCheck, c: 'blue' },
            { n: '04', t: 'Cobra el ganador', d: 'El bote se libera automáticamente a quien gana. Sin esperas.', i: Trophy, c: 'green' },
          ].map((s) => {
            const a = accentClasses[s.c as 'red']
            return (
              <div key={s.n} className={cn('glass glass-hover rounded-2xl p-5', a.border)}>
                <div className="flex items-center justify-between">
                  <div className={cn('grid h-11 w-11 place-items-center rounded-xl', a.bg, a.text)}>
                    <s.i size={20} />
                  </div>
                  <span className="neon-title text-3xl text-white/10">{s.n}</span>
                </div>
                <h3 className={cn('mt-3 font-bold', a.text)}>{s.t}</h3>
                <p className="mt-1 text-sm text-zinc-400">{s.d}</p>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Juegos */}
      <Section id="juegos" eyebrow="La Sala de Juegos" title="Arcade clandestino, jugable ya">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GAMES.slice(0, 8).map((g) => {
            const a = accentClasses[g.accent]
            return (
              <Link key={g.id} to={`/sala/${g.id}`} className={cn('glass glass-hover relative overflow-hidden rounded-2xl p-5', a.border)}>
                <div className={cn('absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br blur-2xl', a.from, 'to-transparent')} />
                <div className="text-3xl">{g.emoji}</div>
                <h3 className={cn('mt-2 font-bold', a.text)}>{g.name}</h3>
                <p className="text-xs text-zinc-400">{g.tagline}</p>
                {g.playable && <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-wide text-neon-green">● Jugable</span>}
              </Link>
            )
          })}
        </div>
        <div className="mt-6 text-center">
          <Link to="/sala" className="btn-neon">Ver toda la sala <ArrowRight size={16} /></Link>
        </div>
      </Section>

      {/* Apuestas + Porras */}
      <Section eyebrow="Entre amigos" title="Apuestas privadas y porras grupales">
        <div className="grid gap-4 md:grid-cols-2">
          <FeatureBlock
            icon={Swords}
            accent="red"
            title="Apuestas privadas"
            text="“Me apuesto 5€ a que España gana el lunes.” Lanza el reto a un amigo, fija las reglas y deja que el dinero se pague solo cuando se verifique."
            points={['Deporte, eventos, retos personales o predicciones', 'Estados claros: pendiente, activa, en verificación, ganada', 'Disputa y reembolso si algo no cuadra']}
          />
          <FeatureBlock
            icon={Dices}
            accent="blue"
            title="Porras grupales"
            text="Resultado exacto, quién gana la final, cuántos goles, quién llega tarde a la cena… Monta una porra para tu grupo y reparte el bote automáticamente."
            points={['Ganador único, varios ganadores o reparto proporcional', 'Entrada fija por persona', 'Cierre y verificación con un toque']}
          />
        </div>
      </Section>

      {/* Seguridad */}
      <section id="seguridad" className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="glass overflow-hidden rounded-3xl p-8 sm:p-12">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-neon-green/80">
                Saldo bloqueado · Juego responsable
              </div>
              <h2 className="neon-title mt-1 text-3xl text-zinc-50 sm:text-4xl">
                La casa no decide. <span className="text-neon-green">Las reglas están claras antes de empezar.</span>
              </h2>
              <p className="mt-3 text-sm text-zinc-400">
                Juégatela arranca como prototipo en modo seguro con fichas ficticias. El dinero real,
                depósitos y retiradas solo se activan tras licencias, verificación de edad, KYC y
                revisión legal. Preparado conceptualmente para Stripe, Apple Pay, Google Pay y PayPal.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['+18 obligatorio', 'Límites de gasto', 'Autoexclusión', 'Anti-fraude', 'KYC', 'Geobloqueo'].map((t) => (
                  <span key={t} className="chip border border-neon-green/30 bg-neon-green/10 text-neon-green">{t}</span>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {[
                { t: 'Fondos bloqueados', d: 'El bote se retiene al aceptar y nadie puede tocarlo.', i: Lock },
                { t: 'Verificación transparente', d: 'Auto, consenso, prueba o árbitro. Tú eliges.', i: ShieldCheck },
                { t: 'Comunidad y disputas', d: 'Reporta, disputa y resuelve con historial visible.', i: Users },
              ].map((s) => (
                <div key={s.t} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-neon-green/15 text-neon-green">
                    <s.i size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-zinc-100">{s.t}</div>
                    <div className="text-sm text-zinc-400">{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-neon-red/30 bg-gradient-to-br from-neon-red/15 via-neon-purple/10 to-ink-900 p-10 text-center">
          <h2 className="neon-title text-4xl text-zinc-50 sm:text-5xl">¿Te la juegas?</h2>
          <p className="mx-auto mt-2 max-w-xl text-zinc-300">
            Entra al bar, busca rival y demuestra de qué vas. Empieza gratis con fichas demo.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/registro" className="btn-primary px-7 py-3 text-base">Crear cuenta gratis</Link>
            <Link to="/app" className="btn-ghost px-7 py-3 text-base">Entrar como invitado</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="mb-8 text-center">
        <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-neon-purple/80">{eyebrow}</div>
        <h2 className="neon-title mt-1 text-3xl text-zinc-50 sm:text-4xl">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function FeatureBlock({
  icon: Icon,
  accent,
  title,
  text,
  points,
}: {
  icon: typeof Swords
  accent: 'red' | 'blue'
  title: string
  text: string
  points: string[]
}) {
  const a = accentClasses[accent]
  return (
    <div className={cn('glass rounded-2xl p-6', a.border)}>
      <div className={cn('grid h-12 w-12 place-items-center rounded-xl', a.bg, a.text)}>
        <Icon size={22} />
      </div>
      <h3 className={cn('mt-4 text-xl font-bold', a.text)}>{title}</h3>
      <p className="mt-2 text-sm text-zinc-400">{text}</p>
      <ul className="mt-4 space-y-2">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2 text-sm text-zinc-300">
            <CheckCircle2 size={16} className={cn('mt-0.5 shrink-0', a.text)} />
            {p}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink-950/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="neon-title text-xl text-neon-red">JUÉGATELA</span>
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            El bar donde las apuestas entre amigos por fin se pagan. Prototipo en modo seguro.
          </p>
        </div>
        <FooterCol title="Producto" links={[['Sala de Juegos', '/sala'], ['Retos', '/retos'], ['Porras', '/porras'], ['Ranking', '/ranking']]} />
        <FooterCol title="Legal" links={[['Términos', '/legal'], ['Privacidad', '/legal'], ['Juego responsable', '/juego-responsable'], ['Soporte', '/soporte']]} />
        <FooterCol title="Cuenta" links={[['Entrar', '/entrar'], ['Crear cuenta', '/registro'], ['Wallet', '/wallet'], ['Panel admin', '/admin']]} />
      </div>
      <div className="border-t border-white/5 px-6 py-5 text-center text-[11px] text-zinc-600">
        © {new Date().getFullYear()} Juégatela · +18 · Juega con cabeza. Saldo ficticio en modo demo. Dinero real sujeto a licencias y verificación.
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-zinc-400">{title}</h4>
      <ul className="space-y-2 text-sm text-zinc-500">
        {links.map(([l, to]) => (
          <li key={l}>
            <Link to={to} className="hover:text-neon-red">{l}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
