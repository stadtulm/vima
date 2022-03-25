const commonHooks = require('feathers-hooks-common')
const { authenticate } = require('@feathersjs/authentication').hooks
const Errors = require('@feathersjs/errors')
const allowAnonymous = require('../authmanagement/anonymous')

module.exports = {
  before: {
    all: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        (context) => {
          if (!context.app.customModuleVisibilities.organisations) {
            throw new Errors.Forbidden('Module is not active')
          }
        },
        allowAnonymous(),
        authenticate('jwt', 'anonymous')
      )
    ],
    find: [],
    get: [],
    create: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          () => {
            throw new Errors.Forbidden('Only administrators can create organisations')
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
        // Skip if user is admin
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          // Check if user is organisation member
          async (context) => {
            const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
              {
                type: 'organisations',
                user: context.params.user?._id,
                reference: context.arguments[0]
              }
            )
            if (userStatusContainers === 0) {
              throw new Errors.Forbidden('Only administrators and organisation members can patch organisations')
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
          (context) => context.params.user?.role !== 'admins',
          // Check if user is organisation member
          async (context) => {
            const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
              {
                type: 'organisations',
                user: context.params.user?._id,
                reference: context.arguments[0]
              }
            )
            if (userStatusContainers === 0) {
              throw new Errors.Forbidden('Only administrators and organisation members can remove organisations')
            }
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
          // Check if user is member of inactive organisation
          async (context) => {
            const inactiveOrganisationIds = context.result.data.filter(obj => !obj.isActive)
            if (inactiveOrganisationIds.length > 0) {
              const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
                {
                  type: 'organisations',
                  user: context.params.user?._id,
                  reference: { $in: inactiveOrganisationIds }
                }
              )
              if (userStatusContainers < inactiveOrganisationIds.length) {
                throw new Errors.Forbidden('Only administrators and organisation members can get inactive organisations')
              }
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
          // Check if user is member of inactive organisation
          async (context) => {
            if (!context.result.isActive) {
              const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
                {
                  type: 'organisations',
                  user: context.params.user?._id,
                  reference: context.result._id
                }
              )
              if (userStatusContainers === 0) {
                throw new Errors.Forbidden('Only administrators and organisation members can get an inactive organisation')
              }
            }
          }
        )
      )
    ],
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
