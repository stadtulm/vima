import { createStore } from 'vuex'
import { setupFeathers } from '../feathers'
import { adMessages } from './services/adMessages'
import { ads } from './services/ads'
import { apikeys } from './services/apikeys'
import { authmanagement } from './services/authmanagement'
import { blog } from './services/blog'
import { categories } from './services/categories'
import { chatMessages } from './services/chatMessages'
import { chats } from './services/chats'
import { discussionMessages } from './services/discussionMessages'
import { discussions } from './services/discussions'
import { events } from './services/events'
import { groups } from './services/groups'
import { logging } from './services/logging'
import { news } from './services/news'
import { organisations } from './services/organisations'
import { preferences } from './services/preferences'
import { sendstats } from './services/sendstats'
import { settings } from './services/settings'
import { sites } from './services/sites'
import { sponsors } from './services/sponsors'
import { statistics } from './services/statistics'
import { statusContainerHelper } from './services/statusContainerHelper'
import { statusContainers } from './services/statusContainers'
import { subscribers } from './services/subscribers'
import { tags } from './services/tags'
import { translations } from './services/translations'
import { unsubscribe } from './services/unsubscribe'
import { uploads } from './services/uploads'
import { users } from './services/users'
import { violations } from './services/violations'

import globals from './globals'

const feathers = setupFeathers({ })

const store = createStore({
  state () {
    return {}
  },
  mutations: {},
  actions: {},
  getters: {},
  modules: { globals },
  plugins: [
    adMessages({ feathers }),
    ads({ feathers }),
    apikeys({ feathers }),
    authmanagement({ feathers }),
    blog({ feathers }),
    categories({ feathers }),
    chatMessages({ feathers }),
    chats({ feathers }),
    discussionMessages({ feathers }),
    discussions({ feathers }),
    events({ feathers }),
    groups({ feathers }),
    logging({ feathers }),
    news({ feathers }),
    organisations({ feathers }),
    preferences({ feathers }),
    sendstats({ feathers }),
    settings({ feathers }),
    sites({ feathers }),
    sponsors({ feathers }),
    statistics({ feathers }),
    statusContainerHelper({ feathers }),
    statusContainers({ feathers }),
    subscribers({ feathers }),
    tags({ feathers }),
    translations({ feathers }),
    unsubscribe({ feathers }),
    uploads({ feathers }),
    users({ feathers }),
    violations({ feathers }),
    feathers.apiVuex.makeAuthPlugin({ userService: 'users' })
  ]
})

export default store
