import { type ClassValue, clsx } from 'clsx'

export const cn = (...inputs: ClassValue[]) => clsx(inputs)

export const fichas = (n: number) =>
  `${n % 1 === 0 ? n.toLocaleString('es-ES') : n.toFixed(2)} fichas`

export const money = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.round(diff / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.round(h / 24)
  return `hace ${d} d`
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function countdown(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'cerrado'
  const h = Math.floor(diff / 3600000)
  if (h > 48) return `${Math.floor(h / 24)} días`
  if (h >= 1) return `${h} h`
  return `${Math.max(1, Math.floor(diff / 60000))} min`
}

export const uid = () => Math.random().toString(36).slice(2, 10)

export function initials(name: string) {
  return name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
