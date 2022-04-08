const Errors = require('@feathersjs/errors')
const { Translate } = require('@google-cloud/translate').v2
const JSum = require('jsum')
const projectId = 'vima-345111'
const fs = require('fs')

/* eslint-disable no-unused-vars */
exports.Translations = class Translations {
  constructor (options, app) {
    this.options = options || {}
    this.app = app
    const credentials = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS))
    const translator = new Translate({ projectId, credentials })
    this.translator = translator
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
      if (message.translationSum && message.translationSum !== data.texts.find(t => t.id.toString() === message._id.toString()).translationSum) {
        throw new Errors.Forbidden('Requested unknown translation')
      }
    }

    // Create missing translations
    await createTranslations(this.app, this.translator, messages, data)

    // Find messages
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

async function createTranslations (app, translator, messages, data) {
  for (const key of data.fields) {
    await Promise.all(messages.map(async m => {
      if (!m[key].find(t => t.lang === data.target) || data.force) {
        const translation = await translator.translate(
          m[key].find(t => t.type === 'default').value,
          googleLanguageCodesMap[data.target] || data.target
        )
        const targetText = {
          lang: data.target,
          type: 'ai',
          value: translation[0]
        }
        //
        const translationSum = JSum.digest(data.allFields.map(field => m[field].find(t => t.type === 'default').value), 'SHA256', 'hex')
        if (m[key].find(t => t.lang === data.target)) {
          // Replace translation object
          await app.service(data.type).patch(
            m._id,
            {
              [key + '.$']: targetText,
              translationSum
            },
            {
              query: {
                [key + '.lang']: data.target
              }
            }
          )
        } else {
          // Push translation object
          await app.service(data.type).patch(m._id, {
            $push: {
              [key]: targetText
            },
            translationSum
          })
        }
        // Update default language
        await app.service(data.type).patch(
          m._id,
          {
            [key + '.$.lang']: translation[1].data.translations[0].detectedSourceLanguage
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

const googleLanguageCodesMap = {
  ua: 'uk'
}
