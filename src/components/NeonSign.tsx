import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Behavior = 'steady' | 'flicker' | 'dying'

interface LetterCfg {
  ch: string
  behavior?: Behavior
  g1?: string // inner glow color
  g2?: string // outer bloom color
}

// Mixed old neon tubes: a few colors like a real bar sign
const DEFAULT: LetterCfg[] = [
  { ch: 'J', g1: '#ff2d55', g2: '#b14bff' },
  { ch: 'U', g1: '#b14bff', g2: '#8a5cff' },
  { ch: 'É', behavior: 'flicker', g1: '#2dd4ff', g2: '#22f5e0' },
  { ch: 'G', g1: '#ff2d55', g2: '#ff3d81' },
  { ch: 'A', g1: '#39ff9e', g2: '#22f5e0' },
  { ch: 'T', behavior: 'flicker', g1: '#b14bff', g2: '#ff2d55' },
  { ch: 'E', g1: '#ff2d55', g2: '#b14bff' },
  { ch: 'L', g1: '#2dd4ff', g2: '#8a5cff' },
  { ch: 'A', behavior: 'dying', g1: '#ff2d55', g2: '#ff3d81' },
]

export function NeonSign({
  letters = DEFAULT,
  className,
}: {
  letters?: LetterCfg[]
  className?: string
}) {
  return (
    <motion.div
      className={cn('neon-sign', className)}
      // subtle hanging-sign sway
      animate={{ rotate: [-0.6, 0.6, -0.4, 0.5, -0.6] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      aria-label="Juégatela"
    >
      {letters.map((l, i) => (
        <span
          key={i}
          data-ch={l.ch}
          className={cn(
            'ltr',
            l.behavior === 'flicker' && 'flicker',
            l.behavior === 'dying' && 'dying'
          )}
          style={
            {
              '--g1': l.g1,
              '--g2': l.g2,
              animationDelay: `${(i * 0.37).toFixed(2)}s`,
            } as React.CSSProperties
          }
        >
          {l.ch}
        </span>
      ))}
    </motion.div>
  )
}
