export default function Header({ view, setView, store, user, members }) {
  return (
    <header className="app-header">
      <h1>
        FHE Planner
        <span className="ward">Cedar City YSA 4th Ward</span>
      </h1>
      <nav>
        <button
          className={`nav-btn ${view === 'list' ? 'active' : ''}`}
          onClick={() => setView('list')}
        >
          Activities
        </button>
        <button
          className={`nav-btn ${view === 'history' ? 'active' : ''}`}
          onClick={() => setView('history')}
        >
          History
        </button>
        <button
          className={`nav-btn ${view === 'members' ? 'active' : ''}`}
          onClick={() => setView('members')}
        >
          Committee
        </button>
        <SignIn store={store} user={user} members={members} />
      </nav>
    </header>
  )
}

function SignIn({ store, user, members }) {
  if (!store) return null

  if (store.mode === 'local') {
    return (
      <span className="signin-box">
        {user ? (
          <>
            <span>{user.displayName}</span>
            <button className="signout" onClick={() => store.signOut()}>
              switch
            </button>
          </>
        ) : (
          <select
            value=""
            onChange={(e) => e.target.value && store.signInAs(e.target.value)}
          >
            <option value="">I am…</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        )}
      </span>
    )
  }

  return (
    <span className="signin-box">
      {user ? (
        <>
          <span>{user.displayName}</span>
          <button className="signout" onClick={() => store.signOut()}>
            sign out
          </button>
        </>
      ) : (
        <button className="nav-btn" onClick={() => store.signInWithGoogle()}>
          Sign in with Google
        </button>
      )}
    </span>
  )
}
