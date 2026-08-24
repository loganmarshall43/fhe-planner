import { fmtRange, isPast, getLeadIds } from '../utils.js'
import TypeBadge from './TypeBadge.jsx'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function ActivityList({ activities, members, user, onOpen, onNew }) {
  const upcoming = activities
    .filter((a) => !isPast(a))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))

  // "Me" = the roster member whose email matches the signed-in Google account.
  const email = (user?.email || '').trim().toLowerCase()
  const me = email
    ? members.find((m) => (m.email || '').trim().toLowerCase() === email)
    : null
  const mine = me ? upcoming.filter((a) => getLeadIds(a).includes(me.id)) : []
  const rest = mine.length ? upcoming.filter((a) => !getLeadIds(a).includes(me.id)) : upcoming

  const newBtn = (
    <button className="btn primary" onClick={onNew}>
      + New Activity
    </button>
  )

  return (
    <div>
      {mine.length > 0 && (
        <>
          <div className="page-head">
            <h2>My Assignments</h2>
            <span className="spacer" />
            {newBtn}
          </div>
          {mine.map((a) => (
            <ActivityCard key={a.id} activity={a} members={members} onOpen={onOpen} />
          ))}
        </>
      )}

      <div className="page-head" style={mine.length ? { marginTop: 28 } : undefined}>
        <h2>Upcoming Activities</h2>
        {mine.length === 0 && (
          <>
            <span className="spacer" />
            {newBtn}
          </>
        )}
      </div>

      {rest.length === 0 &&
        (mine.length > 0 ? (
          <p style={{ color: 'var(--ink-soft)' }}>No other upcoming activities.</p>
        ) : (
          <div className="empty">
            Nothing planned yet. Click <strong>New Activity</strong> to add one, or bring back a
            favorite from <strong>History</strong>.
          </div>
        ))}
      {rest.map((a) => (
        <ActivityCard key={a.id} activity={a} members={members} onOpen={onOpen} />
      ))}
    </div>
  )
}

function ActivityCard({ activity: a, members, onOpen, past = false }) {
  const leads = getLeadIds(a)
    .map((id) => members.find((m) => m.id === id))
    .filter(Boolean)
  const [, month, day] = (a.date || '').split('-').map(Number)

  const supplies = a.supplies || []
  const setup = a.setupTasks || []
  const sDone = supplies.filter((i) => i.done).length
  const tDone = setup.filter((i) => i.done).length
  const allReady =
    supplies.length + setup.length > 0 && sDone === supplies.length && tDone === setup.length

  return (
    <div className="card activity-card" onClick={() => onOpen(a.id)}>
      <div className={`date-badge ${past ? 'past' : ''}`}>
        <div className="month">{month ? MONTHS[month - 1] : '—'}</div>
        <div className="day">{day || '?'}</div>
      </div>
      <div className="body">
        <h3>
          {a.title}
          <TypeBadge type={a.type} />
        </h3>
        <div className="meta">
          {fmtRange(a)}
          {a.location ? ` · ${a.location}` : ''}
        </div>
        <div className="progress">
          {leads.length > 0 && (
            <span className="pill lead">
              {leads.length > 1 ? 'Assigned' : 'Lead'}: {leads.map((m) => m.name).join(', ')}
            </span>
          )}
          {supplies.length > 0 && (
            <span className={`pill ${sDone < supplies.length ? 'warn' : ''}`}>
              Supplies {sDone}/{supplies.length}
            </span>
          )}
          {setup.length > 0 && (
            <span className={`pill ${tDone < setup.length ? 'warn' : ''}`}>
              Setup {tDone}/{setup.length}
            </span>
          )}
          {allReady && !past && <span className="pill">✓ Ready</span>}
        </div>
      </div>
    </div>
  )
}
