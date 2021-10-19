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
        type: 'users'
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
      type: 'subscribers'
    }
  })
  return [...new Set(subscribers.concat(users))]
}

exports.sendNewsletter = async function sendNewsletter (app, allRecipients, reference, alreadySent) {
  if (alreadySent) {
    allRecipients = allRecipients.filter(obj => !alreadySent.map(item => item.email).includes(obj.email))
  }
  const newsToSend = await app.service('news').get(reference)
  let newsText = newsToSend.text

  for (let i = 0; i < newsToSend.pics.length; i++) {
    newsText = newsText.replaceAll(
      '{' + (i + 1) + '}',
      '<p style="background-color:#eee; text-align:center"><img height="350" style="display:block; margin:auto" src="' + process.env.S3_LINK + newsToSend.pics[i].url + '"><div style="font-style: italic; text-align: center; color: #666">Bild von ' + newsToSend.pics[i].credit + '</div></p>'
    )
  }

  const sent = []
  const error = []

  for (const recipient of allRecipients) {
    try {
      await app.service('mailer').create(
        {
          from: process.env.FROM_EMAIL,
          to: recipient.email,
          subject: newsToSend.title,
          html:
            '<h1>' + newsToSend.title + '</h1>' +
            (newsToSend.subTitle ? '<h2>' + newsToSend.subTitle + '</h2>' : '') +
            '<div>' + newsText + '</div>' +
            '<p style="text-align: center; color: #666">Um keine Newsletter mehr zu erhalten, klicken Sie bitte <a href="' + process.env.CLIENT_URL + 'austragen/' + recipient.id + '">hier</a>.</p>'
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
  return {
    sent,
    error
  }
}
