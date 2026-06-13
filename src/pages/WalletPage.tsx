import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Coins, Lock, Clock, TrendingUp, ArrowDownToLine, ArrowUpFromLine,
  CreditCard, Plus, ShieldAlert, Apple, Wallet as WalletIcon, RotateCcw,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { PageHeader, useAuthGate } from '@/components/shared'
import { Card, Chip } from '@/components/ui/Primitives'
import { Modal } from '@/components/ui/Modal'
import { cn, fichas, fmtDate } from '@/lib/utils'
import type { TxType } from '@/lib/types'

const txTone: Record<TxType, { c: string; label: string }> = {
  deposit: { c: 'text-neon-green', label: 'Depósito' },
  withdraw: { c: 'text-zinc-300', label: 'Retirada' },
  lock: { c: 'text-neon-amber', label: 'Bloqueo' },
  release: { c: 'text-neon-green', label: 'Liberación' },
  refund: { c: 'text-neon-blue', label: 'Reembolso' },
  win: { c: 'text-neon-green', label: 'Ganancia' },
  loss: { c: 'text-neon-red', label: 'Pérdida' },
  fee: { c: 'text-zinc-400', label: 'Comisión' },
  bonus: { c: 'text-neon-purple', label: 'Bono' },
}

const PAY_METHODS = [
  { id: 'card', label: 'Tarjeta', icon: CreditCard, detail: '•••• 4242' },
  { id: 'apple', label: 'Apple Pay', icon: Apple, detail: 'Listo' },
  { id: 'google', label: 'Google Pay', icon: WalletIcon, detail: 'Listo' },
]
const AMOUNTS = [10, 25, 50, 100]

export default function WalletPage() {
  const wallet = useStore((s) => s.wallet)
  const transactions = useStore((s) => s.transactions)
  const deposit = useStore((s) => s.deposit)
  const withdraw = useStore((s) => s.withdraw)
  const resetDemo = useStore((s) => s.resetDemo)
  const realMode = useStore((s) => s.realMode)
  const { guard, gate } = useAuthGate()

  const [modal, setModal] = useState<null | 'deposit' | 'withdraw'>(null)
  const [amount, setAmount] = useState(25)

  function confirm() {
    if (modal === 'deposit') deposit(amount)
    else if (modal === 'withdraw') withdraw(amount)
    setModal(null)
  }

  const balances = [
    { label: 'Disponible', value: wallet.available, icon: Coins, c: 'text-neon-amber', glow: 'border-neon-amber/30' },
    { label: 'Bloqueado', value: wallet.locked, icon: Lock, c: 'text-neon-purple', glow: 'border-neon-purple/30' },
    { label: 'Pendiente', value: wallet.pending, icon: Clock, c: 'text-neon-blue', glow: 'border-neon-blue/30' },
    { label: 'Demo total', value: wallet.demo, icon: TrendingUp, c: 'text-neon-green', glow: 'border-neon-green/30' },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Tu saldo"
        title="Wallet"
        subtitle="Gestiona tus fichas demo. Aquí verás el saldo disponible, bloqueado y tu historial."
        action={<button onClick={resetDemo} className="btn-ghost"><RotateCcw size={16} /> Reiniciar demo</button>}
      />

      {/* real money notice */}
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-neon-amber/30 bg-neon-amber/10 p-4 text-sm text-neon-amber">
        <ShieldAlert size={22} className="shrink-0" />
        <div>
          <span className="font-bold">Modo seguro activo.</span> Operas con fichas ficticias. El dinero real, depósitos y retiradas
          {realMode ? ' están habilitados por el administrador pero' : ''} solo se activan tras licencias, verificación de edad, KYC y revisión legal.
          Preparado para Stripe, Apple Pay, Google Pay y PayPal.
        </div>
      </div>

      {/* balances */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {balances.map((b, i) => (
          <motion.div key={b.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={cn('p-4', b.glow)}>
              <b.icon size={18} className={b.c} />
              <div className={cn('mt-2 text-2xl font-extrabold', b.c)}>{b.value.toLocaleString('es-ES')}</div>
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">{b.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* actions */}
      <div className="mt-4 flex flex-wrap gap-3">
        <button onClick={() => guard(() => setModal('deposit'))} className="btn-primary flex-1"><ArrowDownToLine size={16} /> Depositar</button>
        <button onClick={() => guard(() => setModal('withdraw'))} className="btn-neon flex-1"><ArrowUpFromLine size={16} /> Retirar</button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* transactions */}
        <div className="lg:col-span-2">
          <h2 className="neon-title mb-3 text-2xl text-zinc-100">Movimientos</h2>
          <Card className="divide-y divide-white/5">
            {transactions.map((t) => {
              const tone = txTone[t.type]
              return (
                <div key={t.id} className="flex items-center justify-between gap-3 p-3.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Chip tone="zinc">{tone.label}</Chip>
                      <span className="truncate text-sm text-zinc-200">{t.label}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-zinc-500">{fmtDate(t.date)}</div>
                  </div>
                  <div className={cn('shrink-0 font-bold', tone.c)}>
                    {t.amount > 0 ? '+' : ''}{t.amount} <span className="text-[10px] text-zinc-500">fichas</span>
                  </div>
                </div>
              )
            })}
          </Card>
        </div>

        {/* side: methods + limits */}
        <div className="space-y-6">
          <div>
            <h2 className="neon-title mb-3 text-2xl text-zinc-100">Métodos de pago</h2>
            <Card className="space-y-2 p-4">
              {PAY_METHODS.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <m.icon size={20} className="text-zinc-300" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-zinc-200">{m.label}</div>
                    <div className="text-[11px] text-zinc-500">{m.detail}</div>
                  </div>
                  <Chip tone="green">Demo</Chip>
                </div>
              ))}
              <button onClick={() => guard(() => {})} className="btn-ghost mt-1 w-full text-sm"><Plus size={14} /> Añadir método</button>
            </Card>
          </div>

          <div>
            <h2 className="neon-title mb-3 text-2xl text-zinc-100">Límites de gasto</h2>
            <Card className="space-y-3 p-4">
              {[
                { label: 'Diario', used: 30, max: 100 },
                { label: 'Semanal', used: 120, max: 300 },
                { label: 'Mensual', used: 340, max: 1000 },
              ].map((l) => (
                <div key={l.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-zinc-400">{l.label}</span>
                    <span className="text-zinc-500">{l.used}/{l.max}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-gradient-to-r from-neon-amber to-neon-red" style={{ width: `${(l.used / l.max) * 100}%` }} />
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-zinc-500">Ajusta tus límites en Juego responsable.</p>
            </Card>
          </div>
        </div>
      </div>

      {/* deposit/withdraw modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'deposit' ? 'Depositar fichas demo' : 'Retirar (simulado)'}
        size="sm"
        footer={
          <button onClick={confirm} className="btn-primary w-full">
            {modal === 'deposit' ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />}
            {modal === 'deposit' ? `Depositar ${amount}` : `Retirar ${amount}`}
          </button>
        }
      >
        <div className="grid grid-cols-4 gap-2">
          {AMOUNTS.map((a) => (
            <button key={a} onClick={() => setAmount(a)} className={cn('rounded-xl border py-2.5 font-bold transition', amount === a ? 'border-neon-amber/60 bg-neon-amber/15 text-neon-amber' : 'border-white/10 text-zinc-300')}>{a}</button>
          ))}
        </div>
        <input type="range" min={5} max={200} step={5} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-4 w-full accent-neon-red" />
        <p className="mt-3 text-center text-[11px] text-zinc-500">
          {modal === 'deposit'
            ? 'En modo demo no se cobra nada real. Recargas fichas ficticias.'
            : 'Las retiradas reales exigen verificación KYC. En demo es simulado.'}
        </p>
      </Modal>

      {gate}
    </div>
  )
}
