// Shared backend: Firestore + Google sign-in. Active once firebase-config.js is filled in.

import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
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
    return ref.id
  },
  updateMember: (id, patch) => (init(), updateDoc(doc(db, 'members', id), patch)),
  deleteMember: (id) => (init(), deleteDoc(doc(db, 'members', id))),

  async signInWithGoogle() {
    init()
    await signInWithPopup(auth, new GoogleAuthProvider())
  },
  async signOut() {
    init()
    await signOut(auth)
  },
}
