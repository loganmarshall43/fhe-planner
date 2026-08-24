import { useEffect, useState } from 'react'
import { getStore } from './store/index.js'
import Header from './components/Header.jsx'
import ActivityList from './components/ActivityList.jsx'
import ActivityForm from './components/ActivityForm.jsx'
import ActivityDetail from './components/ActivityDetail.jsx'
import MembersPage from './components/MembersPage.jsx'
import HistoryPage from './components/HistoryPage.jsx'
import PublicCalendar from './components/PublicCalendar.jsx'

export default function App() {
  const [store, setStore] = useState(null)
  const [activities, setActivities] = useState([])
  const [members, setMembers] = useState([])
  const [user, setUser] = useState(null)
  const [view, setView] = useState('list') // 'list' | 'new' | 'detail' | 'members' | 'history'
  const [activityId, setActivityId] = useState(null)
  const [template, setTemplate] = useState(null) // activity being duplicated via "Use Again"

  const openActivity = (id) => {
    setActivityId(id)
    setView('detail')
  }
  const duplicate = (activity) => {
    setTemplate(activity)
    setView('new')
  }
  const changeView = (v) => {
    if (v !== 'new') setTemplate(null)
    setView(v)
  }

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

  // Activities are world-readable (the public calendar); the members roster is
  // committee-only, so it's subscribed only once someone is signed in.
  useEffect(() => {
    if (!store) return
    return store.subscribeActivities(setActivities)
  }, [store])

  const committee = store && (store.mode === 'local' || Boolean(user))
  useEffect(() => {
    if (!committee) {
      setMembers([])
      return
    }
    return store.subscribeMembers(setMembers)
  }, [store, committee])

  if (!store || !authReady) return null

  if (!committee) {
    return (
      <>
        <header className="app-header">
          <h1>
            Ward Activities
            <span className="ward">Cedar City YSA 4th Ward</span>
          </h1>
          <nav>
            <button className="nav-btn" onClick={() => store.signInWithGoogle()}>
              Committee sign in
            </button>
          </nav>
        </header>
        <main className="container">
          <PublicCalendar activities={activities} />
        </main>
      </>
    )
  }

  const current = activities.find((a) => a.id === activityId)

  return (
    <>
      <Header view={view} setView={changeView} store={store} user={user} members={members} />
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
            user={user}
            onNew={() => setView('new')}
            onOpen={openActivity}
          />
        )}

        {view === 'history' && (
          <HistoryPage
            activities={activities}
            members={members}
            onOpen={openActivity}
            onDuplicate={duplicate}
          />
        )}

        {view === 'new' && (
          <div>
            <div className="page-head">
              <h2>{template ? `Plan “${template.title}” Again` : 'New Activity'}</h2>
            </div>
            <ActivityForm
              template={template}
              members={members}
              onCancel={() => changeView('list')}
              onSave={async (data) => {
                const id = await store.addActivity(data)
                setTemplate(null)
                openActivity(id)
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
              onBack={() => changeView('list')}
              onDuplicate={duplicate}
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
