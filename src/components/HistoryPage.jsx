import { fmtDate, todayISO } from '../utils.js'

// Scrollable record of everything the ward has done, newest first.
// "Use Again" starts a new activity from that one — supplies and setup carry over.
export default function HistoryPage({ activities, members, onOpen, onDuplicate }) {
  const today = todayISO()
  const past = activities
    .filter((a) => a.date && a.date < today)
    .sort((a, b) => b.date.localeCompare(a.date))

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
          const lead = members.find((m) => m.id === a.leadId)
          const nItems = (a.supplies || []).length + (a.setupTasks || []).length
          return (
            <div key={a.id} className="card activity-card" onClick={() => onOpen(a.id)}>
              <div className="body">
                <h3>{a.title}</h3>
                <div className="meta">
                  Used {fmtDate(a.date)}
                  {lead ? ` · led by ${lead.name}` : ''}
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
