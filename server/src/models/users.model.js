// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

module.exports = function (app) {
  const modelName = 'users'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const schema = new Schema({
    email: {
      lowercase: true,
      type: String,
      trim: true,
      index: {
        unique: true,
        partialFilterExpression: { email: { $type: 'string' } }
      }
    },
    password: {
      type: String
    },
    role: {
      type: String,
      enum: ['admins', 'partners', 'users', 'deleted'],
      default: 'users'
    },
    userName: {
      type: String,
      trim: true,
      index: {
        unique: true,
        partialFilterExpression: { userName: { $type: 'string' } }
      }
    },
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    description: {
      type: String
    },
    pic: {
      url: { type: String },
      credit: { type: String }
    },
    age: {
      type: Number
    },
    gender: {
      type: String, enum: ['m', 'f', 'd', null]
    },
    residence: {
      type: String
    },
    language: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: String,
      default: 'signup',
      enum: ['signup', 'editor', 'invitation', null]
    },
    status: {
      type: String,
      enum: ['idle', 'offline', 'away', 'busy', 'deleted'],
      default: 'offline'
    },
    isVerified: { type: Boolean },
    verifyToken: { type: String },
    verifyExpires: { type: Date },
    verifyChanges: { type: Object },
    resetToken: { type: String },
    resetExpires: { type: Date }
  }, {
    timestamps: true,
    collation: { locale: 'en', strength: 1 }
  })

  schema.virtual('preferences', {
    ref: 'preferences', // Collection
    localField: '_id', // Here
    foreignField: 'user', // There
    justOne: true
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
