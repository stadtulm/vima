export function translator ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class translator extends BaseModel {
    static modelName = 'translator'
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }
  }
  const servicePath = 'translator'
  const vuexPlugin = makeServicePlugin({
    Model: translator,
    service: apiClient.service(servicePath),
    servicePath,
    whitelist: ['$regex', '$options', '$populate'],
    paramsForServer: ['$populate']
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
