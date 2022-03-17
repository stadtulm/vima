const locales = require('../../locales/de.json')

module.exports = {
  async notifyUsers (app, type, action, item, users) {
    const tmpUsers = await app.service('users').find(
      {
        query: {
          _id: { $in: users },
          $populate: [
            {
              path: 'preferences'
            }
          ],
          $select: {
            firstName: 1, lastName: 1, email: 1, status: 1
          }
        },
        paginate: false
      }
    )
    // Custom
    const tmpMailBodyType = type
    if (type === 'newTagsToAccept') {
      item.tag = {}
      item.tag.name = item.text[0].value
      item.tag._id = item._id
    } else if (type === 'newGroupApplicants') {
      item.group = await app.service('groups').get(item.reference)
    } else if (
      type === 'newDiscussionsToAccept' ||
      type === 'newGroupDiscussionsToAccept' ||
      type === 'newAcceptedDiscussions' ||
      type === 'newAcceptedGroupDiscussions'
    ) {
      item.discussion = {}
      item.discussion.title = item.title.value
      item.discussion._id = item._id
      if (
        type === 'newGroupDiscussionsToAccept' ||
        type === 'newAcceptedGroupDiscussions'
      ) {
        item.group = await app.service('groups').get(item.group)
      }
    } else if (type === 'newAdsToAccept' || type === 'newAcceptedAds') {
      item.ad = {}
      item.ad.title = item.title.value
      item.ad._id = item._id
    } else if (type === 'newGroupsToAccept' || type === 'newAcceptedGroups') {
      item.group = {}
      item.group.title = item.title.value
      item.group._id = item._id
    } else if (type === 'newAdApplicants') {
      item.ad = await app.service('ads').get(item.reference)
    } else if (
      type === 'newAcceptedGroupMemberships' ||
      type === 'newAcceptedGroupInvitations' ||
      type === 'newAcceptedGroupModeratorRoles'
    ) {
      item.group = await app.service('groups').get(item.reference)
    } else if (type === 'newGroupViolationsToProve') {
      item.discussion = await app.service('discussions').get(item.discussion)
      item.group = await app.service('groups').get(item.group)
    } else if (type === 'newDiscussionViolationsToProve') {
      type = 'newViolationsToProve'
      item.discussion = await app.service('discussions').get(item.discussion)
    }
    for (const user of tmpUsers) {
      let tmpBody = JSON.parse(JSON.stringify(mailBodies[tmpMailBodyType][action]))
      tmpBody.html = tmpBody.html + '<br><br>' +
        locales.notificationSettingsNote1 + '<a href="' + process.env.CLIENT_URL + 'mitglieder/einstellungen/editor/' + user._id + '">' + locales.notificationSettingsNote2
      tmpBody = JSON.stringify(tmpBody)
      if (!shouldSend(user, type)) {
        continue
      }
      tmpBody = tmpBody
        .replaceAll('{{recipient}}', user.email)
        .replaceAll('{{firstName}}', user.firstName)
        .replaceAll('{{lastName}}', user.lastName)
        .replaceAll('{{groupTitle}}', reducedDefaultTranslation(item.group?.title))
        .replaceAll('{{groupId}}', item.group?._id)
        .replaceAll('{{adTitle}}', reducedDefaultTranslation(item.ad?.title))
        .replaceAll('{{adId}}', item.ad?._id)
        .replaceAll('{{discussionTitle}}', reducedDefaultTranslation(item.discussion?.title))
        .replaceAll('{{discussionId}}', item.discussion?._id)
        .replaceAll('{{tagId}}', item.tag?._id)
        .replaceAll('{{tagName}}', reducedDefaultTranslation(item.tag?.text))
      await app.service('mailer').create(
        JSON.parse(tmpBody)
      )
    }
  },
  async notifyNewMessages (app, type, action, item, userStatusContainers) {
    const statusContainers = await app.service('status-containers').find(
      {
        query: {
          _id: { $in: userStatusContainers.map(obj => obj._id) },
          $populate: [
            {
              path: 'user',
              select: {
                firstName: 1, lastName: 1, email: 1, status: 1
              },
              populate: [
                {
                  path: 'preferences'
                }
              ]
            }
          ]
        }
      }
    )
    for (const statusContainer of statusContainers) {
      if (
        !shouldSend(statusContainer.user, 'new' + type[0].toUpperCase() + type.substr(1)) ||
        statusContainer.unread.length > 1
      ) {
        continue
      }
      let tmpBody = JSON.parse(JSON.stringify(mailBodies[type][action]))
      tmpBody.html = tmpBody.html + '<br><br>' +
        locales.notificationSettingsNote1 + '<a href="' + process.env.CLIENT_URL + 'mitglieder/einstellungen/editor/' + statusContainer.user._id + '">' + locales.notificationSettingsNote2
      tmpBody = JSON.stringify(tmpBody)

      tmpBody = tmpBody
        .replaceAll('{{recipient}}', statusContainer.user.email)
        .replaceAll('{{firstName}}', statusContainer.user.firstName)
        .replaceAll('{{lastName}}', statusContainer.user.lastName)
        .replaceAll('{{chatId}}', item.chat)
        .replaceAll('{{discussionId}}', item.discussion)

      await app.service('mailer').create(
        JSON.parse(tmpBody)
      )
    }
  }
}

function shouldSend (user, action) {
  if (!user.preferences || !user.preferences[action] || user.preferences[action] === 'emailOffline') {
    if (user.status !== 'offline') {
      return false
    } else {
      return true
    }
  } else {
    if (user.preferences[action] === 'emailAlways') {
      return true
    } else {
      return false
    }
  }
}

const mailBodies = {
  newAdsToAccept: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.newAdForApproval,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkNewAdForApproval1 + '<a href="' + process.env.CLIENT_URL + 'admin/suchebiete/uebersicht">' + locales.checkNewAdForApproval2 +
        locales.bestRegards
    },
    patch: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.updatedAdForApproval,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkUpdatedAdForApproval1 + '<a href="' + process.env.CLIENT_URL + 'admin/suchebiete/uebersicht">' + locales.checkUpdatedAdForApproval2 +
        locales.bestRegards
    }
  },
  newAcceptedAds: {
    accepted: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.adApproved,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkApprovedAd1 + '<a href="' + process.env.CLIENT_URL + 'suchebiete/{{adId}}">{{adTitle}}</a>' + locales.checkApprovedAd2 +
        locales.bestRegards
    }
  },
  newGroupsToAccept: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.newInterestGroupForApproval,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkNewInterestGroupForApproval1 + '<a href="' + process.env.CLIENT_URL + 'admin/interessengruppen/uebersicht">' + locales.checkNewInterestGroupForApproval2 +
        locales.bestRegards
    },
    patch: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.updatedInterestGroupForApproval,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkupdatedInterestGroupForApproval1 + '<a href="' + process.env.CLIENT_URL + 'admin/interessengruppen/uebersicht">' + locales.checkupdatedInterestGroupForApproval2 +
        locales.bestRegards
    }
  },
  newAcceptedGroups: {
    accepted: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.interestGroupApproved,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkApprovedinterestGroup1 + '<a href="' + process.env.CLIENT_URL + 'interessengruppen/{{groupId}}">{{groupTitle}}</a>' + locales.checkApprovedinterestGroup2 +
        locales.bestRegards
    }
  },
  newDiscussionsToAccept: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.newDiscussionForApproval,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkNewDiscussionForApproval1 + '<a href="' + process.env.CLIENT_URL + 'admin/diskussionsthemen/uebersicht">' + locales.checkNewDiscussionForApproval2 +
        locales.bestRegards
    },
    patch: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.updatedDiscussionForApproval,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkupdatedDiscussionForApproval1 + '<a href="' + process.env.CLIENT_URL + 'admin/diskussionsthemen/uebersicht">' + locales.checkupdatedDiscussionForApproval2 +
        locales.bestRegards
    }
  },
  newAcceptedDiscussions: {
    accepted: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.discussionApproved,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkApprovedDiscussion1 + '<a href="' + process.env.CLIENT_URL + 'diskussionsforen/{{discussionId}}">{{discussionTitle}}</a>' + locales.checkApprovedDiscussion2 +
        locales.bestRegards
    }
  },
  newGroupDiscussionsToAccept: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.newGroupDiscussionForApproval,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
      locales.checkNewGroupDiscussionForApproval1 + '<a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">' + locales.checkNewGroupDiscussionForApproval2 +
      locales.bestRegards
    },
    patch: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.updatedGroupDiscussionForApproval,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
      locales.checkupdatedGroupDiscussionForApproval1 + '<a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">' + locales.checkupdatedGroupDiscussionForApproval2 +
      locales.bestRegards
    }
  },
  newAcceptedGroupDiscussions: {
    accepted: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.groupDiscussionApproved,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
      locales.checkApprovedGroupDiscussion1 + '<a href="' + process.env.CLIENT_URL + 'interessengruppen/{{groupId}}/gruppendiskussionen/{{discussionId}}">{{discussionTitle}}</a>' + locales.checkApprovedGroupDiscussion2 +
      locales.bestRegards
    }
  },
  newTagsToAccept: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.newTagForApproval,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkNewTagForApproval1 + '<a href="' + process.env.CLIENT_URL + 'admin/schlagwoerter/uebersicht">' + locales.checkNewTagForApproval2 +
        locales.bestRegards
    }
  },
  newChats: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.newChat,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkChat1 + '<a href="' + process.env.CLIENT_URL + 'chats">' + locales.checkChat2 +
        locales.bestRegards
    }
  },
  chatMessages: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.newChatMessage,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkChatMessage1 + '<a href="' + process.env.CLIENT_URL + 'chats/{{chatId}}">' + locales.checkChatMessage2 +
        locales.bestRegards
    }
  },
  discussionMessages: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Eine neuer Diskussionsforums-Beitrag',
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkDiscussionPost1 + '<a href="' + process.env.CLIENT_URL + 'diskussionsforen/{{discussionId}}">' + locales.checkDiscussionPost2 +
        locales.bestRegards
    }
  },
  newAcceptedGroupMemberships: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.newGroupMembership,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkGroupMembership1 + '<a href="' + process.env.CLIENT_URL + 'interessengruppen/{{groupId}}">' + locales.checkGroupMembership2 + '<a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">' + locales.checkGroupMembership3 +
        locales.bestRegards
    },
    patch: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.groupMembershipAccepted,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkAcceptedGroupMembership1 + ' <a href="' + process.env.CLIENT_URL + 'interessengruppen/{{groupId}}">' + locales.checkAcceptedGroupMembership2 + '<a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">' + locales.checkAcceptedGroupMembership3 +
        locales.bestRegards
    }
  },
  newAcceptedGroupInvitations: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.newGroupInvitation,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkGroupInvitation1 + ' <a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">' + locales.checkGroupInvitation2 +
        locales.bestRegards
    }
  },
  newGroupApplicants: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.newGroupMembershipApplication,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkGroupMembershipApplication1 + '<a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">' + locales.checkGroupMembershipApplication2 +
        locales.bestRegards
    }
  },
  newAcceptedGroupModeratorRoles: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.newModeratorRole,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkModeratorRole1 + '<a href="' + process.env.CLIENT_URL + 'interessengruppen/{{groupId}}">' + locales.checkModeratorRole2 + '<a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">' + locales.checkModeratorRole3 +
        locales.bestRegards
    }
  },
  newAdApplicants: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.newAdMessage,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkAdMessage1 + '<a href="' + process.env.CLIENT_URL + 'suchebiete/uebersicht">' + locales.checkAdMessage2 +
        locales.bestRegards
    }
  },
  newViolationsToProve: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.newViolation,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkNewViolation + '<a href="' + process.env.CLIENT_URL + 'admin/verstoesse/uebersicht">' + locales.checkNewViolationAdmin +
        locales.bestRegards
    }
  },
  newDiscussionViolationsToProve: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.newViolation,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkNewDiscussionViolation + '<a href="' + process.env.CLIENT_URL + 'admin/verstoesse/uebersicht">' + locales.checkNewViolationAdmin +
        locales.bestRegards
    }
  },
  newGroupViolationsToProve: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: locales.newGroupNotification,
      html: locales.hello + ' {{firstName}} {{lastName}}!<br><br>' +
        locales.checkGroupNotification1 + '<a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">' + locales.checkGroupNotification2 +
        locales.bestRegards
    }
  }
}

function reducedDefaultTranslation (item) {
  if (item) {
    if (Array.isArray(item)) {
      return item.find(t => t.type === 'default').value
    } else {
      return item
    }
  } else {
    return undefined
  }
}
