/* eslint-disable no-unused-vars */
exports.Statistics = class Statistics {
  constructor (options, app) {
    this.app = app
    this.options = options || {}
  }

  async find (params) {
    return []
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

    return data
  }

  async update (id, data, params) {
    const userModel = this.app.service('users').Model
    const count = await userModel.countDocuments({ status: 'idle' })
    return count
  }

  async patch (id, data, params) {
    return data
  }

  async remove (id, params) {
    return { id }
  }
}
