export function discussions ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class discussions extends BaseModel {
    static modelName = 'discussions'
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }

    // Updates `data.group` to be an instance of the `Group` class
    // and adds latestMessage
    static setupInstance (data, { store, models }) {
      if (data.group) {
        if (typeof data.group === 'object') {
        // eslint-disable-next-line new-cap
          data.group = new models.api.groups(data.group)._id
        }
      }
      if (data.latestMessage === undefined && data.latestDiscussionMessage) {
        data.latestMessage = data.latestDiscussionMessage.createdAt
      }
      return data
    }
  }
  const servicePath = 'discussions'
  const vuexPlugin = makeServicePlugin({
    Model: discussions,
    service: apiClient.service(servicePath),
    servicePath,
    whitelist: ['$exists']
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
