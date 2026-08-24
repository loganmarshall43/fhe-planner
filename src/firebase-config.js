// Firebase web-app config for the fhe-planner project (these values are safe to ship
// to the browser — access control comes from Firestore rules, not from hiding these).

export const firebaseConfig = {
  apiKey: 'AIzaSyAo4KMrOHQimZvgMp0_ZIzawuBI3SeDb-Q',
  authDomain: 'fhe-planner-8e30d.firebaseapp.com',
  projectId: 'fhe-planner-8e30d',
  storageBucket: 'fhe-planner-8e30d.firebasestorage.app',
  messagingSenderId: '182163343291',
  appId: '1:182163343291:web:39e57ff17ed77c007b269e',
}

export const isConfigured = () =>
  Object.values(firebaseConfig).every((v) => v && v !== 'PASTE_ME')
