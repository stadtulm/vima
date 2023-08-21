import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import { vuetifyProTipTap } from './plugins/tiptap'
import sanitizeOptions from './plugins/sanitize'
import VueSanitize from 'vue-3-sanitize'
import VueYoutube from 'vue3-youtube'
import VueVimeoPlayer from 'vue-vimeo-player'
import VueTour from 'vue3-tour'
import matomoOptions from './plugins/matomo'
import VueMatomo from 'vue-matomo'
import CountryFlag from 'vue-country-flag-next'
import i18n from './i18n'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@fortawesome/fontawesome-free/css/all.css'
import moment from 'moment'

const app = createApp(App).use(i18n)
  .use(router)
  .use(store)
  .use(vuetify)
  .use(vuetifyProTipTap)
  .use(i18n)
  .use(VueSanitize, sanitizeOptions)
  .use(VueYoutube)
  .use(VueVimeoPlayer)
  .use(VueTour)
  .use(VueMatomo, matomoOptions)

app.component('country-flag', CountryFlag)
app.mount('#app')

app.config.globalProperties.$moment = moment

export default app
