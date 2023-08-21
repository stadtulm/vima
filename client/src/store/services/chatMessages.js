export function chatMessages ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class chatMessages extends BaseModel {
    static modelName = 'chatMessages'
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }

    // Updates `data.unread` to be an instance of the corresponding class.
    static setupInstance (data, { store, models }) {
      if (data.author) {
        if (typeof data.author === 'object') {
        // eslint-disable-next-line new-cap
          data.author = new models.api.users(data.author)._id
        }
      }
      return data
    }
  }
  const servicePath = 'chat-messages'
  const vuexPlugin = makeServicePlugin({
    Model: chatMessages,
    service: apiClient.service(servicePath),
    servicePath,
    whitelist: ['$exists']
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
