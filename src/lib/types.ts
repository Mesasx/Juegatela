// ── Core domain types for Juegatela ──────────────────────────────────────────

export type ID = string

export interface User {
  id: ID
  username: string
  displayName: string
  avatar: string // emoji or initials seed
  level: number
  xp: number
  country: string
  online: boolean
  // stats
  wins: number
  losses: number
  streak: number
  gamesEarnings: number // demo currency won in arcade
  betsEarnings: number // demo currency won in bets
  badges: string[] // badge ids
  title: string
  joinedAt: string
  verified: boolean
}

export type Currency = 'demo' | 'real'

export interface WalletState {
  available: number
  locked: number
  pending: number
  demo: number
  realModeUnlocked: boolean
}

export type TxType =
  | 'deposit'
  | 'withdraw'
  | 'lock'
  | 'release'
  | 'refund'
  | 'win'
  | 'loss'
  | 'fee'
  | 'bonus'

export interface Transaction {
  id: ID
  type: TxType
  amount: number
  currency: Currency
  label: string
  ref?: string
  date: string
}

export type ChallengeStatus =
  | 'draft'
  | 'pending'
  | 'active'
  | 'verifying'
  | 'won'
  | 'lost'
  | 'cancelled'
  | 'disputed'
  | 'refunded'

export type ChallengeKind = 'sport' | 'event' | 'personal' | 'prediction' | 'arcade'
export type VerifyMethod = 'auto' | 'consensus' | 'admin' | 'proof' | 'vote'
export type Visibility = 'private' | 'group' | 'public'

export interface Challenge {
  id: ID
  title: string
  description: string
  kind: ChallengeKind
  creatorSide: string
  rivalSide: string
  stake: number
  currency: Currency
  acceptBy: string
  eventDate: string
  verify: VerifyMethod
  visibility: Visibility
  rules?: string
  status: ChallengeStatus
  creatorId: ID
  rivalId?: ID
  winnerId?: ID
  createdAt: string
}

export type PorraType =
  | 'single'
  | 'multi'
  | 'exact'
  | 'vote'
  | 'multi-pred'
  | 'odds'
  | 'proportional'

export interface PorraOption {
  id: ID
  label: string
  picksBy: ID[] // users who picked this
}

export interface Porra {
  id: ID
  title: string
  description: string
  type: PorraType
  groupName: string
  entry: number
  currency: Currency
  options: PorraOption[]
  status: 'open' | 'locked' | 'verifying' | 'settled' | 'cancelled'
  closeDate: string
  winningOptionId?: ID
  creatorId: ID
  createdAt: string
}

export interface Game {
  id: string
  name: string
  tagline: string
  emoji: string
  accent: 'red' | 'purple' | 'blue' | 'green' | 'amber'
  category: 'mesa' | 'arcade' | 'reflejos' | 'cartas' | 'azar'
  playable: boolean // truly playable in MVP
  players: string
  difficulty: 1 | 2 | 3
  description: string
}

export interface MatchHistoryItem {
  id: ID
  gameId: string
  opponent: string
  result: 'win' | 'loss' | 'draw'
  stake: number
  currency: Currency
  delta: number
  date: string
}

export interface Badge {
  id: string
  name: string
  emoji: string
  description: string
  rarity: 'común' | 'rara' | 'épica' | 'legendaria'
}

export interface FriendRequest {
  id: ID
  from: User
  date: string
}

export type NotificationType =
  | 'challenge_received'
  | 'challenge_accepted'
  | 'funds_locked'
  | 'match_found'
  | 'match_won'
  | 'match_lost'
  | 'result_pending'
  | 'dispute_open'
  | 'funds_released'
  | 'friend_request'
  | 'message'
  | 'tournament'
  | 'limit_reached'

export interface AppNotification {
  id: ID
  type: NotificationType
  title: string
  body: string
  date: string
  read: boolean
}

export interface RankingEntry {
  rank: number
  user: User
  points: number
  trend: 'up' | 'down' | 'same'
}

export interface Quest {
  id: ID
  title: string
  reward: string
  progress: number
  goal: number
  done: boolean
}
