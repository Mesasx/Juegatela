import { cn } from '@/lib/utils'

/**
 * BarScene — fondo de bar clandestino animado (solo CSS/SVG, sin JS de animación).
 *
 * variant 'barra' → vista hacia la barra: estante de botellas con glow, grifos de
 *   cerveza llenándose, camarero escanciando, otro lavando vasos, camarero
 *   cruzando con bandeja y clientes en la barra balanceándose.
 * variant 'mesas' → vista de la sala: mesas con gente sentada tomando copas (una
 *   levanta la mano pidiendo la cuenta), velas en las mesas y un camarero pasando
 *   entre las mesas con bandeja.
 *
 * Pensado como fondo a pantalla completa. El componente se posiciona
 * `absolute inset-0`, es `pointer-events-none` e incluye su propio overlay oscuro
 * para no estorbar la legibilidad del contenido que vaya encima. El z-index lo
 * controla el contenedor padre.
 */
export function BarScene({
  variant = 'barra',
  className,
}: {
  variant?: 'barra' | 'mesas'
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden select-none',
        'bg-ink-950',
        className
      )}
    >
      {/* Glow ambiental de fondo (neón difuso) */}
      <div className="bar-ambient absolute inset-0" />

      {/* Humo / vaho que se desplaza */}
      <div className="bar-smoke absolute inset-0" />

      {/* Escena */}
      <div className="absolute inset-0 flex items-end justify-center">
        {variant === 'barra' ? <BarraScene /> : <MesasScene />}
      </div>

      {/* Viñeta para profundidad */}
      <div className="bar-vignette absolute inset-0" />

      {/* Overlay oscuro para contraste / legibilidad del contenido */}
      <div className="bar-overlay absolute inset-0" />
    </div>
  )
}

/* ───────────────────────── VARIANT: BARRA ───────────────────────── */

function BarraScene() {
  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMax slice"
      className="h-full w-full"
    >
      <defs>
        <linearGradient id="bar-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c0910" />
          <stop offset="100%" stopColor="#120d1a" />
        </linearGradient>
        <linearGradient id="bar-beer" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#ffb627" />
          <stop offset="100%" stopColor="#ffd24c" />
        </linearGradient>
        <linearGradient id="bar-counter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#241830" />
          <stop offset="100%" stopColor="#070509" />
        </linearGradient>
      </defs>

      {/* pared del fondo */}
      <rect x="0" y="0" width="400" height="240" fill="url(#bar-wall)" />

      {/* lámparas colgantes parpadeantes */}
      <g className="bar-lamp" style={{ ['--d' as string]: '0s' }}>
        <line x1="90" y1="0" x2="90" y2="26" stroke="#2a1d38" strokeWidth="1.5" />
        <circle cx="90" cy="32" r="9" fill="#ffb627" className="bar-lamp-bulb" />
      </g>
      <g className="bar-lamp" style={{ ['--d' as string]: '1.3s' }}>
        <line x1="200" y1="0" x2="200" y2="20" stroke="#2a1d38" strokeWidth="1.5" />
        <circle cx="200" cy="26" r="9" fill="#b14bff" className="bar-lamp-bulb" />
      </g>
      <g className="bar-lamp" style={{ ['--d' as string]: '2.6s' }}>
        <line x1="312" y1="0" x2="312" y2="30" stroke="#2a1d38" strokeWidth="1.5" />
        <circle cx="312" cy="36" r="9" fill="#2dd4ff" className="bar-lamp-bulb" />
      </g>

      {/* estantería de botellas con glow alterno */}
      <g transform="translate(40,70)">
        <rect x="0" y="58" width="320" height="4" fill="#1c1326" />
        <rect x="0" y="30" width="320" height="4" fill="#1c1326" />
        {BOTTLES.map((b, i) => (
          <g
            key={i}
            className="bar-bottle"
            style={{ ['--d' as string]: `${(i % 7) * 0.55}s`, ['--c' as string]: b.c }}
            transform={`translate(${b.x},${b.y})`}
          >
            <rect x="-2.4" y="-18" width="4.8" height="22" rx="1.8" />
            <rect x="-1" y="-24" width="2" height="7" />
          </g>
        ))}
      </g>

      {/* barra (mostrador) */}
      <rect x="0" y="196" width="400" height="44" fill="url(#bar-counter)" />
      <rect x="0" y="194" width="400" height="3" fill="#39ff9e" opacity="0.35" className="bar-counter-glow" />

      {/* grifos de cerveza con jarras llenándose */}
      <g transform="translate(150,150)">
        {/* torre de grifos */}
        <rect x="-3" y="-22" width="6" height="22" fill="#322142" />
        <rect x="-8" y="-26" width="16" height="6" rx="2" fill="#4a2f63" />
        <BeerGlass x={-26} delay="0s" />
        <BeerGlass x={14} delay="2.4s" />
      </g>

      {/* camarero escanciando (silueta, brazo en bucle) */}
      <g transform="translate(78,150)" fill="#05030a">
        <ellipse cx="0" cy="-44" rx="9" ry="10" /> {/* cabeza */}
        <path d="M -11 -34 Q 0 -38 11 -34 L 13 8 Q 0 12 -13 8 Z" /> {/* torso */}
        {/* brazo que escancia */}
        <g className="bar-pour" style={{ transformOrigin: '8px -28px' }}>
          <rect x="6" y="-30" width="6" height="22" rx="3" />
          <rect x="9" y="-12" width="3" height="10" rx="1.5" fill="#ffb627" className="bar-pour-stream" />
        </g>
      </g>

      {/* camarero lavando vasos (silueta, leve frote) */}
      <g transform="translate(300,150)" fill="#05030a">
        <ellipse cx="0" cy="-44" rx="9" ry="10" />
        <path d="M -11 -34 Q 0 -38 11 -34 L 13 8 Q 0 12 -13 8 Z" />
        <g className="bar-scrub" style={{ transformOrigin: '-6px -20px' }}>
          <rect x="-12" y="-26" width="6" height="18" rx="3" />
          <circle cx="-9" cy="-8" r="4" fill="#2dd4ff" opacity="0.5" />
        </g>
      </g>

      {/* clientes en la barra (siluetas con bob desincronizado) */}
      {PATRONS_BAR.map((p, i) => (
        <g
          key={i}
          className="bar-bob"
          style={{ ['--d' as string]: `${p.d}s`, transformOrigin: `${p.x}px 210px` }}
          fill="#030206"
        >
          <ellipse cx={p.x} cy={196} rx="8" ry="9" />
          <path d={`M ${p.x - 11} 206 Q ${p.x} 200 ${p.x + 11} 206 L ${p.x + 12} 240 L ${p.x - 12} 240 Z`} />
        </g>
      ))}

      {/* camarero cruzando con bandeja */}
      <g className="bar-cross" fill="#020106">
        <g transform="translate(0,134)">
          <ellipse cx="0" cy="0" rx="8" ry="9" />
          <path d="M -10 9 Q 0 5 10 9 L 11 56 L -11 56 Z" />
          {/* bandeja levantada */}
          <rect x="-22" y="2" width="3" height="12" rx="1.5" />
          <rect x="-34" y="-2" width="26" height="3" rx="1.5" fill="#0a0710" />
          <circle cx="-28" cy="-5" r="3" fill="#ff2d55" opacity="0.6" />
          <circle cx="-18" cy="-5" r="3" fill="#39ff9e" opacity="0.6" />
        </g>
      </g>
    </svg>
  )
}

/* ───────────────────────── VARIANT: MESAS ───────────────────────── */

function MesasScene() {
  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMax slice"
      className="h-full w-full"
    >
      <defs>
        <linearGradient id="mesas-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c0910" />
          <stop offset="100%" stopColor="#15101f" />
        </linearGradient>
        <radialGradient id="mesas-candle" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd24c" />
          <stop offset="100%" stopColor="#ffb627" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="400" height="240" fill="url(#mesas-wall)" />

      {/* lámparas colgantes sobre las mesas */}
      {[
        { x: 80, c: '#b14bff', d: '0s' },
        { x: 200, c: '#ff2d55', d: '1.1s' },
        { x: 320, c: '#2dd4ff', d: '2.2s' },
      ].map((l, i) => (
        <g key={i} className="bar-lamp" style={{ ['--d' as string]: l.d }}>
          <line x1={l.x} y1="0" x2={l.x} y2="22" stroke="#2a1d38" strokeWidth="1.5" />
          <circle cx={l.x} cy="28" r="8" fill={l.c} className="bar-lamp-bulb" />
        </g>
      ))}

      {/* mesas */}
      <Table x={80} raising={false} delay="0.4s" />
      <Table x={200} raising delay="1.6s" />
      <Table x={320} raising={false} delay="0.9s" />

      {/* camarero pasando entre las mesas con bandeja */}
      <g className="bar-cross bar-cross--slow" fill="#020106">
        <g transform="translate(0,150)">
          <ellipse cx="0" cy="0" rx="8" ry="9" />
          <path d="M -10 9 Q 0 5 10 9 L 11 50 L -11 50 Z" />
          <rect x="18" y="2" width="3" height="12" rx="1.5" />
          <rect x="8" y="-2" width="24" height="3" rx="1.5" fill="#0a0710" />
          <circle cx="14" cy="-5" r="3" fill="#ffb627" opacity="0.6" />
          <circle cx="24" cy="-5" r="3" fill="#2dd4ff" opacity="0.6" />
        </g>
      </g>

      {/* suelo */}
      <rect x="0" y="232" width="400" height="8" fill="#070509" />
    </svg>
  )
}

/** Una mesa con dos siluetas sentadas; opcionalmente una levanta la mano. */
function Table({ x, raising, delay }: { x: number; raising: boolean; delay: string }) {
  return (
    <g transform={`translate(${x},0)`}>
      {/* halo de vela */}
      <circle cx="0" cy="168" r="20" fill="url(#mesas-candle)" className="bar-candle-glow" style={{ ['--d' as string]: delay }} />

      {/* comensal izquierda (bob) */}
      <g className="bar-bob" style={{ ['--d' as string]: delay, transformOrigin: `${-26}px 170px` }} fill="#030206">
        <ellipse cx="-26" cy="150" rx="7" ry="8" />
        <path d="M -36 158 Q -26 154 -16 158 L -15 184 L -37 184 Z" />
      </g>

      {/* comensal derecha (bob o levantando la mano) */}
      {raising ? (
        <g fill="#030206">
          <ellipse cx="26" cy="150" rx="7" ry="8" />
          <path d="M 16 158 Q 26 154 36 158 L 37 184 L 15 184 Z" />
          {/* brazo levantado pidiendo la cuenta */}
          <g className="bar-raise" style={{ transformOrigin: '30px 158px' }}>
            <rect x="28" y="130" width="5" height="30" rx="2.5" />
          </g>
        </g>
      ) : (
        <g className="bar-bob" style={{ ['--d' as string]: `${delay} reverse`, transformOrigin: `${26}px 170px` }} fill="#030206">
          <ellipse cx="26" cy="150" rx="7" ry="8" />
          <path d="M 16 158 Q 26 154 36 158 L 37 184 L 15 184 Z" />
        </g>
      )}

      {/* mesa (tablero + pata) */}
      <ellipse cx="0" cy="178" rx="30" ry="6" fill="#181020" />
      <rect x="-2.5" y="178" width="5" height="40" fill="#120d1a" />
      <ellipse cx="0" cy="218" rx="16" ry="4" fill="#0c0910" />
      {/* vela */}
      <rect x="-2" y="160" width="4" height="9" fill="#241830" />
      <ellipse cx="0" cy="159" rx="2.4" ry="4" fill="#ffd24c" className="bar-flame" style={{ ['--d' as string]: delay }} />
    </g>
  )
}

/* ───────────────────────── PIEZAS REUTILIZABLES ───────────────────────── */

/** Jarra de cerveza que se llena en bucle con espuma arriba. */
function BeerGlass({ x, delay }: { x: number; delay: string }) {
  return (
    <g transform={`translate(${x},10)`}>
      {/* vaso */}
      <rect x="0" y="0" width="20" height="32" rx="2.5" fill="#0a0710" stroke="#322142" strokeWidth="1" />
      {/* relleno ámbar que sube (escala vertical en bucle) */}
      <g className="bar-fill" style={{ ['--d' as string]: delay, transformOrigin: '0 32px' }}>
        <rect x="1.5" y="2" width="17" height="28" rx="1.5" fill="url(#bar-beer)" />
      </g>
      {/* espuma arriba */}
      <g className="bar-foam" style={{ ['--d' as string]: delay }}>
        <rect x="1.5" y="0" width="17" height="5" rx="2.5" fill="#fff6e6" />
      </g>
    </g>
  )
}

/* ───────────────────────── DATOS ───────────────────────── */

const NEON = ['#ff2d55', '#b14bff', '#2dd4ff', '#39ff9e', '#ffb627']

const BOTTLES = Array.from({ length: 22 }, (_, i) => ({
  x: 8 + i * 14,
  y: i % 2 === 0 ? 28 : 56,
  c: NEON[i % NEON.length],
}))

const PATRONS_BAR = [
  { x: 30, d: 0 },
  { x: 235, d: 0.8 },
  { x: 262, d: 1.7 },
  { x: 366, d: 1.1 },
]
