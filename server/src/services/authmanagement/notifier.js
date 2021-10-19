const Errors = require('@feathersjs/errors')

module.exports = function (app) {
  function getLink (type, hash) {
    return process.env.CLIENT_URL + type + '/' + hash
  }

  async function sendEmail (email, retryCount) {
    try {
      await app.service('mailer').create(email)
    } catch (e) {
      if (!retryCount) {
        retryCount = 1
      } else {
        retryCount = retryCount + 1
      }
      if (retryCount <= 3) {
        app.logger.error('Error sending email retrying now (' + retryCount + '): ', e, JSON.stringify(email))
        await sendEmail(email, retryCount)
      } else {
        app.logger.error('Final error sending email: ', e, JSON.stringify(email))
        throw new Errors.Unprocessable('Error sending email')
      }
    }
  }

  return {
    notifier: async function (type, user, notifierOptions) {
      let tokenLink
      let email
      let role
      let greeting = ''
      let emailResult
      const roles = [
        { text: 'Mitglied', value: 'users' },
        { text: 'Partner', value: 'partners' },
        { text: 'Admin', value: 'admins' }
      ]
      switch (type) {
        case 'verifySubscriberSignup':
          tokenLink = getLink('bestaetigen', user._id + '/' + user.verifyToken)
          email = {
            from: process.env.FROM_EMAIL,
            to: user.email,
            subject: 'ViMA-Newsletter abonnieren',
            html: 'Hallo!<br><br>' +
            'Wir freuen uns dass Sie den ViMA-Newsletter erhalten möchten!<br>' +
            'Hierfür klicken Sie bitte nur noch auf den nachfolgenden Bestätigungs-Link:<br><br>' +
            '<a href="' + tokenLink + '">' + tokenLink + '</a><br><br>' +
            'Viele Grüße von Ihrem ViMA-Team!'
          }
          emailResult = await sendEmail(email)
          return emailResult

        case 'resendVerifySignup':
          tokenLink = getLink('verifizieren', user.verifyToken)
          email = {
            from: process.env.FROM_EMAIL,
            to: user.email,
            subject: 'ViMA-Profil beantragt',
            html: 'Hallo ' + user.firstName + ' ' + user.lastName + '!<br><br>' +
            'Sie möchten an ViMA teilhaben - wie schön!<br>' +
            'Um Ihre Registrierung abzuschließen, klicken Sie bitte auf den nachfolgenden Bestätigungs-Link. Danach können Sie sich mit Ihren Zugangsdaten anmelden<br><br>' +
            '<a href="' + tokenLink + '">' + tokenLink + '</a><br><br>' +
            'Viele Grüße von Ihrem ViMA-Team!'
          }
          emailResult = await sendEmail(email)
          return emailResult

        case 'resendVerifyInvitation':
          if (user.firstName) {
            greeting += ' ' + user.firstName
          }
          if (user.lastName) {
            greeting += ' ' + user.lastName
          }
          try {
            role = roles.find(obj => obj.value === user.role).text
          } catch (e) {
            app.logger.error(e)
            return
          }
          tokenLink = getLink('verifizieren', user.verifyToken)
          email = {
            from: process.env.FROM_EMAIL,
            to: user.email,
            subject: 'Zugang für ViMA erhalten',
            html: 'Hallo' + greeting + '!<br><br>' +
            'Sie wurden eingeladen als ' + role + ' an ViMA teilzuhaben.<br>' +
            'Bitte klicken Sie auf nachfolgenden Bestätigungslink um Ihre E-Mail-Adresse zu verifizieren und Ihr Profil zu aktivieren:' + '<br>' +
            '<a href="' + tokenLink + '">' + tokenLink + '</a><br><br>' +
            'Mit der Anmeldung akzeptieren Sie automatisch unsere <a href="' + process.env.CLIENT_URL + '/datenschutz">Datenschutzerklärung</a>. ' +
            'Bei Fragen dazu können Sie sich gerne jederzeit an uns wenden.<br><br>' +
            'Viele Grüße von Ihrem ViMA-Team!'
          }
          emailResult = await sendEmail(email)
          return emailResult

        case 'verifySignup':
          if (user.createdBy === 'signup') {
            email = {
              from: process.env.FROM_EMAIL,
              to: user.email,
              subject: 'Ihr ViMA-Profil ist nun bereit',
              html: 'Hallo ' + user.firstName + ' ' + user.lastName + '!<br><br>' +
            'Vielen Dank für die Bestätigung Ihrer E-Mail-Adresse. Sie können sich nun mit Ihren Zugangsdaten anmelden.<br><br>' +
            'Viele Grüße von Ihrem ViMA-Team!'
            }
            emailResult = await sendEmail(email)
            return emailResult
          } else {
            return
          }

        case 'sendResetPwd':
          if (notifierOptions?.isInvitationProcess) {
            app['_tmpuser_' + user._id] = user.resetToken
            return
          } else {
            tokenLink = getLink('vergessen', user.resetToken)
            email = {
              from: process.env.FROM_EMAIL,
              to: user.email,
              subject: 'ViMA-Passwort vergessen',
              html: 'Hallo ' + user.firstName + ' ' + user.lastName + '!<br><br>' +
            'Sie haben Ihr Passwort vergessen?<br>' +
            'Das macht nichts - klicken Sie einfach auf nachfolgenden Link um dort ein neues Passwort zu vergeben:<br><br>' +
            '<a href="' + tokenLink + '">' + tokenLink + '</a><br><br>' +
            'Viele Grüße von Ihrem ViMA-Team!'
            }
            emailResult = await sendEmail(email)
            return emailResult
          }

        case 'resetPwd':
          if (notifierOptions.isInvitationProcess) {
            return
          } else {
            email = {
              from: process.env.FROM_EMAIL,
              to: user.email,
              subject: 'ViMA-Passwort zurückgesetzt',
              html: 'Hallo ' + user.firstName + ' ' + user.lastName + '!<br><br>' +
            'Sie haben Ihr Passwort erfolgreich zurückgesetzt und können sich nun damit einloggen.<br><br>' +
            'Viele Grüße von Ihrem ViMA-Team!'
            }
            emailResult = await sendEmail(email)
            return emailResult
          }

        case 'passwordChange':
          email = {}
          emailResult = await sendEmail(email)
          return emailResult

        case 'identityChange':
          tokenLink = getLink('verifyChanges', user.verifyToken)
          email = {}
          emailResult = await sendEmail(email)
          return emailResult

        default:
          break
      }
    }
  }
}
