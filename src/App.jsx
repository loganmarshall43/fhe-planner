import { useEffect, useState } from 'react'
import { getStore } from './store/index.js'
import Header from './components/Header.jsx'
import ActivityList from './components/ActivityList.jsx'
import ActivityForm from './components/ActivityForm.jsx'
import ActivityDetail from './components/ActivityDetail.jsx'
import MembersPage from './components/MembersPage.jsx'

export default function App() {
  const [store, setStore] = useState(null)
  const [activities, setActivities] = useState([])
  const [members, setMembers] = useState([])
  const [user, setUser] = useState(null)
  const [view, setView] = useState('list') // 'list' | 'new' | 'detail' | 'members'
  const [activityId, setActivityId] = useState(null)

  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    let unsub
    getStore().then((s) => {
      setStore(s)
      unsub = s.onAuthChange((u) => {
        setUser(u)
        setAuthReady(true)
      })
    })
    return () => unsub && unsub()
  }, [])

  // Firestore rules require sign-in, so only subscribe to data once we have a user
  // (local mode has no such restriction).
  const canRead = store && (store.mode === 'local' || user)
  useEffect(() => {
    if (!canRead) {
      setActivities([])
      setMembers([])
      return
    }
    const unsubs = [store.subscribeActivities(setActivities), store.subscribeMembers(setMembers)]
    return () => unsubs.forEach((u) => u && u())
  }, [store, canRead])

  if (!store || !authReady) return null

  if (!canRead) {
    return (
      <>
        <Header view={view} setView={setView} store={store} user={user} members={members} />
        <main className="container">
          <div className="empty">
            <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>
              Welcome to the 4th Ward FHE Planner
            </p>
            <p>Sign in with your Google account to see the activity catalog.</p>
            <button className="btn primary" onClick={() => store.signInWithGoogle()}>
              Sign in with Google
            </button>
          </div>
        </main>
      </>
    )
  }

  const current = activities.find((a) => a.id === activityId)

  return (
    <>
      <Header view={view} setView={setView} store={store} user={user} members={members} />
      {store.mode === 'local' && (
        <div className="mode-banner">
          <strong>Local demo mode</strong> — data is saved only in this browser. Add your Firebase
          config in <code>src/firebase-config.js</code> to share with the committee.
        </div>
      )}
      <main className="container">
        {view === 'list' && (
          <ActivityList
            activities={activities}
            members={members}
            onNew={() => setView('new')}
            onOpen={(id) => {
              setActivityId(id)
              setView('detail')
            }}
          />
        )}

        {view === 'new' && (
          <div>
            <div className="page-head">
              <h2>New Activity</h2>
            </div>
            <ActivityForm
              members={members}
              onCancel={() => setView('list')}
              onSave={async (data) => {
                const id = await store.addActivity(data)
                setActivityId(id)
                setView('detail')
              }}
            />
          </div>
        )}

        {view === 'detail' &&
          (current ? (
            <ActivityDetail
              activity={current}
              members={members}
              store={store}
              user={user}
              onBack={() => setView('list')}
            />
          ) : (
            <div className="empty">That activity no longer exists.</div>
          ))}

        {view === 'members' && (
          <MembersPage members={members} activities={activities} store={store} />
        )}
      </main>
    </>
  )
}
