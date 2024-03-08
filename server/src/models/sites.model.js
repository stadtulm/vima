const Translation = require('./translations.model')

// sites-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'sites'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const schema = new Schema({
    text: [{ type: Translation, required: true }],
    videos: [
      {
        type: {
          type: String,
          enum: ['youtube', 'vimeo']
        },
        id: {
          type: String
        }
      }
    ],
    type: {
      type: String,
      enum: ['imprint', 'privacy', 'contact', 'vima', 'ileu', 'communicationrules', 'team', 'faq'],
      unique: true
    }
  }, {
    timestamps: true,
    collation: { locale: 'en', strength: 1 }
  })

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName)
  }
  return mongooseClient.model(modelName, schema)
}
