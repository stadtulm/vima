// settings-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'settings'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const schema = new Schema({
    name: { type: String, required: true, unique: true },
    headerColor: { type: String, required: true },
    indicatorColor: { type: String, required: true },
    headerLogo: { type: String, required: true },
    socialMediaURls: {
      fb: { type: String },
      instagram: { type: String },
      twitter: { type: String }
    },
    modules: {
      ads: {
        isActive: { type: Boolean, required: true },
        position: { type: Number, required: true },
        color: { type: String, required: true },
        pic: { type: String, required: true }
      },
      groups: {
        isActive: { type: Boolean, required: true },
        position: { type: Number, required: true },
        color: { type: String, required: true },
        pic: { type: String, required: true }
      },
      discussions: {
        isActive: { type: Boolean, required: true },
        position: { type: Number, required: true },
        color: { type: String, required: true },
        pic: { type: String, required: true }
      },
      news: {
        isActive: { type: Boolean, required: true },
        position: { type: Number, required: true },
        color: { type: String, required: true },
        pic: { type: String, required: true }
      },
      events: {
        isActive: { type: Boolean, required: true },
        position: { type: Number, required: true },
        color: { type: String, required: true },
        pic: { type: String, required: true }
      },
      organisations: {
        isActive: { type: Boolean, required: true },
        position: { type: Number, required: true },
        color: { type: String, required: true },
        pic: { type: String, required: true }
      },
      blog: {
        isActive: { type: Boolean, required: true },
        position: { type: Number, required: true },
        color: { type: String, required: true },
        pic: { type: String, required: true }
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
