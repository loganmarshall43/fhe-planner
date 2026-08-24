// Local demo backend: everything lives in this browser's localStorage.
// Mirrors the firebaseStore interface so the app code doesn't care which is active.

const KEY = 'fhe-planner-v1'

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

const seed = () => ({
  activities: [
    {
      id: uid(),
      title: 'Example: Game Night & Root Beer Floats',
      date: '2026-09-07',
      time: '19:00',
      location: 'Institute Building, Room 12',
      description:
        'Board games and card games, floats afterward. This is a sample activity — edit or delete it!',
      leadId: null,
      supplies: [
        { id: uid(), text: 'Root beer (4 x 2-liter)', done: false, doneBy: null },
        { id: uid(), text: 'Vanilla ice cream (2 tubs)', done: false, doneBy: null },
        { id: uid(), text: 'Cups, spoons, napkins', done: false, doneBy: null },
        { id: uid(), text: 'Board games (ask ward members)', done: false, doneBy: null },
      ],
      setupTasks: [
        { id: uid(), text: 'Reserve room with building coordinator', done: false, doneBy: null },
        { id: uid(), text: 'Set up 6 tables and chairs', done: false, doneBy: null },
        { id: uid(), text: 'Make announcement in Sunday meetings', done: false, doneBy: null },
      ],
    },
  ],
  members: [],
  currentMemberId: null,
})

const load = () => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  const s = seed()
  localStorage.setItem(KEY, JSON.stringify(s))
  return s
}

let state = load()
const listeners = { activities: new Set(), members: new Set(), auth: new Set() }

const save = () => localStorage.setItem(KEY, JSON.stringify(state))
const emit = (which) => {
  if (which === 'activities') listeners.activities.forEach((cb) => cb([...state.activities]))
  if (which === 'members') listeners.members.forEach((cb) => cb([...state.members]))
  if (which === 'auth') listeners.auth.forEach((cb) => cb(currentUser()))
}

const currentUser = () => {
  const m = state.members.find((m) => m.id === state.currentMemberId)
  return m ? { uid: m.id, displayName: m.name, email: m.email || '' } : null
}

export const localStore = {
  mode: 'local',

  subscribeActivities(cb) {
    listeners.activities.add(cb)
    cb([...state.activities])
    return () => listeners.activities.delete(cb)
  },
  subscribeMembers(cb) {
    listeners.members.add(cb)
    cb([...state.members])
    return () => listeners.members.delete(cb)
  },
  onAuthChange(cb) {
    listeners.auth.add(cb)
    cb(currentUser())
    return () => listeners.auth.delete(cb)
  },

  async addActivity(data) {
    const a = { id: uid(), supplies: [], setupTasks: [], leadId: null, ...data }
    state.activities.push(a)
    save()
    emit('activities')
    return a.id
  },
  async updateActivity(id, patch) {
    state.activities = state.activities.map((a) => (a.id === id ? { ...a, ...patch } : a))
    save()
    emit('activities')
  },
  async deleteActivity(id) {
    state.activities = state.activities.filter((a) => a.id !== id)
    save()
    emit('activities')
  },

  async addMember(data) {
    const m = { id: uid(), role: 'member', ...data }
    state.members.push(m)
    save()
    emit('members')
    return m.id
  },
  async updateMember(id, patch) {
    state.members = state.members.map((m) => (m.id === id ? { ...m, ...patch } : m))
    save()
    emit('members')
    emit('auth')
  },
  async deleteMember(id) {
    state.members = state.members.filter((m) => m.id !== id)
    if (state.currentMemberId === id) state.currentMemberId = null
    save()
    emit('members')
    emit('auth')
  },

  // In local mode "signing in" is just picking who you are from the roster.
  async signInAs(memberId) {
    state.currentMemberId = memberId
    save()
    emit('auth')
  },
  async signOut() {
    state.currentMemberId = null
    save()
    emit('auth')
  },
}
