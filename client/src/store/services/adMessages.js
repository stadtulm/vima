export function adMessages ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class adMessages extends BaseModel {
    static modelName = 'adMessages'
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }

    // Updates `data.author` to be an instance of the `User` class.
    static setupInstance (data, { store, models }) {
      if (data.author && typeof data.author === 'object') {
      // eslint-disable-next-line new-cap
        data.author = new models.api.users(data.author)._id
      }
      return data
    }
  }
  const servicePath = 'ad-messages'
  const vuexPlugin = makeServicePlugin({
    Model: adMessages,
    service: apiClient.service(servicePath),
    servicePath
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
