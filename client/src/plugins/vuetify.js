// Styles
import '@fortawesome/fontawesome-free/css/all.css'
import 'vuetify/styles'
import colors from 'vuetify/lib/util/colors'
import { aliases, fa } from 'vuetify/iconsets/fa'
import { mdi } from 'vuetify/iconsets/mdi'

// Vuetify
import { createVuetify } from 'vuetify'
import * as labs from 'vuetify/labs/components'
import { en, de, bg, ro } from 'vuetify/locale'

export default createVuetify(
  {
    components: {
      ...labs
    },
    theme: {
      defaultTheme: 'customTheme',
      themes: {
        customTheme: {
          dark: false,
          colors: {
            customGrey: colors.blueGrey.darken2,
            customGreyMedium: colors.blueGrey.lighten2,
            customGreyLight: colors.blueGrey.lighten4,
            customGreyUltraLight: colors.blueGrey.lighten5
          }
        }
      }
    },
    locale: {
      locale: 'en',
      fallback: 'en',
      messages: { de, en, bg, ro }
    },
    icons: {
      defaultSet: 'fa',
      aliases,
      sets: {
        fa,
        mdi
      }
    }
  }
  // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
)
