import feathers from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
import auth from '@feathersjs/authentication-client'
import io from 'socket.io-client'
import { iff, discard, traverse, paramsForServer } from 'feathers-hooks-common'
import feathersVuex from 'feathers-vuex'
import Store from '@/store'
import { decode } from 'he'
import Cookie from 'cookie'
import i18n from '@/i18n'

if (!Cookie.parse(document.cookie).clientLanguage) {
  document.cookie = 'clientLanguage=' + i18n.locale + '; path=/; SameSite=Lax; expires=31 Dec 2100 23:59:59 UTC'
}

const socket = io(process.env.VUE_APP_SERVER_URL, {
  transports: ['websocket'],
  upgrade: false
})

socket.on('connect', () => {
  Store.commit('SET_IS_DISCONNECTED', false)
})

socket.on('disconnect', (reason) => {
  Store.commit('SET_IS_DISCONNECTED', true)
})

const feathersClient = feathers()
  .configure(socketio(socket, {
    timeout: 60000,
    forceNew: true
  }))
  .configure(auth({ storage: window.localStorage }))
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

export default feathersClient

let handleEvents = {}

if (parseInt(process.env.VUE_APP_DEBUG) === 1) {
  handleEvents = {
    patched: (item, { model }) => {
      console.log(model.toString().split('(')[0].replace('function ', ''), 'patched', item)
      return item
    },
    created: (item, { model }) => {
      console.log(model.toString().split('(')[0].replace('function ', ''), 'created', item)
      return item
    },
    removed: (item, { model }) => {
      console.log(model.toString().split('(')[0].replace('function ', ''), 'removed', item)
      return item
    },
    updated: (item, { model }) => {
      console.log(model.toString().split('(')[0].replace('function ', ''), 'updated', item)
      return item
    }
  }
}

// Setting up feathers-vuex
const { makeServicePlugin, makeAuthPlugin, BaseModel, models, FeathersVuex } = feathersVuex(
  feathersClient,
  {
    serverAlias: 'api', // optional for working with multiple APIs (this is the default value)
    idField: '_id', // Must match the id field in your database table/collection
    handleEvents
  }
)

export { makeAuthPlugin, makeServicePlugin, BaseModel, models, FeathersVuex }
