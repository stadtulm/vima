const commonHooks = require('feathers-hooks-common')
const { authenticate } = require('@feathersjs/authentication').hooks
const Errors = require('@feathersjs/errors')
const { notifyUsers } = require('../mailer/generator')

module.exports = {
  before: {
    all: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        authenticate('jwt'),
        // Populate
        (context) => {
          context.params.query.$populate = [
            {
              path: 'user',
              select: {
                userName: 1,
                pic: 1
              }
            }
          ]
          if (context.params.query.tmpPopulateReference) {
            delete context.params.query.tmpPopulateReference
            context.params.query.$populate.push(
              {
                path: 'reference',
                select: {
                  name: 1,
                  title: 1
                }
              }
            )
          }
        }
      )
    ],
    find: [],
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
        () => {
          throw new Errors.NotImplemented()
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
        // Skip is user is admin
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          async (context) => {
            // Check if there are containers of other users
            const foreignContainers = context.result
              .filter(obj => obj.user._id.toString() !== context.params.user?._id.toString())
            if (foreignContainers.length > 0) {
              // Check if user is owner or moderator of those container references
              const foreignReferenceIds = [...new Set(foreignContainers.map(
                obj => {
                  if (typeof obj.reference === 'object') {
                    return obj.reference._id.toString()
                  } else {
                    return obj.reference.toString()
                  }
                }
              ))]
              const userStatusContainers = await context.app.service('status-containers').Model.countDocuments({
                user: context.params.user?._id,
                reference: { $in: foreignReferenceIds },
                relation: { $in: ['owner', 'moderator'] }
              })
              if (userStatusContainers < foreignReferenceIds.length) {
                throw new Errors.Forbidden('Not allowed to request status containers of other users for references user is not owner or moderator')
              }
              // Add user to channel with id of statusContainers
              for (const statusContainer of context.result) {
                context.app.channel(statusContainer._id).join(context.params.connection)
              }
            }
          }
        )
      )
    ],
    get: [],
    create: [
      // Ads: Notify ad owner
      async (context) => {
        if (context.result.type === 'ads' && context.result.relation === 'applicant') {
          const adAuthorStatusContainers = await context.app.service('status-containers').patch(
            null,
            {
              $push: {
                unread: { type: 'adMessages', id: context.data.tmpAdMessageId }
              }
            },
            {
              query: {
                reference: context.result.reference,
                type: 'ads',
                relation: 'owner'
              }
            }
          )
          await notifyUsers(context.app, 'newAdApplicants', 'create', context.result, adAuthorStatusContainers.map(obj => obj.user))
        }
      },
      // Groups: Notify owner and moderators about new applicant
      async (context) => {
        if (context.result.type === 'groups' && context.result.relation === 'applicant') {
          const tmpUsers = await context.app.service('status-containers').patch(
            null,
            {
              $push: {
                unread: { type: 'users', id: context.result._id }
              }
            },
            {
              query: {
                reference: context.result.reference,
                type: 'groups',
                relation: { $in: ['owner', 'moderator'] }
              }
            }
          )
          await notifyUsers(context.app, 'newGroupApplicants', 'create', context.result, tmpUsers.map(obj => obj.user))
        }
      },
      // Groups: Notify invited user
      async (context) => {
        if (context.result.type === 'groups' && context.result.relation === 'invitation' && context.result.customField === 'new') {
          await notifyUsers(context.app, 'newAcceptedGroupInvitations', 'create', context.result, [context.result.user])
        }
      },
      // Groups: Notify new group moderator
      async (context) => {
        if (context.result.type === 'groups' && context.result.relation === 'moderator' && context.result.customField === 'new') {
          await notifyUsers(context.app, 'newAcceptedGroupModeratorRoles', 'create', context.result, [context.result.user])
        }
      },
      // Discussions: Make user a subscriber when becoming moderator
      async (context) => {
        if (context.result.type === 'discussions' && context.result.relation === 'moderator') {
          const existingSubscriberContainer = await context.app.service('status-containers').find(
            {
              query: {
                type: 'discussions',
                user: context.result.user,
                reference: context.result.reference,
                relation: 'subscriber'
              }
            }
          )
          if (existingSubscriberContainer.length === 0) {
            context.app.service('status-containers').create({
              type: 'discussions',
              user: context.result.user,
              reference: context.result.reference,
              relation: 'subscriber'
            })
          }
        }
      },
      // All: Add owner and moderators of status-container reference to channel
      async (context) => {
        const statusContainers = await context.app.service('status-containers').find(
          {
            query: {
              reference: context.result.reference,
              relation: { $in: ['owner', 'moderator'] }
            }
          }
        )
        for (const statusContainer of statusContainers) {
          if (
            context.app.channel(statusContainer.user) &&
              context.app.channel(statusContainer.user).connections &&
              context.app.channel(statusContainer.user).connections[0]
          ) {
            context.app.channel(context.result._id).join(context.app.channel(statusContainer.user).connections[0])
          }
        }
      }
    ],
    update: [],
    patch: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Groups: If accepted group applicant - notify applicant
        async (context) => {
          if (context.result.type === 'groups' && context.result.relation === 'member' && context.result.customField === 'new') {
            await notifyUsers(context.app, 'newAcceptedGroupMemberships', 'patch', context.result, [context.result.user])
            // Add new accepted user to group channel if online
            if (
              context.app.channel(context.result.user) &&
              context.app.channel(context.result.user).connections &&
              context.app.channel(context.result.user).connections[0]
            ) {
              context.app.logger.debug(context.result.user, '(accepted) joins group channel', context.result.reference)
              context.app.channel(context.result.reference).join(context.app.channel(context.result.user).connections[0])
            }
          }
        }
      )
    ],
    remove: [
      async (context) => {
        await context.app.service('status-containers').patch(
          null,
          {
            $pull: {
              unread: { id: context.result._id }
            }
          }
        )
      },
      // Groups: Remove member / moderator from group channel if online
      (context) => {
        let tmpStatusContainers = JSON.parse(JSON.stringify(context.result))
        if (!Array.isArray(tmpStatusContainers)) {
          tmpStatusContainers = [tmpStatusContainers]
        }
        for (const statusContainer of tmpStatusContainers) {
          if (statusContainer.type === 'groups' && statusContainer.relation === 'member') {
            if (
              context.app.channel(statusContainer.user) &&
              context.app.channel(statusContainer.user).connections &&
              context.app.channel(statusContainer.user).connections[0]
            ) {
              context.app.logger.debug(statusContainer.user, 'leaves group channel', statusContainer.reference)
              context.app.channel(statusContainer.reference).leave(context.app.channel(statusContainer.user).connections[0])
            }
          }
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
