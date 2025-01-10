const Translation = require('./translations-entity.model')

// groups-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'groups'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const ObjectId = Schema.ObjectId
  const schema = new Schema({
    title: [{
      type: Translation,
      required: true
    }],
    description: [{
      type: Translation,
      required: true
    }],
    theme: {
      type: ObjectId,
      ref: 'themes'
    },
    pics: [
      {
        url: { type: String },
        credit: { type: String }
      }
    ],
    files: [
      {
        url: { type: String },
        name: { type: String }
      }
    ],
    categories: [
      {
        type: ObjectId,
        ref: 'categories'
      }
    ],
    tags: [
      {
        type: ObjectId,
        ref: 'tags'
      }
    ],
    prominentCategories: [
      {
        type: ObjectId,
        ref: 'categories'
      }
    ],
    visibility: {
      type: String,
      enum: ['public', 'private', 'hidden']
    },
    accepted: {
      isAccepted: { type: Boolean, default: false },
      dt: { type: Date },
      user: {
        type: ObjectId,
        ref: 'users'
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    translationSum: {
      type: String
    }
  }, {
    timestamps: true,
    collation: { locale: 'en', strength: 1 }
  })

  schema.virtual('latestDiscussionMessages', {
    ref: 'discussions', // Collection
    localField: '_id', // Here
    foreignField: 'group', // There
    options: {
      select: { latestDiscussionMessage: 1 },
      populate: { path: 'latestDiscussionMessage', select: { createdAt: 1 } }
    }
  })

  schema.virtual('owner', {
    ref: 'statusContainers', // Collection
    localField: '_id', // Here
    foreignField: 'reference', // There
    justOne: true,
    options: {
      query: { type: 'groups', relation: 'owner' },
      select: { user: 1 },
      populate: { path: 'user', select: { userName: 1, _id: 1, nationality: 1 } }
    }
  })

  schema.virtual('members', {
    ref: 'statusContainers', // Collection
    localField: '_id', // Here
    foreignField: 'reference', // There
    options: {
      query: { type: 'groups', relation: 'member' },
      select: { user: 1 },
      populate: { path: 'user', select: { userName: 1, _id: 1, nationality: 1 } }
    }
  })

  schema.virtual('moderators', {
    ref: 'statusContainers', // Collection
    localField: '_id', // Here
    foreignField: 'reference', // There
    options: {
      query: { type: 'groups', relation: 'moderator' },
      select: { user: 1 },
      populate: { path: 'user', select: { userName: 1, _id: 1, nationality: 1 } }
    }
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
