import { isConfigured } from '../firebase-config.js'
import { localStore } from './localStore.js'

// Firebase mode is loaded lazily so the demo works before any Firebase setup.
export async function getStore() {
  if (isConfigured()) {
    const { firebaseStore } = await import('./firebaseStore.js')
    return firebaseStore
  }
  return localStore
}
