const commonHooks = require('feathers-hooks-common')
const { authenticate } = require('@feathersjs/authentication').hooks
const Errors = require('@feathersjs/errors')

module.exports = {
  before: {
    all: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        authenticate('jwt'),
        commonHooks.iff(
          // Double check for logged in user
          (context) => !context.params.user || context.params.user.role === 'anonymous',
          () => {
            throw new Errors.Forbidden('Only logged in users can use this service')
          }
        )
      )
    ],
    find: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        async (context) => {
          if (context.params.query.type === 'commonChat') {
            if (!context.params.query.users.map(obj => obj.toString()).includes(context.params.user._id.toString())) {
              throw new Errors.Forbidden('Not allowed to get chats of other users')
            }
          }
        }
      )
    ],
    get: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        () => {
          Errors.NotImplemented()
        }
      )
    ],
    create: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        async (context) => {
          if (context.data.type === 'joinGroup') {
            const group = await context.app.service('groups').get(context.data.groupId)
            if (group.visibility !== 'public') {
              throw new Errors.Forbidden('Not allowed to directly join non public groups')
            }
          // One can not apply for hidden groups
          } else if (context.data.type === 'createGroupApplication') {
            const group = await context.app.service('groups').get(context.data.groupId)
            if (group.visibility === 'hidden') {
              throw new Errors.Forbidden('Not allowed to apply for hidden groups')
            }
          // Only group owner can create moderators
          } else if (context.data.type === 'createGroupModeration') {
            const group = await context.app.service('groups').get(
              context.data.groupId,
              {
                query: {
                  $populate: ['owner']
                }
              }
            )
            if (context.params.user.role !== 'admins' && group.owner.user._id.toString() !== context.params.user?._id.toString()) {
              throw new Errors.Forbidden('Only group owner can create moderators')
            }
            // Only members who are not moderators yet can become moderators
            const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
              {
                type: 'groups',
                reference: context.data.groupId,
                user: context.data.userId,
                relation: ['member', 'moderator']
              }
            )
            if (userStatusContainers !== 1) {
              throw new Errors.Forbidden('Only members who are not moderators yet can become moderators')
            }
          // Only group owner and moderators can invite members
          } else if (context.data.type === 'createGroupInvitation') {
            // ... and admins
            if (context.params.user.role !== 'admins') {
              const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
                {
                  type: 'groups',
                  reference: context.data.groupId,
                  user: context.params.user?._id,
                  relation: { $in: ['owner', 'moderator'] }
                }
              )
              if (userStatusContainers === 0) {
                throw new Errors.Forbidden('Only group owner, moderators and admins are allowed to invite members')
              }
            }
            // Only non members can be invited
            const invitedUserStatusContainers = await context.app.service('status-containers').Model.countDocuments(
              {
                type: 'groups',
                reference: context.data.groupId,
                user: context.data.userId,
                relation: { $in: ['owner', 'moderator', 'invitation'] }
              }
            )
            if (invitedUserStatusContainers > 0) {
              throw new Errors.Forbidden('Only non members can be invited')
            }
          // Only group owner and moderator can accept group applicants
          } else if (context.data.type === 'acceptGroupApplication') {
            // ... and admins
            if (context.params.user.role !== 'admins') {
              const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
                {
                  type: 'groups',
                  reference: context.data.groupId,
                  user: context.params.user?._id,
                  relation: { $in: ['owner', 'moderator'] }
                }
              )
              if (userStatusContainers === 0) {
                throw new Errors.Forbidden('Only group owner, moderators and admins are allowed to accept group applicants')
              }
            }
          // Only admins can add users to organisations
          } else if (context.data.type === 'createOrganisationMembership') {
            if (context.params.user?.role !== 'admins' && context.params.user?.role !== 'volunteers') {
              throw new Errors.Forbidden('Only administrators can add users to organisations')
            }
          }
        }
      )
    ],
    update: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        () => {
          Errors.NotImplemented()
        }
      )
    ],
    patch: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        async (context) => {
          // Check if user is owner of status container
          if (
            context.arguments[0] === 'pullUnreadById' ||
            context.arguments[0] === 'pullUnreadByType' ||
            context.arguments[0] === 'setCustomField'
          ) {
            const statusContainer = await context.app.service('status-containers').get(context.data.containerId)
            if (statusContainer.user.toString() !== context.params.user?._id.toString()) {
              throw new Errors.Forbidden('Not allowed to patch status containers of other users')
            }
          }
        }
      )
    ],
    remove: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        async (context) => {
          // Only group owner, moderator and user can remove group membership
          if (context.params.query.type === 'removeGroupMembership') {
            if (
              context.params.query.userId.toString() !== context.params.user?._id.toString()
            ) {
              const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
                {
                  type: 'groups',
                  user: context.params.user?._id,
                  reference: context.arguments[0],
                  relation: { $in: ['owner', 'moderator'] }
                }
              )
              if (userStatusContainers === 0) {
                throw new Errors.Forbidden('Only the group owner, moderators or the affected user can remove a group membership')
              }
            }
          // Only group owner and user can remove group moderation
          } else if (context.params.query.type === 'removeGroupModeration') {
            if (
              context.params.query.userId.toString() !== context.params.user?._id.toString()
            ) {
              const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
                {
                  type: 'groups',
                  user: context.params.user?._id,
                  reference: context.arguments[0],
                  relation: { $in: ['owner', 'moderator'] }
                }
              )
              if (userStatusContainers === 0) {
                throw new Errors.Forbidden('Only the group owner, moderators or the affected user can remove a group moderation')
              }
            }
          // Only admins can remove users from organisations
          } else if (context.params.query.type === 'removeOrganisationMembership') {
            if (context.params.user?.role !== 'admins' && context.params.user?.role !== 'volunteers') {
              throw new Errors.Forbidden('Only administrators can remove users from organisations')
            }
          }
        }
      )
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
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
