const path = require('path')
const dotenv = require('dotenv')
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
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
// Enable security, CORS, compression and body parsing
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
// Host the public folder
app.use('/', express.static(app.get('public')))

// Set up Plugins and providers
app.configure(express.rest())

app.configure(
  socketio(
    {
      maxHttpBufferSize: 1e8,
      transports: ['websocket']
    },
    io => {
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

Migration

*/

// Add latestMessageUpdate to chats
/*
app.service('chats').find({
  paginate: false,
  query: {
    $populate: [
      'latestChatMessage'
    ]
  }
}).then(async (chats) => {
  for (const chat of chats) {
    if (!chat.latestMessageUpdate && chat.latestChatMessage) {
      await app.service('chats').patch(chat._id, {
        latestMessageUpdate: chat.latestChatMessage.createdAt
      })
    }
  }
}).catch(e => console.log(e))
*/

// Remove replies from chat messages
/*
app.service('chat-messages').find({ paginate: false, query: { _id: '60b8e13007805b546ce240ee' } }).then(async messages => {
  for (const message of messages) {
    if (message.repliesTo) {
      console.log('Child Message:', message._id, ' - parent message:', message.repliesTo)
      const parentMessage = await app.service('chat-messages').get(message.repliesTo)
      console.log('PARENT MESSAGE', parentMessage)
      if (parentMessage) {
        const parentText = parentMessage.text?.find(t => t.type === 'default').value
        if (parentText) {
          const newMessage = {
            text: [
              {
                value: '<blockquote class="blockquote">' + parentText + '</blockquote>' + message.text?.find(t => t.type === 'default').value,
                type: 'default'
              }
            ]
          }
          app.service('chat-messages').patch(message._id, newMessage).catch(e => {
            console.log(e)
          })
        }
      }
    }
  }
}).catch(e => console.log(e))
*/
