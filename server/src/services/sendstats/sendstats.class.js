const { Service } = require('feathers-mongoose')

exports.Sendstats = class Sendstats extends Service {

}

exports.getRecipients = async function getRecipients (app) {
  let users = await app.service('users').find(
    {
      paginate: false,
      query: {
        role: { $ne: 'deleted' },
        isActive: true,
        $populate: [
          {
            path: 'preferences'
          }
        ]
      }
    }
  )
  users = users
    .filter(obj => obj.preferences && obj.preferences.receiveNewsletter)
    .map(obj => {
      return {
        id: obj._id,
        email: obj.email,
        type: 'users',
        language: obj.language || app.customSettings.defaultLanguage
      }
    })
  let subscribers = await app.service('subscribers').find(
    {
      query: {
        isVerified: true
      }
    }
  )
  subscribers = subscribers.map(obj => {
    return {
      id: obj._id,
      email: obj.email,
      type: 'subscribers',
      language: obj.language || app.customSettings.defaultLanguage
    }
  })
  return [...new Set(subscribers.concat(users))]
}

exports.sendNewsletter = async function sendNewsletter (app, allRecipients, reference, alreadySent) {
  if (alreadySent) {
    allRecipients = allRecipients.filter(obj => !alreadySent.map(item => item.email).includes(obj.email))
  }
  const newsToSend = await app.service('news').get(reference)
  // Sort recipients
  const sortedRecipients = {}

  for (const recipient of allRecipients) {
    if (sortedRecipients[recipient.language]) {
      sortedRecipients[recipient.language].push(recipient)
    } else {
      sortedRecipients[recipient.language] = [recipient]
    }
  }

  const sent = []
  const error = []

  for (const languageKey of Object.keys(sortedRecipients)) {
    const tmpTitle = newsToSend.title.find(t => t.lang === languageKey) || newsToSend.title.find(t => t.type === 'default')
    const tmpSubTitle = newsToSend.subTitle.find(t => t.lang === languageKey) || newsToSend.subTitle.find(t => t.type === 'default')
    const newsText = newsToSend.text.find(t => t.lang === languageKey) || newsToSend.text.find(t => t.type === 'default')
    for (let i = 0; i < newsToSend.pics.length; i++) {
      newsText.value = newsText.value.replaceAll(
        '{' + (i + 1) + '}',
        '<p style="background-color:#eee; text-align:center"><img height="350" style="display:block; margin:auto" src="' + process.env.S3_LINK + newsToSend.pics[i].url + '"><div style="font-style: italic; text-align: center; color: #666">© ' + newsToSend.pics[i].credit + '</div></p>'
      )
    }

    for (const recipient of sortedRecipients[languageKey]) {
      try {
        await app.service('mailer').create(
          {
            from: process.env.FROM_EMAIL,
            to: recipient.email,
            subject: tmpTitle.value,
            html:
              '<h1>' + tmpTitle.value + '</h1>' +
              (tmpSubTitle.value ? '<h2>' + tmpSubTitle.value + '</h2>' : '') +
              '<div>' + newsText.value + '</div>' +
              app.i18n.__({ phrase: 'unsubscribeNewsletterNote1', locale: languageKey }) +
              '<a href="' + process.env.CLIENT_URL + 'austragen/' + recipient.id + '">' +
              app.i18n.__({ phrase: 'unsubscribeNewsletterNote2', locale: languageKey })
          }
        )
        sent.push(
          {
            ...recipient,
            dt: new Date()
          }
        )
      } catch (e) {
        error.push(
          {
            ...recipient,
            dt: new Date(),
            message: e.message
          }
        )
      }
    }
  }
  return {
    sent,
    error
  }
}
