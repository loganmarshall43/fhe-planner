import { useState } from 'react'
import { uid } from '../utils.js'

const linesToItems = (text) =>
  text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((text) => ({ id: uid(), text, done: false, doneBy: null }))

export default function ActivityForm({ initial, members, onSave, onCancel }) {
  const editing = Boolean(initial)
  const [form, setForm] = useState({
    title: initial?.title || '',
    date: initial?.date || '',
    time: initial?.time || '19:00',
    location: initial?.location || '',
    description: initial?.description || '',
    leadId: initial?.leadId || '',
    suppliesText: '',
    setupText: '',
  })

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const data = {
      title: form.title.trim(),
      date: form.date,
      time: form.time,
      location: form.location.trim(),
      description: form.description.trim(),
      leadId: form.leadId || null,
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
          Date
          <input type="date" value={form.date} onChange={set('date')} />
        </label>
        <label className="field">
          Time
          <input type="time" value={form.time} onChange={set('time')} />
        </label>
        <label className="field">
          Location
          <input value={form.location} onChange={set('location')} placeholder="e.g. Institute Building" />
        </label>
        <label className="field">
          Committee lead
          <select value={form.leadId} onChange={set('leadId')}>
            <option value="">— Unassigned —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
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
