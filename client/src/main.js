import { createApp } from 'vue'
import App from './App.vue'
import i18n from './i18n'
import vuetify from './plugins/vuetify'
import sanitizeOptions from './plugins/sanitize'
import VueSanitize from 'vue-3-sanitize'
import VueYoutube from 'vue3-youtube'
import VueVimeoPlayer from 'vue-vimeo-player'
import VueTour from 'vue3-tour'
import matomoOptions from './plugins/matomo'
import VueMatomo from 'vue-matomo'
import CountryFlag from 'vue-country-flag-next'
import moment from 'moment'
import store from './store'
import router from './router'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@fortawesome/fontawesome-free/css/all.css'
import 'vue3-tour/dist/vue3-tour.css'

const app = createApp(App)
  .use(i18n)
  .use(vuetify)
  .use(VueSanitize, sanitizeOptions)
  .use(VueVimeoPlayer)
  .use(VueTour)
  .use(VueMatomo, matomoOptions)
  .use(store)
  .use(router)

app.component('YouTube', VueYoutube)
app.component('country-flag', CountryFlag)
app.mount('#app')

app.config.globalProperties.$moment = moment

export default app
