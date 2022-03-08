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

const middleware = require('./middleware')
const services = require('./services')
const appHooks = require('./app.hooks')
const channels = require('./channels')

const authentication = require('./authentication')

const mongoose = require('./mongoose')

const app = express(feathers())

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
  socketio(io => {
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

// Migration

/*

// Add language attribute to each user

*/

/*
  .aggregate(
    {
      $filter: {
        input: '$' + property + '',
        as: property,
        cond: {
          $or: [
            {
              $eq: [
                '$$' + property + '.type',
                'default'
              ]
            },
            {
              $eq: [
                '$$' + property + '.lang',
                'de'
              ]
            }
          ]
        }
      }
    }
  )
  /*
  /*
  .exec(res => {
    console.log(res)
  })
  */

/*
app.service('ads').find({ paginate: false }).then(ads => {
  for (const ad of ads) {
    ad.text = [{
      type: 'default',
      value: ad.text,
      lang: 'de'
    }]
    ad.title = [{
      type: 'default',
      value: ad.title,
      lang: 'de'
    }]
    app.service('ads').update(ad._id, ad).then(res => {
      console.log(res)
    })
  }
})
*/

// New text format news
/*
app.service('news').find({ paginate: false }).then(news => {
  for (const newsEntry of news) {
    newsEntry.text = [{
      type: 'default',
      value: newsEntry.text,
      lang: 'de
    }]
    newsEntry.title = [{
      type: 'default',
      value: newsEntry.title,
      lang: 'de'
    }]
    newsEntry.subTitle = [{
      type: 'default',
      value: newsEntry.subTitle,
      lang: 'de'
    }]
    app.service('news').update(newsEntry._id, newsEntry).then(res => {
      console.log(res)
    })
  }
})
*/

// New text format events

/*
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
    app.service('events').update(event._id, event).then(res => {
      console.log(res)
    })
  }
})
*/

/*
// New text format
app.service('chat-messages').find({ paginate: false }).then(chatMessages => {
  for (const chatMessage of chatMessages) {
    chatMessage.text = [{
      type: 'default',
      value: chatMessage.text
    }]
    app.service('chat-messages').update(chatMessage._id, chatMessage).then(res => {
      console.log(res)
    })
  }
})
*/

/*
// New text format
app.service('ad-messages').find({ paginate: false }).then(adMessages => {
  for (const adMessage of adMessages) {
    adMessage.text = [{
      type: 'default',
      value: adMessage.text
    }]
    app.service('ad-messages').update(adMessage._id, adMessage).then(res => {
      console.log(res)
    })
  }
})
*/

/*
// New text format
app.service('discussion-messages').find({ paginate: false }).then(discussionMessages => {
  for (const discussionMessage of discussionMessages) {
    discussionMessage.text = [{
      type: 'default',
      value: discussionMessage.text
    }]
    app.service('discussion-messages').update(discussionMessage._id, discussionMessage).then(res => {
      console.log(res)
    })
  }
})

*/

/*
// New text format
app.service('categories').find({ paginate: false }).then(els => {
  for (const el of els) {
    el.text = [{
      type: 'default',
      lang: 'de',
      value: el.name
    }]
    el.description = [{
      type: 'default',
      lang: 'de',
      value: el.description
    }]
    app.service('categories').update(el._id, el).then(res => {
      console.log(res)
    })
  }
})
*/

/*
// New text format
app.service('tags').find({ paginate: false }).then(els => {
  for (const el of els) {
    el.text = [{
      type: 'default',
      lang: 'de',
      value: el.name
    }]
    app.service('tags').update(el._id, el).then(res => {
      console.log(res)
    })
  }
})
*/

/*
// Checksum
app.service('discussion-messages').find({ paginate: false }).then(discussionMessages => {
  const JSum = require('jsum')
  for (const discussionMessage of discussionMessages) {
    discussionMessage.translationSum = JSum.digest(discussionMessage.text.find(t => t.type === 'default').value, 'SHA256', 'hex')
    app.service('discussion-messages').update(discussionMessage._id, discussionMessage).then(res => {
      console.log(res)
    })
  }
})
*/

/*
// Checksum
app.service('chat-messages').find({ paginate: false }).then(chatMessages => {
  const JSum = require('jsum')
  for (const chatMessage of chatMessages) {
    chatMessage.translationSum = JSum.digest(chatMessage.text.find(t => t.type === 'default').value, 'SHA256', 'hex')
    app.service('chat-messages').update(chatMessage._id, chatMessage).then(res => {
      console.log(res)
    })
  }
})
*/
