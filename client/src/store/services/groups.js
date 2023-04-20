import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'

class groups extends BaseModel {
  // eslint-disable-next-line no-useless-constructor
  constructor (data, options) {
    super(data, options)
  }

  // Define default properties here
  static instanceDefaults () {
    return {
    }
  }

  // Adds latest message if not there
  static setupInstance (data, { store, models }) {
    if (data.latestMessage === undefined) {
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

groups.modelName = 'groups'
const servicePath = 'groups'
const servicePlugin = makeServicePlugin({
  Model: groups,
  service: feathersClient.service(servicePath),
  servicePath
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
