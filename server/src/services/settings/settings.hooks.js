const commonHooks = require('feathers-hooks-common')
const { authenticate } = require('@feathersjs/authentication').hooks
const Errors = require('@feathersjs/errors')
const allowAnonymous = require('../authmanagement/anonymous')
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
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          () => {
            throw new Errors.Forbidden('Only administrators can create settings')
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
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          () => {
            throw new Errors.Forbidden('Only administrators can patch settings')
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
    find: [],
    get: [],
    create: [
      (context) => {
        util.createModuleVisibilities(context.app, context.result)
      }
    ],
    update: [],
    patch: [
      (context) => {
        util.createModuleVisibilities(context.app, context.result)
      }
    ],
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
