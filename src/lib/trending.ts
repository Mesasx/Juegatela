import type { PorraType } from './types'

export interface TrendingPorra {
  id: string
  emoji: string
  category: 'Mundial 2026' | 'Fútbol' | 'Tenis' | 'Motor' | 'NBA' | 'Ciclismo' | 'TV & Realities' | 'Gaming' | 'Entre amigos'
  hot?: boolean
  title: string
  description: string
  type: PorraType
  options: string[]
  entry: number
}

// Eventos en auge — actualizado a junio 2026.
// El Mundial 2026 (USA · Canadá · México, 11 jun – 19 jul) es el evento estrella.
export const TRENDING_PORRAS: TrendingPorra[] = [
  {
    id: 'wc-winner',
    emoji: '🏆',
    category: 'Mundial 2026',
    hot: true,
    title: '¿Quién gana el Mundial 2026?',
    description: 'La gran porra del torneo. Elige al campeón de USA, Canadá y México.',
    type: 'single',
    options: ['España', 'Argentina', 'Francia', 'Brasil', 'Inglaterra', 'Otro'],
    entry: 10,
  },
  {
    id: 'wc-spain-round',
    emoji: '🇪🇸',
    category: 'Mundial 2026',
    hot: true,
    title: '¿Hasta dónde llega España?',
    description: '¿Repite La Roja o se queda corta esta vez?',
    type: 'single',
    options: ['Campeona', 'Final', 'Semifinales', 'Cuartos', 'Octavos o antes'],
    entry: 5,
  },
  {
    id: 'wc-topscorer',
    emoji: '⚽',
    category: 'Mundial 2026',
    hot: true,
    title: 'Bota de Oro del Mundial',
    description: '¿Quién será el máximo goleador del torneo?',
    type: 'single',
    options: ['Mbappé', 'Lamine Yamal', 'Haaland', 'Vinícius', 'Julián Álvarez', 'Sorpresa'],
    entry: 5,
  },
  {
    id: 'wc-exact',
    emoji: '🎯',
    category: 'Mundial 2026',
    title: 'Resultado exacto del próximo partido de España',
    description: '¿Cómo queda el marcador final en los 90 minutos?',
    type: 'exact',
    options: ['2-0', '1-0', '2-1', '3-1', '1-1', 'Otro'],
    entry: 5,
  },
  {
    id: 'nba-finals',
    emoji: '🏀',
    category: 'NBA',
    hot: true,
    title: 'Campeón de las Finales NBA 2026',
    description: 'El anillo se decide. ¿Quién levanta el trofeo Larry O’Brien?',
    type: 'single',
    options: ['Celtics', 'Thunder', 'Nuggets', 'Knicks', 'Otro'],
    entry: 5,
  },
  {
    id: 'wimbledon',
    emoji: '🎾',
    category: 'Tenis',
    hot: true,
    title: 'Ganador de Wimbledon 2026',
    description: 'Hierba, blanco impoluto y un nuevo campeón.',
    type: 'single',
    options: ['Alcaraz', 'Sinner', 'Djokovic', 'Zverev', 'Otro'],
    entry: 5,
  },
  {
    id: 'f1-gp',
    emoji: '🏎️',
    category: 'Motor',
    title: 'Ganador del próximo Gran Premio de F1',
    description: '¿Quién sube a lo más alto del podio este finde?',
    type: 'single',
    options: ['Verstappen', 'Norris', 'Leclerc', 'Piastri', 'Hamilton', 'Otro'],
    entry: 5,
  },
  {
    id: 'tdf',
    emoji: '🚴',
    category: 'Ciclismo',
    title: 'Maillot amarillo del Tour de Francia 2026',
    description: 'Tres semanas de sufrimiento para un único ganador en París.',
    type: 'single',
    options: ['Pogačar', 'Vingegaard', 'Evenepoel', 'Roglič', 'Otro'],
    entry: 5,
  },
  {
    id: 'motogp',
    emoji: '🏍️',
    category: 'Motor',
    title: 'Ganador del próximo GP de MotoGP',
    description: 'A tumbar la moto. ¿Quién cruza primero la meta?',
    type: 'single',
    options: ['Martín', 'Bagnaia', 'Márquez', 'Bezzecchi', 'Otro'],
    entry: 5,
  },
  {
    id: 'reality-final',
    emoji: '📺',
    category: 'TV & Realities',
    hot: true,
    title: '¿Quién gana la final del reality?',
    description: 'Supervivientes, GH o el de turno: monta la porra del sofá.',
    type: 'single',
    options: ['Concursante 1', 'Concursante 2', 'Concursante 3', 'Concursante 4'],
    entry: 3,
  },
  {
    id: 'fifa-night',
    emoji: '🎮',
    category: 'Gaming',
    title: 'Torneo de FC esta noche',
    description: '¿Quién se corona en el torneo de FC/FIFA del grupo?',
    type: 'single',
    options: ['El Zorro', 'Águila', 'Tiburón', 'Yo'],
    entry: 5,
  },
  {
    id: 'esports',
    emoji: '🕹️',
    category: 'Gaming',
    title: 'Ganador del próximo Major de esports',
    description: 'CS, LoL o Valorant: elige al equipo campeón.',
    type: 'single',
    options: ['Equipo A', 'Equipo B', 'Equipo C', 'Equipo D'],
    entry: 5,
  },
  {
    id: 'late-dinner',
    emoji: '🕖',
    category: 'Entre amigos',
    title: '¿Quién llega tarde a la cena?',
    description: 'El que llegue el último no cobra del bote. Clásico infalible.',
    type: 'vote',
    options: ['El Zorro', 'Lobita', 'Serpiente', 'Pulpo'],
    entry: 3,
  },
  {
    id: 'first-round',
    emoji: '🍻',
    category: 'Entre amigos',
    title: '¿Quién paga la primera ronda?',
    description: 'Decidido como Dios manda: con una porra.',
    type: 'vote',
    options: ['Yo invito', 'Tú invitas', 'Lo echamos a suertes', 'El último en llegar'],
    entry: 2,
  },
]

export const TRENDING_CATEGORIES = Array.from(
  new Set(TRENDING_PORRAS.map((t) => t.category))
)
