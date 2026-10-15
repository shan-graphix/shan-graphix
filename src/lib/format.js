export const digits = (s = '') => String(s).replace(/\D/g, '')

// Sri Lankan numbers like 0771234567 become 94771234567 for WhatsApp links.
export function waNumber(raw = '') {
  let d = digits(raw)
  if (d.startsWith('00')) d = d.slice(2)
  if (d.length === 10 && d.startsWith('0')) d = '94' + d.slice(1)
  return d
}
export const waLink = (raw, text = '') => {
  const n = waNumber(raw)
  return n ? `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}` : ''
}
export const telLink = (raw = '') => (raw ? `tel:${String(raw).replace(/[^\d+]/g, '')}` : '')

// Same person, different formatting: compare the last 9 digits.
export const phoneKey = (raw = '') => digits(raw).slice(-9)

export function toDate(ts) {
  if (!ts) return null
  if (typeof ts.toDate === 'function') return ts.toDate()
  return new Date(ts)
}

export function timeAgo(ts) {
  const d = toDate(ts)
  if (!d) return 'just now'
  const s = Math.max(1, Math.round((Date.now() - d.getTime()) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} h ago`
  const days = Math.round(h / 24)
  if (days < 7) return `${days} d ago`
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

export const formatDate = (ts) => {
  const d = toDate(ts)
  return d ? d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : ''
}

export const money = (n) => `Rs. ${Number(n || 0).toLocaleString('en-LK')}`

export const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || '?'

export const cleanTitle = (filename = '') =>
  filename.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)

export const clamp = (s, n) => String(s || '').trim().slice(0, n)
