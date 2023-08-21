const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication')
const { LocalStrategy } = require('@feathersjs/authentication-local')
const { AuthenticationBaseStrategy } = require('@feathersjs/authentication')
const { NotAuthenticated } = require('@feathersjs/errors')
const bcrypt = require('bcryptjs')

module.exports = app => {
  const authentication = new AuthenticationService(app)

  authentication.register('jwt', new JWTStrategy())
  authentication.register('local', new LocalStrategy())
  authentication.register('api', new ApiKeyStrategy())
  authentication.register('anonymous', new AnonymousStrategy())

  app.use('/authentication', authentication)
}

class ApiKeyStrategy extends AuthenticationBaseStrategy {
  async authenticate (auth, params) {
    const keys = await this.app.service('apikeys').find(
      {
        query: {
          clientId: auth.clientId
        }
      }
    )
    if (keys.data?.length !== 1 || !bcrypt.compareSync(auth.clientSecret, keys.data[0].clientSecret)) {
      throw new NotAuthenticated('Incorrect API Key')
    }

    return {
      apiKey: true,
      user: {
        role: 'partners'
      }
    }
  }
}
class AnonymousStrategy extends AuthenticationBaseStrategy {
  async authenticate (authentication, params) {
    return {
      anonymous: true,
      user: {
        role: 'anonymous'
      }
    }
  }
}
