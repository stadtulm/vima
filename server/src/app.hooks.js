// Application hooks that run for every service
const { traverse, paramsFromClient } = require('feathers-hooks-common')
const sanitizeHtml = require('sanitize-html')
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
      paramsFromClient('keepTranslations')
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
    all: [],
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
