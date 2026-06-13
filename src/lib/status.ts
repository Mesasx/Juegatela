import type { ChallengeStatus, Porra } from './types'

export const challengeStatus: Record<
  ChallengeStatus,
  { label: string; tone: 'red' | 'purple' | 'blue' | 'green' | 'amber' | 'zinc' }
> = {
  draft: { label: 'Borrador', tone: 'zinc' },
  pending: { label: 'Pendiente', tone: 'amber' },
  active: { label: 'Activa', tone: 'green' },
  verifying: { label: 'En verificación', tone: 'blue' },
  won: { label: 'Ganada', tone: 'green' },
  lost: { label: 'Perdida', tone: 'red' },
  cancelled: { label: 'Cancelada', tone: 'zinc' },
  disputed: { label: 'Disputada', tone: 'red' },
  refunded: { label: 'Reembolsada', tone: 'purple' },
}

export const porraStatus: Record<
  Porra['status'],
  { label: string; tone: 'red' | 'purple' | 'blue' | 'green' | 'amber' | 'zinc' }
> = {
  open: { label: 'Abierta', tone: 'green' },
  locked: { label: 'Cerrada', tone: 'amber' },
  verifying: { label: 'Verificando', tone: 'blue' },
  settled: { label: 'Repartida', tone: 'purple' },
  cancelled: { label: 'Cancelada', tone: 'zinc' },
}

export const kindLabel: Record<string, string> = {
  sport: 'Deporte',
  event: 'Evento real',
  personal: 'Reto personal',
  prediction: 'Predicción',
  arcade: 'Arcade',
}

export const verifyLabel: Record<string, string> = {
  auto: 'Automática',
  consensus: 'Consenso',
  admin: 'Administrador',
  proof: 'Subir prueba',
  vote: 'Votación',
}
