// violations-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'violations'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const ObjectId = Schema.ObjectId
  const schema = new Schema({
    responses: [
      {
        user: {
          type: ObjectId, ref: 'users'
        },
        comment: {
          type: String
        },
        dt: {
          type: Date
        }
      }
    ],
    link: { type: String },
    ad: { type: ObjectId, ref: 'ads' },
    chat: { type: ObjectId, ref: 'chats' },
    group: { type: ObjectId, ref: 'groups' },
    discussion: { type: ObjectId, ref: 'discussions' },
    type: { type: String, enum: ['ads', 'chats', 'groups', 'discussions'] },
    originalMessage: {
      type: String
    },
    originalAuthor: {
      type: String
    },
    message: {
      id: {
        type: ObjectId,
        refPath: 'message.type'
      },
      type: {
        type: String, enum: ['discussionMessages', 'chatMessages']
      }
    },
    isClosed: {
      type: Boolean,
      default: false
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
