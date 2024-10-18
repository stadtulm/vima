const { notifyUsers } = require('../mailer/generator')
const commonHooks = require('feathers-hooks-common')
const { authenticate } = require('@feathersjs/authentication').hooks
const Errors = require('@feathersjs/errors')

module.exports = {
  before: {
    all: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        authenticate('jwt'),
        (context) => {
          context.params.query.$populate = [
            {
              path: 'responses.user',
              select: { lastName: 1, firstName: 1, userName: 1, pic: 1 }
            },
            {
              path: 'message.id',
              populate: [
                {
                  path: 'author',
                  select: { lastName: 1, firstName: 1, userName: 1, pic: 1 }
                }
              ]
            },
            {
              path: 'discussion',
              select: { title: 1 },
              populate: {
                path: 'group',
                select: { title: 1 }
              }
            }
          ]
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
        (context) => {
          if (
            !context.params.user ||
            context.params.user.role === 'anonymous'
          ) {
            throw new Errors.Forbidden('Only registered users can create violations')
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
        // Skip if user is admin
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins' && context.params.user?.role !== 'volunteers',
          async (context) => {
            // Check violation is group violation
            const violation = await context.app.service('violations').get(
              context.arguments[0],
              {
                query: {
                  $select: {
                    group: 1,
                    type: 1
                  }
                }
              }
            )
            if (!violation.group || violation.type !== 'groups') {
              throw new Errors.Forbidden('Only administrators and volunteers can patch non group violations')
            }
            // Check if user is group owner or moderator
            const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
              {
                reference: violation.group,
                user: context.params.user?._id,
                relation: { $in: ['owner', 'moderator'] }
              }
            )
            if (userStatusContainers === 0) {
              throw new Errors.Forbidden('Only administrsators, volunteers, group owner and moderators can patch group violations')
            }
          }
        )
      )
    ],
    remove: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Skip if user is admin
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins' && context.params.user?.role !== 'volunteers',
          // Check if user is group owner / moderaor
          async (context) => {
            const violation = await context.app.service('violations').get(
              context.arguments[0],
              {
                query: {
                  $select: {
                    group: 1,
                    type: 1
                  }
                }
              }
            )
            if (!violation.group || violation.type !== 'groups') {
              throw new Errors.Forbidden('Only administrators and volunteers can remove non group violations')
            }
            const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
              {
                reference: violation.group,
                user: context.params.user?._id,
                relation: { $in: ['owner', 'moderator'] }
              }
            )
            if (userStatusContainers === 0) {
              throw new Errors.Forbidden('Only administrators, volunteers, group owner and moderators can remove group violations')
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
          if (
            rec.message &&
            rec.message.id &&
            rec.message.id.text &&
            Array.isArray(rec.message.id.text)
          ) {
            rec.message.id.text = rec.message.id.text.find(t => t.type === 'default')
          }
          if (
            rec.discussion &&
            Array.isArray(rec.discussion.title)
          ) {
            rec.discussion.title = rec.discussion.title.find(t => t.type === 'default')
            if (
              rec.discussion.group &&
              Array.isArray(rec.discussion.group.title)
            ) {
              rec.discussion.group.title = rec.discussion.group.title.find(t => t.type === 'default')
            }
          }
          return rec
        })
      )
    ],
    find: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Skip if user is admin
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins' && context.params.user?.role !== 'volunteers',
          // Check if all violations are group violations
          (context) => {
            if (context.result.data.filter(obj => !obj.group || obj.type !== 'groups').length > 0) {
              throw new Errors.Forbidden('Only administrators and volunteers can request non group violations')
            }
          },
          // Check if user is group owner or moderator
          async (context) => {
            const groupIds = [...new Set(context.result.data.map(obj => obj.group.toString()))]
            const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
              {
                reference: { $in: groupIds },
                user: context.params.user?._id,
                relation: { $in: ['owner', 'moderator'] }
              }
            )
            if (userStatusContainers < groupIds.length) {
              throw new Errors.Forbidden('Only administrators, volunteers, group owner or moderators can request group violations')
            }
          }
        )
      )
    ],
    get: [],
    create: [
      // Notify admin or moderators
      async (context) => {
        if (context.result.type === 'groups') {
          const tmpUsers = await context.app.service('status-containers').patch(
            null,
            {
              $push: {
                unread: {
                  type: 'violations',
                  id: context.result._id
                }
              }
            },
            {
              query: {
                type: 'groups',
                relation: { $in: ['moderator', 'owner'] },
                reference: context.result.group
              }
            }
          )
          await notifyUsers(context.app, 'newGroupViolationsToProve', 'create', context.result, tmpUsers.map(obj => obj.user))
        } else {
          const tmpUsers = await context.app.service('status-containers').patch(
            null,
            {
              $push: {
                unread: {
                  type: 'violations',
                  id: context.result._id
                }
              }
            },
            {
              query: {
                type: 'violations',
                relation: 'admin'
              }
            }
          )
          let type = 'newViolationsToProve'
          if (context.result.discussion) {
            type = 'newDiscussionViolationsToProve'
          }
          await notifyUsers(context.app, type, 'create', context.result, tmpUsers.map(obj => obj.user))
        }
      }
    ],
    update: [],
    patch: [
      async (context) => {
        if (context.data.isClosed) {
          // Remove from unread of all status-containers
          await context.app.service('status-containers').patch(
            null,
            {
              $pull: {
                unread: { id: context.result._id }
              }
            }
          )
        }
      }
    ],
    remove: [
      async (context) => {
        // Remove from unread of all status-containers
        await context.app.service('status-containers').patch(
          null,
          {
            $pull: {
              unread: { id: context.result._id }
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
