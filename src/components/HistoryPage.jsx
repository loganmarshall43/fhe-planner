import { fmtDate, isPast, getLeadIds } from '../utils.js'
import TypeBadge from './TypeBadge.jsx'

// Scrollable record of everything the ward has done, newest first.
// "Use Again" starts a new activity from that one — supplies and setup carry over.
export default function HistoryPage({ activities, members, onOpen, onDuplicate }) {
  const past = activities
    .filter((a) => isPast(a))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  return (
    <div>
      <div className="page-head">
        <h2>Activity History</h2>
      </div>

      {past.length === 0 ? (
        <div className="empty">
          Nothing here yet — once an activity's date passes, it moves into history so you can
          bring it back any time with <strong>Use Again</strong>.
        </div>
      ) : (
        past.map((a) => {
          const leads = getLeadIds(a)
            .map((id) => members.find((m) => m.id === id))
            .filter(Boolean)
          const nItems = (a.supplies || []).length + (a.setupTasks || []).length
          return (
            <div key={a.id} className="card activity-card" onClick={() => onOpen(a.id)}>
              <div className="body">
                <h3>
                  {a.title}
                  <TypeBadge type={a.type} />
                </h3>
                <div className="meta">
                  Used {fmtDate(a.date)}
                  {leads.length ? ` · led by ${leads.map((m) => m.name).join(', ')}` : ''}
                  {nItems ? ` · ${nItems} supply & setup items saved` : ''}
                </div>
              </div>
              <button
                className="btn small primary"
                style={{ alignSelf: 'center' }}
                onClick={(e) => {
                  e.stopPropagation()
                  onDuplicate(a)
                }}
              >
                Use Again
              </button>
            </div>
          )
        })
      )}
    </div>
  )
}
