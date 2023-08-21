export function sites ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class sites extends BaseModel {
    static modelName = 'sites'
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }
  }
  const servicePath = 'sites'
  const vuexPlugin = makeServicePlugin({
    Model: sites,
    service: apiClient.service(servicePath),
    servicePath,
    whitelist: ['$regex', '$options'],
    paramsForServer: []
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({
  })

  return vuexPlugin
}
