// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import de from 'vuetify/lib/locale/de'
import colors from 'vuetify/lib/util/colors'

// Vuetify
import { createVuetify } from 'vuetify'

export default createVuetify(
  {
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
  }
  // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
)
