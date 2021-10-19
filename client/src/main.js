import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import './plugins/asyncComputed'
import './plugins/moment'
import './plugins/sanitize'
import './plugins/youtube'
import './plugins/vimeo'
import './plugins/tour'
import './plugins/matomo'
import i18n from './i18n'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@fortawesome/fontawesome-free/css/all.css'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: h => h(App)
}).$mount('#app')
