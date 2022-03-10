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
    let messages = await this.app.service(data.type).find({
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

    // TODO: Compare translated version and original version and only set language if its the same

    // Create missing translations
    await createTranslations(this.app, messages, data)

    // Update messages
    messages = await this.app.service(data.type).find({
      query: {
        _id: {
          $in: data.texts.map(t => t.id)
        }
      },
      paginate: false
    })

    // Create translation objects
    let collectedResult = []
    for (const key of data.fields) {
      const result = messages.map(m => {
        const translationSum = JSum.digest(data.allFields.map(field => m[field].find(t => t.type === 'default').value), 'SHA256', 'hex')
        return {
          _id: m._id + '_' + key + '_' + data.target,
          show: true,
          translationSum,
          ...m[key].find(t => t.lang === data.target)
        }
      })
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

async function createTranslations (app, messages, data) {
  for (const key of data.fields) {
    await Promise.all(messages.map(async m => {
      if (!m[key].find(t => t.lang === data.target)) {
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
        await app.service(data.type).patch(m._id, {
          $push: {
            [key]: targetText
          }
        })
        // Update default language
        await app.service(data.type).patch(
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
      }
    }))
  }
}
