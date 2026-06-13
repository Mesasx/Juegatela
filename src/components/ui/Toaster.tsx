import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, Info, Zap, X } from 'lucide-react'
import { useStore } from '@/store/useStore'

const icons = {
  success: <CheckCircle2 className="text-neon-green" size={20} />,
  error: <XCircle className="text-neon-red" size={20} />,
  info: <Info className="text-neon-blue" size={20} />,
  neon: <Zap className="text-neon-purple" size={20} />,
}

export function Toaster() {
  const toasts = useStore((s) => s.toasts)
  const dismiss = useStore((s) => s.dismissToast)
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[90] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.9 }}
            className="glass pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border-white/15 px-4 py-3 shadow-panel"
          >
            <div className="mt-0.5">{icons[t.tone]}</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-zinc-100">{t.title}</div>
              {t.body && <div className="text-xs text-zinc-400">{t.body}</div>}
            </div>
            <button onClick={() => dismiss(t.id)} className="text-zinc-500 hover:text-white">
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
