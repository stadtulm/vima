export function violations ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class violations extends BaseModel {
    static modelName = 'violations' // Required for $FeathersVuex plugin to work after production transpile.
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }

    // Updates `data.unread` to be an instance of the corresponding class.
    static setupInstance (data, { store, models }) {
      if (data.responses && data.responses.length > 0) {
        const responses = []
        for (let i = 0; i < data.responses.length; i++) {
          if (typeof data.responses[i].user === 'object') {
            const response = JSON.parse(JSON.stringify(data.responses[i]))
            // eslint-disable-next-line new-cap
            response.user = new models.api.users(data.responses[i].user)._id
            responses.push(response)
          } else {
            responses.push(data.responses[i])
          }
        }
        data.responses = responses
      }
      if (data.message) {
        if (data.message.id && typeof data.message.id === 'object') {
        // eslint-disable-next-line new-cap
          data.message.id = new models.api[data.message.type](data.message.id)._id
        }
      }
      return data
    }
  }
  const servicePath = 'violations'
  const vuexPlugin = makeServicePlugin({
    Model: violations,
    service: apiClient.service(servicePath),
    servicePath,
    whitelist: ['$populate'],
    paramsForServer: ['$populate']
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
