const Translation = require('./translations.model')
// settings-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'settings'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const schema = new Schema({
    name: { type: String, required: true, unique: true },
    defaultLanguage: {
      type: String,
      required: true
    },
    languages: [
      {
        type: String
      }
    ],
    headerLogo: {
      url: { type: String },
      credit: { type: String }
    },
    indicatorColor: { type: String, required: true },
    headerColor: { type: String, required: true },
    socialMediaUrls: {
      fb: { type: String },
      instagram: { type: String },
      twitter: { type: String }
    },
    otherVimaLinks: [
      {
        name: { type: String },
        url: { type: String }
      }
    ],
    modules: {
      ads: {
        isActive: { type: Boolean, required: true },
        position: { type: Number, required: true },
        color: { type: String, required: true },
        bgColor: { type: String, required: true },
        gradientColor: {
          r: { type: Number, required: true },
          g: { type: Number, required: true },
          b: { type: Number, required: true }
        },
        pic: {
          url: { type: String },
          credit: { type: String }
        },
        text: [{ type: Translation, required: true }],
        dependents: [
          {
            type: String
          }
        ]
      },
      groups: {
        isActive: { type: Boolean, required: true },
        position: { type: Number, required: true },
        color: { type: String, required: true },
        bgColor: { type: String, required: true },
        gradientColor: {
          r: { type: Number, required: true },
          g: { type: Number, required: true },
          b: { type: Number, required: true }
        },
        pic: {
          url: { type: String },
          credit: { type: String }
        },
        text: [{ type: Translation, required: true }],
        dependents: [
          {
            type: String
          }
        ]
      },
      discussions: {
        isActive: { type: Boolean, required: true },
        position: { type: Number, required: true },
        color: { type: String, required: true },
        bgColor: { type: String, required: true },
        gradientColor: {
          r: { type: Number, required: true },
          g: { type: Number, required: true },
          b: { type: Number, required: true }
        },
        pic: {
          url: { type: String },
          credit: { type: String }
        },
        text: [{ type: Translation, required: true }],
        dependents: [
          {
            type: String
          }
        ]
      },
      news: {
        isActive: { type: Boolean, required: true },
        position: { type: Number, required: true },
        pic: {
          url: { type: String },
          credit: { type: String }
        },
        text: [{ type: Translation, required: true }],
        dependents: [
          {
            type: String
          }
        ]
      },
      events: {
        isActive: { type: Boolean, required: true },
        position: { type: Number, required: true },
        pic: {
          url: { type: String },
          credit: { type: String }
        },
        text: [{ type: Translation, required: true }],
        dependents: [
          {
            type: String
          }
        ]
      },
      organisations: {
        isActive: { type: Boolean, required: true },
        position: { type: Number, required: true },
        pic: {
          url: { type: String },
          credit: { type: String }
        },
        text: [{ type: Translation, required: true }],
        dependents: [
          {
            type: String
          }
        ]
      },
      blog: {
        isActive: { type: Boolean, required: true },
        position: { type: Number, required: true },
        pic: {
          url: { type: String },
          credit: { type: String }
        },
        text: [{ type: Translation, required: true }],
        dependents: [
          {
            type: String
          }
        ]
      },
      sponsors: {
        isActive: { type: Boolean, required: true },
        position: { type: Number, required: true },
        pic: {
          url: { type: String },
          credit: { type: String }
        },
        text: [{ type: Translation, required: true }],
        dependents: [
          {
            type: String
          }
        ]
      },
      team: {
        isActive: { type: Boolean, required: true },
        position: { type: Number, required: true },
        pic: {
          url: { type: String },
          credit: { type: String }
        },
        text: [{ type: Translation, required: true }],
        dependents: [
          {
            type: String
          }
        ]
      }
    }
  }, {
    timestamps: true
  })

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName)
  }
  return mongooseClient.model(modelName, schema)
}
