/* eslint-disable require-atomic-updates */
module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return async context => {
    const { params } = context
    let clientId, clientSecret
    if (params.query['x-access-token']) {
      clientId = params.query['x-access-token'].split(',')[0]
      clientSecret = params.query['x-access-token'].split(',')[1]
      delete params.query['x-access-token']
    } else if (params.headers['x-access-token']) {
      clientId = params.headers['x-access-token'].split(',')[0]
      clientSecret = params.headers['x-access-token'].split(',')[1]
    }
    if (clientSecret && params.provider && !params.authentication) {
      context.params = {
        ...params,
        authentication: {
          strategy: 'api',
          clientId,
          clientSecret
        }
      }
    }
    return context
  }
}
