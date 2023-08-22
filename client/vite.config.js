import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import dns from 'dns'

dns.setDefaultResultOrder('verbatim')

const path = require('path')

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vue(),
      vuetify({
        autoImport: true
      }),
      VueI18nPlugin({
        /* options */
        // locale messages resource pre-compile option
        strictMessage: false,
        include: './src/locales/**',
      }),
      ViteEjsPlugin(loadEnv(mode, '.')),
      nodePolyfills({
        exclude: ['fs']
      })
    ],
    server: {
      host: 'localhost'
    },
    define: { 'process.env': {} },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js'
      }
    }
  }
})
