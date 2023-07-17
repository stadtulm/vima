const Errors = require('@feathersjs/errors')

/* eslint-disable no-unused-vars */
exports.StatusContainerHelper = class StatusContainerHelper {
  constructor (options, app) {
    this.options = options || {}
    this.app = app
  }

  async find (params) {
    if (params.query.type === 'commonChat') {
      const statusContainers = await this.app.service('status-containers').find(
        {
          query: {
            type: 'chats',
            relation: 'owner',
            user: { $in: params.query.users }
          }
        }
      )
      const commonReferences = [
        ...new Set(
          statusContainers
            .map(obj => obj.reference.toString()).filter((value, index, self) => self.indexOf(value) !== index)
        )
      ]
      if (commonReferences.length === 0) {
        return []
      } else if (commonReferences.length > 1) {
        throw new Errors.Conflict('Found multiple possible chat references')
      } else if (commonReferences.length === 1) {
        const chats = await this.app.service('chats').find(
          {
            query: {
              _id: commonReferences[0]
            },
            paginate: false
          }
        )
        return chats
      }
    } else {
      throw new Errors.NotImplemented()
    }
  }

  async get (id, params) {
    return {
      id, text: `A new message with ID: ${id}!`
    }
  }

  async create (data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)))
    }

    if (data.type === 'createAdSubscription') {
      await this.app.service('status-containers').create({
        type: 'ads',
        user: params.user._id,
        relation: 'subscriber',
        reference: data.adId

      })
    } else if (data.type === 'createDiscussionSubscription') {
      await this.app.service('status-containers').create({
        type: 'discussions',
        user: params.user._id,
        relation: 'subscriber',
        reference: data.discussionId

      })
    } else if (data.type === 'joinGroup') {
      await this.app.service('status-containers').create({
        type: 'groups',
        user: params.user._id,
        relation: 'member',
        reference: data.groupId
      })
    } else if (data.type === 'createGroupApplication') {
      await this.app.service('status-containers').create({
        type: 'groups',
        user: params.user._id,
        relation: 'applicant',
        reference: data.groupId,
        customField: data.message
      })
    } else if (data.type === 'createGroupModeration') {
      await this.app.service('status-containers').create({
        type: 'groups',
        user: data.userId,
        relation: 'moderator',
        reference: data.groupId,
        customField: 'new'
      })
    } else if (data.type === 'createGroupInvitation') {
      await this.app.service('status-containers').create({
        type: 'groups',
        user: data.userId,
        relation: 'invitation',
        reference: data.groupId,
        customField: 'new'
      })
    } else if (data.type === 'acceptGroupApplication') {
      await this.app.service('status-containers').patch(
        null,
        {
          relation: 'member',
          customField: 'new'
        },
        {
          query: {
            type: 'groups',
            user: data.userId,
            relation: 'applicant',
            reference: data.groupId
          }
        })
    } else if (data.type === 'acceptGroupInvitation') {
      await this.app.service('status-containers').patch(
        null,
        {
          relation: 'member',
          customField: null
        },
        {
          query: {
            type: 'groups',
            user: params.user._id,
            relation: 'invitation',
            reference: data.groupId
          }
        })
    } else if (data.type === 'createOrganisationMembership') {
      await this.app.service('status-containers').create({
        type: 'organisations',
        user: data.userId,
        relation: 'member',
        reference: data.organisationId
      })
    } else {
      throw new Errors.NotImplemented()
    }

    return true
  }

  async update (id, data, params) {
    return data
  }

  async patch (id, data, params) {
    if (id === 'resetCustomField') {
      await this.app.service('status-containers').patch(
        null,
        {
          customField: null
        },
        {
          query: {
            user: params.user._id,
            type: data.type,
            relation: data.relation,
            customField: data.customField,
            reference: {
              $in: data.references
            }
          }
        }
      )
    } else if (id === 'pullUnreadById') {
      await this.app.service('status-containers').patch(
        data.containerId,
        {
          $pull: {
            unread: {
              id: {
                $in: data.ids
              }
            }
          }
        }
      )
    } else if (id === 'pullUnreadByType') {
      await this.app.service('status-containers').patch(
        data.containerId,
        {
          $pull: {
            unread: {
              type: data.type
            }
          }
        }
      )
    } else {
      throw new Errors.NotImplemented()
    }
    return true
  }

  async remove (id, params) {
    if (params.query.type === 'removeAdSubscription') {
      await this.app.service('status-containers').remove(
        null,
        {
          query: {
            type: 'ads',
            user: params.user._id,
            relation: 'subscriber',
            reference: id
          }
        }
      )
    } else if (params.query.type === 'removeDiscussionSubscription') {
      await this.app.service('status-containers').remove(
        null,
        {
          query: {
            type: 'discussions',
            user: params.user._id,
            relation: 'subscriber',
            reference: id
          }
        }
      )
    } else if (params.query.type === 'removeGroupMembership') {
      await this.app.service('status-containers').remove(
        null,
        {
          query: {
            type: 'groups',
            user: params.query.userId,
            reference: id
          }
        }
      )
    } else if (params.query.type === 'removeGroupModeration') {
      await this.app.service('status-containers').remove(
        null,
        {
          query: {
            type: 'groups',
            user: params.query.userId,
            reference: id,
            relation: 'moderator'
          }
        }
      )
    } else if (params.query.type === 'removeOrganisationMembership') {
      await this.app.service('status-containers').remove(
        null,
        {
          query: {
            type: 'organisations',
            user: params.query.userId,
            reference: id
          }
        }
      )
    }
    return true
  }
}
