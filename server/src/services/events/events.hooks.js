const commonHooks = require('feathers-hooks-common')
const allowApiKey = require('../authmanagement/apikey')
const { authenticate } = require('@feathersjs/authentication').hooks
const Errors = require('@feathersjs/errors')
const allowAnonymous = require('../authmanagement/anonymous')
const util = require('../util')

module.exports = {
  before: {
    all: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        (context) => {
          if (!context.app.customModuleVisibilities.events) {
            throw new Errors.Forbidden('Module is not active')
          }
        },
        allowApiKey(),
        allowAnonymous(),
        authenticate('jwt', 'api', 'anonymous'),
        // Populate
        (context) => {
          context.params.query.$populate = ['organisation']
        }
      )
    ],
    find: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        (context) => {
          context.params.query = util.convert(context.params.query, ['organisation'])
        },
        commonHooks.iff(
          (context) => !context.params.keepTranslations,
          async (context) => {
            await util.generateLanguageAggegationStages(context, ['text', 'title'])
          }
        )
      )
    ],
    get: [],
    create: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Check if user is partner or admin
        commonHooks.iff(
          (context) => context.params.user?.role !== 'partners' && context.params.user?.role !== 'admins',
          () => {
            throw new Errors.Forbidden('Only partners and administrators can create events')
          }
        ),
        // Check if user is organisation member
        async (context) => {
          const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
            {
              type: 'organisations',
              user: context.params.user?._id,
              reference: context.data.organisation
            }
          )
          if (userStatusContainers === 0) {
            throw new Errors.Forbidden('Only organisation members can create events')
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
        // Check if user is organisation member
        async (context) => {
          const event = await context.app.service('events').get(
            context.arguments[0],
            {
              query: {
                $select: { organisation: 1 }
              }
            }
          )
          const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
            {
              type: 'organisations',
              user: context.params.user?._id,
              reference: event.organisation
            }
          )
          if (userStatusContainers === 0) {
            throw new Errors.Forbidden('Only organisation members can patch events')
          }
        }
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
            const event = await context.app.service('events').get(
              context.arguments[0],
              {
                query: {
                  $select: { organisation: 1 }
                }
              }
            )
            const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
              {
                type: 'organisations',
                user: context.params.user?._id,
                reference: event.organisation
              }
            )
            if (userStatusContainers === 0) {
              throw new Errors.Forbidden('Only administrators and organisation members can patch events')
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
          // Check organisation membership of inactive events
          async (context) => {
            const inactiveEventOrganisationIds = [...new Set(
              context.result.data
                .filter(obj => !obj.isActive)
                .map(obj => obj.organisation._id)
            )]
            const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
              {
                type: 'organisations',
                reference: { $in: inactiveEventOrganisationIds },
                user: context.params.user?._id
              }
            )
            if (userStatusContainers < inactiveEventOrganisationIds.length) {
              throw new Errors.Forbidden('Only administrators and organisation members can request inactive events')
            }
          }
          // TBD: Are events of inactive organisations allowed?
        )
      )
    ],
    get: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Skip if user is admin
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          // Check if user is organisation member if event is inactive
          async (context) => {
            if (!context.result.isActive) {
              const userStatusContainers = await context.app.service('status-containers').Model.countDocuments(
                {
                  type: 'organisations',
                  user: context.params.user?._id,
                  reference: context.result.organisation
                }
              )
              if (userStatusContainers === 0) {
                throw new Errors.Forbidden('Only administrators and organisation members can request an inactive event')
              }
            }
          }
        ),
        commonHooks.alterItems((rec, context) => {
          if (Array.isArray(rec.title)) {
            const langText = rec.title.find(t => t.lang === context.params.connection.language)
            if (langText) {
              rec.title = langText
            } else {
              rec.title = rec.title.find(t => t.type === 'default')
            }
          }
          if (Array.isArray(rec.text)) {
            const langText = rec.text.find(t => t.lang === context.params.connection.language)
            if (langText) {
              rec.text = langText
            } else {
              rec.text = rec.text.find(t => t.type === 'default')
            }
          }
          return rec
        })
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
