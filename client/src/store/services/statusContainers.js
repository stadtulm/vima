export function statusContainers ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class statusContainers extends BaseModel {
    static modelName = 'statusContainers'

    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }

    // Updates `data.unread` to be an instance of the corresponding class.
    static setupInstance (data, { store, models }) {
      if (data.unread && data.unread.length > 0) {
        const unread = []
        for (let i = 0; i < data.unread.length; i++) {
          if (typeof data.unread[i].id === 'object' && data.unread[i].type) {
            unread.push(
              {
                type: data.unread[i].type,
                id: new models.api[data.unread[i].type](data.unread[i].id)._id
              })
          } else {
            unread.push(data.unread[i])
          }
        }
        data.unread = unread
      }
      if (data.user) {
        if (typeof data.user === 'object') {
        // eslint-disable-next-line new-cap
          data.user = new models.api.users(data.user)._id
        }
      }
      if (data.reference) {
        if (typeof data.reference === 'object') {
        // eslint-disable-next-line new-cap
          data.reference = new models.api[data.type](data.reference)._id
        }
      }
      return data
    }
  }
  const servicePath = 'status-containers'
  const vuexPlugin = makeServicePlugin({
    Model: statusContainers,
    service: apiClient.service(servicePath),
    servicePath
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
