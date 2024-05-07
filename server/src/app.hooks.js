// Application hooks that run for every service
const { traverse, paramsFromClient } = require('feathers-hooks-common')
const sanitizeHtml = require('sanitize-html')
const util = require('./services/util')

const sanitizeOptions = {
  allowedTags: ['img', 'p', 'strong', 'em', 'u', 's', 'blockquote', 'ul', 'li', 'ol', 'a', 'br', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'span'],
  allowedAttributes: { blockquote: ['class'], a: ['href', 'target'], img: ['src', 'style', 'height'], p: ['style'], div: ['style'], span: ['data-id', 'data-label', 'data-type', 'class'] },
  allowedSchemesByTag: {
    img: ['data', 'http', 'https']
  }
}

// Sanitize strings
const sanitizer = function (node) {
  if (typeof node === 'string') {
    this.update(sanitizeHtml(node, sanitizeOptions))
  }
}

module.exports = {
  before: {
    all: [
      paramsFromClient('keepTranslations', 'overwriteExisting', 'translationType')
    ],
    find: [],
    get: [],
    create: [
      traverse(sanitizer)
    ],
    update: [
      traverse(sanitizer)
    ],
    patch: [
      traverse(sanitizer)
    ],
    remove: []
  },

  after: {
    all: [
      async (context) => {
        if (
          context.type === 'after' &&
          ['ads', 'groups', 'discussions', 'violations'].includes(context.path) &&
          ['created', 'patched', 'removed'].includes(context.event)
        ) {
          let verb = context.event
          if (verb === 'patched') {
            verb = util.checkForAcceptedModification(context.data)
          }
          const results = Array.isArray(context.result) ? context.result : [context.result]
          for (const result of results) {
            try {
              await context.app.service('activities').create({
                author: {
                  id: context.params.user?._id || '000000000000000000000000',
                  value: context.params.user?.userName || 'system',
                  role: context.params.user?.role || 'system'
                },
                type: context.path,
                verb,
                subject: {
                  id: result._id,
                  value: Array.isArray(result.title) ? result.title.find(t => t.type === 'default')?.value : result.title?.value
                }
              })
            } catch (e) {
              context.app.logger.error('Error creating activity log for "' + context.event + ' ' + context.path + '": ' + e.message)
            }
          }
        }
      }
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [
      (context) => {
        context.app.logger.error(
          context.error, '-',
          'User:',
          context.params.user ? context.params.user._id + '(' + context.params.user.firstName + ' ' + context.params.user.lastName + ')' : 'anonymous' + ',',
          'Hook:',
          context.error.hook?.type, context.error.hook?.method, context.error.hook?.path + ', ',
          'Args:',
          JSON.stringify(context.arguments[0], replacePw) + ',',
          'Data:',
          JSON.stringify(context.data, replacePw)
        )
        delete context.error.stack
        delete context.error.hook
      }
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}

function replacePw (key, value) {
  if (key === 'password') {
    return '********'
  } else {
    return value
  }
}
