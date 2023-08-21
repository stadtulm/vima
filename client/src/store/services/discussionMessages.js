export function discussionMessages ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class discussionMessages extends BaseModel {
    static modelName = 'discussionMessages'
    // Updates `data.author` to be an instance of the `User` class.
    static setupInstance (data, { store, models }) {
      if (data.author && typeof data.author === 'object') {
      // eslint-disable-next-line new-cap
        data.author = new models.api.users(data.author)._id
      }
      if (data.latestAnswers && data.latestAnswers.author && typeof data.latestAnswers.author === 'object') {
      // eslint-disable-next-line new-cap
        data.latestAnswers.author = new models.api.users(data.latestAnswers.author)._id
      }
      return data
    }
  }
  const servicePath = 'discussion-messages'
  const vuexPlugin = makeServicePlugin({
    Model: discussionMessages,
    service: apiClient.service(servicePath),
    servicePath,
    whitelist: ['$exists']
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
