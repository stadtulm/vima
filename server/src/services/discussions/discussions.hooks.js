const commonHooks = require('feathers-hooks-common')
const { authenticate } = require('@feathersjs/authentication').hooks
const allowAnonymous = require('../authmanagement/anonymous')
const { notifyUsers } = require('../mailer/generator')
const Errors = require('@feathersjs/errors')

module.exports = {
  before: {
    all: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        allowAnonymous(),
        authenticate('jwt', 'anonymous'),
        // Populate
        (context) => {
          context.params.query.$populate = [
            'author',
            'latestMessage',
            'messagesCount',
            {
              path: 'group',
              populate: ['owner']
            }
          ]
        }
      )
    ],
    find: [],
    get: [],
    create: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Skip if user is admin
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          // Check if requested discussion is a group discussion
          commonHooks.iffElse(
            context => context.data.group,
            // Check for group membership
            async (context) => {
              context.params.tmpUserStatusContainers = await context.app.service('status-containers').find(
                {
                  query: {
                    user: context.params.user._id,
                    type: 'groups',
                    reference: context.data.group,
                    relation: { $in: ['owner', 'moderator', 'member'] }
                  }
                }
              )
              if (context.params.tmpUserStatusContainers.length === 0) {
                throw new Errors.Forbidden('Only group members can create discussions in this group')
              }
            },
            // Throw because user is not an admin
            () => {
              throw new Errors.Forbidden('Only administrators can create non group discussions')
            }
          )
        ),
        // Accept immediately
        (context) => {
          context.data.accepted = { isAccepted: true, dt: new Date(), user: context.params.user._id }
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
        // Get discussion to patch with populated group and author and save for later
        async context => {
          const discussion = await context.app.service('discussions').get(
            context.arguments[0],
            {
              query: {
                $populate: ['author', 'group']
              }
            }
          )
          context.params.tmpDiscussion = discussion
        },
        // Throw if non owner tries to patch properties other than accepted
        async (context) => {
          const tmpData = JSON.parse(JSON.stringify(context.data))
          delete tmpData.accepted
          if (
            context.params.tmpDiscussion.author.user._id.toString() !== context.params.user?._id.toString() &&
            Object.keys(tmpData).length > 0
          ) {
            throw new Errors.Forbidden('Only discussion author can patch discussion properties')
          }
        },
        commonHooks.iff(
          context => context.data.accepted,
          // Check if group discussion
          commonHooks.iffElse(
            context => context.params.tmpDiscussion.group,
            // Only admin, group owner or moderator can patch accepted of group discussion
            async (context) => {
              // Check group relation
              const groupStatusContainers = await context.app.service('status-containers').Model.countDocuments(
                {
                  reference: context.params.tmpDiscussion.group._id,
                  user: context.params.user._id,
                  type: 'groups',
                  relation: { $in: ['owner', 'moderator'] }
                }
              )
              if (
                context.params.user?.role !== 'admins' &&
                groupStatusContainers === 0
              ) {
                throw new Errors.Forbidden('Only administrator, group owners and moderators can accept group discussion')
              }
            },
            // Only admin can patch accepted of discussion
            async (context) => {
              if (context.params.user?.role !== 'admins') {
                throw new Errors.Forbidden('Only administrators can accept discussions')
              }
            }
          )
        )
      )
    ],
    remove: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Skip if user is admin
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          // Get discussion to remove with populated group and author and save for later
          async context => {
            const discussion = await context.app.service('discussions').get(
              context.arguments[0],
              {
                query: {
                  $populate: ['author', 'author']
                }
              }
            )
            context.params.tmpDiscussion = discussion
          },
          // Check if group discussion
          commonHooks.iffElse(
            context => context.params.tmpDiscussion.group,
            // Group discussion: Check for discussion owner, group owner or group moderator
            async (context) => {
              const groupStatusContainers = await context.app.service('status-containers').Model.countDocuments(
                {
                  reference: context.params.tmpDiscussion.group._id,
                  user: context.params.user._id,
                  type: 'groups',
                  relation: { $in: ['owner', 'moderator'] }
                }
              )
              if (
                context.params.user?._id.toString() !== context.params.tmpDiscussion.author.user._id.toString() &&
                groupStatusContainers === 0
              ) {
                throw new Errors.Forbidden('Only administrators, group owner, group moderator or discussion owner can remove discussion')
              }
            },
            // Discussion: Check for discussion owner
            commonHooks.iff(
              context => context.params.user?._id.toString() !== context.params.tmpDiscussion.author._id.toString(),
              () => {
                throw new Errors.Forbidden('Only administrators and discussion owner can remove discussion')
              }
            )
          )
        )
      )
    ]
  },

  after: {
    all: [],
    find: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Skip if user is admin
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          // Check if user has relation to restricted discussions
          async (context) => {
            const restrictedDiscussionIds = context.result.data
              .filter(
                obj =>
                  !obj.isActive ||
                  !obj.accepted ||
                  !obj.accepted.isAccepted
              )
              .map(obj => obj._id)
            const userStatusContainers = await context.app.service('status-containers').find(
              {
                query: {
                  reference: { $in: restrictedDiscussionIds },
                  user: context.params.user?._id,
                  type: 'discussions'
                }
              }
            )
            if (userStatusContainers.length < restrictedDiscussionIds.length) {
              // User has no direct relation to discussion, now check if user is group owner or moderator
              const nonRelationDiscussionIds = restrictedDiscussionIds
                .filter(obj => !userStatusContainers.map(obj => obj.reference).includes(obj))
                .filter(obj => !obj.group)
              // The discussion(s) without relations are no group discussions - throw immediately
              if (nonRelationDiscussionIds.length === 0) {
                throw new Errors.Forbidden('Not allowed to request restricted discussions without relation')
              }
              // Get group of discussion without relation
              const groups = [...new Set(
                nonRelationDiscussionIds
                  .map(discussionId => context.result.data.find(obj => obj._id.toString() === discussionId.toString()).group._id)
              )]
              const groupStatusContainers = await context.app.service('status-containers').Model.countDocuments(
                {
                  type: 'groups',
                  reference: { $in: groups },
                  relation: { $in: ['owner', 'moderator'] }
                }
              )
              if (groupStatusContainers < groups.length) {
                throw new Errors.Forbidden('Not allowed to request restricted discussions without relation')
              }
            }
          },
          // Check if user has relation to restricted groups
          async (context) => {
            const groupIds = context.result.data
              .filter(obj => obj.group)
              .map(obj => obj.group)
            const restrictedGroups = await context.app.service('groups').find(
              {
                query: {
                  _id: { $in: groupIds },
                  $or: [
                    { visibility: { $in: ['hidden', 'private'] } },
                    { isActive: { $ne: true } },
                    { 'accepted.isAccepted': { $ne: true } }
                  ]
                },
                paginate: false
              }
            )
            const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
              {
                reference: { $in: restrictedGroups.map(obj => obj._id) },
                user: context.params.user?._id,
                type: 'groups',
                relation: { $in: ['owner', 'moderator', 'member'] }
              }
            )
            if (userStatusContainers < restrictedGroups.length) {
              throw new Errors.Forbidden('Not allowed to request discussions of restricted groups without relation')
            }
          }
        )
      )
    ],
    get: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Skip if user is admin
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          // Check for restricted discussion relation
          async (context) => {
            if (
              !context.result.isActive ||
              !context.result.accepted ||
              !context.result.accepted.isAccepted
            ) {
              const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
                {
                  type: 'discussions',
                  user: context.params.user?._id,
                  reference: context.result._id
                }
              )
              // User has no direct relation with discussion, now check if user is group owner or moderator
              if (userStatusContainers === 0) {
                // If discussion is no group discussion throw immediately
                if (!context.result.group) {
                  throw new Errors.Forbidden('Not allowed to request restricted discussion without relation')
                }
                // Check if user is group owner or moderator
                const groupStatusContainers = await context.app.service('status-containers').Model.countDocuments(
                  {
                    type: 'groups',
                    reference: context.result.group,
                    relation: { $in: ['owner', 'moderator'] }
                  }
                )
                if (groupStatusContainers === 0) {
                  throw new Errors.Forbidden('Not allowed to request restricted discussions without relation')
                }
              }
            }
          },
          // Check for restricted group relation
          async (context) => {
            if (
              context.result.group
            ) {
              const group = await context.app.service('groups').get(
                context.result.group
              )
              if (
                group.visibility !== 'public' ||
                !group.isActive ||
                !group.accepted ||
                !group.accepted.isAccepted
              ) {
                const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
                  {
                    type: 'groups',
                    user: context.params.user?._id,
                    reference: context.result.group,
                    relation: { $in: ['owner', 'moderator', 'member'] }
                  }
                )
                if (userStatusContainers === 0) {
                  throw new Errors.Forbidden('Not allowed to request discussion of restricted group without relation')
                }
              }
            }
          }
        )
      )
    ],
    create: [
      // Create status containers for discussion
      async (context) => {
        // Create status container
        await context.app.service('status-containers').create({
          user: context.params.user._id,
          type: 'discussions',
          reference: context.result._id,
          relation: 'owner'
        })
      }
    ],
    update: [],
    patch: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        async (context) => {
          // Check if discussion status has been changed
          if (context.data.accepted) {
            // If discussion has been accepted
            if (
              context.params.tmpDiscussion.author.user._id.toString() !== context.params.user._id.toString() &&
              context.data.accepted.isAccepted
            ) {
              // Notify author that discussion has been accepted if not changed by the author
              await context.app.service('status-containers').patch(
                null,
                {
                  customField: 'accepted'
                },
                {
                  query: {
                    reference: context.arguments[0],
                    type: 'discussions',
                    relation: 'owner'
                  }
                }
              )
              let type
              if (context.result.group) {
                type = 'newAcceptedGroupDiscussions'
              } else {
                type = 'newAcceptedDiscussions'
              }
              await notifyUsers(context.app, type, 'accepted', context.result, [context.params.tmpDiscussion.author.user._id])
              // Update admins that discussion has been accepted
              await context.app.service('status-containers').patch(
                null,
                {
                  $pull: {
                    unread: { id: context.result._id }
                  }
                },
                {
                  query: {
                    type: 'discussions',
                    relation: 'admin'
                  }
                }
              )
            }
          }
          if (!context.data.accepted?.isAccepted) {
            // Update user - remove from accepted notifications
            await context.app.service('status-containers').patch(
              null,
              {
                customField: null
              },
              {
                query: {
                  reference: context.arguments[0],
                  type: 'discussions',
                  relation: 'owner'
                }
              }
            )
            if (context.result.group) {
              if (!context.data.tmpUserCanAccept) {
                // Notify owner and moderators
                const tmpUsers = await context.app.service('status-containers').patch(
                  null,
                  {
                    $push: {
                      unread: { type: 'discussions', id: context.result._id }
                    }
                  },
                  {
                    query: {
                      type: 'groups',
                      reference: context.result.group,
                      relation: { $in: ['owner', 'moderator'] }
                    }
                  }
                )
                await notifyUsers(context.app, 'newGroupDiscussionsToAccept', 'patch', context.result, tmpUsers.map(obj => obj.user))
              }
            } else {
              if (context.params.user.role !== 'admins') {
                // Notify admins that discussion has been patched
                const tmpUsers = await context.app.service('status-containers').patch(
                  null,
                  {
                    $push: {
                      unread: { type: 'discussions', id: context.result._id }
                    }
                  },
                  {
                    query: {
                      type: 'discussions',
                      relation: 'admin',
                      'unread.id': {
                        $ne: context.result._id
                      }
                    }
                  }
                )
                await notifyUsers(context.app, 'newDiscussionsToAccept', 'patch', context.result, tmpUsers.map(obj => obj.user))
              }
            }
          }
        }
      )
    ],
    remove: [
      async (context) => {
        // Remove all status containers for this discussion
        if (context.result._id) {
          await context.app.service('status-containers').remove(
            null,
            {
              query: {
                reference: context.result._id
              }
            }
          )
        } else if (context.params.many) {
          await context.app.service('status-containers').remove(
            null,
            {
              query: {
                reference: { $in: context.params.many }
              }
            }
          )
        }
        // Remove discussion from unread of all users
        await context.app.service('status-containers').patch(
          null,
          {
            $pull: {
              unread: { id: context.result._id }
            }
          }
        )
        // Remove all messages for this discussion
        await context.app.service('discussion-messages').remove(
          null,
          {
            query: {
              discussion: context.result._id
            }
          }
        )
        // Remove images / uploads
        if (context.result.pics) {
          for (const pic of context.result.pics) {
            await context.app.service('uploads').remove(pic.url)
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
