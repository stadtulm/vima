import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'
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
        customCyan: colors.cyan,
        customTeal: colors.teal.lighten1,
        customPurple: colors.deepPurple.lighten1,
        customGrey: colors.blueGrey.darken2,
        customGreyMedium: colors.blueGrey.lighten2,
        customGreyLight: colors.blueGrey.lighten4,
        customGreyUltraLight: colors.blueGrey.lighten5,
        customLimeBg: colors.lime.lighten3,
        customCyanBg: colors.cyan.lighten4,
        customTealBg: colors.teal.lighten4,
        customPurpleBg: colors.deepPurple.lighten5,
        customGreyBg: colors.blueGrey.lighten5

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
  vuetify: vuetify,
  iconsGroup: 'fa'
})

export default vuetify
