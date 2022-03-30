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
            firstName: 1, lastName: 1, email: 1, status: 1, language: 1
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
      let tmpBody = JSON.parse(JSON.stringify(returnMailBody(app, tmpMailBodyType, action, user.language || app.customSettings.defaultLanguage)))
      tmpBody.html = tmpBody.html + '<br><br>' +
        app.i18n.__({ phrase: 'notificationSettingsNote1', locale: user.language || app.customSettings.defaultLanguage }) +
        '<a href="' + process.env.CLIENT_URL + 'mitglieder/einstellungen/editor/' + user._id + '">' +
        app.i18n.__({ phrase: 'notificationSettingsNote2', locale: user.language || app.customSettings.defaultLanguage })
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
                firstName: 1, lastName: 1, email: 1, status: 1, language: 1
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
      let tmpBody = JSON.parse(JSON.stringify(returnMailBody(app, type, action, statusContainer.user.language || app.customSettings.defaultLanguage)))
      tmpBody.html = tmpBody.html + '<br><br>' +
        app.i18n.__({ phrase: 'notificationSettingsNote1', locale: statusContainer.user.language || app.customSettings.defaultLanguage }) +
        '<a href="' + process.env.CLIENT_URL + 'mitglieder/einstellungen/editor/' + statusContainer.user._id + '">' +
        app.i18n.__({ phrase: 'notificationSettingsNote2', locale: statusContainer.user.language || app.customSettings.defaultLanguage })
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

function returnMailBody (app, type, action, language) {
  const mailBodies = {
    newAdsToAccept: {
      create: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'newAdForApproval', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkNewAdForApproval1', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'admin/suchebiete/uebersicht">' +
          app.i18n.__({ phrase: 'checkNewAdForApproval2', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      },
      patch: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'updatedAdForApproval', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkUpdatedAdForApproval1', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'admin/suchebiete/uebersicht">' +
          app.i18n.__({ phrase: 'checkUpdatedAdForApproval2', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      }
    },
    newAcceptedAds: {
      accepted: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'adApproved', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkApprovedAd1', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'suchebiete/{{adId}}">{{adTitle}}</a>' +
          app.i18n.__({ phrase: 'checkApprovedAd2', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      }
    },
    newGroupsToAccept: {
      create: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'newInterestGroupForApproval', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkNewInterestGroupForApproval1', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'admin/interessengruppen/uebersicht">' +
          app.i18n.__({ phrase: 'checkNewInterestGroupForApproval2', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      },
      patch: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'updatedInterestGroupForApproval', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkupdatedInterestGroupForApproval1', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'admin/interessengruppen/uebersicht">' +
          app.i18n.__({ phrase: 'checkupdatedInterestGroupForApproval2', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      }
    },
    newAcceptedGroups: {
      accepted: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'interestGroupApproved', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkApprovedinterestGroup1', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'interessengruppen/{{groupId}}">{{groupTitle}}</a>' +
          app.i18n.__({ phrase: 'checkApprovedinterestGroup2', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      }
    },
    newDiscussionsToAccept: {
      create: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'newDiscussionForApproval', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkNewDiscussionForApproval1', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'admin/diskussionsthemen/uebersicht">' +
          app.i18n.__({ phrase: 'checkNewDiscussionForApproval2', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      },
      patch: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'updatedDiscussionForApproval', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkupdatedDiscussionForApproval1', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'admin/diskussionsthemen/uebersicht">' +
          app.i18n.__({ phrase: 'checkupdatedDiscussionForApproval2', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      }
    },
    newAcceptedDiscussions: {
      accepted: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'discussionApproved', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkApprovedDiscussion1', locale: language }) +
          '<a href="' + process.env.CLIENT_URL +
          'diskussionsforen/{{discussionId}}">{{discussionTitle}}</a>' +
          app.i18n.__({ phrase: 'checkApprovedDiscussion2', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      }
    },
    newGroupDiscussionsToAccept: {
      create: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'newGroupDiscussionForApproval', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkNewGroupDiscussionForApproval1', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">' +
          app.i18n.__({ phrase: 'checkNewGroupDiscussionForApproval2', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      },
      patch: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'updatedGroupDiscussionForApproval', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkupdatedGroupDiscussionForApproval1', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">' +
          app.i18n.__({ phrase: 'checkupdatedGroupDiscussionForApproval2', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      }
    },
    newAcceptedGroupDiscussions: {
      accepted: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'groupDiscussionApproved', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkApprovedGroupDiscussion1', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'interessengruppen/{{groupId}}/gruppendiskussionen/{{discussionId}}">{{discussionTitle}}</a>' +
          app.i18n.__({ phrase: 'checkApprovedGroupDiscussion2', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      }
    },
    newTagsToAccept: {
      create: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'newTagForApproval', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkNewTagForApproval1', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'admin/schlagwoerter/uebersicht">' +
          app.i18n.__({ phrase: 'checkNewTagForApproval2', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      }
    },
    newChats: {
      create: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'newChat', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkChat1', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'chats">' +
          app.i18n.__({ phrase: 'checkChat2', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      }
    },
    chatMessages: {
      create: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'newChatMessage', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkChatMessage1', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'chats/{{chatId}}">' +
          app.i18n.__({ phrase: 'checkChatMessage2', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      }
    },
    discussionMessages: {
      create: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: 'Eine neuer Diskussionsforums-Beitrag',
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkDiscussionPost1', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'diskussionsforen/{{discussionId}}">' +
          app.i18n.__({ phrase: 'checkDiscussionPost2', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      }
    },
    newAcceptedGroupMemberships: {
      create: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'newGroupMembership', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkGroupMembership1', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'interessengruppen/{{groupId}}">' +
          app.i18n.__({ phrase: 'checkGroupMembership2', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">' +
          app.i18n.__({ phrase: 'checkGroupMembership3', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      },
      patch: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'groupMembershipAccepted', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkAcceptedGroupMembership1', locale: language }) +
          ' <a href="' + process.env.CLIENT_URL + 'interessengruppen/{{groupId}}">' +
          app.i18n.__({ phrase: 'checkAcceptedGroupMembership2', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">' +
          app.i18n.__({ phrase: 'checkAcceptedGroupMembership3', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      }
    },
    newAcceptedGroupInvitations: {
      create: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'newGroupInvitation', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkGroupInvitation1', locale: language }) +
          ' <a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">' +
          app.i18n.__({ phrase: 'checkGroupInvitation2', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      }
    },
    newGroupApplicants: {
      create: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'newGroupMembershipApplication', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkGroupMembershipApplication1', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">' +
          app.i18n.__({ phrase: 'checkGroupMembershipApplication2', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      }
    },
    newAcceptedGroupModeratorRoles: {
      create: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'newModeratorRole', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkModeratorRole1', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'interessengruppen/{{groupId}}">' +
          app.i18n.__({ phrase: 'checkModeratorRole2', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">' +
          app.i18n.__({ phrase: 'checkModeratorRole3', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      }
    },
    newAdApplicants: {
      create: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'newAdMessage', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkAdMessage1', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'suchebiete/uebersicht">' +
          app.i18n.__({ phrase: 'checkAdMessage2', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      }
    },
    newViolationsToProve: {
      create: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'newViolation', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkNewViolation', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'admin/verstoesse/uebersicht">' +
          app.i18n.__({ phrase: 'checkNewViolationAdmin', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      }
    },
    newDiscussionViolationsToProve: {
      create: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'newViolation', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkNewDiscussionViolation', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'admin/verstoesse/uebersicht">' +
          app.i18n.__({ phrase: 'checkNewViolationAdmin', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      }
    },
    newGroupViolationsToProve: {
      create: {
        from: process.env.FROM_EMAIL,
        to: '{{recipient}}',
        subject: app.i18n.__({ phrase: 'newGroupNotification', locale: language }),
        html: app.i18n.__({ phrase: 'hello', locale: language }) +
          ' {{firstName}} {{lastName}}!<br><br>' +
          app.i18n.__({ phrase: 'checkGroupNotification1', locale: language }) +
          '<a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">' +
          app.i18n.__({ phrase: 'checkGroupNotification2', locale: language }) +
          app.i18n.__({ phrase: 'bestRegards', locale: language })
      }
    }
  }
  return mailBodies[type][action]
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
