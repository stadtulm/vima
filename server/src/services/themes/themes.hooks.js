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
            await util.generateLanguageAggegationStages(context, ['title', 'description'])
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
            throw new Errors.Forbidden('Only administrators can create themes')
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
            throw new Errors.Forbidden('Only administrators can patch themes')
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
            throw new Errors.Forbidden('Only administrators can remove themes')
          }
        )
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
        // Remove from all groups
        await context.app.service('groups').patch(
          null,
          {
            theme: null
          },
          {
            query: {
              theme: context.result._id
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
