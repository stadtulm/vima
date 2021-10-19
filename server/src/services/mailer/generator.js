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
      item.tag.name = item.name
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
      item.discussion.title = item.title
      item.discussion._id = item._id
      if (
        type === 'newGroupDiscussionsToAccept' ||
        type === 'newAcceptedGroupDiscussions'
      ) {
        item.group = await app.service('groups').get(item.group)
      }
    } else if (type === 'newAdsToAccept' || type === 'newAcceptedAds') {
      item.ad = {}
      item.ad.title = item.title
      item.ad._id = item._id
    } else if (type === 'newGroupsToAccept' || type === 'newAcceptedGroups') {
      item.group = {}
      item.group.title = item.title
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
        '<p style="text-align: center; color: #666">Sie können in <a href="' + process.env.CLIENT_URL + 'mitglieder/einstellungen/editor/' + user._id + '">Ihren persönlichen Einstellungen</a> jederzeit festlegen welche E-Mail-Benachrichtigungen Sie erhalten möchten.</p>'
      tmpBody = JSON.stringify(tmpBody)
      if (!shouldSend(user, type)) {
        continue
      }
      tmpBody = tmpBody
        .replaceAll('{{recipient}}', user.email)
        .replaceAll('{{firstName}}', user.firstName)
        .replaceAll('{{lastName}}', user.lastName)
        .replaceAll('{{groupTitle}}', item.group?.title)
        .replaceAll('{{groupId}}', item.group?._id)
        .replaceAll('{{adTitle}}', item.ad?.title)
        .replaceAll('{{adId}}', item.ad?._id)
        .replaceAll('{{discussionTitle}}', item.discussion?.title)
        .replaceAll('{{discussionId}}', item.discussion?._id)
        .replaceAll('{{tagId}}', item.tag?._id)
        .replaceAll('{{tagName}}', item.tag?.name)
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
        '<p style="text-align: center; color: #666">Sie können in <a href="' + process.env.CLIENT_URL + 'mitglieder/einstellungen/editor/' + statusContainer.user._id + '">Ihren persönlichen Einstellungen</a> jederzeit festlegen welche E-Mail-Benachrichtigungen Sie erhalten möchten.</p>'
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
      subject: 'Ein neues Inserat wartet auf Freigabe',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Ein neues Inserat mit dem Titel "{{adTitle}}" wurde eingestellt.<br>' +
        'Um dieses zu sichten und anschließend evtl. freizugeben, rufen Sie bitte den <a href="' + process.env.CLIENT_URL + 'admin/suchebiete/uebersicht">Suche-Biete-Bereich in Ihren Admin-Funktionen</a> auf.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    },
    patch: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Ein bearbeitetes Inserat wartet auf Freigabe',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Das Inserat mit dem Titel "{{adTitle}}" wurde bearbeitet.<br>' +
        'Um dieses zu sichten und anschließend evtl. erneut freizugeben, rufen Sie bitte den <a href="' + process.env.CLIENT_URL + 'admin/suchebiete/uebersicht">Suche-Biete-Bereich in Ihren Admin-Funktionen</a> auf.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    }
  },
  newAcceptedAds: {
    accepted: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Ihr Inserat wurde freigegeben',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Ihr Inserat mit dem Titel "<a href="' + process.env.CLIENT_URL + 'suchebiete/{{adId}}">{{adTitle}}</a>" wurde freigegeben.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    }
  },
  newGroupsToAccept: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Eine neue Interessengruppe wartet auf Freigabe',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Eine neue Interessengruppe mit dem Titel "{{groupTitle}}" wurde eingestellt.<br>' +
        'Um diese zu sichten und anschließend evtl. freizugeben, rufen Sie bitte den <a href="' + process.env.CLIENT_URL + 'admin/interessengruppen/uebersicht">Interessengruppen-Bereich in Ihren Admin-Funktionen</a> auf.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    },
    patch: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Eine bearbeitete Interessengruppe wartet auf Freigabe',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Die Interessengruppe mit dem Titel "{{groupTitle}}" wurde bearbeitet.<br>' +
        'Um diese zu sichten und anschließend evtl. erneut freizugeben, rufen Sie bitte den <a href="' + process.env.CLIENT_URL + 'admin/interessengruppen/uebersicht">Interessengruppen-Bereich in Ihren Admin-Funktionen</a> auf.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    }
  },
  newAcceptedGroups: {
    accepted: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Ihre Interessengruppe wurde freigegeben',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Ihre Interessengruppe mit dem Titel "<a href="' + process.env.CLIENT_URL + 'interessengruppen/{{groupId}}">{{groupTitle}}</a>" wurde freigegeben.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    }
  },
  newDiscussionsToAccept: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Ein neues Diskussionsforum wartet auf Freigabe',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Ein neues Diskussionsforum mit dem Titel "{{discussionTitle}}" wurde eingestellt.<br>' +
        'Um dieses zu sichten und anschließend evtl. freizugeben, rufen Sie bitte den <a href="' + process.env.CLIENT_URL + 'admin/diskussionsthemen/uebersicht">Diskussionsthemen-Bereich in Ihren Admin-Funktionen</a> auf.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    },
    patch: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Ein bearbeitetes Diskussionsforum wartet auf Freigabe',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Das Diskussionsforum mit dem Titel "{{discussionTitle}}" wurde bearbeitet.<br>' +
        'Um dieses zu sichten und anschließend evtl. erneut freizugeben, rufen Sie bitte den <a href="' + process.env.CLIENT_URL + 'admin/diskussionsthemen/uebersicht">Diskussionsthemen-Bereich in Ihren Admin-Funktionen</a> auf.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    }
  },
  newAcceptedDiscussions: {
    accepted: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Ihr Diskussionsforum wurde freigegeben',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Ihr Diskussionsforum mit dem Titel "<a href="' + process.env.CLIENT_URL + 'diskussionsforen/{{discussionId}}">{{discussionTitle}}</a>" wurde freigegeben.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    }
  },
  newGroupDiscussionsToAccept: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Eine neue Gruppendiskussion wartet auf Freigabe',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
      'In der Gruppe "{{groupTitle}}" wurde eine neue Gruppendiskussion mit dem Titel "{{discussionTitle}}" eingestellt.<br>' +
      'Um diese zu sichten und anschließend evtl. freizugeben, rufen Sie bitte die <a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">Gruppendiskussionen in Ihrem Interessengruppen-Bereich</a> auf.<br><br>' +
      'Viele Grüße von Ihrem ViMA-Team!'
    },
    patch: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Eine bearbeitete Gruppendiskussion wartet auf Freigabe',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
      'Die Gruppendiskussion mit dem Titel "{{discussionTitle}}" in der Interessengruppe "{{groupTitle}}" wurde bearbeitet.<br>' +
      'Um diese zu sichten und anschließend evtl. erneut freizugeben, rufen Sie bitte die <a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">Gruppendiskussionen in Ihrem Interessengruppen-Bereich</a> auf.<br><br>' +
      'Viele Grüße von Ihrem ViMA-Team!'
    }
  },
  newAcceptedGroupDiscussions: {
    accepted: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Ihre Gruppendiskussion wurde freigegeben',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
      'Ihre Gruppendiskussion mit dem Titel "<a href="' + process.env.CLIENT_URL + 'interessengruppen/{{groupId}}/gruppendiskussionen/{{discussionId}}">{{discussionTitle}}</a>" in der Gruppe "{{groupTitle}}" wurde freigegeben.<br><br>' +
      'Viele Grüße von Ihrem ViMA-Team!'
    }
  },
  newTagsToAccept: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Eine neues Schlagwort wartet auf Freigabe',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Ein Vorschlag für ein neues Schlagwort ("{{tagName}}") wurde eingereicht.<br>' +
        'Um dieses zu sichten und anschließend evtl. freizugeben, rufen Sie bitte den <a href="' + process.env.CLIENT_URL + 'admin/schlagwoerter/uebersicht">Schlagwörter-Bereich in Ihren Admin-Funktionen</a> auf.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    }
  },
  newChats: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Ein neuer Chat',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Eine Person hat auf ViMA einen neuen Chat mit Ihnen begonnen.<br>' +
        'Um diesen anzusehen, rufen Sie bitte Ihren <a href="' + process.env.CLIENT_URL + 'chats">Chat-Bereich</a> auf.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    }
  },
  chatMessages: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Eine neue Chatnachricht',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Sie haben eine neue Chatnachricht erhalten.<br>' +
        'Um diese anzusehen, rufen Sie bitte den <a href="' + process.env.CLIENT_URL + 'chats/{{chatId}}">Chat</a> auf.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    }
  },
  discussionMessages: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Eine neuer Diskussionsforums-Beitrag',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Es wurde ein neuer Beitrag zu einem Ihrer abonnierten Diskusionsthemen eingestellt.<br>' +
        'Um dieses anzusehen, rufen Sie bitte die <a href="' + process.env.CLIENT_URL + 'diskussionsforen/{{discussionId}}">Diskussion</a> auf.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    }
  },
  newAcceptedGroupMemberships: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Neue Gruppenmitgliedschaft',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Sie wurden zur Gruppe "{{groupTitle}}" hinzugefügt.<br>' +
        'Um diese anzusehen, rufen Sie bitte die <a href="' + process.env.CLIENT_URL + 'interessengruppen/{{groupId}}">Gruppe</a> oder Ihren <a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">Interessengruppen-Bereich</a> auf.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    },
    patch: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Gruppenmitgliedschaft angenommen',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Ihrer Mitgliedschaftsanfrage für die Gruppe "{{groupTitle}}" wurde statt gegeben.<br>' +
        'Um diese anzusehen, rufen Sie bitte die <a href="' + process.env.CLIENT_URL + 'interessengruppen/{{groupId}}">Gruppe</a> oder Ihren <a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">Interessengruppen-Bereich</a> auf.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    }
  },
  newAcceptedGroupInvitations: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Neue Gruppeneinladung',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Sie wurden zur Gruppe "{{groupTitle}}" eingeladen.<br>' +
        'Um die Einladung anzunehmen oder abzulehnen, rufen Sie bitte Ihren <a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">Interessengruppen-Bereich</a> auf.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    }
  },
  newGroupApplicants: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Neue Gruppenmitgliedschaft beantragt',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Es wurde eine neue Mitgliedschaft für die Gruppe "{{groupTitle}}" beantragt.<br>' +
        'Um die Anfrage anzusehen, und evtl. zu bestätigen rufen Sie bitte Ihren <a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">Interessengruppen-Bereich</a> auf.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    }
  },
  newAcceptedGroupModeratorRoles: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Neue Moderatorenrolle',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Sie wurden für die Gruppe "{{groupTitle}}" zum Moderator ernannt.<br>' +
        'Um die Gruppe anzusehen, rufen Sie bitte die <a href="' + process.env.CLIENT_URL + 'interessengruppen/{{groupId}}">Gruppe</a> oder Ihren <a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">Interessengruppen-Bereich</a> auf.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    }
  },
  newAdApplicants: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Eine neue Nachricht zu Ihrem Inserat',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Es gibt eine neue Nachricht zu Ihrem Inserat "{{adTitle}}"<br>' +
        'Um die Nachricht anzusehen, rufen Sie bitte Ihren <a href="' + process.env.CLIENT_URL + 'suchebiete/uebersicht">Suche-Biete-Bereich</a> auf.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    }
  },
  newViolationsToProve: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Ein neu gemelderter Verstoß',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Es gibt einen neuen Verstoß.<br>' +
        'Um die diese anzusehen, rufen Sie bitte die <a href="' + process.env.CLIENT_URL + 'admin/verstoesse/uebersicht">Verstöße in Ihrem Admin-Bereich</a> auf.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    }
  },
  newDiscussionViolationsToProve: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Ein neue gemeldeter Verstoß',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Es gibt einen neuen Verstoß in der Diskussion "{{discussionTitle}}".<br>' +
        'Um die diese anzusehen, rufen Sie bitte die <a href="' + process.env.CLIENT_URL + 'admin/verstoesse/uebersicht">Verstöße in Ihrem Admin-Bereich</a> auf.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    }
  },
  newGroupViolationsToProve: {
    create: {
      from: process.env.FROM_EMAIL,
      to: '{{recipient}}',
      subject: 'Eine neue Meldung in Ihrer Gruppe',
      html: 'Hallo {{firstName}} {{lastName}}!<br><br>' +
        'Es gibt eine neue Meldung in der Gruppendiskussion "{{discussionTitle}}" Ihrer Gruppe "{{groupTitle}}".<br>' +
        'Um diese anzusehen, rufen Sie bitte die Ihren <a href="' + process.env.CLIENT_URL + 'interessengruppen/uebersicht">Interessengruppen-Bereich</a> auf.<br><br>' +
        'Viele Grüße von Ihrem ViMA-Team!'
    }
  }
}
