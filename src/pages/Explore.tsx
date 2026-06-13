import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, Swords, Ticket, Gamepad2, Trophy, Sparkles, ChevronRight } from 'lucide-react'
import { Card, Chip, SectionTitle } from '@/components/ui/Primitives'
import { PageHeader, ChallengeCard, PorraCard, GameCard, UserRow } from '@/components/shared'
import { CHALLENGES, PORRAS, RANKING } from '@/lib/mockData'
import { GAMES } from '@/lib/games'
import { cn } from '@/lib/utils'
import type { Game } from '@/lib/types'

type Cat = 'todo' | Game['category']

const CATS: { key: Cat; label: string; emoji: string }[] = [
  { key: 'todo', label: 'Todo', emoji: '🌌' },
  { key: 'arcade', label: 'Arcade', emoji: '🕹️' },
  { key: 'mesa', label: 'Mesa', emoji: '🎱' },
  { key: 'reflejos', label: 'Reflejos', emoji: '⚡' },
  { key: 'cartas', label: 'Cartas', emoji: '🃏' },
  { key: 'azar', label: 'Azar', emoji: '🎲' },
]

export default function Explore() {
  const [cat, setCat] = useState<Cat>('todo')

  const publicChallenges = CHALLENGES.filter((c) => c.visibility !== 'private').slice(0, 4)
  const featuredChallenges = publicChallenges.length ? publicChallenges : CHALLENGES.slice(0, 4)
  const games = cat === 'todo' ? GAMES : GAMES.filter((g) => g.category === cat)
  const topPlayers = RANKING.slice(0, 5)

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <PageHeader
        eyebrow="El lobby clandestino"
        title="Explorar"
        subtitle="Echa un ojo al ambiente del bar: retos abiertos, porras calientes y los juegos que más se mueven. Sin cuenta, solo mirando."
      />

      {/* Banner CTA */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Card glow="shadow-neon-red/30" className="relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neon-red/20 via-neon-purple/15 to-transparent" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-neon-purple/30 blur-3xl" />
          <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-neon-amber">
                <Sparkles size={18} className="animate-pulse-glow" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Modo demo · fichas ficticias</span>
              </div>
              <h2 className="neon-title text-3xl text-zinc-50 sm:text-4xl">¿Te la juegas?</h2>
              <p className="mt-1 max-w-md text-sm text-zinc-400">
                Crea tu cuenta, llévate fichas demo de bienvenida y empieza a retar a tus amigos esta misma noche.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link to="/registro" className="btn-primary">
                Crear cuenta <ChevronRight size={16} />
              </Link>
              <Link to="/entrar" className="btn-ghost">
                Entrar
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Retos destacados */}
      <section className="mb-10">
        <SectionTitle
          eyebrow="Se cuece algo"
          title="Retos destacados"
          action={
            <Link to="/retos" className="btn-ghost text-sm">
              <Swords size={14} /> Ver retos
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {featuredChallenges.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ChallengeCard c={c} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Porras populares */}
      <section className="mb-10">
        <SectionTitle
          eyebrow="A bote pronto"
          title="Porras populares"
          action={
            <Link to="/porras" className="btn-ghost text-sm">
              <Ticket size={14} /> Ver porras
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PORRAS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <PorraCard p={p} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Juegos de moda */}
      <section className="mb-10">
        <SectionTitle
          eyebrow="La sala de máquinas"
          title="Juegos de moda"
          action={
            <Link to="/sala" className="btn-ghost text-sm">
              <Gamepad2 size={14} /> Ver sala
            </Link>
          }
        />

        {/* Filtros por categoría */}
        <div className="scrollbar-none mb-4 flex gap-2 overflow-x-auto pb-1">
          {CATS.map((c) => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={cn(
                'chip shrink-0 gap-1.5 px-3 py-1.5 transition',
                cat === c.key
                  ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/40'
                  : 'bg-white/5 text-zinc-400 border border-white/10 hover:text-white'
              )}
            >
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>

        {games.length ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {games.map((g, i) => (
              <GameCard key={g.id} g={g} index={i} />
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center text-sm text-zinc-500">
            Nada en esta categoría todavía. Pronto habrá más máquinas encendidas.
          </Card>
        )}
      </section>

      {/* Jugadores top */}
      <section className="mb-4">
        <SectionTitle
          eyebrow="La barra de los cracks"
          title="Jugadores top"
          action={
            <Link to="/ranking" className="btn-ghost text-sm">
              <Trophy size={14} /> Ver ranking
            </Link>
          }
        />
        <div className="space-y-2">
          {topPlayers.map((e, i) => (
            <motion.div
              key={e.user.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <UserRow
                user={e.user}
                to={`/perfil/${e.user.id}`}
                right={
                  <div className="flex items-center gap-2">
                    <Chip tone={i === 0 ? 'amber' : 'zinc'}>
                      <Flame size={11} /> #{e.rank}
                    </Chip>
                    <span className="hidden text-sm font-extrabold text-zinc-200 sm:block">
                      {e.points.toLocaleString('es-ES')}
                    </span>
                  </div>
                }
              />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
