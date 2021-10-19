const { v1: uuidv1 } = require('uuid')
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
          (context) => {
            return context.params.user?.role !== 'partners' &&
            context.params.user?.role !== 'admins'
          },
          () => {
            throw new Errors.Forbidden('Only partners and administrators can handle api keys')
          }
        )
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
        // Check for organisation membership
        async (context) => {
          const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
            {
              type: 'organisations',
              user: context.params.user?._id,
              reference: context.data.clientId
            }
          )
          if (userStatusContainers === 0) {
            throw new Errors.Forbidden('Not allowed to create api key for organisation if user is not a member')
          }
        }
      ),
      async (context) => {
        // Remove existing api key
        await context.app.service('apikeys').remove(
          null,
          {
            query: {
              clientId: context.data.clientId
            }
          }
        )
        // Create new api key and save for after hooks
        context.data.tmpApiKey = uuidv1()
        // Hash api key for db
        context.data.clientSecret = await context.app.service('authentication').strategies.local.hashPassword(context.data.tmpApiKey)
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
        () => {
          throw new Errors.NotImplemented()
        }
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
          // check for inactive or not accepted ads
          async (context) => {
            const restrictedApikeyClientIds = context.result.data
              .map(obj => obj.clientId)
            const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
              {
                type: 'organisations',
                user: context.params.user?._id,
                reference: { $in: restrictedApikeyClientIds },
                relation: { $in: ['owner', 'member'] }
              }
            )
            if (userStatusContainers < restrictedApikeyClientIds.length) {
              throw new Errors.Forbidden('Request includes restricted apikeys')
            }
          }
        )
      )
    ],
    get: [],
    create: [
      (context) => {
        // Return unhashed apikey once
        context.result.clientSecret = context.data.tmpApiKey
      }
    ],
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
