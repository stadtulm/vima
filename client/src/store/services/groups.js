export function groups ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class groups extends BaseModel {
    static modelName = 'groups'
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }

    // Adds latest message if not there
    static setupInstance (data, { store, models }) {
      if (data.latestMessage === undefined && data.latestDiscussionMessages) {
        const latestDiscussionMessage = data.latestDiscussionMessages
          .map(discussion => discussion.latestDiscussionMessage)
          .filter(discussion => !!discussion)
        if (latestDiscussionMessage.length > 0) {
          data.latestMessage = latestDiscussionMessage.map(discussionMessage => discussionMessage.createdAt)
            .sort()
            .reverse()[0]
        }
      }
      return data
    }
  }
  const servicePath = 'groups'
  const vuexPlugin = makeServicePlugin({
    Model: groups,
    service: apiClient.service(servicePath),
    servicePath
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
