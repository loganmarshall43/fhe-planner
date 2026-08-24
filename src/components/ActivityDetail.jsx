import { useState } from 'react'
import { fmtRange, uid, getLeadIds } from '../utils.js'
import ActivityForm from './ActivityForm.jsx'
import TypeBadge from './TypeBadge.jsx'

export default function ActivityDetail({ activity: a, members, store, user, onBack, onDuplicate }) {
  const [editing, setEditing] = useState(false)
  const leads = getLeadIds(a)
    .map((id) => members.find((m) => m.id === id))
    .filter(Boolean)

  const updateList = (key, items) => store.updateActivity(a.id, { [key]: items })

  const remove = async () => {
    if (confirm(`Delete "${a.title}"? This can't be undone.`)) {
      await store.deleteActivity(a.id)
      onBack()
    }
  }

  if (editing) {
    return (
      <div>
        <button className="back-link" onClick={() => setEditing(false)}>
          ← Cancel editing
        </button>
        <ActivityForm
          initial={a}
          members={members}
          onCancel={() => setEditing(false)}
          onSave={async (data) => {
            await store.updateActivity(a.id, data)
            setEditing(false)
          }}
        />
      </div>
    )
  }

  return (
    <div>
      <button className="back-link" onClick={onBack}>
        ← All activities
      </button>

      <div className="card detail-head">
        <h2>
          {a.title}
          <TypeBadge type={a.type} />
        </h2>
        <div className="meta">
          <span>📅 {fmtRange(a)}</span>
          {a.location && <span>📍 {a.location}</span>}
          {leads.length > 0 && (
            <span className="pill lead">
              {leads.length > 1 ? 'Assigned' : 'Lead'}: {leads.map((m) => m.name).join(', ')}
            </span>
          )}
        </div>
        {a.description && <p className="desc">{a.description}</p>}
        <div className="detail-actions">
          <button className="btn small" onClick={() => setEditing(true)}>
            Edit details
          </button>
          <button className="btn small" onClick={() => onDuplicate(a)}>
            Use Again
          </button>
          <button className="btn small danger" onClick={remove}>
            Delete
          </button>
        </div>
      </div>

      <Checklist
        title="🛒 Supplies"
        items={a.supplies || []}
        user={user}
        onChange={(items) => updateList('supplies', items)}
        placeholder="Add a supply item…"
      />
      <Checklist
        title="🔧 Setup & Tasks"
        items={a.setupTasks || []}
        user={user}
        onChange={(items) => updateList('setupTasks', items)}
        placeholder="Add a setup task…"
      />
    </div>
  )
}

function Checklist({ title, items, user, onChange, placeholder }) {
  const [text, setText] = useState('')
  const done = items.filter((i) => i.done).length

  const toggle = (id) =>
    onChange(
      items.map((i) =>
        i.id === id
          ? { ...i, done: !i.done, doneBy: !i.done ? user?.displayName || 'someone' : null }
          : i
      )
    )

  const add = (e) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    onChange([...items, { id: uid(), text: t, done: false, doneBy: null }])
    setText('')
  }

  return (
    <div className="card checklist-section">
      <h3>
        {title}
        <span className="count">
          {items.length ? `${done} of ${items.length} done` : 'nothing added yet'}
        </span>
      </h3>
      {items.map((i) => (
        <div key={i.id} className={`check-item ${i.done ? 'done' : ''}`}>
          <input type="checkbox" checked={i.done} onChange={() => toggle(i.id)} />
          <div className="text">
            {i.text}
            {i.done && i.doneBy && <div className="by">✓ {i.doneBy}</div>}
          </div>
          <button
            className="remove"
            title="Remove item"
            onClick={() => onChange(items.filter((x) => x.id !== i.id))}
          >
            ×
          </button>
        </div>
      ))}
      <form className="add-item" onSubmit={add}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} />
        <button className="btn small" type="submit">
          Add
        </button>
      </form>
    </div>
  )
}
