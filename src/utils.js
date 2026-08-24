export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

export const fmtDate = (iso) => {
  if (!iso) return 'No date'
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const fmtTime = (t) => {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hr = h % 12 || 12
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`
}

export const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
}

export const isPast = (a, today = todayISO()) => Boolean(a.date) && a.date < today

// "Mon, Sep 7, 2026 · 7:00 PM – 9:00 PM"
export const fmtRange = (a) => {
  let s = fmtDate(a.date)
  if (a.time) s += ` · ${fmtTime(a.time)}`
  if (a.endTime) s += ` – ${fmtTime(a.endTime)}`
  return s
}

// Older activities stored a single leadId; newer ones store leadIds[].
export const getLeadIds = (a) => a.leadIds || (a.leadId ? [a.leadId] : [])

export const ACTIVITY_TYPES = {
  FHE: { color: '#24492d', bg: '#e7efe6' },
  'Sports Night': { color: '#1f4e79', bg: '#e2ecf6' },
  'Sunday BBQ': { color: '#8a4b12', bg: '#f6ead9' },
  'Ward Prayer': { color: '#4a3a72', bg: '#ece7f5' },
}

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?'
