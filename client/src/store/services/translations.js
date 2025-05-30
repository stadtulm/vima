export function translations ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class translations extends BaseModel {
    static modelName = 'translations'
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }
  }
  const servicePath = 'translations'
  const vuexPlugin = makeServicePlugin({
    Model: translations,
    service: apiClient.service(servicePath),
    servicePath,
    whitelist: ['$regex', '$options', '$populate', '$exists', '$ne', '$eq'],
    paramsForServer: ['$populate']
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
