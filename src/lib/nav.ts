import {
  Home,
  Compass,
  Gamepad2,
  Swords,
  Trophy,
  Wallet,
  Users,
  Bell,
  History,
  Settings,
  LifeBuoy,
  ShieldCheck,
  Scale,
  LayoutDashboard,
  Target,
  Dices,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const primaryNav: NavItem[] = [
  { to: '/app', label: 'Inicio', icon: Home },
  { to: '/explorar', label: 'Explorar', icon: Compass },
  { to: '/sala', label: 'Sala de Juegos', icon: Gamepad2 },
  { to: '/matchmaking', label: 'Buscar rival', icon: Target },
  { to: '/retos', label: 'Retos', icon: Swords },
  { to: '/porras', label: 'Porras', icon: Dices },
  { to: '/ranking', label: 'Ranking', icon: Trophy },
  { to: '/amigos', label: 'Amigos', icon: Users },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
  { to: '/historial', label: 'Historial', icon: History },
]

export const secondaryNav: NavItem[] = [
  { to: '/notificaciones', label: 'Notificaciones', icon: Bell },
  { to: '/ajustes', label: 'Ajustes', icon: Settings },
  { to: '/soporte', label: 'Soporte', icon: LifeBuoy },
  { to: '/juego-responsable', label: 'Juego responsable', icon: ShieldCheck },
  { to: '/legal', label: 'Legal', icon: Scale },
  { to: '/admin', label: 'Panel Admin', icon: LayoutDashboard },
]

// mobile bottom bar (5 items)
export const bottomNav: NavItem[] = [
  { to: '/app', label: 'Inicio', icon: Home },
  { to: '/sala', label: 'Juegos', icon: Gamepad2 },
  { to: '/retos', label: 'Retos', icon: Swords },
  { to: '/ranking', label: 'Ranking', icon: Trophy },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
]
