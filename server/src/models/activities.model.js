// activities-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'activities'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const ObjectId = Schema.ObjectId
  const schema = new Schema({
    author: {
      id: {
        type: ObjectId,
        ref: 'users'
      },
      value: {
        type: String
      },
      role: {
        type: String,
        enum: ['admins', 'partners', 'users', 'deleted', 'system']
      }
    },
    type: {
      type: String,
      enum: ['chats', 'ads', 'discussions', 'groups', 'tags', 'organisations', 'violations']
    },
    verb: {
      type: String,
      enum: ['created', 'removed', 'patched', 'accepted', 'unaccepted', 'opened', 'closed', 'activated', 'deactivated', 'invited', 'sent']
    },
    subject: {
      id: {
        type: ObjectId
      },
      value: {
        type: String
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
