import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Users, Swords, Dices, Gamepad2, Receipt, Flag,
  Settings2, Activity, ShieldAlert, TrendingUp, Power, Globe, Percent,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { PageHeader } from '@/components/shared'
import { Card, Chip, Avatar } from '@/components/ui/Primitives'
import { Modal } from '@/components/ui/Modal'
import { FRIENDS, ME, RANKING } from '@/lib/mockData'
import { challengeStatus, porraStatus } from '@/lib/status'
import { cn, fichas, fmtDate } from '@/lib/utils'

const TABS = [
  { id: 'metrics', label: 'Métricas', icon: LayoutDashboard },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'challenges', label: 'Apuestas', icon: Swords },
  { id: 'porras', label: 'Porras', icon: Dices },
  { id: 'tx', label: 'Transacciones', icon: Receipt },
  { id: 'disputes', label: 'Disputas', icon: Flag },
  { id: 'suspicious', label: 'Actividad', icon: Activity },
  { id: 'config', label: 'Configuración', icon: Settings2 },
]

export default function Admin() {
  const challenges = useStore((s) => s.challenges)
  const porras = useStore((s) => s.porras)
  const transactions = useStore((s) => s.transactions)
  const realMode = useStore((s) => s.realMode)
  const setRealMode = useStore((s) => s.setRealMode)
  const updateChallenge = useStore((s) => s.updateChallenge)
  const toast = useStore((s) => s.toast)
  const [tab, setTab] = useState('metrics')
  const [confirmReal, setConfirmReal] = useState(false)

  const allUsers = [ME, ...FRIENDS]
  const disputes = challenges.filter((c) => c.status === 'disputed')

  return (
    <div>
      <PageHeader
        eyebrow="Backoffice"
        title="Panel Admin"
        subtitle="Operación, cumplimiento y control de la plataforma. Vista de demostración."
        action={
          <Chip tone={realMode ? 'red' : 'green'}>
            {realMode ? '⚠ Dinero real ON' : '● Modo seguro'}
          </Chip>
        }
      />

      <div className="scrollbar-none mb-5 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn('chip flex items-center gap-1.5 whitespace-nowrap border transition', tab === t.id ? 'border-neon-purple/50 bg-neon-purple/15 text-neon-purple' : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white')}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {tab === 'metrics' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: 'Usuarios activos', value: '1.284', c: 'text-neon-blue', icon: Users, sub: '+8% semana' },
                { label: 'Apuestas activas', value: challenges.filter((c) => c.status === 'active').length + 312, c: 'text-neon-red', icon: Swords, sub: 'en curso' },
                { label: 'Volumen (fichas)', value: '48.2k', c: 'text-neon-amber', icon: TrendingUp, sub: 'últimas 24h' },
                { label: 'Comisión generada', value: '2.4k', c: 'text-neon-green', icon: Percent, sub: '5% medio' },
              ].map((m) => (
                <Card key={m.label} className="p-4">
                  <m.icon size={18} className={m.c} />
                  <div className={cn('mt-2 text-2xl font-extrabold', m.c)}>{m.value}</div>
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500">{m.label}</div>
                  <div className="text-[10px] text-zinc-600">{m.sub}</div>
                </Card>
              ))}
            </div>
            <Card className="p-5">
              <h3 className="mb-3 font-bold text-zinc-100">Actividad por juego (demo)</h3>
              <div className="space-y-2">
                {[['Neón Pong', 82, 'bg-neon-blue'], ['Billar de Trastienda', 64, 'bg-neon-green'], ['Mano Fría', 91, 'bg-neon-red'], ['Porras', 47, 'bg-neon-purple']].map(([n, v, c]) => (
                  <div key={n as string}>
                    <div className="mb-1 flex justify-between text-xs"><span className="text-zinc-300">{n}</span><span className="text-zinc-500">{v}%</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5"><div className={cn('h-full rounded-full', c as string)} style={{ width: `${v}%` }} /></div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === 'users' && (
          <Card className="divide-y divide-white/5">
            {allUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3">
                <Avatar seed={u.avatar} size={40} online={u.online} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5"><span className="font-semibold text-zinc-100">{u.displayName}</span>{u.verified && <Chip tone="blue">KYC ✓</Chip>}</div>
                  <div className="text-[11px] text-zinc-500">@{u.username} · Nivel {u.level} · {u.country}</div>
                </div>
                <div className="hidden text-right text-xs text-zinc-500 sm:block">
                  <div>{u.wins}V / {u.losses}D</div>
                </div>
                <button onClick={() => toast({ tone: 'info', title: 'Usuario suspendido', body: `${u.displayName} suspendido (demo).` })} className="btn-ghost px-3 py-1.5 text-xs text-neon-red">Suspender</button>
              </div>
            ))}
          </Card>
        )}

        {tab === 'challenges' && (
          <Card className="divide-y divide-white/5">
            {challenges.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-zinc-100">{c.title}</div>
                  <div className="text-[11px] text-zinc-500">{fichas(c.stake)} · bote {c.stake * 2}</div>
                </div>
                <Chip tone={challengeStatus[c.status].tone}>{challengeStatus[c.status].label}</Chip>
              </div>
            ))}
          </Card>
        )}

        {tab === 'porras' && (
          <Card className="divide-y divide-white/5">
            {porras.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-zinc-100">{p.title}</div>
                  <div className="text-[11px] text-zinc-500">{p.groupName} · entrada {fichas(p.entry)}</div>
                </div>
                <Chip tone={porraStatus[p.status].tone}>{porraStatus[p.status].label}</Chip>
              </div>
            ))}
          </Card>
        )}

        {tab === 'tx' && (
          <Card className="divide-y divide-white/5">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm text-zinc-200">{t.label}</div>
                  <div className="text-[11px] text-zinc-500">{fmtDate(t.date)} · {t.type}</div>
                </div>
                <span className={cn('font-bold', t.amount > 0 ? 'text-neon-green' : 'text-neon-red')}>{t.amount > 0 ? '+' : ''}{t.amount}</span>
              </div>
            ))}
          </Card>
        )}

        {tab === 'disputes' && (
          <div className="space-y-3">
            {disputes.length === 0 && <Card className="p-8 text-center text-sm text-zinc-500">No hay disputas abiertas. 🎉</Card>}
            {disputes.map((c) => (
              <Card key={c.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div><div className="font-bold text-zinc-100">{c.title}</div><div className="text-[11px] text-zinc-500">{fichas(c.stake)} en disputa</div></div>
                  <Chip tone="red"><Flag size={10} /> Disputada</Chip>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg border border-neon-green/20 bg-neon-green/5 p-2"><span className="text-zinc-500">Lado A: </span><span className="text-neon-green">{c.creatorSide}</span></div>
                  <div className="rounded-lg border border-neon-red/20 bg-neon-red/5 p-2"><span className="text-zinc-500">Lado B: </span><span className="text-neon-red">{c.rivalSide}</span></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => { updateChallenge(c.id, { status: 'won', winnerId: c.creatorId }); toast({ tone: 'success', title: 'Disputa resuelta', body: 'A favor del lado A.' }) }} className="btn-ghost flex-1 text-neon-green">Resolver a favor de A</button>
                  <button onClick={() => { updateChallenge(c.id, { status: 'won', winnerId: c.rivalId }); toast({ tone: 'success', title: 'Disputa resuelta', body: 'A favor del lado B.' }) }} className="btn-ghost flex-1 text-neon-red">A favor de B</button>
                  <button onClick={() => { updateChallenge(c.id, { status: 'refunded' }); toast({ tone: 'info', title: 'Reembolsado', body: 'Fondos devueltos a ambos.' }) }} className="btn-ghost flex-1">Reembolsar</button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'suspicious' && (
          <Card className="divide-y divide-white/5">
            {[
              { u: 'serpiente99', risk: 'Posible multicuenta (misma IP)', level: 'alto' },
              { u: 'jugador_11', risk: 'Patrón de abandono intencional', level: 'medio' },
              { u: 'pulpo_8', risk: 'Depósitos inusuales (AML)', level: 'medio' },
              { u: 'jugador_9', risk: 'Velocidad de juego no humana (bot)', level: 'alto' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={18} className={s.level === 'alto' ? 'text-neon-red' : 'text-neon-amber'} />
                  <div><div className="text-sm font-semibold text-zinc-200">@{s.u}</div><div className="text-[11px] text-zinc-500">{s.risk}</div></div>
                </div>
                <Chip tone={s.level === 'alto' ? 'red' : 'amber'}>{s.level}</Chip>
              </div>
            ))}
          </Card>
        )}

        {tab === 'config' && (
          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 font-bold text-zinc-100"><Power size={18} className={realMode ? 'text-neon-red' : 'text-neon-green'} /> Modo dinero real</div>
                  <p className="mt-1 max-w-md text-sm text-zinc-400">Activa pagos reales (Stripe, Apple/Google Pay, PayPal). Requiere licencias, KYC, verificación de edad y revisión legal por jurisdicción.</p>
                </div>
                <button
                  onClick={() => (realMode ? setRealMode(false) : setConfirmReal(true))}
                  className={cn('relative h-7 w-12 shrink-0 rounded-full transition', realMode ? 'bg-neon-red' : 'bg-white/10')}
                >
                  <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white transition-all', realMode ? 'left-6' : 'left-1')} />
                </button>
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2 font-bold text-zinc-100"><Globe size={18} className="text-neon-blue" /> Regiones</div>
              <div className="flex flex-wrap gap-2">
                {[['España', true], ['México', true], ['Argentina', true], ['Colombia', false], ['EE. UU.', false], ['Reino Unido', false]].map(([r, on]) => (
                  <button key={r as string} onClick={() => toast({ tone: 'info', title: 'Región actualizada', body: `${r} ${on ? 'desactivada' : 'activada'} (demo).` })} className={cn('chip border transition', on ? 'border-neon-green/40 bg-neon-green/10 text-neon-green' : 'border-white/10 bg-white/5 text-zinc-500')}>
                    {r} {on ? '●' : '○'}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2 font-bold text-zinc-100"><Percent size={18} className="text-neon-amber" /> Comisión de plataforma</div>
              <input type="range" min={0} max={15} defaultValue={5} className="w-full accent-neon-amber" onChange={(e) => toast({ tone: 'info', title: 'Comisión', body: `Ajustada a ${e.target.value}% (demo).` })} />
              <p className="text-[11px] text-zinc-500">Aplicada sobre el bote de cada reto/porra liquidada.</p>
            </Card>

            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2 font-bold text-zinc-100"><Gamepad2 size={18} className="text-neon-purple" /> Logs recientes</div>
              <div className="space-y-1 font-mono text-[11px] text-zinc-500">
                <div>[OK] Liquidación reto #c4 → ganador me (+30)</div>
                <div>[WARN] Reintento de pago demo usuario @pulpo_8</div>
                <div>[OK] Matchmaking emparejó 14 partidas en 5 min</div>
                <div>[FLAG] Revisión AML abierta para @serpiente99</div>
              </div>
            </Card>
          </div>
        )}
      </motion.div>

      <Modal
        open={confirmReal}
        onClose={() => setConfirmReal(false)}
        title="Activar dinero real"
        size="sm"
        footer={
          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => setConfirmReal(false)}>Cancelar</button>
            <button className="btn-primary flex-1" onClick={() => { setRealMode(true); setConfirmReal(false); toast({ tone: 'error', title: 'Modo real activado', body: 'Solo válido con licencias y verificación reales.' }) }}>Activar</button>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <ShieldAlert size={32} className="text-neon-red" />
          <p className="text-sm text-zinc-300">
            Esto habilitaría apuestas con dinero real. No debe activarse sin licencias de juego válidas, KYC, verificación de edad,
            prevención de blanqueo y revisión legal por jurisdicción. En esta demo es solo ilustrativo.
          </p>
        </div>
      </Modal>
    </div>
  )
}
