export function users ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class users extends BaseModel {
    static modelName = 'users' // Required for $FeathersVuex plugin to work after production transpile.
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }
  }
  const servicePath = 'users'
  const vuexPlugin = makeServicePlugin({
    Model: users,
    service: apiClient.service(servicePath),
    servicePath,
    whitelist: ['$regex', '$options', '$populate'],
    paramsForServer: ['$populate']
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
