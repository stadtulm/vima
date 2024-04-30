// translator-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'translations'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const ObjectId = Schema.ObjectId
  const schema = new Schema({
    textId: { type: String, required: true },
    type: { type: String, enum: ['client', 'server'], required: true },
    translations: [
      {
        lang: { type: String },
        value: { type: String },
        edits: [
          {
            author: {
              type: ObjectId,
              ref: 'users'
            },
            ts: {
              type: Date
            },
            _id: false
          }
        ]
      }
    ]
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
