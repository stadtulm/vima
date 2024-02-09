const { authenticate } = require('@feathersjs/authentication').hooks
const dauria = require('dauria')
const commonHooks = require('feathers-hooks-common')
const Errors = require('@feathersjs/errors')
// const { SYNC } = require('feathers-sync')

module.exports = {
  before: {
    all: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        authenticate('jwt')
      )
    ],
    find: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        () => {
          throw new Errors.NotImplemented()
        }
      )
    ],
    get: [],
    create: [
      (context) => {
        if (!context.data.uri && context.params.file) {
          const file = context.params.file
          const uri = dauria.getBase64DataURI(file.buffer, file.mimetype)
          context.data.uri = uri
        }
        if (context.params.file?.originalname) {
          if (context.params.file?.isEdit) {
            context.data.id = context.params.file.originalname
          } else {
            context.data.id = Date.now().toString() + '_' + context.params.file.originalname.replace(/\s/g, '_')
          }
        } else if (context.data.originalname) {
          if (context.data.isEdit) {
            context.data.id = context.data.originalname
          } else {
            context.data.id = Date.now().toString() + '_' + context.data.originalname.replace(/\s/g, '_')
          }
        }
      },
      (context) => {
        if (!context.data.private) {
          context.params.s3 = { ACL: 'public-read' }
        }
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
    remove: []
  },

  after: {
    all: [
      // context => { context[SYNC] = false }
    ],
    find: [],
    get: [],
    create: [
      (context) => {
        context.result = { id: context.result.id, uuid: context.data.uuid }
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
