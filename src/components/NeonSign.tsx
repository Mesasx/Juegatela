import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Behavior = 'steady' | 'flicker' | 'dying'

interface LetterCfg {
  ch: string
  behavior?: Behavior
  g1?: string // inner glow color
  g2?: string // outer bloom color
}

// Letrero de neón rojo: todas las letras en tonos rojos
const DEFAULT: LetterCfg[] = [
  { ch: 'J', g1: '#ff2d55', g2: '#ff3d81' },
  { ch: 'U', g1: '#ff2d55', g2: '#ff5277' },
  { ch: 'É', behavior: 'flicker', g1: '#ff2d55', g2: '#ff3d81' },
  { ch: 'G', g1: '#ff2d55', g2: '#ff5277' },
  { ch: 'A', g1: '#ff2d55', g2: '#ff3d81' },
  { ch: 'T', behavior: 'flicker', g1: '#ff2d55', g2: '#ff5277' },
  { ch: 'E', g1: '#ff2d55', g2: '#ff3d81' },
  { ch: 'L', g1: '#ff2d55', g2: '#ff5277' },
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
