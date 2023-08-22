import Feathers from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
import auth from '@feathersjs/authentication-client'
import { io } from 'socket.io-client'
import { iff, discard, traverse, paramsForServer } from 'feathers-hooks-common'
import feathersVuex from '@feathersjs/vuex'
import Cookies from 'js-cookie'
import i18n from '@/i18n'
import Store from '@/store'
import { decode } from 'he'

const appMode = import.meta.env.VITE_MODE
const serverDomain = import.meta.env.VITE_SERVER_DOMAIN

export function setupFeathers () {
  const currentLangCookie = Cookies.get('clientLanguage', { path: '/' })
  if (!currentLangCookie || currentLangCookie === 'undefined') {
    document.cookie = Cookies.set('clientLanguage', i18n.global.locale.value, {
      domain: serverDomain,
      path: '/',
      sameSite: appMode === 'production' ? 'None' : 'Lax',
      secure: appMode === 'production',
      expires: 365 * 100
    })
  }
  const socket = io(import.meta.env.VITE_SERVER_URL, { transports: ['websocket'], upgrade: false })

  socket.on('connect', () => {
    console.log('CONNECTED')
    Store.commit('SET_IS_DISCONNECTED', false)
  })

  socket.on('disconnect', (reason) => {
    Store.commit('SET_IS_DISCONNECTED', true)
  })

  const apiClient = Feathers.feathers()
  apiClient
    .configure(socketio(socket, {
      timeout: 60000,
      forceNew: true
    }))
    .configure(
      auth({ storage: window.localStorage })
    )
    .hooks({
      before: {
        all: [
          context => {
            context.params = paramsForServer(context.params, 'keepTranslations')
          },
          iff(
            context => ['create', 'update', 'patch'].includes(context.method),
            discard('__id', '__isTemp')
          )
        ]
      },
      after: {
        all: [
          traverse((node) => {
            if (typeof node === 'string') {
              return decode(node)
            }
          })
        ]
      },
      error: {
        all: [
          context => {
            delete context.stack
            delete context.hook
          }
        ]
      }
    })

  // Setting up feathers-vuex
  const apiVuex = feathersVuex(apiClient, {
    debug: true,
    serverAlias: 'api', // optional for working with multiple APIs (this is the default value)
    idField: '_id', // Must match the id field in your database table/collection
    handleEvents: {
      created: (item, { model }) => {
        return item
      }
    }
  })

  return {
    apiClient,
    apiVuex
  }
}
