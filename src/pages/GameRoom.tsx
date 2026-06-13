import { useState } from 'react'
import { GAMES } from '@/lib/games'
import { GameCard, PageHeader } from '@/components/shared'
import { Chip } from '@/components/ui/Primitives'
import { cn } from '@/lib/utils'

const CATS = [
  { id: 'todos', label: 'Todos' },
  { id: 'mesa', label: 'Mesa' },
  { id: 'arcade', label: 'Arcade' },
  { id: 'reflejos', label: 'Reflejos' },
  { id: 'cartas', label: 'Cartas' },
  { id: 'azar', label: 'Azar' },
]

export default function GameRoom() {
  const [cat, setCat] = useState('todos')
  const list = GAMES.filter((g) => cat === 'todos' || g.category === cat)
  const playable = GAMES.filter((g) => g.playable)

  return (
    <div>
      <PageHeader
        eyebrow="La Sala de Juegos"
        title="Elige tu mesa"
        subtitle="Arcade clandestino jugable en el navegador. Practica gratis o juega con fichas contra amigos y rivales."
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {CATS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={cn(
              'chip border transition',
              cat === c.id
                ? 'border-neon-red/50 bg-neon-red/15 text-neon-red'
                : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
            )}
          >
            {c.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-zinc-500">
          <Chip tone="green">{playable.length} jugables ya</Chip>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((g, i) => (
          <GameCard key={g.id} g={g} index={i} />
        ))}
      </div>
    </div>
  )
}
