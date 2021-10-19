const commonHooks = require('feathers-hooks-common')
const { authenticate } = require('@feathersjs/authentication').hooks
const Errors = require('@feathersjs/errors')
const { notifyNewMessages } = require('../mailer/generator')

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
      // Patch reference message if created message is a reply
      async (context) => {
        if (context.result.repliesTo) {
          await context.app.service('chat-messages').patch(
            context.result.repliesTo,
            {
              $push: {
                replies: context.result._id
              }
            }
          )
        }
      },
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
      // If it is a reply - remove reply from reference message
      async (context) => {
        if (context.result.repliesTo) {
          await context.app.service('chat-messages').patch(
            context.result.repliesTo,
            {
              $pull: {
                replies: context.result._id
              }
            }
          )
        }
      },
      // If it has replies - remove all replies
      async (context) => {
        if (context.result.replies && context.result.replies.length > 0) {
          const chatMessageIds = await context.app.service('chat-messages').find(
            {
              paginate: false,
              query: {
                repliesTo: context.result._id,
                $select: ['_id']
              }
            }
          )
          await context.app.service('chat-messages').remove(
            null,
            {
              query: {
                _id: { $in: context.result.replies }
              },
              many: chatMessageIds.map(obj => obj._id)
            }
          )
        }
      },
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
