const { notifyNewMessages, notifyUsers } = require('../mailer/generator')
const commonHooks = require('feathers-hooks-common')
const { authenticate } = require('@feathersjs/authentication').hooks
const allowAnonymous = require('../authmanagement/anonymous')
const Errors = require('@feathersjs/errors')
const JSum = require('jsum')
const cheerio = require('cheerio')

module.exports = {
  before: {
    all: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        allowAnonymous(),
        authenticate('jwt', 'anonymous'),
        (context) => {
          context.params.query.$populate = [
            'latestAnswers',
            {
              path: 'latestAnswers',
              populate: {
                path: 'author',
                select: ['_id', 'userName', 'pic']
              }
            },
            {
              path: 'author',
              select: ['_id', 'userName', 'pic']
            }
          ]
        }
      )
    ],
    find: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Skip if user is admin
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          // Check for discussion query
          commonHooks.iff(
            (context) => !context.params.query?.discussion,
            () => {
              throw new Errors.Forbidden('Not allowed to request discussion-messages without discussion query')
            }
          ),
          async (context) => {
            // Get discussion with populated group
            const discussion = await context.app.service('discussions').get(
              context.params.query.discussion,
              {
                query: {
                  $populate: {
                    path: 'group'
                  }
                }
              }
            )
            // Check if user is owner of inactive or not accepted discussion
            if (
              !discussion.isActive ||
              !discussion.accepted ||
              !discussion.accepted.isAccepted
            ) {
              throw new Errors.Forbidden('Request includes posts of restricted discussion')
            }
            // Check if user is owner of inactive or not accepted group
            if (discussion.group) {
              if (
                !discussion.group.isActive ||
                !discussion.group.accepted ||
                !discussion.group.accepted.isAccepted
              ) {
                throw new Errors.Forbidden('Request includes posts of restricted group')
              }
              // Check if user is member of hidden group
              if (
                discussion.group.visibility !== 'public'
              ) {
                const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
                  {
                    reference: discussion.group._id,
                    user: context.params.user?._id,
                    type: 'groups',
                    relation: { $in: ['owner', 'moderator', 'member'] }
                  }
                )
                if (userStatusContainers === 0) {
                  throw new Errors.Forbidden('Request includes posts of restricted group')
                }
              }
            }
          }
        )
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
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Check for registered user
        (context) => {
          if (context.params.user === 'anonymous') {
            throw new Errors.Forbidden('Only registered users can participate in dicussions')
          }
        },
        // Check for group membership
        async (context) => {
          const discussion = await context.app.service('discussions').get(
            context.data.discussion,
            {
              query: {
                $populate: {
                  path: 'group'
                }
              }
            }
          )
          if (discussion.group) {
            const userStatusContainers = await context.app.service('status-containers').find(
              {
                query: {
                  reference: discussion.group._id,
                  user: context.params.user._id,
                  type: 'groups',
                  relation: { $in: ['owner', 'moderator', 'member'] }
                }
              }
            )
            if (userStatusContainers.length === 0) {
              throw new Errors.Forbidden('Only group members can post in private or hidden groups')
            }
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
      commonHooks.iff(
        commonHooks.isProvider('external'),
        async (context) => {
          const discussionMessage = await context.app.service('discussion-messages').get(context.arguments[0])
          if (context.params.user._id.toString() !== discussionMessage.author.toString()) {
            throw new Errors.Forbidden('Only author can patch discussion messages')
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
          // Check if discussion is a group discussion and store group for later
          commonHooks.iffElse(
            async (context) => {
              const message = await context.app.service('discussion-messages').get(
                context.arguments[0],
                {
                  query: {
                    $populate: { path: 'discussion', select: 'group' }
                  }
                }
              )
              context.params.tmpMessage = message
              if (message.discussion.group) {
                return true
              } else {
                return false
              }
            },
            // Group discussion: Check if user is author, owner or moderator
            async (context) => {
              const userStatusContainers = await context.app.service('status-containers').find(
                {
                  query: {
                    reference: context.params.tmpMessage.discussion.group,
                    user: context.params.user._id,
                    type: 'groups',
                    relation: { $in: ['owner', 'moderator', 'member'] }
                  }
                }
              )
              if (
                userStatusContainers.filter(obj => obj.relation !== 'member').length === 0 &&
                (
                  userStatusContainers.filter(obj => obj.relation === 'member').length === 0 ||
                  context.params.user._id.toString() !== context.params.tmpMessage.author.toString()
                )
              ) {
                throw new Errors.Forbidden('Only group owner, moderator or author who is still member of the group can remove group discussion messages')
              }
            }
          )
        )
      )
    ]
  },

  after: {
    all: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        commonHooks.alterItems(async (rec, context) => {
          if (rec.latestAnswers?.text && Array.isArray(rec.latestAnswers.text)) {
            if (!rec.latestAnswers.text.find(t => t.lang === context.params.connection?.language)) {
              // Create translation
              const translatedText = await context.app.service('translations').create({
                type: 'discussion-messages',
                texts: [{
                  ...rec.latestAnswers,
                  id: rec.latestAnswers._id
                }],
                allFields: ['text'],
                fields: ['text'],
                target: context.params.connection?.language
              })
              rec.latestAnswers.text.push(translatedText)
            }
          }
          if (Array.isArray(rec.text)) {
            try {
              rec.text = rec.text.find(t => t.type === 'default')
            } catch (e) {
              console.log(e)
            }
          }
          return rec
        })
      )
    ],
    find: [],
    get: [],
    create: [
      // Patch reference message if created message is a reply
      async (context) => {
        if (context.result.repliesTo) {
          await context.app.service('discussion-messages').patch(
            context.result.repliesTo,
            {
              $push: {
                replies: context.result._id
              }
            },
            {
              query: {
                $populate: [
                  { path: 'latestAnswers' }
                ]
              }
            }
          )
        }
      },
      // Add unread flag to status containers of subscribers
      async (context) => {
        const userStatusContainers = await context.app.service('status-containers').patch(
          null,
          {
            $push: {
              unread: { type: 'discussions', id: context.result._id }
            }
          },
          {
            query: {
              type: 'discussions',
              reference: context.result.discussion,
              user: { $ne: context.result.author },
              relation: 'subscriber'
            }
          }
        )
        await notifyNewMessages(context.app, 'discussionMessages', 'create', context.result, userStatusContainers)
      },
      async (context) => {
        // Parse message for mention tags then
        const $ = await cheerio.load(context.result.text.value)
        const targetUserIds = await $('span[data-type="mention"]').map((i, x) => $(x).attr('data-id')).toArray()
        // Send notifications
        await notifyUsers(context.app, 'newMention', 'create', context.result, targetUserIds)
        // Add to status-containers
        for (const userId of targetUserIds) {
          const mentionContainer = await context.app.service('status-containers').find(
            {
              query: {
                user: userId,
                type: 'discussions',
                relation: 'mentions'
              }
            }
          )
          if (mentionContainer.length > 1) {
            throw new Error('Too many mention containers exist for user ' + userId)
          } else if (mentionContainer.length === 0) {
            await context.app.service('status-containers').create({
              type: 'discussions',
              reference: context.result.discussion,
              user: userId,
              unread: [
                {
                  type: 'discussion-messages',
                  id: context.result._id
                }
              ],
              relation: 'mentions'
            })
          } else {
            await context.app.service('status-containers').patch(
              mentionContainer[0]._id,
              {
                $push: {
                  unread: { type: 'discussion-messages', id: context.result._id }
                }
              }
            )
          }
        }
      }
    ],
    update: [],
    patch: [
      // Add unread flag to status containers of subscribers
      async (context) => {
        if (context.data.text) {
          await context.app.service('status-containers').patch(
            null,
            {
              $push: {
                unread: { type: 'discussion-messages', id: context.result._id }
              }
            },
            {
              query: {
                type: 'discussions',
                reference: context.result.discussion,
                user: { $ne: context.result.author },
                'unread.id': {
                  $ne: context.result._id
                },
                relation: 'subscriber'
              }
            }
          )
        }
      }
    ],
    remove: [
      // If message to remove is a reply - remove reply from reference message
      async (context) => {
        if (context.result.repliesTo) {
          try {
            await context.app.service('discussion-messages').patch(
              context.result.repliesTo,
              {
                $pull: {
                  replies: context.result._id
                }
              },
              {
                query: {
                  $populate: [
                    { path: 'latestAnswers' }
                  ]
                }
              }
            )
          } catch (e) {
            console.log('Can not patch - already deleted', context.result.repliesTo)
          }
        }
      },
      // If message to remove has replies - remove its replies
      async (context) => {
        if (context.result.replies && context.result.replies.length > 0) {
          const discussionMessageIds = await context.app.service('discussion-messages').find(
            {
              paginate: false,
              query: {
                repliesTo: context.result._id,
                $select: ['_id']
              }
            }
          )
          for (const reply of discussionMessageIds) {
            await context.app.service('discussion-messages').remove(reply._id)
          }
        }
      },
      // Remove message unread-flag and all reply unread-flags from status containers
      // TODO: Test if pulls form unread and mention work when deleting a message
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
            },
            {
              query: {
                reference: context.result.discussion,
                relation: { $in: ['subscriber', 'mentions'] }
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
            },
            {
              query: {
                type: 'discussions',
                relation: { $in: ['subscriber', 'mentions'] }
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
