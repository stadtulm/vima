const Translation = require('./translations-entity.model')
// info-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html

// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'info'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const schema = new Schema({
    title: [{ type: Translation, required: true }],
    text: [{ type: Translation }],
    type: { type: String, enum: ['static', 'dynamic'] },
    pic: {
      url: { type: String },
      credit: { type: String }
    },
    video:
    {
      type: {
        type: String,
        enum: ['youtube', 'vimeo']
      },
      id: {
        type: String
      }
    },
    color: { type: String },
    position: { type: Number },
    isActive: { type: Boolean }
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
