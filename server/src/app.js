const path = require('path')
const dotenv = require('dotenv')
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
const favicon = require('serve-favicon')
const compress = require('compression')
const helmet = require('helmet')
const cors = require('cors')
const logger = require('./logger')

const feathers = require('@feathersjs/feathers')
const configuration = require('@feathersjs/configuration')
const express = require('@feathersjs/express')
const socketio = require('@feathersjs/socketio')

const { I18n } = require('i18n')

const middleware = require('./middleware')
const services = require('./services')
const appHooks = require('./app.hooks')
const channels = require('./channels')

const authentication = require('./authentication')

const mongoose = require('./mongoose')

const util = require('./services/util')

const app = express(feathers())
app.i18n = new I18n()

// Load app configuration
app.configure(configuration())
// Enable security, CORS, compression, favicon and body parsing
app.use(helmet({
  contentSecurityPolicy: false
}))
// Get env allowlist
const allowList = process.env.CORS_ALLOWLIST.split(',')
const corsOptions = {
  origin: function (origin, callback) {
    if (allowList.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS:', origin))
    }
  }
}
app.use(cors(corsOptions))
app.use(compress())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(favicon(path.join(app.get('public'), 'favicon.ico')))
// Host the public folder
app.use('/', express.static(app.get('public')))

// Set up Plugins and providers
app.configure(express.rest())

app.configure(
  socketio(
    { maxHttpBufferSize: 1e8 },
    io => {
      io.set('transports', ['websocket'])
      io.use((socket, next) => {
        socket.feathers.clientId = socket.client.id
        next()
      })
    })
)

app.configure(mongoose)

/*
// Setup feathers-sync
if (parseInt(process.env.FEATHERS_SYNC) === 1) {
  const sync = require('feathers-sync')
  const bson = require('bson')
  app.configure(sync({
    uri: 'redis://' + process.env.REDIS_PW + '@' + process.env.REDIS_URL,
    redisOptions: { return_buffers: true },
    serialize: bson.serialize,
    deserialize: bson.deserialize
  }))
}
*/

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware)
app.configure(authentication)
// Set up our services (see `services/index.js`)
app.configure(services)
// Set up event channels (see channels.js)
app.configure(channels)

// Configure a middleware for 404s and the error handler
app.use(express.notFound())
app.use(express.errorHandler({ logger }))

app.hooks(appHooks)

const port = app.get('port')
const server = app.listen(port)

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
)

server.on('listening', () =>
  logger.info('Server application started on http://' + app.get('host') + ':' + port + ', PID: ' + process.pid)
)

// Create settings if not existant
initSettings()
async function initSettings () {
  let settings = await app.service('settings').find()
  if (settings.length > 1) {
    throw new Error('Multiple server settings found')
  }
  if (settings.length === 0) {
    const backupSettings = require('../initialSettings.json')
    settings = await app.service('settings').create(backupSettings)
  }
  util.createModuleVisibilities(app, settings)
}

// After server restart set all not connected users to offline
setTimeout(async () => {
  const re = /[0-9A-Fa-f]{6}/g
  const filteredObjectIds = app.channels.filter(obj => obj.length === 24 && re.test(obj)).map(obj => app.get('mongooseClient').Types.ObjectId(obj))
  await app.service('users').patch(
    null,
    {
      status: 'offline'
    },
    {
      query: {
        _id: { $nin: filteredObjectIds },
        status: { $ne: 'offline' }
      }
    }
  )
}, 10000)

app.logger = logger

module.exports = app

/*

// Migration
const JSum = require('jsum')

app.service('users').find({ paginate: false }).then(users => {
  for (const user of users) {
    user.language = 'de'
    app.service('users').update(user._id, user).catch(e => {
      console.log(e)
    })
  }
})

// ad-messages
app.service('ad-messages').find({ paginate: false }).then(adMessages => {
  for (const adMessage of adMessages.slice(0, 1)) {
    adMessage.text = [{
      type: 'default',
      value: adMessage.text
    }]
    adMessage.translationSum = JSum.digest(JSON.parse(JSON.stringify(adMessage.text)), 'SHA256', 'hex')
    app.service('ad-messages').update(adMessage._id, adMessage).catch(e => {
      console.log(e)
    })
  }
})

// ads
app.service('ads').find({ paginate: false }).then(ads => {
  for (const ad of ads) {
    ad.text = [{
      type: 'default',
      value: ad.text
    }]
    ad.title = [{
      type: 'default',
      value: ad.title
    }]
    ad.translationSum = JSum.digest([JSON.parse(JSON.stringify(ad.title)), JSON.parse(JSON.stringify(ad.text))], 'SHA256', 'hex')
    app.service('ads').update(ad._id, ad).catch(e => {
      console.log(e)
    })
  }
})

// blog
app.service('blog').find({ paginate: false }).then(blog => {
  for (const blogEntry of blog) {
    blogEntry.title = [{
      type: 'default',
      lang: 'de',
      value: blogEntry.text
    }]
    blogEntry.subTitle = [{
      type: 'default',
      lang: 'de',
      value: blogEntry.title
    }]
    blogEntry.text = [{
      type: 'default',
      lang: 'de',
      value: blogEntry.text
    }]
    app.service('blog').update(blogEntry._id, blogEntry).catch(e => {
      console.log(e)
    })
  }
})

// categories
app.service('categories').find({ paginate: false }).then(categories => {
  for (const category of categories) {
    category.text = [{
      type: 'default',
      lang: 'de',
      value: category.name // name is old property name
    }]
    category.description = [{
      type: 'default',
      lang: 'de',
      value: category.description
    }]
    app.service('categories').update(category._id, category).catch(e => {
      console.log(e)
    })
  }
})

// chat-messages
app.service('chat-messages').find({ paginate: false }).then(chatMessages => {
  for (const chatMessage of chatMessages) {
    chatMessage.text = [{
      type: 'default',
      value: chatMessage.text
    }]
    chatMessage.translationSum = JSum.digest(JSON.parse(JSON.stringify(chatMessage.text)), 'SHA256', 'hex')
    app.service('chat-messages').update(chatMessage._id, chatMessage).catch(e => {
      console.log(e)
    })
  }
})

// discussion-messages
app.service('discussion-messages').find({ paginate: false }).then(discussionMessages => {
  for (const discussionMessage of discussionMessages) {
    discussionMessage.text = [{
      type: 'default',
      value: discussionMessage.text
    }]
    discussionMessage.translationSum = JSum.digest(JSON.parse(JSON.stringify(discussionMessage.text)), 'SHA256', 'hex')
    app.service('discussion-messages').update(discussionMessage._id, discussionMessage).catch(e => {
      console.log(e)
    })
  }
})

// discussions
app.service('discussions').find({ paginate: false }).then(discussions => {
  for (const discussion of discussions) {
    discussion.description = [{
      type: 'default',
      value: discussion.description
    }]
    discussion.title = [{
      type: 'default',
      value: discussion.title
    }]
    discussion.translationSum = JSum.digest([JSON.parse(JSON.stringify(discussion.title)), JSON.parse(JSON.stringify(discussion.description))], 'SHA256', 'hex')
    app.service('discussions').update(discussion._id, discussion).catch(e => {
      console.log(e)
    })
  }
})

// events
app.service('events').find({ paginate: false }).then(events => {
  for (const event of events) {
    event.text = [{
      type: 'default',
      value: event.text,
      lang: 'de'
    }]
    event.title = [{
      type: 'default',
      value: event.title,
      lang: 'de'
    }]
    app.service('events').update(event._id, event).catch(e => {
      console.log(e)
    })
  }
})

// groups
app.service('groups').find({ paginate: false }).then(groups => {
  for (const group of groups) {
    group.description = [{
      type: 'default',
      value: group.description
    }]
    group.title = [{
      type: 'default',
      value: group.title
    }]
    group.translationSum = JSum.digest([JSON.parse(JSON.stringify(group.title)), JSON.parse(JSON.stringify(group.description))], 'SHA256', 'hex')
    app.service('groups').update(group._id, group).catch(e => {
      console.log(e)
    })
  }
})

// news
app.service('news').find({ paginate: false }).then(news => {
  for (const newsEntry of news) {
    newsEntry.text = [{
      type: 'default',
      lang: 'de',
      value: newsEntry.text
    }]
    newsEntry.title = [{
      type: 'default',
      lang: 'de',
      value: newsEntry.title
    }]
    newsEntry.subTitle = [{
      type: 'default',
      lang: 'de',
      value: newsEntry.subTitle
    }]
    app.service('news').update(newsEntry._id, newsEntry).catch(e => {
      console.log(e)
    })
  }
})

// sites
app.service('sites').find({ paginate: false }).then(sites => {
  for (const site of sites) {
    site.text = [{
      type: 'default',
      lang: 'de',
      value: site.text
    }]
    app.service('sites').update(site._id, site).catch(e => {
      console.log(e)
    })
  }
})

// tags
app.service('tags').find({ paginate: false }).then(els => {
  for (const el of els) {
    el.text = [{
      type: 'default',
      lang: 'de',
      value: el.name
    }]
    app.service('tags').update(el._id, el).catch(e => {
      console.log(e)
    })
  }
})

*/
