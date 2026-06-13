import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Gamepad2,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Coins,
  RotateCcw,
  Percent,
  Gift,
} from 'lucide-react'
import type { TxType } from '@/lib/types'
import { Card, Chip, Stat } from '@/components/ui/Primitives'
import { PageHeader } from '@/components/shared'
import { useStore } from '@/store/useStore'
import { MATCH_HISTORY } from '@/lib/mockData'
import { getGame } from '@/lib/games'
import { cn, fichas, fmtDate } from '@/lib/utils'

type Tab = 'matches' | 'tx'

const RESULT: Record<string, { label: string; color: string; tone: 'green' | 'red' | 'zinc' }> = {
  win: { label: 'Victoria', color: 'text-neon-green', tone: 'green' },
  loss: { label: 'Derrota', color: 'text-neon-red', tone: 'red' },
  draw: { label: 'Empate', color: 'text-zinc-300', tone: 'zinc' },
}

const TX_META: Record<TxType, { label: string; icon: typeof Coins; color: string }> = {
  deposit: { label: 'Recarga', icon: ArrowUpRight, color: 'text-neon-green' },
  withdraw: { label: 'Retirada', icon: ArrowDownRight, color: 'text-neon-amber' },
  lock: { label: 'Bloqueo', icon: Lock, color: 'text-neon-amber' },
  release: { label: 'Liberación', icon: Coins, color: 'text-neon-green' },
  refund: { label: 'Reembolso', icon: RotateCcw, color: 'text-neon-blue' },
  win: { label: 'Ganancia', icon: ArrowUpRight, color: 'text-neon-green' },
  loss: { label: 'Pérdida', icon: ArrowDownRight, color: 'text-neon-red' },
  fee: { label: 'Comisión', icon: Percent, color: 'text-zinc-400' },
  bonus: { label: 'Bono', icon: Gift, color: 'text-neon-purple' },
}

export default function HistoryPage() {
  const transactions = useStore((s) => s.transactions)
  const [tab, setTab] = useState<Tab>('matches')
  const [txFilter, setTxFilter] = useState<'all' | 'in' | 'out'>('all')

  const stats = useMemo(() => {
    const won = transactions.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0)
    const lost = transactions.filter((t) => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0)
    return {
      won,
      lost,
      balance: won - lost,
      played: MATCH_HISTORY.length,
    }
  }, [transactions])

  const visibleTx = transactions.filter((t) =>
    txFilter === 'all' ? true : txFilter === 'in' ? t.amount > 0 : t.amount < 0
  )

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="La libreta del local"
        title="Historial"
        subtitle="Tus partidas y todos los movimientos de fichas demo, con su rastro."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Ganado" value={fichas(stats.won)} accent="text-neon-green" />
        <Stat label="Perdido" value={fichas(stats.lost)} accent="text-neon-red" />
        <Stat
          label="Balance"
          value={`${stats.balance >= 0 ? '+' : ''}${fichas(stats.balance)}`}
          accent={stats.balance >= 0 ? 'text-neon-green' : 'text-neon-red'}
        />
        <Stat label="Partidas" value={stats.played} sub="jugadas" accent="text-neon-blue" />
      </div>

      <div className="mb-5 inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
        <button
          onClick={() => setTab('matches')}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition',
            tab === 'matches' ? 'bg-neon-purple/20 text-neon-purple' : 'text-zinc-400 hover:text-zinc-200'
          )}
        >
          <Gamepad2 size={16} /> Partidas
        </button>
        <button
          onClick={() => setTab('tx')}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition',
            tab === 'tx' ? 'bg-neon-purple/20 text-neon-purple' : 'text-zinc-400 hover:text-zinc-200'
          )}
        >
          <Receipt size={16} /> Transacciones
        </button>
      </div>

      {tab === 'matches' ? (
        <Card className="overflow-hidden p-0">
          <div className="hidden grid-cols-[1.4fr_1fr_0.8fr_0.8fr_1fr] gap-3 border-b border-white/10 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-zinc-500 sm:grid">
            <span>Juego</span>
            <span>Oponente</span>
            <span>Resultado</span>
            <span className="text-right">Apuesta</span>
            <span className="text-right">Fecha</span>
          </div>
          {MATCH_HISTORY.map((m, i) => {
            const r = RESULT[m.result]
            const game = getGame(m.gameId)
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-white/5 px-4 py-3 last:border-0 sm:grid sm:grid-cols-[1.4fr_1fr_0.8fr_0.8fr_1fr] sm:items-center sm:gap-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{game?.emoji ?? '🎮'}</span>
                  <span className="font-bold text-zinc-100">{game?.name ?? m.gameId}</span>
                </div>
                <div className="mt-1 text-sm text-zinc-400 sm:mt-0">vs {m.opponent}</div>
                <div className="mt-1 sm:mt-0">
                  <Chip tone={r.tone}>{r.label}</Chip>
                </div>
                <div className="mt-1 text-sm text-zinc-300 sm:mt-0 sm:text-right">{fichas(m.stake)}</div>
                <div className="mt-1 flex items-center justify-between sm:mt-0 sm:block sm:text-right">
                  <span className={cn('font-extrabold', r.color)}>
                    {m.delta > 0 ? '+' : ''}
                    {m.delta} fichas
                  </span>
                  <span className="block text-[11px] text-zinc-500">{fmtDate(m.date)}</span>
                </div>
              </motion.div>
            )
          })}
        </Card>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {(['all', 'in', 'out'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTxFilter(f)}
                className={cn(
                  'chip transition',
                  txFilter === f
                    ? 'bg-neon-purple/15 text-neon-purple border border-neon-purple/40'
                    : 'bg-white/5 text-zinc-400 border border-white/10 hover:text-zinc-200'
                )}
              >
                {f === 'all' ? 'Todas' : f === 'in' ? 'Entradas' : 'Salidas'}
              </button>
            ))}
          </div>
          <Card className="overflow-hidden p-0">
            {visibleTx.map((t, i) => {
              const meta = TX_META[t.type]
              const Icon = meta.icon
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0"
                >
                  <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5', meta.color)}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold text-zinc-100">{t.label}</span>
                      <Chip tone="zinc">{meta.label}</Chip>
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {fmtDate(t.date)}
                      {t.ref && <span className="ml-2 font-mono text-zinc-600">#{t.ref}</span>}
                    </div>
                  </div>
                  <div
                    className={cn(
                      'shrink-0 text-right font-extrabold',
                      t.amount >= 0 ? 'text-neon-green' : 'text-neon-red'
                    )}
                  >
                    {t.amount >= 0 ? '+' : '−'}
                    {fichas(Math.abs(t.amount))}
                  </div>
                </motion.div>
              )
            })}
          </Card>
        </>
      )}
    </div>
  )
}
