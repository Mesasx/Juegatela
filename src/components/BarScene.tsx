import { cn } from '@/lib/utils'

/**
 * BarScene — fondo de bar clandestino con SILUETAS HUMANAS reales a contraluz.
 * Dibujado en SVG a mano; animaciones CSS (prefijo barx- en index.css).
 * variant 'barra'  → la barra: clientes de espaldas, camareros sirviendo.
 * variant 'mesas'  → la sala: gente en mesas bebiendo, una pidiendo la cuenta.
 */

const SIL = '#04060c' // color silueta (casi negro)

const rim = (c: string, b = 7) => ({ filter: `drop-shadow(0 0 ${b}px ${c})` })

// ── Cliente de espaldas, sentado en taburete (barra) ──────────────────────
function PatronBack({ x, s = 1, delay = 0, glow }: { x: number; s?: number; delay?: number; glow: string }) {
  return (
    <g transform={`translate(${x} 540) scale(${s})`}>
      {/* taburete */}
      <rect x={-7} y={-2} width={14} height={64} rx={5} fill="#0a0a12" />
      <rect x={-32} y={46} width={64} height={7} rx={3} fill="#0a0a12" />
      <ellipse cx={0} cy={0} rx={40} ry={11} fill="#0a0a12" />
      {/* cuerpo (bob) */}
      <g className="barx-anim" style={{ animation: `barx-bob 4.5s ease-in-out ${delay}s infinite`, ...rim(glow, 6) }}>
        {/* brazos apoyados en la barra */}
        <path d="M -34 -118 C -56 -112 -64 -88 -58 -64 C -55 -53 -47 -52 -44 -60 C -49 -84 -42 -104 -32 -112 Z" fill={SIL} />
        <path d="M 34 -118 C 56 -112 64 -88 58 -64 C 55 -53 47 -52 44 -60 C 49 -84 42 -104 32 -112 Z" fill={SIL} />
        {/* torso de espaldas */}
        <path d="M -40 2 C -47 -46 -47 -94 -38 -122 C -34 -138 -22 -148 -16 -152 C -8 -170 8 -170 16 -152 C 22 -148 34 -138 38 -122 C 47 -94 47 -46 40 2 Z" fill={SIL} />
        {/* cuello + cabeza */}
        <rect x={-12} y={-166} width={24} height={20} rx={8} fill={SIL} />
        <circle cx={0} cy={-184} r={25} fill={SIL} />
      </g>
    </g>
  )
}

// ── Camarero detrás de la barra agitando una coctelera ────────────────────
function BartenderShaker({ x, glow }: { x: number; glow: string }) {
  return (
    <g transform={`translate(${x} 372)`} style={rim(glow, 7)}>
      <path d="M -34 6 C -40 -28 -42 -60 -38 -88 C -36 -100 -24 -108 -16 -110 L 16 -110 C 24 -108 36 -100 38 -88 C 42 -60 40 -28 34 6 Z" fill={SIL} />
      <path d="M -20 -88 L 20 -88 L 16 4 L -16 4 Z" fill="#070a12" />
      <rect x={-10} y={-124} width={20} height={18} rx={7} fill={SIL} />
      <circle cx={0} cy={-140} r={20} fill={SIL} />
      {/* brazo izq estático */}
      <path d="M 34 -92 C 50 -84 57 -64 52 -42 C 50 -32 43 -32 40 -41 C 44 -62 38 -80 29 -88 Z" fill={SIL} />
      {/* brazo der agitando coctelera */}
      <g className="barx-anim" style={{ animation: 'barx-shake 0.9s ease-in-out infinite', transformBox: 'fill-box', transformOrigin: '85% 95%' }}>
        <path d="M -34 -92 C -52 -100 -58 -126 -50 -150 C -47 -160 -39 -160 -36 -150 C -42 -128 -34 -106 -26 -96 Z" fill={SIL} />
        <path d="M -54 -184 L -34 -184 L -38 -150 L -50 -150 Z" fill="#10131c" stroke={glow} strokeWidth={1.5} />
        <rect x={-54} y={-190} width={20} height={8} rx={2} fill="#10131c" stroke={glow} strokeWidth={1.2} />
      </g>
    </g>
  )
}

// ── Camarero limpiando un vaso ────────────────────────────────────────────
function BartenderWipe({ x, glow }: { x: number; glow: string }) {
  return (
    <g transform={`translate(${x} 374)`} style={rim(glow, 6)}>
      <path d="M -32 6 C -38 -26 -40 -58 -36 -84 C -34 -96 -22 -104 -14 -106 L 14 -106 C 22 -104 34 -96 36 -84 C 40 -58 38 -26 32 6 Z" fill={SIL} />
      <rect x={-10} y={-120} width={20} height={18} rx={7} fill={SIL} />
      <circle cx={0} cy={-136} r={19} fill={SIL} />
      {/* dos brazos hacia el frente + manos frotando el vaso */}
      <g className="barx-anim" style={{ animation: 'barx-wipe 1.4s ease-in-out infinite' }}>
        <path d="M -30 -84 C -40 -64 -34 -44 -16 -40 L 16 -40 C 34 -44 40 -64 30 -84 C 22 -70 -22 -70 -30 -84 Z" fill={SIL} />
        <path d="M -8 -58 L 8 -58 L 5 -30 L -5 -30 Z" fill="#0c1018" stroke={glow} strokeWidth={1.3} />
      </g>
    </g>
  )
}

// ── Camarero cruzando con bandeja (perfil) ────────────────────────────────
function WaiterTray({ y = 520, s = 1, dur = 17, delay = 0, glow }: { y?: number; s?: number; dur?: number; delay?: number; glow: string }) {
  return (
    <g className="barx-anim" style={{ animation: `barx-cross ${dur}s linear ${delay}s infinite` }}>
      <g transform={`translate(0 ${y}) scale(${s})`} style={rim(glow, 6)}>
        {/* piernas mid-stride */}
        <path d="M -4 -78 L -16 -2 L -6 -2 L 2 -64 Z" fill={SIL} />
        <path d="M 4 -78 L 16 -4 L 26 -4 L 14 -70 Z" fill={SIL} />
        {/* torso ligeramente inclinado */}
        <path d="M -10 -150 C -16 -126 -14 -100 -6 -78 L 10 -78 C 16 -100 14 -128 10 -150 Z" fill={SIL} />
        {/* cabeza */}
        <circle cx={2} cy={-164} r={16} fill={SIL} />
        {/* brazo levantando la bandeja */}
        <path d="M 6 -140 C 22 -150 30 -160 26 -172 C 24 -178 18 -176 16 -170 C 14 -160 2 -150 -2 -146 Z" fill={SIL} />
        <ellipse cx={28} cy={-176} rx={26} ry={6} fill="#0c1018" stroke={glow} strokeWidth={1.3} />
        <rect x={18} y={-188} width={6} height={12} rx={2} fill={SIL} />
        <rect x={32} y={-188} width={6} height={12} rx={2} fill={SIL} />
      </g>
    </g>
  )
}

// ── Comensal en una mesa (perfil, sentado) ────────────────────────────────
function Diner({ x, s = 1, delay = 0, glow, raising }: { x: number; s?: number; delay?: number; glow: string; raising?: boolean }) {
  return (
    <g transform={`translate(${x} 470) scale(${s})`} style={rim(glow, 6)}>
      {/* silla insinuada */}
      <rect x={18} y={-86} width={6} height={92} rx={3} fill="#0a0a12" />
      <g className="barx-anim" style={{ animation: `barx-bob 5s ease-in-out ${delay}s infinite` }}>
        {/* muslo sentado + pierna */}
        <path d="M -28 4 L 22 4 L 22 -14 L -24 -14 Z" fill={SIL} />
        <path d="M -24 4 L -30 64 L -18 64 L -12 4 Z" fill={SIL} />
        {/* torso */}
        <path d="M -22 -12 C -28 -44 -24 -74 -16 -96 C -12 -106 2 -106 8 -96 C 14 -74 16 -44 12 -12 Z" fill={SIL} />
        {/* cabeza */}
        <circle cx={-4} cy={-112} r={18} fill={SIL} />
        {/* brazo: apoyado, o levantado pidiendo la cuenta */}
        {raising ? (
          <g className="barx-anim" style={{ animation: `barx-raise 5.5s ease-in-out ${delay}s infinite`, transformBox: 'fill-box', transformOrigin: '20% 95%' }}>
            <path d="M -16 -86 C -22 -120 -16 -150 -8 -168 C -5 -175 1 -173 1 -166 C -2 -146 -6 -116 -4 -88 Z" fill={SIL} />
          </g>
        ) : (
          <path d="M 8 -84 C 26 -78 34 -64 30 -50 C 28 -44 22 -46 20 -52 C 22 -64 14 -76 4 -80 Z" fill={SIL} />
        )}
      </g>
    </g>
  )
}

function BarTable({ x, y, s = 1, glow }: { x: number; y: number; s?: number; glow: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={70} ry={18} fill="#0c0a12" stroke={glow} strokeWidth={1} opacity={0.9} />
      <rect x={-6} y={6} width={12} height={70} rx={4} fill="#0a0a10" />
      {/* vela */}
      <g style={rim('#ffb627', 8)}>
        <rect x={18} y={-18} width={5} height={14} rx={2} fill="#1a140a" />
        <ellipse className="barx-anim" cx={20.5} cy={-22} rx={3} ry={6} fill="#ffd24c"
          style={{ animation: 'barx-flame 1.2s ease-in-out infinite', transformBox: 'fill-box', transformOrigin: '50% 100%' }} />
      </g>
      {/* copas */}
      <path d="M -26 -6 L -16 -6 L -19 -20 L -23 -20 Z" fill="#0c1018" stroke={glow} strokeWidth={1} />
      <path d="M 36 -4 L 44 -4 L 42 -16 L 38 -16 Z" fill="#0c1018" stroke={glow} strokeWidth={1} />
    </g>
  )
}

export function BarScene({
  variant = 'barra',
  className,
}: {
  variant?: 'barra' | 'mesas'
  className?: string
}) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 select-none overflow-hidden', className)}>
      <div className="bar-ambient absolute inset-0" />

      <svg viewBox="0 0 1200 560" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="bx-backlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a1020" stopOpacity="0" />
            <stop offset="55%" stopColor="#7a1f3a" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ff7a3c" stopOpacity="0.18" />
          </linearGradient>
          <radialGradient id="bx-haze" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#b14bff" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#070509" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="0" y="120" width="1200" height="300" fill="url(#bx-backlight)" />
        <rect x="0" y="0" width="1200" height="560" fill="url(#bx-haze)" />

        {/* lámparas colgantes */}
        {[200, 600, 1000].map((lx, i) => (
          <g key={lx} className="barx-anim" style={{ animation: `barx-lamp ${4 + i}s ease-in-out infinite` }}>
            <line x1={lx} y1={0} x2={lx} y2={56} stroke="#1a1322" strokeWidth={3} />
            <ellipse cx={lx} cy={62} rx={20} ry={10} fill="#1a1015" />
            <ellipse cx={lx} cy={70} rx={42} ry={26} fill="#ffb627" opacity={0.1} style={rim('#ffb627', 18)} />
            <circle cx={lx} cy={64} r={5} fill="#ffe29a" style={rim('#ffb627', 10)} />
          </g>
        ))}

        {variant === 'barra' ? (
          <>
            {/* estantería de botellas */}
            {Array.from({ length: 26 }).map((_, i) => {
              const bx = 60 + i * 42
              const colors = ['#ff2d55', '#b14bff', '#2dd4ff', '#39ff9e', '#ffb627']
              const c = colors[i % colors.length]
              return (
                <g key={i} className="barx-anim" style={{ animation: `barx-lamp ${3 + (i % 4)}s ease-in-out ${i * 0.2}s infinite` }}>
                  <rect x={bx} y={120} width={14} height={46} rx={4} fill="#0c1018" stroke={c} strokeWidth={1} style={rim(c, 5)} />
                  <rect x={bx + 4} y={108} width={6} height={16} rx={2} fill="#0c1018" />
                </g>
              )
            })}
            <rect x="30" y="168" width="1140" height="6" rx="3" fill="#1a1322" />

            {/* camareros detrás de la barra */}
            <BartenderShaker x={360} glow="#2dd4ff" />
            <BartenderWipe x={820} glow="#39ff9e" />

            {/* jarras de cerveza llenándose */}
            {[640, 700].map((gx, i) => (
              <g key={gx} transform={`translate(${gx} 352)`}>
                <path d="M -12 0 L 12 0 L 9 -40 L -9 -40 Z" fill="#0c1018" stroke="#ffb627" strokeWidth={1.2} style={rim('#ffb627', 4)} />
                <rect className="barx-anim" x={-9} y={-38} width={18} height={38} fill="#ffae1f" opacity={0.85}
                  style={{ animation: `barx-fill ${4 + i}s ease-in-out infinite`, transformBox: 'fill-box', transformOrigin: '50% 100%' }} />
                <ellipse cx={0} cy={-38} rx={9} ry={3} fill="#fff6e0" opacity={0.9} />
              </g>
            ))}

            {/* barra (tablero + frontal) */}
            <rect x="0" y="356" width="1200" height="10" fill="#2a160a" />
            <rect x="0" y="356" width="1200" height="4" fill="#3a1c0c" style={rim('#ff7a3c', 4)} />
            <rect x="0" y="366" width="1200" height="194" fill="#0c0a10" />

            {/* clientes de espaldas en la barra */}
            <PatronBack x={150} glow="#ff2d55" delay={0} s={1.02} />
            <PatronBack x={300} glow="#b14bff" delay={1.1} s={0.96} />
            <PatronBack x={520} glow="#2dd4ff" delay={0.6} s={1.0} />
            <PatronBack x={930} glow="#39ff9e" delay={1.6} s={1.0} />
            <PatronBack x={1070} glow="#ffb627" delay={0.3} s={0.95} />

            {/* camarero cruzando con bandeja, primer plano */}
            <WaiterTray y={540} s={1.05} dur={19} glow="#ff2d55" />
          </>
        ) : (
          <>
            {/* SALA DE MESAS */}
            <BarTable x={260} y={360} s={1.05} glow="#ff2d55" />
            <Diner x={205} s={1.05} delay={0.2} glow="#ff2d55" />
            <Diner x={320} s={1.05} delay={1.0} glow="#ff2d55" raising />

            <BarTable x={920} y={330} s={0.95} glow="#2dd4ff" />
            <Diner x={870} s={0.95} delay={0.6} glow="#2dd4ff" />
            <Diner x={975} s={0.95} delay={1.4} glow="#2dd4ff" />

            <BarTable x={600} y={460} s={1.2} glow="#b14bff" />
            <Diner x={540} s={1.2} delay={0.9} glow="#b14bff" />
            <Diner x={665} s={1.2} delay={0.2} glow="#b14bff" />

            <WaiterTray y={520} s={1.1} dur={16} glow="#39ff9e" />
          </>
        )}
      </svg>

      {/* humo + viñeta + oscurecido para legibilidad */}
      <div className="bar-smoke absolute inset-0" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(7,5,9,0.55) 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(7,5,9,0.55), rgba(7,5,9,0.30) 40%, rgba(7,5,9,0.78))' }} />
    </div>
  )
}
