// sendstats-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'sendstats'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const ObjectId = Schema.ObjectId
  const schema = new Schema({
    reference: { type: String, required: true, unique: true },
    type: { type: String, enum: ['news'] },
    sent: [
      {
        email: { type: String },
        id: { type: ObjectId, refPath: 'sent.user.type' },
        type: { type: String, enum: ['users', 'subscribers'] },
        dt: { type: Date }
      }
    ],
    error: [
      {
        email: { type: String },
        id: { type: ObjectId, refPath: 'sent.type' },
        type: { type: String, enum: ['users', 'subscribers'] },
        message: { type: String },
        dt: { type: Date }
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
