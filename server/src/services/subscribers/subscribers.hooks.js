const locales = require('../../locales/de.json')
const commonHooks = require('feathers-hooks-common')
const { authenticate } = require('@feathersjs/authentication').hooks
const allowAnonymous = require('../authmanagement/anonymous')
const Errors = require('@feathersjs/errors')
const verifyHooks = require('feathers-authentication-management').hooks
const accountService = require('../authmanagement/notifier')

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
        () => {
          throw new Errors.NotImplemented()
        }
      )
    ],
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
        verifyHooks.addVerification(),
        async (context) => {
          // Try to find user by email
          const emailResult = await context.app.service('users').find(
            {
              query: {
                email: context.data.email,
                $populate: [
                  {
                    path: 'preferences'
                  }
                ]
              }
            }
          )
          // A user with this email exists
          if (emailResult.total > 0) {
            if (emailResult.data[0].preferences) {
              // Patch preferences and set newsletter to true
              await context.app.service('preferences').patch(
                emailResult.data[0].preferences._id,
                {
                  receiveNewsletter: true
                }
              )
            } else {
              // Create new preferences with newsletter set to true
              await context.app.service('preferences').create(
                {
                  user: emailResult.data[0]._id,
                  receiveNewsletter: true
                }
              )
            }
            // Throw error indicating that the user exists
            throw new Errors.Conflict(locales.profileAlreadyExistedSettingsAdjusted)
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
        commonHooks.preventChanges(true,
          'isVerified.' +
          'verifyToken.' +
          'verifyShortToken.' +
          'verifyExpires.' +
          'verifyChanges.' +
          'resetToken.' +
          'resetShortToken.' +
          'resetExpires'
        ),
        async (context) => {
          // Confirm subscription
          if (context.data.tmpAction === 'confirmSignup' && context.data.tmpValue) {
            const ObjectId = require('mongoose').Types.ObjectId
            // Throw if subscriber id is invalid
            if (!ObjectId.isValid(context.arguments[0])) {
              throw new Errors.NotFound(locales.confirmationIdInvalid)
            }
            // Throw subscriber id is not existing
            let subscriber
            try {
              subscriber = await context.app.service('subscribers').get(context.arguments[0])
            } catch (e) {
              throw new Errors.NotFound(locales.confirmationIdUnknown)
            }
            if (subscriber.isVerified) {
              // Throw error if subscriber already is verified
              throw new Errors.NotFound(locales.emailAlreadyConfirmed)
            } else if (subscriber && subscriber.verifyToken && subscriber.verifyToken === context.data.tmpValue) {
              // Verify
              context.data.isVerified = true
              context.data.verifyToken = null
            } else {
              // Throw id verify token is invalid
              throw new Errors.NotFound(locales.confirmationCodeInvalid)
            }
          } else {
            // Throw if request is invalid
            throw new Errors.NotFound(locales.confirmationLinkInvalid)
          }
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
    find: [],
    get: [],
    create: [
      async (context) => {
        await accountService(context.app).notifier('verifySubscriberSignup', context.result)
      },
      verifyHooks.removeVerification()
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
