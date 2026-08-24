import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base matches the GitHub Pages URL (https://<user>.github.io/fhe-planner/);
// dev stays at / so the local server is unaffected.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/fhe-planner/' : '/',
}))
