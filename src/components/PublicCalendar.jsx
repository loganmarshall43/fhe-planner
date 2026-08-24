import { useState } from 'react'
import { fmtRange, todayISO, ACTIVITY_TYPES } from '../utils.js'
import TypeBadge from './TypeBadge.jsx'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Read-only month calendar for the general public: what's happening, when, and where.
// No supplies, assignments, or member info — that's committee-only.
export default function PublicCalendar({ activities }) {
  const today = todayISO()
  const [ty, tm] = today.split('-').map(Number)
  const [ym, setYm] = useState({ y: ty, m: tm })

  const shift = (d) =>
    setYm(({ y, m }) => {
      const n = m + d
      if (n < 1) return { y: y - 1, m: 12 }
      if (n > 12) return { y: y + 1, m: 1 }
      return { y, m: n }
    })

  const monthKey = `${ym.y}-${String(ym.m).padStart(2, '0')}`
  const inMonth = activities
    .filter((a) => (a.date || '').startsWith(monthKey))
    .sort((a, b) => `${a.date}${a.time || ''}`.localeCompare(`${b.date}${b.time || ''}`))

  const byDay = {}
  inMonth.forEach((a) => {
    const d = Number(a.date.slice(8))
    ;(byDay[d] = byDay[d] || []).push(a)
  })

  const startDow = new Date(ym.y, ym.m - 1, 1).getDay()
  const daysInMonth = new Date(ym.y, ym.m, 0).getDate()
  const cells = [
    ...Array.from({ length: startDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div>
      <div className="cal-head">
        <button className="cal-nav" onClick={() => shift(-1)} aria-label="Previous month">
          ‹
        </button>
        <h2>
          {MONTH_NAMES[ym.m - 1]} {ym.y}
        </h2>
        <button className="cal-nav" onClick={() => shift(1)} aria-label="Next month">
          ›
        </button>
      </div>

      <div className="cal-grid">
        {DOW.map((d) => (
          <div key={d} className="cal-dow">
            {d}
          </div>
        ))}
        {cells.map((day, i) =>
          day === null ? (
            <div key={`e${i}`} className="cal-cell empty" />
          ) : (
            <div
              key={day}
              className={`cal-cell ${`${monthKey}-${String(day).padStart(2, '0')}` === today ? 'today' : ''}`}
            >
              <div className="d">{day}</div>
              {(byDay[day] || []).map((a) => {
                const c = ACTIVITY_TYPES[a.type] || { color: '#24492d', bg: '#e7efe6' }
                return (
                  <div
                    key={a.id}
                    className="cal-chip"
                    style={{ color: c.color, background: c.bg }}
                    title={a.title}
                  >
                    {a.title}
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>

      <div className="page-head" style={{ marginTop: 28 }}>
        <h2>This Month</h2>
      </div>
      {inMonth.length === 0 ? (
        <div className="empty">No activities on the calendar for {MONTH_NAMES[ym.m - 1]} yet.</div>
      ) : (
        <div className="card">
          {inMonth.map((a) => (
            <div key={a.id} className="cal-list-item">
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong>{a.title}</strong>
                <TypeBadge type={a.type} />
                <div style={{ color: 'var(--ink-soft)', fontSize: 13.5 }}>
                  {fmtRange(a)}
                  {a.location ? ` · ${a.location}` : ''}
                </div>
                {a.description && <div style={{ marginTop: 4 }}>{a.description}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
