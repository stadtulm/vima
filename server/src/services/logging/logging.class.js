/* eslint-disable no-unused-vars */
exports.Logging = class Logging {
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

    this.app.logger[data.type]('[' + data.route + ']', '[' + data.user + ']', '[' + data.method + ']', data.message)

    return data
  }

  async update (id, data, params) {
    return data
  }

  async patch (id, data, params) {
    return data
  }

  async remove (id, params) {
    return { id }
  }
}
