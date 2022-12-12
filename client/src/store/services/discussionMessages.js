import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'

class discussionMessages extends BaseModel {
  // eslint-disable-next-line no-useless-constructor
  constructor (data, options) {
    super(data, options)
  }

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
discussionMessages.modelName = 'discussionMessages'
const servicePath = 'discussion-messages'
const servicePlugin = makeServicePlugin({
  Model: discussionMessages,
  service: feathersClient.service(servicePath),
  servicePath,
  whitelist: ['$exists']
})

// Setup the client-side Feathers hooks.
feathersClient.service(servicePath).hooks({
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
})

export default servicePlugin
