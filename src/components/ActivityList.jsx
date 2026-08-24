import { fmtDate, fmtTime, todayISO } from '../utils.js'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function ActivityList({ activities, members, onOpen, onNew }) {
  const today = todayISO()
  const sorted = [...activities].sort((a, b) => (a.date || '').localeCompare(b.date || ''))
  const upcoming = sorted.filter((a) => !a.date || a.date >= today)
  const past = sorted.filter((a) => a.date && a.date < today).reverse()

  return (
    <div>
      <div className="page-head">
        <h2>Upcoming Activities</h2>
        <span className="spacer" />
        <button className="btn primary" onClick={onNew}>
          + New Activity
        </button>
      </div>

      {upcoming.length === 0 && (
        <div className="empty">
          Nothing planned yet. Click <strong>New Activity</strong> to add your first one.
        </div>
      )}
      {upcoming.map((a) => (
        <ActivityCard key={a.id} activity={a} members={members} onOpen={onOpen} past={false} />
      ))}

      {past.length > 0 && (
        <>
          <div className="page-head" style={{ marginTop: 32 }}>
            <h2>Past Activities</h2>
          </div>
          {past.map((a) => (
            <ActivityCard key={a.id} activity={a} members={members} onOpen={onOpen} past />
          ))}
        </>
      )}
    </div>
  )
}

function ActivityCard({ activity: a, members, onOpen, past }) {
  const lead = members.find((m) => m.id === a.leadId)
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
        <h3>{a.title}</h3>
        <div className="meta">
          {fmtDate(a.date)}
          {a.time ? ` · ${fmtTime(a.time)}` : ''}
          {a.location ? ` · ${a.location}` : ''}
        </div>
        <div className="progress">
          {lead && <span className="pill lead">Lead: {lead.name}</span>}
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
