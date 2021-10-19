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
        authenticate('jwt', 'anonymous')
      )
    ],
    find: [],
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
            throw new Errors.Forbidden('Only registered users can create tags')
          }
        },
        // Accept immediately if author is admin
        (context) => {
          if (context.params.user.role === 'admins') {
            context.data.isAccepted = true
          } else {
            context.data.isAccepted = false
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
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          () => {
            throw new Errors.Forbidden('Only administrators can patch tags')
          }
        )
      )
    ],
    remove: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          () => {
            throw new Errors.Forbidden('Only administrators can remove tags')
          }
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
          // Check for correct query
          (context) => {
            const restrictedTags = context.result
              .filter(obj =>
                !obj.isActive ||
                !obj.isAccepted
              )
            if (restrictedTags.length > 0) {
              throw new Errors.Forbidden('Only administrators can request restricted tags')
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
          // Check for correct query
          async (context) => {
            if (
              !context.result.isActive ||
              !context.result.isAccepted
            ) {
              throw new Errors.Forbidden('Only administrators can get restricted tag')
            }
          }
        )
      )
    ],
    create: [
      // Inform admins that new not accepted tag has been created
      async (context) => {
        if (context.params.user.role !== 'admins') {
          const tmpUsers = await context.app.service('status-containers').patch(
            null,
            {
              $push: {
                unread: { type: 'tags', id: context.result._id }
              }
            },
            {
              query: {
                type: 'tags',
                relation: 'admin'
              }
            }
          )
          await notifyUsers(context.app, 'newTagsToAccept', 'create', context.result, tmpUsers.map(obj => obj.user))
        }
      }
    ],
    update: [],
    patch: [
      async (context) => {
        // If tag has been accepted by admin
        if (context.data.isAccepted) {
          // Update admins that tag has been accepted
          await context.app.service('status-containers').patch(
            null,
            {
              $pull: {
                unread: { id: context.result._id }
              }
            },
            {
              query: {
                type: 'tags',
                relation: 'admin'
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
        // Remove from all ads, groups, discussions, news, events
        for (const type of ['ads', 'discussions', 'groups', 'news', 'events']) {
          await context.app.service(type).patch(
            null,
            {
              $pull: {
                tags: context.result._id
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
