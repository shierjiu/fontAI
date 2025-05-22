import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import jsconfigPaths from 'vite-jsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), jsconfigPaths()],
})
