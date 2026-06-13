import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { type ReactNode, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Toaster } from '@/components/ui/Toaster'

import Landing from '@/pages/Landing'
import Auth from '@/pages/Auth'
import Home from '@/pages/Home'
import Explore from '@/pages/Explore'
import GameRoom from '@/pages/GameRoom'
import GameDetail from '@/pages/GameDetail'
import GamePlay from '@/pages/GamePlay'
import Matchmaking from '@/pages/Matchmaking'
import Challenges from '@/pages/Challenges'
import CreateChallenge from '@/pages/CreateChallenge'
import Porras from '@/pages/Porras'
import CreatePorra from '@/pages/CreatePorra'
import Groups from '@/pages/Groups'
import Friends from '@/pages/Friends'
import Profile from '@/pages/Profile'
import Ranking from '@/pages/Ranking'
import WalletPage from '@/pages/WalletPage'
import HistoryPage from '@/pages/HistoryPage'
import Notifications from '@/pages/Notifications'
import SettingsPage from '@/pages/SettingsPage'
import Support from '@/pages/Support'
import Responsible from '@/pages/Responsible'
import Legal from '@/pages/Legal'
import Admin from '@/pages/Admin'

function Page({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  )
}

// Wrap app pages in the shell
function Shell({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <Page>{children}</Page>
    </AppShell>
  )
}

export default function App() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public, full-bleed */}
          <Route path="/" element={<Page><Landing /></Page>} />
          <Route path="/entrar" element={<Page><Auth mode="login" /></Page>} />
          <Route path="/registro" element={<Page><Auth mode="register" /></Page>} />
          <Route path="/recuperar" element={<Page><Auth mode="recover" /></Page>} />

          {/* App, inside shell */}
          <Route path="/app" element={<Shell><Home /></Shell>} />
          <Route path="/explorar" element={<Shell><Explore /></Shell>} />
          <Route path="/sala" element={<Shell><GameRoom /></Shell>} />
          <Route path="/sala/:gameId" element={<Shell><GameDetail /></Shell>} />
          <Route path="/jugar/:gameId" element={<Shell><GamePlay /></Shell>} />
          <Route path="/matchmaking" element={<Shell><Matchmaking /></Shell>} />
          <Route path="/retos" element={<Shell><Challenges /></Shell>} />
          <Route path="/retos/crear" element={<Shell><CreateChallenge /></Shell>} />
          <Route path="/porras" element={<Shell><Porras /></Shell>} />
          <Route path="/porras/crear" element={<Shell><CreatePorra /></Shell>} />
          <Route path="/grupos" element={<Shell><Groups /></Shell>} />
          <Route path="/amigos" element={<Shell><Friends /></Shell>} />
          <Route path="/perfil" element={<Shell><Profile /></Shell>} />
          <Route path="/perfil/:userId" element={<Shell><Profile /></Shell>} />
          <Route path="/ranking" element={<Shell><Ranking /></Shell>} />
          <Route path="/wallet" element={<Shell><WalletPage /></Shell>} />
          <Route path="/historial" element={<Shell><HistoryPage /></Shell>} />
          <Route path="/notificaciones" element={<Shell><Notifications /></Shell>} />
          <Route path="/ajustes" element={<Shell><SettingsPage /></Shell>} />
          <Route path="/soporte" element={<Shell><Support /></Shell>} />
          <Route path="/juego-responsable" element={<Shell><Responsible /></Shell>} />
          <Route path="/legal" element={<Shell><Legal /></Shell>} />
          <Route path="/admin" element={<Shell><Admin /></Shell>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <Toaster />
    </>
  )
}
