import { createApp } from 'vue'
import App from './App.vue'
import i18n from './i18n'
import vuetify from './plugins/vuetify'
import sanitizeOptions from './plugins/sanitize'
import VueSanitize from 'vue-3-sanitize'
import YouTube from 'vue3-youtube'
import vueVimeoPlayer from 'vue-vimeo-player'
import VueTour from 'vue3-tour'
import matomoOptions from './plugins/matomo'
import VueMatomo from 'vue-matomo'
import CountryFlag from 'vue-country-flag-next'
import moment from 'moment'
import store from './store'
import router from './router'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@fortawesome/fontawesome-free/css/all.css'
import 'vue3-tour/dist/vue3-tour.css'

const app = createApp(App)
  .use(i18n)
  .use(vuetify)
  .use(VueSanitize, sanitizeOptions)
  .use(vueVimeoPlayer)
  .use(VueTour)
  .use(VueMatomo, matomoOptions)
  .use(store)
  .use(router)

app.component('DatePicker', VueDatePicker)
app.component('youtube', YouTube)
app.component('country-flag', CountryFlag)
app.mount('#app')

app.config.globalProperties.$moment = moment

export default app
