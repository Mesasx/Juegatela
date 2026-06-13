import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  User,
  WalletState,
  Transaction,
  Challenge,
  Porra,
  AppNotification,
} from '@/lib/types'
import {
  ME,
  TRANSACTIONS,
  CHALLENGES,
  PORRAS,
  NOTIFICATIONS,
} from '@/lib/mockData'
import { uid } from '@/lib/utils'

export type Toast = {
  id: string
  title: string
  body?: string
  tone: 'success' | 'error' | 'info' | 'neon'
}

export type AuthMode = 'guest' | 'authed' | 'out'

interface AppState {
  // session
  auth: AuthMode
  user: User
  realMode: boolean // platform-level real-money toggle (admin)

  // wallet
  wallet: WalletState
  transactions: Transaction[]

  // data
  challenges: Challenge[]
  porras: Porra[]
  notifications: AppNotification[]

  // ui
  toasts: Toast[]

  // actions — session
  login: () => void
  enterGuest: () => void
  logout: () => void
  setRealMode: (v: boolean) => void

  // actions — wallet
  lockFunds: (amount: number, label: string, ref?: string) => boolean
  releaseToMe: (amount: number, label: string, ref?: string) => void
  settleLoss: (amount: number, label: string, ref?: string) => void
  refund: (amount: number, label: string, ref?: string) => void
  deposit: (amount: number) => void
  withdraw: (amount: number) => boolean
  addTx: (tx: Omit<Transaction, 'id' | 'date'>) => void

  // actions — data
  addChallenge: (c: Challenge) => void
  updateChallenge: (id: string, patch: Partial<Challenge>) => void
  addPorra: (p: Porra) => void
  pickPorraOption: (porraId: string, optionId: string) => void

  // actions — notifications
  markAllRead: () => void
  pushNotification: (n: Omit<AppNotification, 'id' | 'date' | 'read'>) => void

  // actions — toasts
  toast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void

  resetDemo: () => void
}

const initialWallet: WalletState = {
  available: 1000,
  locked: 20,
  pending: 0,
  demo: 1000,
  realModeUnlocked: false,
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      auth: 'out',
      user: ME,
      realMode: false,
      wallet: initialWallet,
      transactions: TRANSACTIONS,
      challenges: CHALLENGES,
      porras: PORRAS,
      notifications: NOTIFICATIONS,
      toasts: [],

      login: () => {
        set({ auth: 'authed' })
        get().toast({ tone: 'neon', title: 'Bienvenido al bar', body: 'Sesión iniciada en modo demo.' })
      },
      enterGuest: () => {
        set({ auth: 'guest' })
        get().toast({ tone: 'info', title: 'Modo invitado', body: 'Explora y practica. Para apostar, crea tu cuenta.' })
      },
      logout: () => set({ auth: 'out' }),
      setRealMode: (v) => set({ realMode: v }),

      lockFunds: (amount, label, ref) => {
        const { wallet } = get()
        if (amount > wallet.available) {
          get().toast({ tone: 'error', title: 'Saldo insuficiente', body: 'No tienes fichas demo suficientes.' })
          return false
        }
        set({
          wallet: { ...wallet, available: wallet.available - amount, locked: wallet.locked + amount },
        })
        get().addTx({ type: 'lock', amount: -amount, currency: 'demo', label, ref })
        get().toast({ tone: 'neon', title: 'Fondos bloqueados', body: `${amount} fichas en juego.` })
        return true
      },
      releaseToMe: (amount, label, ref) => {
        const { wallet } = get()
        set({
          wallet: {
            ...wallet,
            locked: Math.max(0, wallet.locked - amount),
            available: wallet.available + amount * 2,
          },
        })
        get().addTx({ type: 'win', amount: amount * 2, currency: 'demo', label, ref })
      },
      settleLoss: (amount, label, ref) => {
        const { wallet } = get()
        set({ wallet: { ...wallet, locked: Math.max(0, wallet.locked - amount) } })
        get().addTx({ type: 'loss', amount: -amount, currency: 'demo', label, ref })
      },
      refund: (amount, label, ref) => {
        const { wallet } = get()
        set({
          wallet: { ...wallet, locked: Math.max(0, wallet.locked - amount), available: wallet.available + amount },
        })
        get().addTx({ type: 'refund', amount, currency: 'demo', label, ref })
      },
      deposit: (amount) => {
        const { wallet } = get()
        set({ wallet: { ...wallet, available: wallet.available + amount, demo: wallet.demo + amount } })
        get().addTx({ type: 'deposit', amount, currency: 'demo', label: 'Recarga de fichas demo' })
        get().toast({ tone: 'success', title: 'Recarga completada', body: `+${amount} fichas demo.` })
      },
      withdraw: (amount) => {
        const { wallet } = get()
        if (amount > wallet.available) {
          get().toast({ tone: 'error', title: 'Saldo insuficiente', body: 'No puedes retirar más de tu saldo disponible.' })
          return false
        }
        set({ wallet: { ...wallet, available: wallet.available - amount } })
        get().addTx({ type: 'withdraw', amount: -amount, currency: 'demo', label: 'Retirada (simulada)' })
        get().toast({ tone: 'info', title: 'Retirada simulada', body: 'En modo demo no se mueve dinero real.' })
        return true
      },
      addTx: (tx) =>
        set((s) => ({
          transactions: [{ ...tx, id: uid(), date: new Date().toISOString() }, ...s.transactions],
        })),

      addChallenge: (c) => set((s) => ({ challenges: [c, ...s.challenges] })),
      updateChallenge: (id, patch) =>
        set((s) => ({ challenges: s.challenges.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      addPorra: (p) => set((s) => ({ porras: [p, ...s.porras] })),
      pickPorraOption: (porraId, optionId) =>
        set((s) => ({
          porras: s.porras.map((p) =>
            p.id !== porraId
              ? p
              : {
                  ...p,
                  options: p.options.map((o) => ({
                    ...o,
                    picksBy:
                      o.id === optionId
                        ? Array.from(new Set([...o.picksBy, 'me']))
                        : o.picksBy.filter((x) => x !== 'me'),
                  })),
                }
          ),
        })),

      markAllRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      pushNotification: (n) =>
        set((s) => ({
          notifications: [
            { ...n, id: uid(), date: new Date().toISOString(), read: false },
            ...s.notifications,
          ],
        })),

      toast: (t) => {
        const id = uid()
        set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
        setTimeout(() => get().dismissToast(id), 4200)
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      resetDemo: () => {
        set({
          wallet: initialWallet,
          transactions: TRANSACTIONS,
          challenges: CHALLENGES,
          porras: PORRAS,
          notifications: NOTIFICATIONS,
        })
        get().toast({ tone: 'info', title: 'Demo reiniciada', body: 'Saldo y datos restaurados.' })
      },
    }),
    {
      name: 'juegatela-store',
      partialize: (s) => ({
        auth: s.auth,
        wallet: s.wallet,
        transactions: s.transactions,
        challenges: s.challenges,
        porras: s.porras,
        notifications: s.notifications,
        realMode: s.realMode,
      }),
    }
  )
)

export const useUnreadCount = () =>
  useStore((s) => s.notifications.filter((n) => !n.read).length)
