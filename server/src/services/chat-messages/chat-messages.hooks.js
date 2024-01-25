const commonHooks = require('feathers-hooks-common')
const { authenticate } = require('@feathersjs/authentication').hooks
const Errors = require('@feathersjs/errors')
const { notifyNewMessages } = require('../mailer/generator')
const JSum = require('jsum')

module.exports = {
  before: {
    all: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        authenticate('jwt')
      )
    ],
    find: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Check for correct query
        commonHooks.iff(
          (context) => !context.params.query?.chat,
          () => {
            throw new Errors.Forbidden('Not allowed to request chat messages without a chat')
          }
        ),
        // Check if chat is blocked
        async (context) => {
          const chat = await context.app.service('chats').get(context.params.query.chat)
          if (chat.isBlocked) {
            throw new Errors.Forbidden('Not allowed to request chat messages of blocked chat')
          }
        },
        // Check if user is chat owner
        async (context) => {
          const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
            {
              reference: context.params.query.chat,
              user: context.params.user?._id,
              relation: 'owner',
              type: 'chats'
            }
          )
          if (userStatusContainers === 0) {
            throw new Errors.Forbidden('Not allowed to request chat messages of a chat if user is not owner')
          }
        }
      )
    ],
    get: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        () => {
          throw new Errors.NotImplemented()
        }
      )
    ],
    create: [
      // Only chat owner can create new message
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Check if user is chat owner
        async (context) => {
          const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
            {
              reference: context.data.chat,
              user: context.params.user?._id,
              relation: 'owner',
              type: 'chats'
            }
          )
          if (userStatusContainers === 0) {
            throw new Errors.Forbidden('Not allowed to create messages of a chat if user is not owner')
          }
        }
      ),
      (context) => {
        context.data.translationSum = JSum.digest(
          ['text'].map(field => context.data[field].find(t => t.type === 'default').value),
          'SHA256',
          'hex'
        )
      }
    ],
    update: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        () => {
          throw new Errors.NotImplemented()
        }
      )
    ],
    patch: [
      // Only author can patch chatMessage
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Check if user is author
        async (context) => {
          const chatMessage = await context.app.service('chat-messages').get(context.arguments[0])
          if (context.params.user._id.toString() !== chatMessage.author.toString()) {
            throw new Errors.Forbidden('Only author can patch chat messages')
          }
        }
      ),
      commonHooks.iff(
        (context) => context.data?.text?.find(t => t.type === 'default'),
        (context) => {
          context.data.translationSum = JSum.digest(
            ['text'].map(field => context.data[field].find(t => t.type === 'default').value),
            'SHA256',
            'hex'
          )
        }
      )
    ],
    remove: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Skip if user is admin
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          // Check if user is author
          async (context) => {
            const chatMessage = await context.app.service('chat-messages').get(context.arguments[0])
            if (context.params.user._id.toString() !== chatMessage.author.toString()) {
              throw new Errors.Forbidden('Only author can remove chat messages')
            }
          }
        )
      )
    ]
  },

  after: {
    all: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        commonHooks.alterItems(rec => {
          if (rec.latestAnswers?.text && Array.isArray(rec.latestAnswers.text)) {
            rec.latestAnswers.text = rec.latestAnswers.text.find(t => t.type === 'default')
          }
          if (Array.isArray(rec.text)) {
            rec.text = rec.text.find(t => t.type === 'default')
          }
          return rec
        })
      ),
      // Prepare user ids for sending results to the correct channels
      async (context) => {
        const tmpUsers = await context.app.service('status-containers').find(
          {
            query: {
              reference: context.result.chat,
              relation: 'owner',
              $select: { user: 1 }
            }
          }
        )
        context.result.tmpUsers = tmpUsers.map(obj => obj.user.toString())
      }
    ],
    find: [],
    get: [],
    create: [
      // Add unread flag to status containers of other users
      async (context) => {
        const userStatusContainers = await context.app.service('status-containers').patch(
          null,
          {
            $push: {
              unread: { type: 'chatMessages', id: context.result._id }
            }
          },
          {
            query: {
              type: 'chats',
              reference: context.result.chat,
              user: { $ne: context.result.author }
            }
          }
        )
        await notifyNewMessages(context.app, 'chatMessages', 'create', context.result, userStatusContainers)
      }
    ],
    update: [],
    patch: [
      // Add unread flag to status containers of other users
      async (context) => {
        if (context.data.text) {
          await context.app.service('status-containers').patch(
            null,
            {
              $push: {
                unread: { type: 'chatMessages', id: context.result._id }
              }
            },
            {
              query: {
                type: 'chats',
                reference: context.result.chat,
                user: { $ne: context.result.author }
              }
            }
          )
        }
      }
    ],
    remove: [
      // Remove message flag and all reply flags from status containers
      async (context) => {
        if (context.result._id) {
          await context.app.service('status-containers').patch(
            null,
            {
              $pull: {
                unread: {
                  id: context.result._id
                }
              }
            }
          )
        } else if (context.params.many) {
          await context.app.service('status-containers').patch(
            null,
            {
              $pull: {
                unread: {
                  id: { $in: context.params.many }
                }
              }
            }
          )
        }
      },
      // Remove pics
      async (context) => {
        let isArray = false
        if (!Array.isArray(context.result)) {
          context.result = [context.result]
          isArray = false
        }
        for (const message of context.result) {
          for (const pic of message.pics) {
            await context.app.service('uploads').remove(pic.url)
          }
        }
        if (!isArray) {
          context.result = context.result[0]
        }
      }
    ]
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
