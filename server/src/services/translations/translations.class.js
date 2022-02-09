const translate = require('deepl')

/* eslint-disable no-unused-vars */
exports.Translations = class Translations {
  constructor (options) {
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
    const translation = await translate({
      free_api: true,
      text: data.text,
      target_lang: 'EN',
      auth_key: process.env.DEEPL_AUTH_KEY
    })
    console.log(translation.data.translations[0].text)
    return translation.data.translations[0]
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
