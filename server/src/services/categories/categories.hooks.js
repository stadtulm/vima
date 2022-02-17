const { authenticate } = require('@feathersjs/authentication').hooks
const allowAnonymous = require('../authmanagement/anonymous')
const commonHooks = require('feathers-hooks-common')
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
        )
      )
    ]
  },

  after: {
    all: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        commonHooks.iff(
          (context) => !context.params.$keepTranslations,
          commonHooks.alterItems((rec, context) => {
            return reduceTranslations(rec, context.params.connection.language, ['text', 'description'])
          })
        )
      )
    ],
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

function reduceTranslations (data, language, properties) {
  for (const property of properties) {
    if (data[property] && Array.isArray(data[property])) {
      const dataProperty = data[property].find(translation => translation.lang === language)
      if (dataProperty) {
        data[property] = [dataProperty]
      } else {
        data[property] = [data[property].find(translation => translation.type === 'default')]
      }
    }
  }
  return data
}
