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
    find: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
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
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins' && context.params.user?.role !== 'volunteers',
          () => {
            throw new Errors.Forbidden('Only administrators and volunteers can create info slides')
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
          (context) => context.params.user?.role !== 'admins' && context.params.user?.role !== 'volunteers',
          () => {
            throw new Errors.Forbidden('Only administrators and volunteers can patch info slides')
          }
        )
      )
    ],
    remove: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins' && context.params.user?.role !== 'volunteers',
          () => {
            throw new Errors.Forbidden('Only administrators and volunteers can remove slides')
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
          (context) => context.params.user?.role !== 'admins' && context.params.user?.role !== 'volunteers',
          // Check for inactive info slides
          (context) => {
            const inactiveInfos = context.result.data.filter(obj => !obj.isActive)
            if (inactiveInfos.length > 0) {
              throw new Errors.Forbidden('Only administrators and volunteers can request inactive info slides')
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
          // Check for inactive info slides
          (context) => {
            if (!context.result.isActive) {
              throw new Errors.Forbidden('Only logged in users can request inactive info slides')
            }
          }
        ),
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
