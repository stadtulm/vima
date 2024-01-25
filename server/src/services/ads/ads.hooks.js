const commonHooks = require('feathers-hooks-common')
const { authenticate } = require('@feathersjs/authentication').hooks
const allowAnonymous = require('../authmanagement/anonymous')
const Errors = require('@feathersjs/errors')
const { notifyUsers } = require('../mailer/generator')
const util = require('../util')
const JSum = require('jsum')

module.exports = {
  before: {
    all: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        (context) => {
          if (!context.app.customModuleVisibilities.ads) {
            throw new Errors.Forbidden('Module is not active')
          }
        },
        allowAnonymous(),
        authenticate('jwt', 'anonymous'),
        commonHooks.iffElse(
          (context) => context.params.user?.role === 'anonymous',
          (context) => {
            delete context.params.query.$populate
          },
          (context) => {
            context.params.query.$populate = ['author']
          }
        )
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
            await util.generateDefaultAggegationStages(context, ['text', 'title'])
          }
        )
      )
    ],
    get: [],
    create: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Check for registered user
        (context) => {
          if (
            !context.params.user ||
            context.params.user.role === 'anonymous'
          ) {
            throw new Errors.Forbidden('Only registered users can create ads')
          }
        },
        // Accept ad immediately if author is admin otherwise set accepted to false
        (context) => {
          if (context.params.user.role === 'admins') {
            context.data.accepted = {
              isAccepted: true,
              dt: new Date(),
              user: context.params.user._id
            }
          } else {
            context.data.accepted = {
              isAccepted: false,
              dt: new Date(),
              user: context.params.user._id
            }
          }
        }
      ),
      (context) => {
        context.data.translationSum = JSum.digest(
          [
            context.data.title.find(t => t.type === 'default').value,
            context.data.text.find(t => t.type === 'default').value
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
          throw new Error.NotImplemented()
        }
      )
    ],
    patch: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Only let ad author patch properties other than accepted
        // And set accepted to false if that is the case
        async context => {
          // Get ad to patch with populated author
          const ad = await context.app.service('ads').get(
            context.arguments[0],
            {
              query: {
                $populate: ['author']
              }
            }
          )
          // Check for any other properties than accepted
          const tmpData = JSON.parse(JSON.stringify(context.data))
          delete tmpData.accepted
          delete tmpData.tmpAdAuthor
          // Check for ad author
          if (
            ad.author.user._id.toString() !== context.params.user?._id.toString() &&
            Object.keys(tmpData).length > 0
          ) {
            throw new Errors.Forbidden('Only ad author can patch ad properties')
          }
          // Check for changed properties
          delete tmpData.isActive
          if (
            context.params.user?.role !== 'admins' &&
            Object.keys(tmpData).length > 0
          ) {
            context.data.accepted = { isAccepted: false, dt: new Date(), user: context.params.user._id }
          }
        },
        // Only let administrators patch accepted property
        commonHooks.iff(
          context => context.data.isAccepted,
          (context) => {
            if (context.params.user?.role !== 'admins') {
              throw new Errors.Forbidden('Only administrators can accept ads')
            }
          }
        )
      ),
      commonHooks.iff(
        (context) => context.data?.title?.find(t => t.type === 'default') || context.data?.text?.find(t => t.type === 'default'),
        (context) => {
          context.data.translationSum = JSum.digest(
            [
              context.data.title.find(t => t.type === 'default').value,
              context.data.text.find(t => t.type === 'default').value
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
          // Check if user is ad owner
          async context => {
            // Get ad to delete
            const ad = await context.app.service('ads').get(
              context.arguments[0],
              {
                query: {
                  $populate: ['author']
                }
              }
            )
            if (ad.author.user._id.toString() !== context.params.user?._id.toString()) {
              throw new Errors.Forbidden('Only ad owner and administrators can remove ad')
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
          if (Array.isArray(rec.text)) {
            rec.text = rec.text.find(t => t.type === 'default')
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
          (context) => context.params.user?.role !== 'admins',
          // If ad is inactive or not accepted a user can only request it if a relation (status container) already exists
          async (context) => {
            const restrictedAdIds = context.result.data
              .filter(
                obj =>
                  !obj.isActive ||
                  !obj.accepted ||
                  !obj.accepted.isAccepted
              )
              .map(obj => obj._id)
            const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
              {
                type: 'ads',
                user: context.params.user?._id,
                reference: { $in: restrictedAdIds }
              }
            )
            if (userStatusContainers < restrictedAdIds.length) {
              throw new Errors.Forbidden('Request includes restricted ads')
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
          // If ad is inactive or not accepted a user can only request it if a relation (status container) already exists
          commonHooks.iff(
            (context) =>
              !context.result.isActive ||
              !context.result.accepted ||
              !context.result.accepted.isAccepted,
            async (context) => {
              const restrictedAdId = [context.result._id]
              const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
                {
                  type: 'ads',
                  user: context.params.user?._id,
                  reference: restrictedAdId
                }
              )
              if (userStatusContainers < restrictedAdId.length) {
                throw new Errors.Forbidden('Request includes restricted ad')
              }
            }
          )
        )
      )
    ],
    create: [
      async (context) => {
        // Create ad status container for ad author
        await context.app.service('status-containers').create({
          user: context.params.user._id,
          type: 'ads',
          reference: context.result._id,
          relation: 'owner'
        })
      },
      // Notify admins that there is an ad to accept
      async (context) => {
        if (context.params.user.role !== 'admins') {
          const tmpUsers = await context.app.service('status-containers').patch(
            null,
            {
              $push: {
                unread: {
                  id: context.result._id
                }
              }
            },
            {
              query: {
                type: 'ads',
                relation: 'admin'
              }
            }
          )
          await notifyUsers(context.app, 'newAdsToAccept', 'create', context.result, tmpUsers.map(obj => obj.user))
        }
      }
    ],
    update: [],
    patch: [
      // Check if ad status has been changed
      commonHooks.iff(
        (context) => { return context.data.accepted },
        // Check if ad has been accepted by admin
        commonHooks.iff(
          (context) => {
            return context.data.tmpAdAuthor &&
              context.data.tmpAdAuthor.toString() !== context.params.user._id.toString() &&
              context.data.accepted.isAccepted
          },
          // Notify ad author that ad has been accepted
          async (context) => {
            await context.app.service('status-containers').patch(
              null,
              {
                customField: 'accepted'
              },
              {
                query: {
                  reference: context.arguments[0],
                  type: 'ads',
                  relation: 'owner'
                }
              }
            )
            await notifyUsers(context.app, 'newAcceptedAds', 'accepted', context.result, [context.data.tmpAdAuthor])
            // Update admin status containers that ad has been accepted
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
                  type: 'ads',
                  relation: 'admin'
                }
              }
            )
          }
        ),
        // If ad is not accepted anymore remove ad from owner's "new accepted" notifications
        commonHooks.iff(
          (context) => { return !context.data.accepted?.isAccepted },
          async (context) => {
            await context.app.service('status-containers').patch(
              null,
              {
                customField: null
              },
              {
                query: {
                  reference: context.arguments[0],
                  type: 'ads',
                  relation: 'owner'
                }
              }
            )
          }
        ),
        // Notify admins that an ad has been patched and should be accepted
        commonHooks.iff(
          (context) => { return context.params.user.role !== 'admins' },
          async (context) => {
            const tmpUsers = await context.app.service('status-containers').patch(
              null,
              {
                $push: {
                  unread: { type: 'ad', id: context.result._id }
                }
              },
              {
                query: {
                  type: 'ads',
                  relation: 'admin',
                  'unread.id': {
                    $ne: context.result._id
                  }
                }
              }
            )
            await notifyUsers(context.app, 'newAdsToAccept', 'patch', context.result, tmpUsers.map(obj => obj.user))
          }
        )
      )
    ],
    remove: [
      async (context) => {
        // Remove all ad messages for this ad
        await context.app.service('ad-messages').remove(
          null,
          {
            query: {
              ad: context.arguments[0]
            }
          }
        )
        // Remove all status containers for this ad
        await context.app.service('status-containers').remove(
          null,
          {
            query: {
              reference: context.result._id
            }
          }
        )
        // Remove from unread of all status containers
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
        // Remove images / uploads of this ad
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
