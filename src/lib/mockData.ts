import type {
  User,
  Badge,
  Challenge,
  Porra,
  MatchHistoryItem,
  AppNotification,
  RankingEntry,
  Quest,
  FriendRequest,
  Transaction,
} from './types'

export const BADGES: Badge[] = [
  { id: 'rey-bar', name: 'Rey del Bar', emoji: '👑', description: 'Nº1 del ranking semanal', rarity: 'legendaria' },
  { id: 'mano-fria', name: 'Mano Fría', emoji: '🧊', description: 'Gana 10 duelos de reflejos', rarity: 'épica' },
  { id: 'doble-nada', name: 'Doble o Nada', emoji: '🎰', description: 'Gana 3 revanchas seguidas', rarity: 'rara' },
  { id: 'invicto', name: 'El Invicto', emoji: '🛡️', description: 'Racha de 15 victorias', rarity: 'legendaria' },
  { id: 'farolero', name: 'El Farolero', emoji: '🃏', description: 'Gana farolando 5 veces', rarity: 'épica' },
  { id: 'neon-dorado', name: 'Neón Dorado', emoji: '✨', description: 'Alcanza el nivel 25', rarity: 'épica' },
  { id: 'maestro-billar', name: 'Maestro del Billar', emoji: '🎱', description: 'Gana 20 partidas de billar', rarity: 'rara' },
  { id: 'campeon-noche', name: 'Campeón de la Noche', emoji: '🌙', description: 'Gana un torneo nocturno', rarity: 'legendaria' },
  { id: 'primera-ronda', name: 'Primera Ronda', emoji: '🍻', description: 'Juega tu primera partida', rarity: 'común' },
  { id: 'fiel', name: 'Cliente Fiel', emoji: '🪙', description: 'Entra 7 días seguidos', rarity: 'común' },
]

const avatars = ['🦊', '🐺', '🐉', '🦅', '🐍', '🦂', '🐙', '🦈', '🐲', '🦇', '🐯', '🦁']

function mkUser(p: Partial<User> & { id: string; username: string }): User {
  return {
    displayName: p.username,
    avatar: avatars[Math.floor(Math.random() * avatars.length)],
    level: 12,
    xp: 3400,
    country: 'ES',
    online: false,
    wins: 40,
    losses: 25,
    streak: 3,
    gamesEarnings: 1200,
    betsEarnings: 800,
    badges: ['primera-ronda'],
    title: 'Habitual del bar',
    joinedAt: '2025-09-01',
    verified: false,
    ...p,
  }
}

export const ME: User = mkUser({
  id: 'me',
  username: 'tu_alias',
  displayName: 'Tú',
  avatar: '🎭',
  level: 14,
  xp: 4280,
  online: true,
  wins: 58,
  losses: 31,
  streak: 4,
  gamesEarnings: 2150,
  betsEarnings: 1340,
  badges: ['primera-ronda', 'mano-fria', 'doble-nada', 'fiel'],
  title: 'Tiburón de barra',
  verified: true,
})

export const FRIENDS: User[] = [
  mkUser({ id: 'u1', username: 'elzorro', displayName: 'El Zorro', avatar: '🦊', online: true, level: 22, streak: 7, wins: 120, losses: 60, title: 'Rey del Bar', badges: ['rey-bar', 'invicto', 'neon-dorado'], verified: true }),
  mkUser({ id: 'u2', username: 'lobitanoche', displayName: 'Lobita', avatar: '🐺', online: true, level: 18, wins: 88, losses: 70, title: 'Farolera', badges: ['farolero'] }),
  mkUser({ id: 'u3', username: 'serpiente99', displayName: 'Serpiente', avatar: '🐍', online: false, level: 9, wins: 30, losses: 41, title: 'Aprendiz' }),
  mkUser({ id: 'u4', username: 'aguilareal', displayName: 'Águila', avatar: '🦅', online: true, level: 31, wins: 210, losses: 90, title: 'Campeón de la Noche', badges: ['campeon-noche', 'maestro-billar'], verified: true }),
  mkUser({ id: 'u5', username: 'pulpo_8', displayName: 'Pulpo', avatar: '🐙', online: false, level: 15, wins: 64, losses: 55, title: 'Mano Fría', badges: ['mano-fria'] }),
  mkUser({ id: 'u6', username: 'tiburonx', displayName: 'Tiburón', avatar: '🦈', online: true, level: 27, wins: 150, losses: 80, title: 'Doble o Nada', badges: ['doble-nada', 'neon-dorado'] }),
]

export const FRIEND_REQUESTS: FriendRequest[] = [
  { id: 'fr1', from: mkUser({ id: 'r1', username: 'murcielago', displayName: 'Murciélago', avatar: '🦇', level: 11 }), date: '2026-06-12T20:14:00Z' },
  { id: 'fr2', from: mkUser({ id: 'r2', username: 'dragon_rojo', displayName: 'Dragón Rojo', avatar: '🐉', level: 19, verified: true }), date: '2026-06-13T08:02:00Z' },
]

export const CHALLENGES: Challenge[] = [
  {
    id: 'c1', title: 'España gana a Cabo Verde', description: 'Partido del lunes. Si gana España, gano yo.',
    kind: 'sport', creatorSide: 'Gana España', rivalSide: 'Empate o gana Cabo Verde',
    stake: 5, currency: 'demo', acceptBy: '2026-06-15T18:00:00Z', eventDate: '2026-06-16T20:45:00Z',
    verify: 'auto', visibility: 'private', status: 'pending', creatorId: 'me', rivalId: 'u1', createdAt: '2026-06-12T10:00:00Z',
    rules: 'Cuenta el resultado en los 90 min + descuento. Prórroga no aplica.',
  },
  {
    id: 'c2', title: 'No fumo en toda la semana', description: 'Reto personal. Si aguanto sin fumar, pago el Zorro.',
    kind: 'personal', creatorSide: 'Aguanto la semana', rivalSide: 'Caes antes del domingo',
    stake: 20, currency: 'demo', acceptBy: '2026-06-14T00:00:00Z', eventDate: '2026-06-20T23:59:00Z',
    verify: 'consensus', visibility: 'group', status: 'active', creatorId: 'me', rivalId: 'u4', createdAt: '2026-06-10T09:00:00Z',
  },
  {
    id: 'c3', title: 'Llego antes que tú al bar', description: 'El último en llegar el viernes paga la primera ronda.',
    kind: 'event', creatorSide: 'Llego primero', rivalSide: 'Llegas tú primero',
    stake: 10, currency: 'demo', acceptBy: '2026-06-13T18:00:00Z', eventDate: '2026-06-13T22:00:00Z',
    verify: 'proof', visibility: 'private', status: 'verifying', creatorId: 'u2', rivalId: 'me', createdAt: '2026-06-11T12:00:00Z',
  },
  {
    id: 'c4', title: 'Maratón en menos de 4h', description: 'Predicción libre sobre mi crono del domingo.',
    kind: 'prediction', creatorSide: 'Bajo de 4h', rivalSide: 'Tardo más de 4h',
    stake: 15, currency: 'demo', acceptBy: '2026-06-09T00:00:00Z', eventDate: '2026-06-08T09:00:00Z',
    verify: 'proof', visibility: 'public', status: 'won', creatorId: 'me', rivalId: 'u6', winnerId: 'me', createdAt: '2026-06-01T12:00:00Z',
  },
  {
    id: 'c5', title: 'Final de la liga de billar', description: 'Quién gana la final del torneo del barrio.',
    kind: 'event', creatorSide: 'Gana el Águila', rivalSide: 'Gana el Tiburón',
    stake: 25, currency: 'demo', acceptBy: '2026-06-05T00:00:00Z', eventDate: '2026-06-04T20:00:00Z',
    verify: 'admin', visibility: 'public', status: 'disputed', creatorId: 'u4', rivalId: 'u6', createdAt: '2026-05-28T12:00:00Z',
  },
]

export const PORRAS: Porra[] = [
  {
    id: 'p1', title: 'Resultado exacto España-Cabo Verde', description: '¿Cómo queda el marcador final?',
    type: 'exact', groupName: 'Los del bar', entry: 5, currency: 'demo', status: 'open',
    closeDate: '2026-06-16T20:30:00Z', creatorId: 'me', createdAt: '2026-06-12T10:00:00Z',
    options: [
      { id: 'o1', label: '2-0', picksBy: ['me', 'u1'] },
      { id: 'o2', label: '3-1', picksBy: ['u2'] },
      { id: 'o3', label: '1-0', picksBy: ['u4', 'u6'] },
      { id: 'o4', label: '2-1', picksBy: [] },
    ],
  },
  {
    id: 'p2', title: 'Quién gana el torneo de FIFA', description: 'Torneo de esta noche en casa del Zorro.',
    type: 'single', groupName: 'Gamers', entry: 10, currency: 'demo', status: 'locked',
    closeDate: '2026-06-13T21:00:00Z', creatorId: 'u1', createdAt: '2026-06-13T15:00:00Z',
    options: [
      { id: 'o1', label: 'El Zorro', picksBy: ['u1', 'me'] },
      { id: 'o2', label: 'Águila', picksBy: ['u4'] },
      { id: 'o3', label: 'Tiburón', picksBy: ['u6', 'u2'] },
    ],
  },
  {
    id: 'p3', title: 'Quién llega tarde a la cena', description: 'El que llegue más tarde no cobra del bote.',
    type: 'vote', groupName: 'Cena viernes', entry: 3, currency: 'demo', status: 'settled',
    closeDate: '2026-06-06T21:00:00Z', winningOptionId: 'o3', creatorId: 'u2', createdAt: '2026-06-05T10:00:00Z',
    options: [
      { id: 'o1', label: 'El Zorro', picksBy: ['u4'] },
      { id: 'o2', label: 'Lobita', picksBy: [] },
      { id: 'o3', label: 'Serpiente', picksBy: ['me', 'u1', 'u6'] },
    ],
  },
]

export const MATCH_HISTORY: MatchHistoryItem[] = [
  { id: 'm1', gameId: 'pong', opponent: 'El Zorro', result: 'win', stake: 5, currency: 'demo', delta: 5, date: '2026-06-13T09:20:00Z' },
  { id: 'm2', gameId: 'reflejos', opponent: 'Tiburón', result: 'loss', stake: 10, currency: 'demo', delta: -10, date: '2026-06-12T22:10:00Z' },
  { id: 'm3', gameId: 'billar', opponent: 'Águila', result: 'win', stake: 8, currency: 'demo', delta: 8, date: '2026-06-12T18:45:00Z' },
  { id: 'm4', gameId: 'pong', opponent: 'Aleatorio #2291', result: 'win', stake: 3, currency: 'demo', delta: 3, date: '2026-06-11T20:00:00Z' },
  { id: 'm5', gameId: 'reflejos', opponent: 'Lobita', result: 'loss', stake: 5, currency: 'demo', delta: -5, date: '2026-06-10T19:30:00Z' },
  { id: 'm6', gameId: 'billar', opponent: 'Pulpo', result: 'draw', stake: 6, currency: 'demo', delta: 0, date: '2026-06-09T21:15:00Z' },
]

export const NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', type: 'challenge_received', title: 'Nuevo reto', body: 'Lobita te reta: "Llego antes que tú al bar" · 10 fichas', date: '2026-06-13T08:30:00Z', read: false },
  { id: 'n2', type: 'funds_locked', title: 'Fondos bloqueados', body: 'Se bloquearon 20 fichas para tu reto con Águila.', date: '2026-06-13T07:00:00Z', read: false },
  { id: 'n3', type: 'match_won', title: '¡Victoria!', body: 'Ganaste a El Zorro en Neón Pong. +5 fichas liberadas.', date: '2026-06-13T09:21:00Z', read: false },
  { id: 'n4', type: 'friend_request', title: 'Solicitud de amistad', body: 'Dragón Rojo quiere ser tu amigo.', date: '2026-06-13T08:02:00Z', read: true },
  { id: 'n5', type: 'tournament', title: 'Torneo disponible', body: 'Torneo nocturno de Mano Fría a las 23:00. ¡Apúntate!', date: '2026-06-12T20:00:00Z', read: true },
  { id: 'n6', type: 'dispute_open', title: 'Disputa abierta', body: 'La porra de la final de billar está en revisión.', date: '2026-06-12T11:00:00Z', read: true },
]

export const TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'bonus', amount: 1000, currency: 'demo', label: 'Bono de bienvenida (fichas demo)', date: '2026-06-01T10:00:00Z' },
  { id: 't2', type: 'win', amount: 5, currency: 'demo', label: 'Victoria vs El Zorro · Neón Pong', ref: 'm1', date: '2026-06-13T09:21:00Z' },
  { id: 't3', type: 'lock', amount: -20, currency: 'demo', label: 'Reto: No fumo en toda la semana', ref: 'c2', date: '2026-06-13T07:00:00Z' },
  { id: 't4', type: 'loss', amount: -10, currency: 'demo', label: 'Derrota vs Tiburón · Mano Fría', ref: 'm2', date: '2026-06-12T22:10:00Z' },
  { id: 't5', type: 'win', amount: 8, currency: 'demo', label: 'Victoria vs Águila · Billar', ref: 'm3', date: '2026-06-12T18:45:00Z' },
  { id: 't6', type: 'fee', amount: -0.4, currency: 'demo', label: 'Comisión de plataforma (5%)', date: '2026-06-12T18:45:00Z' },
]

function mkRankUser(i: number, base: User): RankingEntry {
  return {
    rank: i + 1,
    user: base,
    points: Math.round(5000 - i * 340 + Math.random() * 80),
    trend: i % 3 === 0 ? 'up' : i % 3 === 1 ? 'down' : 'same',
  }
}

export const RANKING: RankingEntry[] = [
  FRIENDS[3], FRIENDS[0], FRIENDS[5], ME, FRIENDS[1], FRIENDS[4], FRIENDS[2],
  ...Array.from({ length: 5 }, (_, k) =>
    mkUser({ id: `rk${k}`, username: `jugador_${k + 8}`, displayName: `Jugador ${k + 8}`, level: 20 - k })
  ),
].map((u, i) => mkRankUser(i, u))

export const QUESTS: Quest[] = [
  { id: 'q1', title: 'Juega 3 partidas hoy', reward: '+150 XP', progress: 1, goal: 3, done: false },
  { id: 'q2', title: 'Gana un duelo de reflejos', reward: 'Insignia Mano Fría', progress: 0, goal: 1, done: false },
  { id: 'q3', title: 'Crea una porra con amigos', reward: '+200 XP', progress: 1, goal: 1, done: true },
  { id: 'q4', title: 'Entra al bar 2 días seguidos', reward: '+50 fichas demo', progress: 2, goal: 2, done: true },
]
