import { type ReactNode, type ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// ── Avatar ────────────────────────────────────────────────────────────────
export function Avatar({
  seed,
  size = 40,
  online,
  ring,
}: {
  seed: string
  size?: number
  online?: boolean
  ring?: boolean
}) {
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <div
        className={cn(
          'flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-ink-700 to-ink-850 text-center',
          ring && 'ring-2 ring-neon-purple/50'
        )}
        style={{ fontSize: size * 0.5 }}
      >
        <span>{seed}</span>
      </div>
      {online !== undefined && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full border-2 border-ink-900',
            online ? 'bg-neon-green shadow-neon-green' : 'bg-zinc-600'
          )}
        />
      )}
    </div>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────
export function Card({
  children,
  className,
  hover,
  glow,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: string
}) {
  return (
    <div
      className={cn('glass rounded-2xl', hover && 'glass-hover cursor-pointer', glow, className)}
    >
      {children}
    </div>
  )
}

// ── Chip / Badge ────────────────────────────────────────────────────────
const toneMap: Record<string, string> = {
  red: 'bg-neon-red/15 text-neon-red border border-neon-red/30',
  purple: 'bg-neon-purple/15 text-neon-purple border border-neon-purple/30',
  blue: 'bg-neon-blue/15 text-neon-blue border border-neon-blue/30',
  green: 'bg-neon-green/15 text-neon-green border border-neon-green/30',
  amber: 'bg-neon-amber/15 text-neon-amber border border-neon-amber/30',
  zinc: 'bg-white/5 text-zinc-300 border border-white/10',
}

export function Chip({
  children,
  tone = 'zinc',
  className,
}: {
  children: ReactNode
  tone?: keyof typeof toneMap
  className?: string
}) {
  return <span className={cn('chip', toneMap[tone], className)}>{children}</span>
}

// ── Button ────────────────────────────────────────────────────────────────
type Variant = 'primary' | 'ghost' | 'neon'
export function Button({
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const v = variant === 'primary' ? 'btn-primary' : variant === 'neon' ? 'btn-neon' : 'btn-ghost'
  return (
    <button className={cn(v, className)} {...props}>
      {children}
    </button>
  )
}

// ── Stat ──────────────────────────────────────────────────────────────────
export function Stat({
  label,
  value,
  sub,
  accent = 'text-zinc-100',
}: {
  label: string
  value: ReactNode
  sub?: string
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{label}</div>
      <div className={cn('mt-0.5 text-xl font-extrabold', accent)}>{value}</div>
      {sub && <div className="text-[11px] text-zinc-500">{sub}</div>}
    </div>
  )
}

// ── ProgressBar ────────────────────────────────────────────────────────────
export function ProgressBar({
  value,
  max = 100,
  tone = 'from-neon-red to-neon-purple',
  className,
}: {
  value: number
  max?: number
  tone?: string
  className?: string
}) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-white/5', className)}>
      <motion.div
        className={cn('h-full rounded-full bg-gradient-to-r', tone)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  )
}

// ── Section heading ─────────────────────────────────────────────────────────
export function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string
  title: string
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-neon-purple/80">
            {eyebrow}
          </div>
        )}
        <h2 className="neon-title text-2xl text-zinc-100 sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  )
}

// ── Empty state ─────────────────────────────────────────────────────────────
export function EmptyState({
  icon = '🍸',
  title,
  body,
  action,
}: {
  icon?: string
  title: string
  body?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-12 text-center">
      <div className="mb-3 text-4xl opacity-70">{icon}</div>
      <h3 className="text-lg font-bold text-zinc-200">{title}</h3>
      {body && <p className="mt-1 max-w-sm text-sm text-zinc-500">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
