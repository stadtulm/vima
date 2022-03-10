const Errors = require('@feathersjs/errors')
const translate = require('deepl')
const JSum = require('jsum')

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
          $in: data.texts.map(t => t.id)
        }
      },
      paginate: false
    })
    // Compare messages and sent checksums
    for (const message of messages) {
      if (message.translationSum !== data.texts.find(t => t.id.toString() === message._id.toString()).translationSum) {
        throw new Errors.Forbidden('Requested unknown translation')
      }
    }
    let collectedResult = []

    // TODO: Compare translated version and original version and only set language if its the same

    for (const key of ['text', 'title']) {
      const result = await Promise.all(messages.map(async m => {
      // Existing translations
        if (m[key].find(t => t.lang === data.target)) {
          return {
            _id: m._id + '_' + key + '_' + data.target,
            show: true,
            translationSum: JSum.digest(m[key].find(t => t.type === 'default').value, 'SHA256', 'hex'),
            ...m[key].find(t => t.lang === data.target)
          }
          // Get translations
        } else {
          const translation = await translate({
            free_api: true,
            text: m[key].find(t => t.type === 'default').value,
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
              [key]: targetText
            }
          })
          // Update default language
          await this.app.service(data.type).patch(
            m._id,
            {
              [key + '.$.lang']: translation.data.translations[0].detected_source_language.toLocaleLowerCase()
            },
            {
              query: {
                [key + '.type']: 'default'
              }
            }
          )
          return {
            _id: m._id + '_' + key + '_' + data.target,
            show: true,
            translationSum: JSum.digest(m.text.find(t => t.type === 'default').value, 'SHA256', 'hex'),
            ...targetText
          }
        }
      }))
      collectedResult = collectedResult.concat(result)
    }
    return collectedResult
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
