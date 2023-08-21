export function authmanagement ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class AuthManagement extends BaseModel {
  static modelName = 'AuthManagement'
  static instanceDefaults () {
    return {
    }
  }
  }
  const servicePath = 'authManagement'
  const vuexPlugin = makeServicePlugin({
    Model: AuthManagement,
    service: apiClient.service(servicePath),
    servicePath
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
