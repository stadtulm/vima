const translate = require('deepl')

/* eslint-disable no-unused-vars */
exports.Translations = class Translations {
  constructor (options, app) {
    this.options = options || {}
    this.app = app
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
    const messages = await this.app.service(data.type).find({
      query: {
        _id: {
          $in: data.ids
        }
      },
      paginate: false
    })
    // Existing translations
    const result = await Promise.all(messages.map(async m => {
      if (m.text.find(t => t.lang === data.target)) {
        return {
          _id: m._id + '_' + data.target,
          show: true,
          ...m.text.find(t => t.lang === data.target)
        }
      } else {
        const translation = await translate({
          free_api: true,
          text: m.text.find(t => t.type === 'default').value,
          target_lang: data.target,
          auth_key: process.env.DEEPL_AUTH_KEY
        })
        const targetText = {
          lang: data.target,
          type: 'deepl',
          value: translation.data.translations[0].text
        }
        // Push translation object
        await this.app.service(data.type).patch(m._id, {
          $push: {
            text: targetText
          }
        })
        // Update default language
        await this.app.service(data.type).patch(
          m._id,
          {
            'text.$.lang': translation.data.translations[0].detected_source_language.toLocaleLowerCase()
          },
          {
            query: {
              'text.type': 'default'
            }
          }
        )
        return {
          _id: m._id + '_' + data.target,
          show: true,
          ...targetText
        }
      }
    }))
    return result
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
