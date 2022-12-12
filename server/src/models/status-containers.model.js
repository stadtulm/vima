// statusContainers-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'statusContainers'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const ObjectId = Schema.ObjectId
  const schema = new Schema({
    user: {
      type: ObjectId,
      ref: 'users'
    },
    relation: {
      type: String,
      enum: ['owner', 'applicant', 'subscriber', 'moderator', 'admin', 'member', 'invitation']
    },
    type: {
      type: String,
      enum: ['chats', 'ads', 'discussions', 'groups', 'tags', 'organisations', 'violations']
    },
    reference: {
      type: ObjectId,
      refPath: 'type'
    },
    unread: [
      {
        type: { type: String },
        id: {
          type: ObjectId,
          refPath: 'unread.type'
        }
      }
    ],
    customField: {
      type: String
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
