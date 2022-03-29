const locales = require('../../locales/de.json')
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
        { text: locales.member, value: 'users' },
        { text: locales.partner, value: 'partners' },
        { text: locales.admin, value: 'admins' }
      ]
      switch (type) {
        case 'verifySubscriberSignup':
          tokenLink = getLink('bestaetigen', user._id + '/' + user.verifyToken)
          email = {
            from: process.env.FROM_EMAIL,
            to: user.email,
            subject: locales.subscribeToVimaNewsletter,
            html: locales.confirmSubscription +
            '<a href="' + tokenLink + '">' + tokenLink + '</a><br><br>' +
            locales.bestRegards
          }
          emailResult = await sendEmail(email)
          return emailResult

        case 'resendVerifySignup':
          tokenLink = getLink('verifizieren', user.verifyToken)
          email = {
            from: process.env.FROM_EMAIL,
            to: user.email,
            subject: locales.vimaProfileRequested,
            html: locales.hello + ' ' + user.firstName + ' ' + user.lastName + '!<br><br>' +
            locales.confirmRegistration +
            '<a href="' + tokenLink + '">' + tokenLink + '</a><br><br>' +
            locales.bestRegards
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
            subject: locales.getAccessToVima,
            html: locales.hello + greeting + '!<br><br>' +
            locales.confirmInvitation1 + role + locales.confirmInvitation2 +
            '<a href="' + tokenLink + '">' + tokenLink + '</a><br><br>' +
            locales.privacyAcceptanceNote + '<a href="' + process.env.CLIENT_URL + '/datenschutz">' + locales.privacy + '</a>. ' +
            locales.contactForQuestion +
            locales.bestRegards
          }
          emailResult = await sendEmail(email)
          return emailResult

        case 'verifySignup':
          if (user.createdBy === 'signup') {
            email = {
              from: process.env.FROM_EMAIL,
              to: user.email,
              subject: locales.vimaProfileIsReady,
              html: locales.hello + ' ' + user.firstName + ' ' + user.lastName + '!<br><br>' +
              locales.readyToLogin +
              locales.bestRegards
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
              subject: locales.forgotVimaPassword,
              html: locales.hello + ' ' + user.firstName + ' ' + user.lastName + '!<br><br>' +
              locales.youForgotVimaPassword +
              '<a href="' + tokenLink + '">' + tokenLink + '</a><br><br>' +
              locales.bestRegards
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
              subject: locales.vimaPasswordReset,
              html: locales.hello + ' ' + user.firstName + ' ' + user.lastName + '!<br><br>' +
              locales.passwordSuccessfullyReset +
              locales.bestRegards
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
