import { CATEGORY_META } from './constants.js'

export const fmt = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount)

export const fmtCompact = (amount, currency = 'USD') => {
  if (Math.abs(amount) >= 1_000_000) return `${currency === 'USD' ? '$' : ''}${(amount/1_000_000).toFixed(2)}M`
  if (Math.abs(amount) >= 1_000)     return `${currency === 'USD' ? '$' : ''}${(amount/1_000).toFixed(1)}K`
  return fmt(amount, currency)
}

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export const fmtRelative = (d) => {
  const diff = Math.floor((Date.now() - new Date(d)) / 1000)
  if (diff < 60)     return 'just now'
  if (diff < 3600)   return `${Math.floor(diff/60)}m ago`
  if (diff < 86400)  return `${Math.floor(diff/3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff/86400)}d ago`
  return fmtDate(d)
}

export const catEmoji = (c) => CATEGORY_META[c]?.emoji || '💳'
export const catColor = (c) => CATEGORY_META[c]?.color || '#6b7591'

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

export const slugify = (s) => s?.toLowerCase().replace(/\s+/g, '-')

export const todayISO = () => new Date().toISOString().slice(0, 10)
