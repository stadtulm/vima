import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { ViteEjsPlugin } from 'vite-plugin-ejs';

const path = require('path')

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vue(),
      vuetify({
        autoImport: true
      }),
      ViteEjsPlugin(loadEnv(mode, '.')),
    ],
    define: { 'process.env': {} },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  }
})
