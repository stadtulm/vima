const commonHooks = require('feathers-hooks-common')
const { authenticate } = require('@feathersjs/authentication').hooks
const { notifyUsers } = require('../mailer/generator')
const allowAnonymous = require('../authmanagement/anonymous')
const Errors = require('@feathersjs/errors')
const util = require('../util')
const JSum = require('jsum')

module.exports = {
  before: {
    all: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        (context) => {
          if (!context.app.customModuleVisibilities.groups) {
            throw new Errors.Forbidden('Module is not active')
          }
        },
        allowAnonymous(),
        authenticate('jwt', 'anonymous'),
        (context) => {
          context.params.query.$populate = ['owner']
        }
      )
    ],
    find: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        (context) => {
          context.params.query = util.convert(context.params.query, [])
        },
        commonHooks.iff(
          (context) => !context.params.keepTranslations,
          async (context) => {
            await util.generateDefaultAggegationStages(context, ['description', 'title'])
          }
        )
      )
    ],
    get: [],
    create: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Check for registered user
        commonHooks.iff(
          (context) => !context.params.user || context.params.user.role === 'anonymous',
          () => {
            throw new Errors.Forbidden('Only registered users can create groups')
          }
        ),
        // Check for admin if group visibility is hidden
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins' && context.data.visibility === 'hidden',
          () => {
            throw new Errors.Forbidden('Only administrators can create hidden groups')
          }
        ),
        // Accept group immediately if author is admin
        (context) => {
          if (context.params.user.role === 'admins') {
            context.data.accepted = { isAccepted: true, dt: new Date(), user: context.params.user._id }
          } else {
            context.data.accepted = { isAccepted: false, dt: new Date(), user: context.params.user._id }
          }
        }
      ),
      (context) => {
        context.data.translationSum = JSum.digest(
          [
            context.data.title.find(t => t.type === 'default').value,
            context.data.description.find(t => t.type === 'default').value
          ],
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
        // Check if user is group owner
        async (context) => {
          // Get group to patch with populated owner and store for later
          const group = await context.app.service('groups').get(
            context.arguments[0],
            {
              query: {
                $populate: ['owner']
              }
            }
          )
          context.params.tmpGroupOwnerId = group.owner.user._id
          // Check for other properties than accepted
          const tmpData = JSON.parse(JSON.stringify(context.data))
          delete tmpData.accepted
          if (
            group.owner.user._id.toString() !== context.params.user?._id.toString() &&
            Object.keys(tmpData).length > 0
          ) {
            throw new Errors.Forbidden('Only group owner can patch group properties')
          }
        },
        // Check if patch contains accepted
        commonHooks.iff(
          (context) => context.data.isAccepted,
          // Only admin can patch accepted of discussion
          (context) => {
            if (context.params.user?.role !== 'admins') {
              throw new Errors.Forbidden('Only administrators can accept groups')
            }
          }
        ),
        // Set accepted field to false again if
        // patch is executed by non-admin or
        // isActive is not changed and
        // other fields than active are patched
        (context) => {
          if (
            context.params.user.role !== 'admins' &&
          !(
            Object.keys(context.data).includes('isActive') &&
            Object.keys(context.data).length === 1
          )
          ) {
            context.data.accepted = { isAccepted: false, dt: new Date(), user: context.params.user._id }
          }
        }
      ),
      commonHooks.iff(
        (context) => context.data?.title?.find(t => t.type === 'default') || context.data?.description?.find(t => t.type === 'default'),
        (context) => {
          context.data.translationSum = JSum.digest(
            [
              context.data.title.find(t => t.type === 'default').value,
              context.data.description.find(t => t.type === 'default').value
            ],
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
          // Check if user is group owner
          async (context) => {
            // Get group to remove
            const group = await context.app.service('groups').get(
              context.arguments[0],
              {
                query: {
                  $populate: ['owner']
                }
              }
            )
            if (group.owner.user._id.toString() !== context.params.user?._id.toString()) {
              throw new Errors.Forbidden('Only group owner and administrators can remove group')
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
          if (Array.isArray(rec.title)) {
            rec.title = rec.title.find(t => t.type === 'default')
          }
          if (Array.isArray(rec.description)) {
            rec.description = rec.description.find(t => t.type === 'default')
          }
          return rec
        })
      )
    ],
    find: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Skip if admin
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          // Check for group membership of hidden groups
          async (context) => {
            const resultToFilter = context.result.data || context.result
            const hiddenGroupIds = resultToFilter
              .filter(obj => obj.visibility === 'hidden')
              .map(obj => obj._id)
            const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
              {
                reference: { $in: hiddenGroupIds },
                user: context.params.user?._id,
                type: 'groups',
                relation: { $in: ['owner', 'moderator', 'member', 'invitation'] }
              }
            )
            if (userStatusContainers < hiddenGroupIds.length) {
              throw new Errors.Forbidden('Not allowed to request hidden groups without relation')
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
          // Check if user is member of hidden or restricted group
          async (context) => {
            if (
              context.result.visibility === 'hidden' ||
              !context.result.isActive ||
              !context.result.accepted ||
              !context.result.accepted.isAccepted
            ) {
              const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
                {
                  type: 'groups',
                  reference: context.result._id,
                  user: context.params.user?._id,
                  relation: { $in: ['owner', 'moderator', 'member', 'invitation'] }
                }
              )
              if (userStatusContainers === 0) {
                throw new Errors.Forbidden('Not allowed to get restricted group without relation')
              }
            }
          }
        )
      )
    ],
    create: [
      // Create status containers for group
      async (context) => {
        // Create status container
        await context.app.service('status-containers').create({
          user: context.params.user._id,
          type: 'groups',
          reference: context.result._id,
          relation: 'owner'
        })
      },
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Inform admins that new not accepted group has been created
        async (context) => {
          if (context.params.user.role !== 'admins') {
            const tmpUsers = await context.app.service('status-containers').patch(
              null,
              {
                $push: {
                  unread: { type: 'groups', id: context.result._id }
                }
              },
              {
                query: {
                  type: 'groups',
                  relation: 'admin'
                }
              }
            )
            await notifyUsers(context.app, 'newGroupsToAccept', 'create', context.result, tmpUsers.map(obj => obj.user))
          }
        }
      )
    ],
    update: [],
    patch: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        async (context) => {
          // Check if group status has been changed
          if (context.data.accepted) {
            // If group has been accepted by admin
            if (
              context.params.tmpGroupOwnerId.toString() !== context.params.user._id.toString() &&
              context.data.accepted.isAccepted
            ) {
              // Notify author that group has been accepted
              await context.app.service('status-containers').patch(
                null,
                {
                  customField: 'accepted'
                },
                {
                  query: {
                    reference: context.arguments[0],
                    type: 'groups',
                    relation: 'owner'
                  }
                }
              )
              // Update admins that group has been accepted
              await context.app.service('status-containers').patch(
                null,
                {
                  $pull: {
                    unread: { id: context.result._id }
                  }
                },
                {
                  query: {
                    type: 'groups',
                    relation: 'admin'
                  }
                }
              )
              await notifyUsers(context.app, 'newAcceptedGroups', 'accepted', context.result, [context.params.tmpGroupOwnerId])
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
                  type: 'groups',
                  relation: 'owner'
                }
              }
            )
            if (context.params.user.role !== 'admins') {
              const tmpData = JSON.parse(JSON.stringify(context.data))
              delete tmpData.accepted
              delete tmpData.isActive
              if (Object.keys(tmpData).length > 0) {
              // Notify admins that group has been patched
                const tmpUsers = await context.app.service('status-containers').patch(
                  null,
                  {
                    $push: {
                      unread: { type: 'groups', id: context.result._id }
                    }
                  },
                  {
                    query: {
                      type: 'groups',
                      relation: 'admin',
                      'unread.id': {
                        $ne: context.result._id
                      }
                    }
                  }
                )
                await notifyUsers(context.app, 'newGroupsToAccept', 'patch', context.result, tmpUsers.map(obj => obj.user))
              }
            }
          }
        }
      )
    ],
    remove: [
      async (context) => {
        // Remove all status containers for this group
        await context.app.service('status-containers').remove(
          null,
          {
            query: {
              reference: context.result._id
            }
          }
        )
        // Remove group from unread of all admins
        await context.app.service('status-containers').patch(
          null,
          {
            $pull: {
              unread: { id: context.result._id }
            }
          }
        )
        // Remove all discussions for this group
        const groupDiscussionsId = await context.app.service('discussions').find(
          {
            paginate: false,
            query: {
              group: context.result._id,
              $select: ['_id']
            }
          }
        )
        await context.app.service('discussions').remove(
          null,
          {
            query: {
              group: context.result._id
            },
            many: groupDiscussionsId.map(obj => obj._id)
          }
        )
        // Remove images
        if (context.result.pics) {
          for (const pic of context.result.pics) {
            await context.app.service('uploads').remove(pic.url)
          }
        }
        // Remove files
        if (context.result.files) {
          for (const file of context.result.files) {
            await context.app.service('uploads').remove(file.url)
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
