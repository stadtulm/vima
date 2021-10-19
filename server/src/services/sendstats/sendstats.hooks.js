
const { authenticate } = require('@feathersjs/authentication').hooks
const commonHooks = require('feathers-hooks-common')
const { sendNewsletter, getRecipients } = require('./sendstats.class.js')
const Errors = require('@feathersjs/errors')

module.exports = {
  before: {
    all: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        authenticate('jwt'),
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          () => {
            throw new Errors.Forbidden('Only administrators are allowed to handle send stats')
          }
        )
      )
    ],
    find: [],
    get: [],
    create: [
      async (context) => {
        const allRecipients = await getRecipients(context.app)
        const { sent, error } = await sendNewsletter(context.app, allRecipients, context.data.reference)
        context.data.sent = sent
        context.data.error = error
      }
    ],
    update: [],
    patch: [
      async (context) => {
        const sendStats = await context.app.service('sendstats').get(context.arguments[0])
        const allRecipients = await getRecipients(context.app)
        const { sent, error } = await sendNewsletter(context.app, allRecipients, sendStats.reference, sendStats.sent)
        context.data.sent = sendStats.sent.concat(sent)
        context.data.error = sendStats.error
          .filter(obj => error.map(i => i.id).includes(obj.id))
          .filter(obj => sent.map(i => i.id).includes(obj.id))
          .concat(error)
      }
    ],
    remove: []
  },

  after: {
    all: [],
    find: [],
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
