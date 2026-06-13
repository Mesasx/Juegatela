import { type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Plus, Bell, Coins, ShieldQuestion } from 'lucide-react'
import { primaryNav, secondaryNav, bottomNav } from '@/lib/nav'
import { useStore, useUnreadCount } from '@/store/useStore'
import { Avatar } from '@/components/ui/Primitives'
import { cn, fichas } from '@/lib/utils'

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="neon-title text-2xl leading-none text-neon-red">JUÉGATELA</span>
      <span className="h-2 w-2 animate-pulse-glow rounded-full bg-neon-green shadow-neon-green" />
    </Link>
  )
}

function WalletPill() {
  const wallet = useStore((s) => s.wallet)
  return (
    <Link
      to="/wallet"
      className="flex items-center gap-2 rounded-xl border border-neon-amber/30 bg-neon-amber/10 px-3 py-1.5 text-sm font-bold text-neon-amber transition hover:bg-neon-amber/20"
    >
      <Coins size={16} />
      {fichas(wallet.available).replace(' fichas', '')}
      <span className="hidden text-[10px] font-semibold uppercase opacity-70 sm:inline">demo</span>
    </Link>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const auth = useStore((s) => s.auth)
  const user = useStore((s) => s.user)
  const logout = useStore((s) => s.logout)
  const unread = useUnreadCount()
  const navigate = useNavigate()

  return (
    <div className="smoke min-h-screen">
      {/* ── Desktop sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/5 bg-ink-900/80 backdrop-blur-xl lg:flex">
        <div className="px-5 py-5">
          <Brand />
        </div>
        <nav className="scrollbar-none flex-1 space-y-0.5 overflow-y-auto px-3">
          {primaryNav.map((item) => (
            <NavItemLink key={item.to} {...item} />
          ))}
          <div className="my-3 border-t border-white/5" />
          {secondaryNav.map((item) => (
            <NavItemLink key={item.to} {...item} subtle badge={item.to === '/notificaciones' ? unread : undefined} />
          ))}
        </nav>
        <div className="border-t border-white/5 p-3">
          {auth === 'guest' && (
            <div className="mb-2 flex items-start gap-2 rounded-xl border border-neon-amber/30 bg-neon-amber/10 p-2.5 text-[11px] text-neon-amber">
              <ShieldQuestion size={26} className="shrink-0" />
              <span>Estás como invitado. Crea tu cuenta para apostar y guardar progreso.</span>
            </div>
          )}
          <Link to="/perfil" className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/5">
            <Avatar seed={user.avatar} size={38} online={user.online} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-zinc-100">
                {auth === 'guest' ? 'Invitado' : user.displayName}
              </div>
              <div className="truncate text-[11px] text-zinc-500">Nivel {user.level} · {user.title}</div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault()
                logout()
                navigate('/')
              }}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/10 hover:text-neon-red"
              title="Salir"
            >
              <LogOut size={16} />
            </button>
          </Link>
        </div>
      </aside>

      {/* ── Main column ── */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-white/5 bg-ink-950/70 px-4 backdrop-blur-xl sm:px-6">
          <div className="lg:hidden">
            <Brand />
          </div>
          <div className="hidden lg:block">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-600">
              El bar está abierto · {user.online ? 'en línea' : 'fuera'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <WalletPill />
            <Link
              to="/notificaciones"
              className="relative rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white/10"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-neon-red px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </Link>
            <Link to="/retos/crear" className="btn-primary hidden sm:inline-flex">
              <Plus size={16} /> Crear reto
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12">{children}</main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-white/10 bg-ink-900/95 backdrop-blur-xl lg:hidden">
        {bottomNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition',
                isActive ? 'text-neon-red' : 'text-zinc-500'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? 'drop-shadow-[0_0_6px_rgba(255,45,85,0.8)]' : ''} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function NavItemLink({
  to,
  label,
  icon: Icon,
  subtle,
  badge,
}: {
  to: string
  label: string
  icon: typeof Plus
  subtle?: boolean
  badge?: number
}) {
  return (
    <NavLink
      to={to}
      end={to === '/app'}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition',
          isActive
            ? 'bg-neon-red/10 text-neon-red shadow-[inset_0_0_0_1px_rgba(255,45,85,0.25)]'
            : subtle
            ? 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
            : 'text-zinc-300 hover:bg-white/5 hover:text-white'
        )
      }
    >
      <Icon size={18} />
      <span className="flex-1">{label}</span>
      {badge ? (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-neon-red px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </NavLink>
  )
}
