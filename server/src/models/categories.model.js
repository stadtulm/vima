// categories-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'categories'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const schema = new Schema({
    name: { type: String, required: true },
    pic: {
      url: { type: String },
      credit: { type: String }
    },
    description: { type: String }
  }, {
    timestamps: true
  })

  schema.virtual('adsTags', {
    ref: 'ads', // Collection
    localField: '_id', // Here
    foreignField: 'categories',
    options: {
      query: {
        'accepted.isAccepted': true,
        isActive: true
      },
      select: { tags: 1 }
    }
  })

  schema.virtual('discussionsTags', {
    ref: 'discussions', // Collection
    localField: '_id', // Here
    foreignField: 'categories',
    options: {
      query: {
        'accepted.isAccepted': true,
        isActive: true
      },
      select: { tags: 1 }
    }
  })

  schema.virtual('groupsTags', {
    ref: 'groups', // Collection
    localField: '_id', // Here
    foreignField: 'categories',
    options: {
      query: {
        'accepted.isAccepted': true,
        isActive: true,
        visibility: { $ne: 'hidden' }
      },
      select: { tags: 1 }
    }
  })

  schema.virtual('ads', {
    ref: 'ads', // Collection
    localField: '_id', // Here
    foreignField: 'categories',
    count: true,
    options: {
      query: {
        'accepted.isAccepted': true,
        isActive: true
      }
    }
  })

  schema.virtual('discussions', {
    ref: 'discussions', // Collection
    localField: '_id', // Here
    foreignField: 'categories',
    count: true,
    options: {
      query: {
        'accepted.isAccepted': true,
        isActive: true
      }
    }
  })

  schema.virtual('groups', {
    ref: 'groups', // Collection
    localField: '_id', // Here
    foreignField: 'categories',
    count: true,
    options: {
      query: {
        'accepted.isAccepted': true,
        isActive: true,
        visibility: { $ne: 'hidden' }
      }
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
