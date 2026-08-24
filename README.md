# FHE Planner — Cedar City YSA 4th Ward

Activity catalog and planning tool for the FHE committee. Add activities with date, time,
location, supplies, and setup tasks; assign a committee lead to each one; committee members
check off supplies and setup tasks as they're handled (each checkoff shows who did it).

## Run it locally

```bash
npm install
npm run dev
```

Out of the box the app runs in **local demo mode** — data is saved in your browser's
localStorage only. That's fine for planning solo. To share with the committee, connect
Firebase (below).

## Connecting Firebase (shared mode)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and **Add project**
   (call it `fhe-planner` or similar; Analytics not needed).
2. **Build → Firestore Database → Create database** — production mode, any US location.
3. **Build → Authentication → Get started → Google** — enable the Google sign-in provider.
4. **Project settings (gear icon) → Your apps → Web (`</>` icon)** — register an app, then copy
   the `firebaseConfig` object it shows into `src/firebase-config.js`, replacing the
   `PASTE_ME` values.
5. In **Firestore → Rules**, paste the contents of `firestore.rules` from this folder and
   publish. This limits reading/writing to signed-in users so random people can't touch
   your data.

Restart `npm run dev` and the demo-mode banner disappears. Everyone signs in with Google;
add each committee member's Gmail on the Committee page so their checkoffs match up.

## Putting it online for the committee

Firebase Hosting (free) is the natural fit:

```bash
npm run build
npx firebase-tools login
npx firebase-tools init hosting   # public dir: dist, single-page app: yes
npx firebase-tools deploy
```

You'll get a `something.web.app` URL to text to the committee. After Hosting is set up, add
that domain under **Authentication → Settings → Authorized domains** (it usually is already).

## Where things live

- `src/store/localStore.js` — browser-only backend (demo mode)
- `src/store/firebaseStore.js` — Firestore backend (shared mode)
- `src/components/` — the UI (activity list, form, detail with checklists, committee roster)
- Data model: `activities` (title, date, time, location, description, leadId, supplies[],
  setupTasks[]) and `members` (name, email, role) collections.
