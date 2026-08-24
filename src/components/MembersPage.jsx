import { useState } from 'react'
import { initials, getLeadIds } from '../utils.js'

export default function MembersPage({ members, activities, store }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const add = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await store.addMember({ name: name.trim(), email: email.trim(), role: 'member' })
    setName('')
    setEmail('')
  }

  const leadCount = (id) => activities.filter((a) => getLeadIds(a).includes(id)).length

  const remove = (m) => {
    const n = leadCount(m.id)
    const warning = n
      ? `Remove ${m.name}? They're assigned to ${n} activit${n === 1 ? 'y' : 'ies'} (they'll be unassigned).`
      : `Remove ${m.name} from the committee?`
    if (confirm(warning)) {
      activities
        .filter((a) => getLeadIds(a).includes(m.id))
        .forEach((a) =>
          store.updateActivity(a.id, {
            leadIds: getLeadIds(a).filter((id) => id !== m.id),
            leadId: null,
          })
        )
      store.deleteMember(m.id)
    }
  }

  return (
    <div>
      <div className="page-head">
        <h2>Committee</h2>
      </div>

      <form className="card form-card" onSubmit={add}>
        <div className="form-grid">
          <label className="field">
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sarah Jensen" />
          </label>
          <label className="field">
            Email <span style={{ fontWeight: 400 }}>(used to match their Google sign-in)</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@gmail.com"
            />
          </label>
        </div>
        <div className="form-actions">
          <button className="btn primary" type="submit">
            Add Member
          </button>
        </div>
      </form>

      {members.length === 0 ? (
        <div className="empty">
          No committee members yet. Add yourself first — then you can sign in and be assigned as an
          activity lead.
        </div>
      ) : (
        <div className="card">
          {members.map((m) => (
            <div key={m.id} className="member-row">
              <div className="avatar">{initials(m.name)}</div>
              <div className="info">
                <div className="name">
                  {m.name} {m.role === 'leader' && <span className="role-tag">Leader</span>}
                </div>
                {m.email && <div className="email">{m.email}</div>}
              </div>
              {leadCount(m.id) > 0 && (
                <span className="pill">{leadCount(m.id)} activities</span>
              )}
              <button
                className="btn small"
                onClick={() =>
                  store.updateMember(m.id, { role: m.role === 'leader' ? 'member' : 'leader' })
                }
              >
                {m.role === 'leader' ? 'Make member' : 'Make leader'}
              </button>
              <button className="btn small danger" onClick={() => remove(m)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
