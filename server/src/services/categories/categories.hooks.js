const { authenticate } = require('@feathersjs/authentication').hooks
const allowAnonymous = require('../authmanagement/anonymous')
const commonHooks = require('feathers-hooks-common')
const Errors = require('@feathersjs/errors')
const util = require('../util')

module.exports = {
  before: {
    all: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        allowAnonymous(),
        authenticate('jwt', 'anonymous')
      )
    ],
    find: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        commonHooks.iff(
          (context) => !context.params.keepTranslations,
          async (context) => {
            await util.generateLanguageAggegationStages(context, ['text', 'description'])
          }
        )
      )
    ],
    get: [],
    create: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Check for admin
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          () => {
            throw new Errors.Forbidden('Only administrators can create categories')
          }
        )
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
        // Check for admin
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          () => {
            throw new Errors.Forbidden('Only administrators can patch categories')
          }
        )
      )
    ],
    remove: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Check for admin
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          () => {
            throw new Errors.Forbidden('Only administrators can remove categories')
          }
        ),
        async (context) => {
          // Remove image
          if (context.result.pic) {
            await context.app.service('uploads').remove(context.result.pic.url)
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
    remove: [
      async (context) => {
        // Remove from all ads, groups, discussions, news, events
        for (const type of ['ads', 'discussions', 'groups', 'news', 'events']) {
          await context.app.service(type).patch(
            null,
            {
              $pull: {
                categories: context.result._id
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
