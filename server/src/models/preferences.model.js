// preferences-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'preferences'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const ObjectId = Schema.ObjectId
  const schema = new Schema({
    user: { type: ObjectId, ref: 'users' },
    receiveNewsletter: { type: Boolean },
    publishGender: { type: String, enum: ['all', 'users', 'none'] },
    publishAge: { type: String, enum: ['all', 'users', 'none'] },
    publishFavoriteCategories: { type: String, enum: ['all', 'users', 'none'] },
    publishResidence: { type: String, enum: ['all', 'users', 'none'] },
    newChats: { type: String, enum: ['emailAlways', 'emailOffline', 'emailOff'] },
    newChatMessages: { type: String, enum: ['emailAlways', 'emailOffline', 'emailOff'] },
    newDiscussionMessages: { type: String, enum: ['emailAlways', 'emailOffline', 'emailOff'] },
    newAcceptedGroupMemberships: { type: String, enum: ['emailAlways', 'emailOffline', 'emailOff'] },
    newAcceptedGroupInvitations: { type: String, enum: ['emailAlways', 'emailOffline', 'emailOff'] },
    newAcceptedGroupModeratorRoles: { type: String, enum: ['emailAlways', 'emailOffline', 'emailOff'] },
    newAdApplicants: { type: String, enum: ['emailAlways', 'emailOffline', 'emailOff'] },
    newGroupApplicants: { type: String, enum: ['emailAlways', 'emailOffline', 'emailOff'] },
    newGroupDiscussionsToAccept: { type: String, enum: ['emailAlways', 'emailOffline', 'emailOff'] },
    newAdsToAccept: { type: String, enum: ['emailAlways', 'emailOffline', 'emailOff'] },
    newDiscussionsToAccept: { type: String, enum: ['emailAlways', 'emailOffline', 'emailOff'] },
    newGroupsToAccept: { type: String, enum: ['emailAlways', 'emailOffline', 'emailOff'] },
    newTagsToAccept: { type: String, enum: ['emailAlways', 'emailOffline', 'emailOff'] },
    newAcceptedAds: { type: String, enum: ['emailAlways', 'emailOffline', 'emailOff'] },
    newAcceptedGroups: { type: String, enum: ['emailAlways', 'emailOffline', 'emailOff'] },
    newAcceptedDiscussions: { type: String, enum: ['emailAlways', 'emailOffline', 'emailOff'] },
    newAcceptedGroupDiscussions: { type: String, enum: ['emailAlways', 'emailOffline', 'emailOff'] },
    newViolationsToProve: { type: String, enum: ['emailAlways', 'emailOffline', 'emailOff'] },
    newGroupViolationsToProve: { type: String, enum: ['emailAlways', 'emailOffline', 'emailOff'] },
    newUser: { type: String, enum: ['emailAlways', 'emailOff'] },
    newMention: { type: String, enum: ['emailAlways', 'emailOffline', 'emailOff'] },
    newFavoriteCategoryContent: { type: String, enum: ['emailAlways', 'emailOffline', 'emailOff'] }
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
