const locales = require('../../locales/de.json')
const { authenticate } = require('@feathersjs/authentication').hooks
const verifyHooks = require('feathers-authentication-management').hooks
const accountService = require('../authmanagement/notifier')
const commonHooks = require('feathers-hooks-common')
const { hashPassword } = require('@feathersjs/authentication-local').hooks
const Errors = require('@feathersjs/errors')
const allowAnonymous = require('../authmanagement/anonymous')
const bcrypt = require('bcryptjs')

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
        // Check for registered user
        commonHooks.iff(
          (context) => !context.params.user || context.params.user.role === 'anonymous',
          () => {
            throw new Errors.Forbidden('Only registered user can find users')
          }
        )
      ),
      context => {
        if (context.params.query) {
          context.params.collation = { locale: 'en', strength: 2 }
        }
      }
    ],
    get: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        commonHooks.iff(
          (context) => !context.params.user || context.params.user.role === 'anonymous',
          () => {
            throw new Errors.Forbidden('Only registered user can get users')
          }
        ),
        // Custom errors
        async (context) => {
          const user = await context.app.service('users').get(context.arguments[0])
          if (!user.isVerified) {
            throw new Errors.NotFound(locales.accessNotYetVerifiedByLink)
          }
          if (!user.isActive) {
            throw new Errors.NotFound(locales.accessArchived)
          }
        }
      )
    ],
    create: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        verifyHooks.addVerification(),
        hashPassword('password'),
        // Skip if user is admin
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          // Check for role
          commonHooks.iff(
            (context) => context.data.role && context.data.role !== 'users',
            () => {
              throw new Errors.Forbidden('Only administrators can create users with special roles')
            }
          )
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
        hashPassword('password'),
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
        // Check for registered user
        commonHooks.iff(
          (context) => !context.params.user || context.params.user.role === 'anonymous',
          () => {
            throw new Errors.Forbidden('Only registered user can patch users')
          }
        ),
        // Skip if user is admin
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          // Handle pw change and check for confirmation
          commonHooks.iff(
            (context) => context.data.password,
            async (context) => {
              const user = await context.app.service('users').get(
                context.arguments[0],
                {
                  query: {
                    $select: { password: 1 }
                  }
                }
              )
              if (
                !context.data.tmpOldPassword ||
                !bcrypt.compareSync(context.data.tmpOldPassword, user.password)
              ) {
                throw new Errors.Forbidden('Wrong confirmation password')
              }
            }
          ),
          // Check if user tries to patch other user
          commonHooks.iff(
            (context) => context.params.user?._id.toString() !== context.arguments[0].toString(),
            () => {
              throw new Errors.Forbidden('Only administrators can patch other users')
            }
          ),
          // Check if user tries to patch own role
          commonHooks.iff(
            (context) =>
              context.data.role &&
              context.data.role !== 'deleted' &&
              context.data.role !== context.params.user?.role
            ,
            () => {
              throw new Errors.Forbidden('Only administrators can change a user\'s role')
            }
          ),
          // Check if user tries to activate own account
          commonHooks.iff(
            (context) => context.data.isActive,
            () => {
              throw new Errors.Forbidden('Only administrators can activate users')
            }
          )
        )
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
    all: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        commonHooks.discard('password', 'resetToken', 'resetExpires')
      )
    ],
    find: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        // Skip if user is admin
        commonHooks.iff(
          (context) => context.params.user?.role !== 'admins',
          // Check for inactive users
          (context) => {
            const restrictedUsers = context.result.data
              .filter(
                obj =>
                  !obj.isActive ||
                  !obj.isVerified ||
                  obj.role === 'deleted'
              )
            if (restrictedUsers.length > 0) {
              throw new Errors.Forbidden('Only administrators are allowed to request restricted users')
            }
          },
          // Remove for not allowed fields
          commonHooks.keep('_id', 'userName', 'pic'),
          // Double check if not allowed fields exist
          (context) => {
            const tmpData = JSON.parse(JSON.stringify(context.result.data))
            const reducedUsers = tmpData.map(
              obj => {
                delete obj._id
                delete obj.userName
                delete obj.pic
                return obj
              }
            )
            const filteredReducedUsers = reducedUsers
              .filter(obj => Object.keys(obj).length > 0)
            if (filteredReducedUsers.length > 0) {
              throw new Errors.Forbidden('Requested users contain private information')
            }
          }
        )
      )
    ],
    get: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        useFilter
      )
    ],
    create: [
      async (context) => {
        const result = await context.app.service('users').find({ query: { role: 'admins' }, paginate: false })
        if (result.length === 0) {
          // Make first user admin
          context.app.service('users').patch(context.result._id, { isVerified: true, role: 'admins', verifyExpires: null, verifyToken: null, resetExpires: null, resetToken: null })
        } else {
          // Send notifiers
          try {
            if (context.result.createdBy !== 'signup') {
              await accountService(context.app).notifier('resendVerifyInvitation', context.result)
            } else {
              await accountService(context.app).notifier('resendVerifySignup', context.result)
            }
          } catch (e) {
            await context.app.service('users').remove(context.result._id)
            throw e
          }
        }
      },
      commonHooks.iff(
        context => context.result.createdBy === 'signup',
        verifyHooks.removeVerification()
      ),
      async (context) => {
        if (context.result.role === 'admins') {
          for (const type of ['ads', 'discussions', 'groups', 'tags', 'violations']) {
            await context.app.service('status-containers').create(
              {
                user: context.result._id,
                relation: 'admin',
                type
              }
            )
          }
        }
      },
      async (context) => {
        await context.app.service('status-containers').create(
          {
            user: context.result._id,
            relation: 'owner',
            type: 'violations'
          }
        )
      },
      commonHooks.iff(
        commonHooks.isProvider('external'),
        commonHooks.iff(
          (context) => context.result.createdBy !== 'signup',
          useFilter
        )
      )
    ],
    update: [],
    patch: [
      // Handle admin status containers
      async (context) => {
        let statusContainer = []
        // Find existing status container
        if (context.data.role) {
          for (const type of ['ads', 'discussions', 'groups', 'tags', 'violations']) {
            statusContainer = await context.app.service('status-containers').find(
              {
                query: {
                  user: context.result._id,
                  relation: 'admin',
                  type
                }
              }
            )
            if (context.data.role === 'admins' && statusContainer.length === 0) {
              // User is admin now but has no status container - create one
              statusContainer = await context.app.service('status-containers').create(
                {
                  user: context.result._id,
                  relation: 'admin',
                  type
                }
              )
            } else if (context.data.role !== 'admins' && statusContainer.length === 1) {
            // User is no admin anymore but has status container
              await context.app.service('status-containers').remove(statusContainer[0]._id)
            }
          }
        }
      },
      // Remove pic and chats if user has been deleted
      async (context) => {
        if (context.data.role === 'deleted') {
          // Remove pic
          if (context.data.tmpPicUrlToDelete) {
            try {
              await context.app.service('uploads').remove(context.data.tmpPicUrlToDelete)
            } catch (e) {
              //
            }
          }
          // Find status owner containers of user and delete references
          const userStatusContainers = await context.app.service('status-containers').find(
            {
              query: {
                user: context.result._id,
                type: {
                  $in: ['chats', 'ads'] // Groups and discussions can go on without user?
                },
                relation: 'owner'
              }
            }
          )
          for (const statusContainer of userStatusContainers) {
            await context.app.service(statusContainer.type).remove(statusContainer.reference)
          }
          // Remove other status's containers
          await context.app.service('status-containers').remove(
            null,
            {
              query: {
                user: context.result._id
              }
            }
          )
          // Remove users's preferences
          await context.app.service('preferences').remove(
            null,
            {
              query: {
                user: context.result._id
              }
            }
          )
        }
      },
      commonHooks.iff(
        commonHooks.isProvider('external'),
        useFilter
      )
    ],
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

async function useFilter (context) {
  // Array without pagination
  if (Array.isArray(context.result)) {
    for (let i = 0; i < context.result.length; i++) {
      context.result[i] = await filterUser(context, context.result[i])
    }
    // Array with pagination
  } else if (context.result.data) {
    for (let i = 0; i < context.result.data.length; i++) {
      context.result.data[i] = await filterUser(context, context.result.data[i])
    }
    // Single user
  } else if (context.result._id) {
    context.result = await filterUser(context, context.result)
  }
}

async function filterUser (context, user) {
  // Filter user not admin or own user
  if (
    context.params.user?.role !== 'admins' &&
    context.params.user?._id.toString() !== user._id.toString()
  ) {
    // Clone user
    const tmpUser = JSON.parse(JSON.stringify(user))
    // Get preferences
    let preferences = await context.app.service('preferences').find(
      {
        query: {
          user: tmpUser._id
        }
      }
    )
    preferences = preferences[0]
    // Create reduced user object
    user = {
      _id: tmpUser._id,
      userName: tmpUser.userName,
      pic: tmpUser.pic
    }
    // Add properties based on preferences
    for (const key of ['Gender', 'Age', 'Residence']) {
      if (
        tmpUser[key.toLowerCase()] !== undefined &&
        (
          preferences['publish' + key] === 'all' ||
          (
            preferences['publish' + key] === 'users' &&
            context.params.user &&
            context.params.user.role !== 'anonymous'
          )
        )
      ) {
        user[key.toLowerCase()] = tmpUser[key.toLowerCase()]
      }
    }
  }
  // Delete properties for all uers
  delete user.password
  delete user.verifyToken
  return user
}
