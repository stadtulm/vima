
const commonHooks = require('feathers-hooks-common')
const { authenticate } = require('@feathersjs/authentication').hooks
const Errors = require('@feathersjs/errors')
const { notifyUsers } = require('../mailer/generator')

module.exports = {
  before: {
    all: [
      // Authenticate
      commonHooks.iff(
        commonHooks.isProvider('external'),
        authenticate('jwt'),
        // Populate
        (context) => {
          context.params.query.$populate = [
            'latestChatMessage'
          ]
        }
      )
    ],
    find: [],
    get: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Only owner can get chat
        async (context) => {
          const ownChatStatusContainer = await context.app.service('status-containers').Model.countDocuments({
            user: context.params.user._id,
            reference: context.arguments[0],
            relation: 'owner',
            type: 'chats'
          })
          if (ownChatStatusContainer === 0) {
            throw new Errors.Forbidden('Request includes chat of other user')
          }
        }
      )
    ],
    create: [
      // Users can only create own chats
      commonHooks.iff(
        commonHooks.isProvider('external'),
        (context) => {
          if (!context.data.tmpUsers.find(obj => obj.toString() === context.params.user._id.toString())) {
            throw new Errors.Forbidden('Users can only create own chats')
          }
        }
      )
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
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Only owner of chat can patch chat
        async (context) => {
          const ownChatStatusContainer = await context.app.service('status-containers').Model.countDocuments({
            user: context.params.user._id,
            reference: context.arguments[0],
            relation: 'owner',
            type: 'chats'
          })
          if (ownChatStatusContainer !== 1) {
            throw new Errors.Forbidden('Not allowed to patch chat if user is not owner')
          }
        }
      )
    ],
    remove: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Only admin can remove chat
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          () => {
            throw new Errors.Forbidden('Only administrators can remove chats')
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
          if (rec.latestChatMessage?.text && Array.isArray(rec.latestChatMessage.text)) {
            rec.latestChatMessage.text = rec.latestChatMessage.text.find(t => t.type === 'default')
          }
          return rec
        })
      ),
      // Prepare user ids for sending results to correct channels
      async (context) => {
        const tmpUsers = await context.app.service('status-containers').find(
          {
            query: {
              reference: context.result._id,
              relation: 'owner',
              $select: { user: 1 }
            }
          }
        )
        context.result.tmpUsers = tmpUsers.map(obj => obj.user.toString())
      }
    ],
    find: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Check if user is owner of all requested chats
        async (context) => {
          const chatIds = context.result.data.map(obj => obj._id)
          const userStatusContainers = await context.app.service('status-containers').Model.countDocuments({
            user: context.params.user._id,
            reference: { $in: chatIds },
            relation: 'owner',
            type: 'chats'
          })
          if (userStatusContainers < chatIds.length) {
            throw new Errors.Forbidden('Request includes chats of other users')
          }
        }
      )
    ],
    get: [],
    create: [
      // Create status container for each user of the created chat
      async (context) => {
        for (const userId of context.data.tmpUsers) {
          let markAsNew = null
          if (!context.params.user || context.params.user._id.toString() !== userId.toString()) {
            markAsNew = 'new'
          }
          // Create status container
          await context.app.service('status-containers').create({
            user: userId,
            type: 'chats',
            relation: 'owner',
            reference: context.result._id,
            customField: markAsNew
          })
        }
        await notifyUsers(context.app, 'newChats', 'create', context.result, context.data.tmpUsers)
      }
    ],
    update: [],
    patch: [],
    remove: [
      async (context) => {
        // Remove all messages for this chat
        await context.app.service('chat-messages').remove(
          null,
          {
            query: {
              chat: context.result._id
            }
          }
        )
        // Remove all status containers for this chat
        await context.app.service('status-containers').remove(
          null,
          {
            query: {
              reference: context.result._id
            }
          }
        )
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
