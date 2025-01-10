const Translation = require('./translations-entity.model')
// themes-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'themes'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const schema = new Schema({
    title: [{
      type: Translation,
      required: true
    }],
    description: [{ type: Translation }]
  }, {
    timestamps: true,
    collation: { locale: 'en', strength: 1 }
  })

  schema.virtual('groups', {
    ref: 'groups', // Collection
    localField: '_id', // Here
    foreignField: 'theme' // There
  })

  // Ensure virtual fields are serialised.
  schema.set('toJSON', { virtuals: true })
  schema.set('toObject', { virtuals: true })

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName)
  }
  return mongooseClient.model(modelName, schema)
}
