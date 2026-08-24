import { ACTIVITY_TYPES } from '../utils.js'

export default function TypeBadge({ type }) {
  if (!type) return null
  const c = ACTIVITY_TYPES[type] || { color: '#5c6355', bg: '#eeece6' }
  return (
    <span className="type-badge" style={{ color: c.color, background: c.bg }}>
      {type}
    </span>
  )
}
