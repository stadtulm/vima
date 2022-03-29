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
        (context) => {
          if (!context.app.customModuleVisibilities.blog) {
            throw new Errors.Forbidden('Module is not active')
          }
        },
        allowAnonymous(),
        authenticate('jwt', 'anonymous')
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
            await util.generateLanguageAggegationStages(context, ['text', 'title', 'subTitle'])
          }
        )
      )
    ],
    get: [],
    create: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          () => {
            throw new Errors.Forbidden('Only administrators can create blog entries')
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
            throw new Errors.Forbidden('Only administrator can patch blog entries')
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
            throw new Errors.Forbidden('Only administrator can remove blog entries')
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
          // Check for internal blog entries
          (context) => {
            const internalBlogEntry = context.result.data.filter(obj => obj.isInteral)
            if (
              internalBlogEntry.length > 0 &&
              (
                !context.params.user ||
                context.params.user.role === 'anonymous'
              )
            ) {
              throw new Errors.Forbidden('Only logged in users can request internal blog entries')
            }
          },
          // Check for inactive blog entries
          (context) => {
            const inactiveBlogEntry = context.result.data.filter(obj => !obj.isActive)
            if (inactiveBlogEntry.length > 0) {
              throw new Errors.Forbidden('Only administrators can request inactive blog entries')
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
          // Check for internal blog entry
          (context) => {
            if (
              context.result.isInternal &&
              (
                !context.params.user ||
                context.params.user.role === 'anonymous'
              )
            ) {
              throw new Errors.Forbidden('Only logged in users can request internal blog entries')
            }
          },
          // Check for inactive blog entry
          (context) => {
            if (!context.result.isActive) {
              throw new Errors.Forbidden('Only logged in users can request inactive blog entries')
            }
          },
          commonHooks.iff(
            (context) => !context.params.keepTranslations,
            commonHooks.alterItems((rec, context) => {
              if (Array.isArray(rec.title)) {
                const langText = rec.title.find(t => t.lang === context.params.connection.language)
                if (langText) {
                  rec.title = langText
                } else {
                  rec.title = rec.title.find(t => t.type === 'default')
                }
              }
              if (Array.isArray(rec.subTitle)) {
                const langText = rec.subTitle.find(t => t.lang === context.params.connection.language)
                if (langText) {
                  rec.subTitle = langText
                } else {
                  rec.subTitle = rec.subTitle.find(t => t.type === 'default')
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
