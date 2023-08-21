import { createI18n } from 'vue-i18n'
import bg from '@/locales/bg'
import de from '@/locales/de'
import en from '@/locales/en'
import ro from '@/locales/ro'
import rs from '@/locales/rs'
import ua from '@/locales/ua'

export default createI18n({
  locale: import.meta.env.VITE_I18N_LOCALE || 'en',
  fallbackLocale: import.meta.env.VITE_I18N_FALLBACK_LOCALE || 'en',
  messages: {
    bg,
    de,
    en,
    ro,
    rs,
    ua
  }
})
