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
          if (!context.app.customModuleVisibilities.news) {
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
            throw new Errors.Forbidden('Only administrators can create news')
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
            throw new Errors.Forbidden('Only administrator can patch news')
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
            throw new Errors.Forbidden('Only administrator can remove news')
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
          // Check for internal news
          (context) => {
            const internalNews = context.result.data.filter(obj => obj.isInteral)
            if (
              internalNews.length > 0 &&
              (
                !context.params.user ||
                context.params.user.role === 'anonymous'
              )
            ) {
              throw new Errors.Forbidden('Only logged in users can request internal news')
            }
          },
          // Check for inactive news
          (context) => {
            const inactiveNews = context.result.data.filter(obj => !obj.isActive)
            if (inactiveNews.length > 0) {
              throw new Errors.Forbidden('Only administrators can request inactive news')
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
          // Check for internal news
          (context) => {
            if (
              context.result.isInternal &&
              (
                !context.params.user ||
                context.params.user.role === 'anonymous'
              )
            ) {
              throw new Errors.Forbidden('Only logged in users can request internal news')
            }
          },
          // Check for inactive news
          (context) => {
            if (!context.result.isActive) {
              throw new Errors.Forbidden('Only logged in users can request inactive news')
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
