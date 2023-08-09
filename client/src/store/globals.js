import i18n from '@/i18n.js'
import Store from '@/store'
import Vue from 'vue'
import Cookies from 'js-cookie'
const appMode = process.env.VUE_APP_MODE
const serverDomain = process.env.VUE_APP_SERVER_DOMAIN

const state = {
  hasMatomo: false,
  isDisconnected: true,
  userCount: undefined,
  firstLoad: true,
  showTour: true,
  moduleVisibilities: {},
  cancelledTour: false,
  itemsPerPageOptions: [10, 25, 50, 100, -1],
  replyColors: ['#e4e4e4', '#d0d0d0', '#b4b4b4', '#989898', '#909090'],
  i18nMap: {
    rs: 'sr',
    ua: 'uk'
  },
  isModuleActiveOrDependency (moduleKey) {
    if (!Vue.prototype.$settings) {
      return false
    }
    if (
      Vue.prototype.$settings.modules[moduleKey].isActive ||
      (
        Vue.prototype.$settings.modules[moduleKey].dependents && Vue.prototype.$settings.modules[moduleKey].dependents.length > 0 &&
        Vue.prototype.$settings.modules[moduleKey].dependents.map(depKey => Vue.prototype.$settings.modules[depKey]).find(dependent => dependent.isActive)
      )
    ) {
      return true
    } else {
      return false
    }
  },
  async setLanguage (languageCode) {
    // Update cookie
    document.cookie = Cookies.set('clientLanguage', languageCode, {
      domain: serverDomain,
      path: '/',
      sameSite: appMode === 'production' ? 'None' : 'Lax',
      secure: appMode === 'production',
      expires: 365 * 100
    })
    // Update user language
    const user = Store.getters['auth/user']
    if (user && user._id) {
      Store.dispatch('users/patch', [
        user._id,
        {
          language: languageCode
        }
      ])
    }
    // Refresh page
    document.location.reload(true)
  },
  parseRgbString (str) {
    const vals = str.substring(str.indexOf('(') + 1, str.length - 1).split(', ')
    return {
      r: vals[0],
      g: vals[1],
      b: vals[2]
    }
  },
  resolveProperty (path, obj = self, separator = '.') {
    const properties = Array.isArray(path) ? path : path.split(separator)
    return properties.reduce((prev, curr) => prev && prev[curr], obj)
  },
  deepSort: function (sortBy, sortDesc, arr) {
    const prop = sortBy.split('.')
    const len = prop.length
    arr.sort((a, b) => {
      let i = 0
      while (i < len) { a = a[prop[i]]; b = b[prop[i]]; i++ }
      if (sortDesc) {
        if (a < b) {
          return -1
        } else if (a > b) {
          return 1
        } else {
          return 0
        }
      } else {
        if (a > b) {
          return -1
        } else if (a < b) {
          return 1
        } else {
          return 0
        }
      }
    })
    return arr
  },
  getTags: function (tags) {
    if (tags) {
      return tags
        .map(obj => {
          const tag = Store.getters['tags/get'](obj)
          if (tag) {
            return tag
          } else {
            Store.dispatch('logging/create', { type: 'error', route: window.location.pathname, user: (Store.getters['auth/user'] ? Store.getters['auth/user']._id : '-'), method: 'getTags', message: 'Not existant tag: ' + obj })
            return false
          }
        })
        .filter(obj => !!obj)
        .sort((a, b) => a.text.localeCompare(b.text))
    } else {
      return []
    }
  },
  getCategories: function (categories) {
    if (categories) {
      return categories
        .map(obj => {
          const category = Store.getters['categories/get'](obj)
          if (category) {
            return category
          } else {
            Store.dispatch('logging/create', { type: 'error', route: window.location.pathname, user: (Store.getters['auth/user'] ? Store.getters['auth/user']._id : '-'), method: 'getCategories', message: 'Not existant category: ' + obj })
            return false
          }
        })
        .filter(obj => !!obj)
        .sort((a, b) => a.text.value.localeCompare(b.text.value))
    } else {
      return []
    }
  },
  newTab: function (text) {
    if (text) {
      return text.replaceAll('href=', 'target="_blank" href=')
    } else {
      return text
    }
  },
  reduceTranslations: function (data, language, properties) {
    for (const property of properties) {
      if (data[property] && Array.isArray(data[property])) {
        const dataProperty = data[property].find(translation => translation && translation.lang === language)
        if (dataProperty) {
          data[property] = dataProperty
        } else if (data[property].find(translation => translation && translation.type === 'default')) {
          data[property] = data[property].find(translation => translation && translation.type === 'default')
        } else {
          data[property] = {
            value: i18n.t('noDefaultValue'),
            type: 'error'
          }
        }
      }
    }
    return data
  },
  hydrateTranslations: function (data) {
    let tmpLanguages = JSON.parse(JSON.stringify(data || []))
    if (!Array.isArray(tmpLanguages)) {
      tmpLanguages = [tmpLanguages]
    }
    for (const language of Vue.prototype.$settings.languages) {
      if (!tmpLanguages.find(obj => obj.lang === language)) {
        tmpLanguages.push({
          type: i18n.fallbackLocale === language ? 'default' : 'author',
          lang: language,
          value: ''
        })
      }
    }
    return tmpLanguages
  },
  rules: {
    required: value => !!value || i18n.t('rulesRequired'),
    tiptapRequired: value => (value && value.replaceAll('<p>', '').replaceAll('</p>', '') !== '') || i18n.t('rulesRequired'),
    radio: value => value !== null || i18n.t('rulesRequired'),
    content: value => (!value || value.length < 0) || i18n.t('rulesRequired'),
    tagText: value => (!value || value.length <= 50) || i18n.t('rulesMaxLength', { msg: 40 }),
    shortText: value => (!value || value.length <= 150) || i18n.t('rulesMaxLength', { msg: 150 }),
    longText: value => (!value || value.length <= 500) || i18n.t('rulesMaxLength', { msg: 500 }),
    email: value => {
      const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return (!value || pattern.test(value)) || i18n.t('rulesEmail')
    },
    minOneCategory: v => v.length > 0 || i18n.t('rulesMinOneCategory'),
    maxThreeCategories: v => v.length <= 3 || i18n.t('rulesMaxThreeCategories'),
    password: value => (value && value.length >= 8 && value.length <= 16) || i18n.t('rulesPassword'),
    passwordOptional: value => {
      if (!value || value === '') {
        return true
      } else {
        if (value.length >= 8 && value.length <= 16) {
          return true
        }
      }
      return i18n.t('rulesPassword')
    },
    userNameLength: v => (!v || v.length < 20) || i18n.t('rulesMaxLength', { msg: 20 }),
    noBlanks: v => !(/[ ]/.test(v)) || i18n.t('noBlanksError'),
    webLink: v => ((!v || v.startsWith('http://') || v.startsWith('https://')) || i18n.t('linkMustStartWithHttp'))
  },
  s3: process.env.VUE_APP_S3_URL,
  server: process.env.VUE_APP_SERVER_URL,
  videoTypeItems: [
    { textKey: 'youtube', value: 'youtube' },
    { textKey: 'vimeo', value: 'vimeo' }
  ],
  roleItems: [
    { textKey: 'member', value: 'users' },
    { textKey: 'partner', value: 'partners' },
    { textKey: 'admin', value: 'admins' }
  ],
  blockedItems: [
    { type: 'notBlocked', icon: 'fas fa-check-circle', textKey: 'notBlocked' },
    { type: 'selfBlocked', icon: 'fas fa-check-ban', textKey: 'blockedByMe' },
    { type: 'otherBlocked', icon: 'fas fa-check-ban', textKey: 'blockedByOther' }
  ],
  questionTypeItems: [
    { textKey: 'rating', value: 'rating' },
    { textKey: 'multipleChoice', value: 'check' },
    { textKey: 'singleChoice', value: 'radio' },
    { textKey: 'freeText', value: 'text' }
  ],
  relationItems: {
    owner: { isMember: true, value: 'owner', textKey: 'author', icon: 'fas fa-star-of-life' },
    moderator: { isMember: true, value: 'moderator', textKey: 'moderator', icon: 'fas fa-users' },
    member: { isMember: true, value: 'member', textKey: 'member', icon: 'fas fa-user-check' },
    subscriber: { value: 'subscriber', textKey: 'subscriber', icon: 'fas fa-star' },
    applicant: { value: 'applicant', textKey: 'applicant', icon: 'fas fa-comment-dots' },
    apply: { value: 'apply', textKey: 'requestMembership', icon: 'fas fa-user-plus' },
    subscribe: { value: 'subscribe', textKey: 'subscribe', icon: 'far fa-star' },
    invitation: { value: 'invitation', textKey: 'invited', icon: 'fas fa-door-open' }
  },
  visibilityItems: {
    public: 'fas fa-lock-open',
    private: 'fas fa-lock',
    hidden: 'fas fa-eye-slash'
  },
  snackbar: false,
  statusItems: {
    idle: { color: 'success', textKey: 'active' },
    busy: { color: 'error', textKey: 'inConversation' },
    offline: { color: 'customGrey', textKey: 'offline' },
    away: { color: 'warning', textKey: 'online' }
  },
  typeItems: {
    ads: 'ads',
    discussions: 'discussions',
    groups: 'interestGroups'
  }
}

const getters = {
  replyColors: state => {
    return state.replyColors
  },
  i18nMap: state => {
    return state.i18nMap
  },
  setLanguage: state => {
    return state.setLanguage
  },
  moduleVisibilities: state => {
    return state.moduleVisibilities
  },
  isModuleActiveOrDependency: state => {
    return state.isModuleActiveOrDependency
  },
  itemsPerPageOptions: state => {
    return state.itemsPerPageOptions
  },
  hasMatomo: state => {
    return state.hasMatomo
  },
  cancelledTour: state => {
    return state.cancelledTour
  },
  showTour: state => {
    return state.showTour
  },
  newTab: state => {
    return state.newTab
  },
  reduceTranslations: state => {
    return state.reduceTranslations
  },
  hydrateTranslations: state => {
    return state.hydrateTranslations
  },
  parseRgbString: state => {
    return state.parseRgbString
  },
  resolveProperty: state => {
    return state.resolveProperty
  },
  deepSort: state => {
    return state.deepSort
  },
  getTags: state => {
    return state.getTags
  },
  getCategories: state => {
    return state.getCategories
  },
  visibilityItems: state => {
    return state.visibilityItems
  },
  isDisconnected: state => {
    return state.isDisconnected
  },
  rules: state => {
    return state.rules
  },
  s3: state => {
    return state.s3
  },
  server: state => {
    return state.server
  },
  roleItems: state => {
    return state.roleItems
  },
  relationItems: state => {
    return state.relationItems
  },
  typeItems: state => {
    return state.typeItems
  },
  blockedItems: state => {
    return state.blockedItems
  },
  videoTypeItems: state => {
    return state.videoTypeItems
  },
  questionTypeItems: state => {
    return state.questionTypeItems
  },
  snackbar: state => {
    return state.snackbar
  },
  statusItems: state => {
    return state.statusItems
  },
  firstLoad: state => {
    return state.firstLoad
  },
  userCount: state => {
    return state.userCount
  }
}

const mutations = {
  SET_MODULE_VISIBILITIES: (state, msg) => {
    state.moduleVisibilities = msg
  },
  SET_CANCELLED_TOUR: (state, msg) => {
    state.cancelledTour = msg
  },
  SET_SHOW_TOUR: (state, msg) => {
    state.showTour = msg
  },
  SET_SNACKBAR: (state, msg) => {
    state.snackbar = msg
  },
  SET_FIRST_LOAD: (state, msg) => {
    state.firstLoad = msg
  },
  SET_USER_COUNT: (state, msg) => {
    state.userCount = msg
  },
  SET_IS_DISCONNECTED: (state, msg) => {
    state.isDisconnected = msg
  },
  SET_HAS_MATOMO: (state, msg) => {
    state.hasMatomo = msg
  }
}

export default {
  state,
  mutations,
  getters
}
