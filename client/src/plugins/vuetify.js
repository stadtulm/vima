import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import de from 'vuetify/lib/locale/de'
import colors from 'vuetify/lib/util/colors'
import { TiptapVuetifyPlugin } from 'tiptap-vuetify'
import './tiptap.css'

const vuetify = new Vuetify({
  theme: {
    options: {
      customProperties: true
    },
    themes: {
      light: {
        customGrey: colors.blueGrey.darken2,
        customGreyMedium: colors.blueGrey.lighten2,
        customGreyLight: colors.blueGrey.lighten4,
        customGreyUltraLight: colors.blueGrey.lighten5
      }
    }
  },
  lang: {
    locales: { de },
    current: 'de'
  },
  icons: {
    iconfont: 'fa'
  }
})

Vue.use(Vuetify)
Vue.use(TiptapVuetifyPlugin, {
  vuetify,
  iconsGroup: 'fa'
})

export default vuetify
