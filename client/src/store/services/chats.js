export function chats ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class chats extends BaseModel {
    static modelName = 'chats'
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }
  }
  const servicePath = 'chats'
  const vuexPlugin = makeServicePlugin({
    Model: chats,
    service: apiClient.service(servicePath),
    servicePath
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
