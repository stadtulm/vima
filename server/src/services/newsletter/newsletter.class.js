const Errors = require('@feathersjs/errors')
const { getRecipients, sendNewsletter } = require('../sendstats/sendstats.class.js')

/* eslint-disable no-unused-vars */
exports.Newsletter = class Newsletter {
  constructor (options, app) {
    this.options = options || {}
    this.app = app
  }

  async find (params) {
    const recipients = await getRecipients(this.app)
    return recipients
  }

  async get (id, params) {
    return {
      id, text: `A new message with ID: ${id}!`
    }
  }

  async create (data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)))
    }
    if (data.tmpTestUser) {
      // Send a test mail
      return await sendNewsletter(this.app, [{ ...data.tmpTestUser, type: 'test' }], data.reference)
    }
  }

  async update (id, data, params) {
    return data
  }

  async patch (id, data, params) {
    return data
  }

  async remove (id, params) {
    // Unsubscribe from newsletter by patching users preferences
    // Fails if there is no user with this id, try to remove from subscribers instead
    const users = await this.app.service('users').find({
      query: {
        _id: id,
        $populate: [
          {
            path: 'preferences'
          }
        ]
      },
      paginate: false
    })
    const user = users[0]
    if (user) {
      if (user.preferences && user.preferences.receiveNewsletter) {
        await this.app.service('preferences').patch(
          user.preferences._id,
          {
            receiveNewsletter: false
          }
        )
        return true
      }
    } else {
      try {
        return await this.app.service('subscribers').remove(id)
      } catch (e) {
        throw new Errors.NotFound('Kein Eintrag gefunden')
      }
    }
  }
}
