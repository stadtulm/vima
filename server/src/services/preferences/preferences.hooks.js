const commonHooks = require('feathers-hooks-common')
const { authenticate } = require('@feathersjs/authentication').hooks
const Errors = require('@feathersjs/errors')

module.exports = {
  before: {
    all: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        authenticate('jwt', 'anonymous')
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
        // Check if preferences user is current user
        commonHooks.iff(
          (context) => context.data.user.toString() !== context.params.user?._id.toString(),
          () => {
            throw new Errors.Forbidden('Not allowed to create preferences of other users')
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
        // Check if preferences user is current user
        commonHooks.iff(
          (context) => context.data.user.toString() !== context.params.user?._id.toString(),
          () => {
            throw new Errors.Forbidden('Not allowed to patch preferences of other users')
          }
        )
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
        // Skip if user is admin
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          // Check for other preferences than users's
          (context) => {
            const userPreferences = context.result
              .filter(obj => obj.user.toString() !== context.params.user?._id.toString())
            if (userPreferences.length > 0) {
              throw new Errors.Forbidden('Not allowed to find preferences of other users')
            }
          }
        )
      )
    ],
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
