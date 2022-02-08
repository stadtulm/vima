const locales = require('../../locales/de.json')
const commonHooks = require('feathers-hooks-common')
const Errors = require('@feathersjs/errors')
const { authenticate } = require('@feathersjs/authentication').hooks

module.exports = {
  before: {
    all: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        authenticate('jwt'),
        (context) => {
          context.params.query.$populate = {
            path: 'author',
            select: {
              userName: 1,
              pic: 1
            }
          }
        }
      )
    ],
    find: [],
    get: [],
    create: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        async (context) => {
          const ad = await context.app.service('ads').get(context.data.ad)
          if (
            !ad.isActive ||
            !ad.accepted ||
            !ad.accepted.isAccepted
          ) {
            throw new Errors.Forbidden('Not allowed to create messages for restricted ads')
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
        () => {
          throw new Errors.NotImplemented()
        }
      )
    ],
    remove: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        () => {
          throw new Errors.NotImplemented()
        }
      )
    ]
  },

  after: {
    all: [],
    find: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Check if user is owner of ad
        async (context) => {
          const adIds = new Set(context.result.map(obj => obj.ad))
          const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
            {
              type: 'ads',
              reference: { $in: adIds },
              user: context.params.user?._id,
              relation: 'owner'
            }
          )
          if (userStatusContainers < adIds.length) {
            throw new Errors.Forbidden('Not allowed to request ad messages of user is not the ad author')
          }
        },
        // Check if ad messages belong to not accepted ads
        async (context) => {
          const adIds = context.result.map(obj => obj.ad)
          const notAcceptedAds = await context.app.service('ads').Model.countDocuments(
            {
              query: {
                _id: { $in: adIds },
                'accepted.isAccepted': { $ne: true }
              },
              paginate: false
            }
          )
          if (notAcceptedAds > 0) {
            throw new Errors.Forbidden('Not allowed to request ad messages of not accepted ads')
          }
        }
      )
    ],
    get: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Check if user is owner of ad
        async (context) => {
          const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
            {
              type: 'ads',
              reference: context.result.ad,
              user: context.params.user?._id,
              relation: 'owner'
            }
          )
          if (userStatusContainers === 0) {
            throw new Errors.Forbidden('Not allowed to request ad message of user is not the ad author')
          }
        },
        // Check if ad message belongs to not accepted ad
        async (context) => {
          const ad = await context.app.service('ads').get(context.result._id)
          if (
            !ad.accepted ||
            !ad.accepted.isAccepted
          ) {
            throw new Errors.Forbidden('Not allowed to request ad message of not accepted ad')
          }
        }
      )
    ],
    create: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        commonHooks.iff(
          (context) => !context.data.repliesTo,
          async (context) => {
            const userStatusContainers = await context.app.service('status-containers').find(
              {
                query: {
                  type: 'ads',
                  reference: context.data.ad,
                  user: context.params.user?._id
                }
              }
            )
            // Check if user is already applicant
            const applicantContainer = userStatusContainers.find(obj => obj.relation === 'applicant')
            if (applicantContainer) {
              throw new Errors.Conflict('Already replied to this ad')
            }
            // Check if user is owner
            const ownerContainer = userStatusContainers.find(obj => obj.relation === 'owner')
            if (ownerContainer) {
              throw new Errors.Conflict('Can not reply to own ad')
            }
            // Patch or create applicant container
            const subscriberContainer = userStatusContainers.find(obj => obj.relation === 'subscriber')
            if (subscriberContainer) {
              await context.app.service('status-containers').remove(subscriberContainer._id)
            }
            await context.app.service('status-containers').create(
              {
                type: 'ads',
                user: context.params.user._id,
                reference: context.data.ad,
                relation: 'applicant',
                tmpAdMessageId: context.result._id
              }
            )
          }
        ),
        commonHooks.iff(
          (context) => context.result.repliesTo,
          // Check if user is ad owner
          async (context) => {
            const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
              {
                type: 'ads',
                reference: context.data.ad,
                user: context.params.user?._id,
                relation: 'owner'
              }
            )
            if (userStatusContainers === 0) {
              throw new Errors.Forbidden('Only ad author is a can reply to ad messages')
            }
          },
          // Patch reference ad message if created message is a reply
          async (context) => {
            context.params.tmpApplicantAdMessage = await context.app.service('ad-messages').patch(
              context.result.repliesTo,
              {
                $push: {
                  replies: context.result._id
                }
              }
            )
          },
          // Create chat-messages
          async (context) => {
            const userChatStatusContainers = await context.app.service('status-containers').find(
              {
                query: {
                  $or: [{ user: context.params.tmpApplicantAdMessage.author._id }, { user: context.data.author }],
                  type: 'chats',
                  relation: 'owner'
                }
              }
            )
            const tmpUser1StatusContainerReferences = userChatStatusContainers
              .filter(obj => obj.user.toString() === context.params.tmpApplicantAdMessage.author._id.toString())
              .map(obj => obj.reference.toString())
            const tmpUser2StatusContainerReferences = userChatStatusContainers
              .filter(obj => obj.user.toString() === context.data.author.toString())
              .map(obj => obj.reference.toString())
            const reference = tmpUser1StatusContainerReferences
              .filter(e => tmpUser2StatusContainerReferences.indexOf(e) !== -1)
            let chatId
            if (!reference[0]) {
              // Create chat if not existant
              const chat = await context.app.service('chats').create(
                {
                  tmpUsers: [context.params.tmpApplicantAdMessage.author, context.data.author]
                }
              )
              chatId = chat._id
            } else {
              chatId = reference[0]
            }
            // Get ad title
            const ad = await context.app.service('ads').get(
              context.data.ad,
              {
                query: {
                  $select: {
                    title: 1
                  }
                }
              }
            )
            // Create applicant chat message
            const applicantChatMessage = await context.app.service('chat-messages').create(
              {
                chat: chatId,
                text:
                  '<blockquote class="blockquote"><p>' + locales.subject + ': ' + locales.ad + ' "' + ad.title + '"</blockquote>' +
                  '<p>' + context.params.tmpApplicantAdMessage.text + '</p>',
                author: context.params.tmpApplicantAdMessage.author,
                replies: [] // Has to be pushed later
              }
            )
            // Create owner chat message
            const ownerChatMessage = await context.app.service('chat-messages').create(
              {
                chat: chatId,
                text: context.data.text,
                author: context.params.user._id,
                repliesTo: applicantChatMessage._id
              }
            )
            // Patch original message with replies
            await context.app.service('chat-messages').patch(
              applicantChatMessage._id,
              {
                replies: [
                  ownerChatMessage._id
                ]
              }
            )
            // Patchad messages with chat
            await context.app.service('ad-messages').patch(
              null,
              {
                chat: chatId
              },
              {
                query: {
                  ad: context.data.ad,
                  $or: [{ author: context.params.tmpApplicantAdMessage.author }, { author: context.data.author }]
                }
              }
            )
          }
        )
      )
    ],
    update: [],
    patch: [],
    remove: []
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
