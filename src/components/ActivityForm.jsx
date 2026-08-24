import { useState } from 'react'
import { uid, getLeadIds, ACTIVITY_TYPES } from '../utils.js'

const linesToItems = (text) =>
  text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((text) => ({ id: uid(), text, done: false, doneBy: null }))

const itemsToLines = (items) => (items || []).map((i) => i.text).join('\n')

// `initial` = editing an existing activity; `template` = duplicating one (prefill
// everything except date and assignments, with checklists reset).
export default function ActivityForm({ initial, template, members, onSave, onCancel }) {
  const editing = Boolean(initial)
  const source = initial || template
  const [form, setForm] = useState({
    title: source?.title || '',
    type: source?.type || '',
    date: initial?.date || '',
    time: source?.time || '19:00',
    endTime: source?.endTime || '',
    location: source?.location || '',
    description: source?.description || '',
    leadIds: initial ? getLeadIds(initial) : [],
    suppliesText: template ? itemsToLines(template.supplies) : '',
    setupText: template ? itemsToLines(template.setupTasks) : '',
  })

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const toggleLead = (id) =>
    setForm((f) => ({
      ...f,
      leadIds: f.leadIds.includes(id) ? f.leadIds.filter((x) => x !== id) : [...f.leadIds, id],
    }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const data = {
      title: form.title.trim(),
      type: form.type || null,
      date: form.date,
      time: form.time,
      endTime: form.endTime || null,
      location: form.location.trim(),
      description: form.description.trim(),
      leadIds: form.leadIds,
      leadId: null, // clear the legacy single-lead field
    }
    if (!editing) {
      data.supplies = linesToItems(form.suppliesText)
      data.setupTasks = linesToItems(form.setupText)
    }
    onSave(data)
  }

  return (
    <form className="card form-card" onSubmit={submit}>
      <div className="form-grid">
        <label className="field full">
          Activity
          <input
            value={form.title}
            onChange={set('title')}
            placeholder="e.g. Service Project at the Food Bank"
            autoFocus
            required
          />
        </label>
        <label className="field">
          Type
          <select value={form.type} onChange={set('type')}>
            <option value="">— General —</option>
            {Object.keys(ACTIVITY_TYPES).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Date
          <input type="date" value={form.date} onChange={set('date')} />
        </label>
        <label className="field">
          Start time
          <input type="time" value={form.time} onChange={set('time')} />
        </label>
        <label className="field">
          End time <span style={{ fontWeight: 400 }}>(optional)</span>
          <input type="time" value={form.endTime} onChange={set('endTime')} />
        </label>
        <label className="field full">
          Location
          <input value={form.location} onChange={set('location')} placeholder="e.g. Institute Building" />
        </label>
        <div className="field full">
          Assigned committee members
          <div className="member-checks">
            {members.length === 0 && (
              <span style={{ fontWeight: 400 }}>Add people on the Committee page first.</span>
            )}
            {members.map((m) => (
              <label key={m.id} className={`check-pill ${form.leadIds.includes(m.id) ? 'on' : ''}`}>
                <input
                  type="checkbox"
                  checked={form.leadIds.includes(m.id)}
                  onChange={() => toggleLead(m.id)}
                />
                {m.name}
              </label>
            ))}
          </div>
        </div>
        <label className="field full">
          Description / notes
          <textarea rows={3} value={form.description} onChange={set('description')} />
        </label>
        {!editing && (
          <>
            <label className="field">
              Supplies needed (one per line)
              <textarea
                rows={4}
                value={form.suppliesText}
                onChange={set('suppliesText')}
                placeholder={'Paper plates\nWater coolers\nFirst aid kit'}
              />
            </label>
            <label className="field">
              Setup tasks (one per line)
              <textarea
                rows={4}
                value={form.setupText}
                onChange={set('setupText')}
                placeholder={'Reserve the room\nSet up chairs\nMake Sunday announcement'}
              />
            </label>
          </>
        )}
      </div>
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn primary">
          {editing ? 'Save Changes' : 'Add Activity'}
        </button>
      </div>
    </form>
  )
}
