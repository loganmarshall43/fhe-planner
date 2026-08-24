// Shared backend: Firestore + Google sign-in. Active once firebase-config.js is filled in.

import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { firebaseConfig } from '../firebase-config.js'

let db, auth

const init = () => {
  if (db) return
  const app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  auth = getAuth(app)
}

const col = (name) => collection(db, name)

// Roster doc ids are lowercased emails, matching the rules' email.lower() check.
const rosterId = (email) => (email || '').trim().toLowerCase()

const subscribe = (name, cb, order) => {
  init()
  const q = order ? query(col(name), orderBy(order)) : col(name)
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      // Signed-out users hit permission-denied by design; don't spam the console.
      if (err.code !== 'permission-denied') console.error(`Firestore ${name}:`, err)
      cb([])
    }
  )
}

export const firebaseStore = {
  mode: 'firebase',

  subscribeActivities: (cb) => subscribe('activities', cb, 'date'),
  subscribeMembers: (cb) => subscribe('members', cb, 'name'),
  onAuthChange(cb) {
    init()
    return onAuthStateChanged(auth, (u) =>
      cb(u ? { uid: u.uid, displayName: u.displayName, email: u.email } : null)
    )
  },

  async addActivity(data) {
    init()
    const ref = await addDoc(col('activities'), {
      supplies: [],
      setupTasks: [],
      leadId: null,
      ...data,
    })
    return ref.id
  },
  updateActivity: (id, patch) => (init(), updateDoc(doc(db, 'activities', id), patch)),
  deleteActivity: (id) => (init(), deleteDoc(doc(db, 'activities', id))),

  async addMember(data) {
    init()
    const ref = await addDoc(col('members'), { role: 'member', ...data })
    const rid = rosterId(data.email)
    if (rid) await setDoc(doc(db, 'roster', rid), { name: data.name || '' })
    return ref.id
  },
  updateMember: (id, patch) => (init(), updateDoc(doc(db, 'members', id), patch)),
  async deleteMember(id, email) {
    init()
    await deleteDoc(doc(db, 'members', id))
    const rid = rosterId(email)
    if (rid) await deleteDoc(doc(db, 'roster', rid))
  },

  // Firestore rules gate writes on roster/{email} existing, so keep a roster doc
  // per member email. Run at sign-in to backfill members created before this existed.
  async syncRoster(members) {
    init()
    const withEmail = members.filter((m) => rosterId(m.email))
    await Promise.all(
      withEmail.map((m) =>
        setDoc(doc(db, 'roster', rosterId(m.email)), { name: m.name || '' }, { merge: true })
      )
    )
    if (withEmail.length) console.log(`[roster] synced ${withEmail.length} member(s)`)
  },

  async signInWithGoogle() {
    init()
    await signInWithPopup(auth, new GoogleAuthProvider())
  },
  async signOut() {
    init()
    await signOut(auth)
  },
}
