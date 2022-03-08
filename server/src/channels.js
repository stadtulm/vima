const Cookie = require('cookie')

function createLanguageChannels (app, data, connections, properties) {
  // TODO: Replace with real languages list
  const languages = ['de', 'en']
  const isArray = Array.isArray(data)
  if (!isArray) {
    data = [data]
  }
  const filteredChannels = []
  const filteredData = {}
  const sortedConnections = {}
  // Split filtered data
  for (const language of languages) {
    sortedConnections[language] = []
    filteredData[language] = data.map(obj => {
      const clone = JSON.parse(JSON.stringify(obj))
      for (const property of properties) {
        // Check if language exists and use default if not
        const languageProperty = obj[property].find(t => t.lang === language)
        if (languageProperty) {
          clone[property] = obj[property].find(t => t.lang === language)
        } else {
          clone[property] = obj[property].find(t => t.type === 'default')
        }
      }
      return clone
    })
    if (!isArray) {
      filteredData[language] = filteredData[language][0]
    }
  }
  // Sort connections by language
  for (const connection of connections.connections) {
    let id
    if (connection.user) {
      id = connection.user._id.toString()
    } else {
      id = connection.clientId
    }
    sortedConnections[connection.language] = id
  }
  // Create channels
  for (const language of languages) {
    filteredChannels.push(app.channel(sortedConnections[language]).send(filteredData[language]))
  }
  return filteredChannels
}

module.exports = function (app) {
  if (typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return
  }

  /*
  * Connection stuff
  */

  app.on('connection', async connection => {
    // Join anonymous as default channel
    app.channel('anonymous').join(connection)
    app.channel(connection.clientId).join(connection)
    // Expose user language
    app.io.sockets.connected[connection.clientId].feathers.language = Cookie.parse(connection.headers.cookie).clientLanguage
  })

  app.on('disconnect', async (connection) => {
    if (connection && connection.user) {
      // Patch user
      await app.service('users').patch(connection.user._id, { status: 'offline' })
    }
    // Update users count
    await app.service('statistics').update('', {})
  })

  app.on('logout', async connection => {
    if (connection && connection.user) {
      // Patch user
      await app.service('users').patch(connection.user._id, { status: 'offline', isActive: false })
      // Patch user again
      setTimeout(async () => {
        await app.service('users').patch(connection.user._id, { isActive: true })
        // Join anonymous channel
      }, 1000)
      // Join anonymous
      app.channel(connection.clientId).join(connection)
      app.channel('anonymous').join(connection)
    }
    // Update users count
    await app.service('statistics').update('', {})
  })

  app.on('login', async (authResult, { connection }) => {
    // Leave common channels
    app.channel('anonymous').leave(connection)
    app.channel(connection.clientId).leave(connection)
    if (connection && connection.user) {
      // Join common channels
      app.channel('authenticated').join(connection)
      // Join role channel
      app.channel(connection.user.role).join(connection)
      // Join personal channels
      app.channel(connection.user._id.toString()).join(connection)
      // Patch status
      if (connection.user.status === 'offline') {
        await app.service('users').patch(connection.user._id, { status: 'idle' })
      }
      // Add user to group channels
      const userStatusContainers = await app.service('status-containers').find(
        {
          query: {
            user: connection.user._id,
            type: 'groups',
            relation: { $in: ['owner', 'moderator', 'member'] }
          }
        }
      )
      for (const userStatusContainer of userStatusContainers) {
        app.logger.debug('User', connection.user.userName, 'added to group channel', userStatusContainer.reference)
        app.channel(userStatusContainer.reference.toString()).join(connection)
      }
      // Log
      app.logger.debug('Login', connection.user._id, connection.user.firstName, connection.user.lastName)
    }
    await app.service('statistics').update('', {})
  })

  /*
  * Ads
  */

  // eslint-disable-next-line no-unused-vars
  app.service('ads').publish((data, hook) => {
    return app.channel('anonymous', 'authenticated')
  })

  /*
  * API keys
  */

  // eslint-disable-next-line no-unused-vars
  app.service('apikeys').publish((data, hook) => {
    return []
  })

  /*
  * Authmanagenent
  */

  app.service('authManagement').publish((data, hook) => {
    return []
  })

  /*
  * Categories
  */

  // eslint-disable-next-line no-unused-vars
  app.service('categories').publish((data, hook) => {
    return createLanguageChannels(app, data, app.channel('anonymous', 'authenticated'), ['text', 'description'])
  })

  /*
  * Chat messages
  */

  app.service('chat-messages').publish((data, hook) => {
    const tmpUsers = data.tmpUsers
    delete data.tmpUsers
    if (Array.isArray(data.text)) {
      data.text = data.text.find(obj => obj.type === 'default')[0]
    }
    return tmpUsers.map(obj => app.channel(obj))
  })

  /*
  * Chats
  */

  app.service('chats').publish((data, hook) => {
    const tmpUsers = data.tmpUsers
    delete data.tmpUsers
    return tmpUsers.map(obj => app.channel(obj))
  })

  /*
  * Discussion Messages
  */

  app.service('discussion-messages').publish(async (data, hook) => {
    if (Array.isArray(data.text)) {
      data.text = data.text.find(obj => obj.type === 'default')[0]
    }
    // Get discussion (and group) of message
    const discussion = await app.service('discussions').get(
      data.discussion,
      {
        query: {
          $select: { _id: 1 },
          $populate: {
            path: 'group',
            select: { visibility: 1 }
          }
        }
      }
    )
    if (
      !discussion.group ||
      discussion.group.visibility === 'public'
    ) {
      return app.channel('anonymous', 'authenticated')
    } else {
      return app.channel('admins', discussion.group._id)
    }
  })

  /*
  * Discussions
  */

  app.service('discussions').publish((data, hook) => {
    if (
      !data.group ||
      data.group.visibility !== 'hidden'
    ) {
      return app.channel('anonymous', 'authenticated')
    } else {
      let groupId
      if (typeof data.group === 'object') {
        groupId = data.group._id
      } else {
        groupId = data.group
      }
      return app.channel('admins', groupId)
    }
  })

  /*
  * Events
  */

  // eslint-disable-next-line no-unused-vars
  app.service('events').publish((data, hook) => {
    if (
      Array.isArray(data) ||
      !data.isActive
    ) {
      return app.channel('admins')
    } else {
      return app.channel('anonymous', 'authenticated')
    }
  })

  /*
  * Groups
  */

  // eslint-disable-next-line no-unused-vars
  app.service('groups').publish((data, hook) => {
    if (
      Array.isArray(data) ||
      !data.isActive ||
      !data.accepted?.isAccepted ||
      data.visibility === 'hidden'
    ) {
      return app.channel('admins', data._id.toString())
    } else {
      return app.channel('anonymous', 'authenticated')
    }
  })

  /*
  * News
  */

  // eslint-disable-next-line no-unused-vars
  app.service('news').publish((data, hook) => {
    if (
      Array.isArray(data) ||
      !data.isActive
    ) {
      return app.channel('admins')
    } else {
      if (data.isInternal) {
        return app.channel('authenticated')
      } else {
        return app.channel('anonymous', 'authenticated')
      }
    }
  })

  /*
  * Organisations
  */

  // TODO: Add members to a channel and post updates of inactive organisations to that channel

  // eslint-disable-next-line no-unused-vars
  app.service('organisations').publish((data, hook) => {
    if (
      Array.isArray(data) ||
      !data.isActive
    ) {
      return app.channel('admins')
    } else {
      return app.channel('anonymous', 'authenticated')
    }
  })

  /*
  * Sendstats
  */

  // eslint-disable-next-line no-unused-vars
  app.service('sendstats').publish((data, hook) => {
    return app.channel('admins')
  })

  /*
  * Sites
  */

  // eslint-disable-next-line no-unused-vars
  app.service('sites').publish((data, hook) => {
    return app.channel('anonymous', 'authenticated')
  })

  /*
  * Statistics
  */

  // eslint-disable-next-line no-unused-vars
  app.service('statistics').publish((data, hook) => {
    return app.channel('authenticated')
  })

  /*
  * Status containers
  */

  app.service('status-containers').publish((data, hook) => {
    let tmpData = data
    if (!Array.isArray(data)) {
      tmpData = [data]
    }
    // Concat array of users and array of status container ids
    // to notify all users directly linked in the status container
    // and all users who are owners of the status container reference
    return [
      ...new Set(
        tmpData.map(obj => obj.user.toString())
      )
    ]
      .concat(
        tmpData.map(obj => obj._id.toString())
      )
      .map(obj => app.channel(obj))
  })

  /*
  * Subscribers
  */

  // eslint-disable-next-line no-unused-vars
  app.service('subscribers').publish((data, hook) => {
    return app.channel('admins')
  })

  /*
  * Tags
  */

  // eslint-disable-next-line no-unused-vars
  app.service('tags').publish((data, hook) => {
    let isPublic = true
    if (Array.isArray(data)) {
      if (data.map(tag => !tag.isActive || !tag.isAccepted)) {
        isPublic = false
      }
    } else {
      if (!data.isActive || !data.isAccepted) {
        isPublic = false
      }
    }
    if (
      isPublic
    ) {
      return createLanguageChannels(app, data, app.channel('anonymous', 'authenticated'), ['text'])
    } else {
      return createLanguageChannels(app, data, app.channel('admins'), ['text'])
    }
  })

  /*
  * Users
  */

  app.service('users').publish(async (data, hook) => {
    delete data.password
    const tmpData = JSON.parse(JSON.stringify(data))
    return [
      app.channel(data._id.toString()).send(data),
      app.channel('admins').send(tmpData)
    ]
  })

  /*
  * Violations
  */

  // eslint-disable-next-line no-unused-vars
  app.service('violations').publish((data, hook) => {
    // TODO: What about group moderators / owners
    return app.channel('admins')
  })
}
