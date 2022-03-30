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
        { text: app.i18n.__({ phrase: 'member', locale: user.language || app.customSettings.defaultLanguage }), value: 'users' },
        { text: app.i18n.__({ phrase: 'partner', locale: user.language || app.customSettings.defaultLanguage }), value: 'partners' },
        { text: app.i18n.__({ phrase: 'admin', locale: user.language || app.customSettings.defaultLanguage }), value: 'admins' }
      ]
      switch (type) {
        case 'verifySubscriberSignup':
          tokenLink = getLink('bestaetigen', user._id + '/' + user.verifyToken)
          email = {
            from: process.env.FROM_EMAIL,
            to: user.email,
            subject: app.i18n.__({ phrase: 'subscribeToVimaNewsletter', locale: user.language || app.customSettings.defaultLanguage }),
            html: app.i18n.__({ phrase: 'confirmSubscription', locale: user.language || app.customSettings.defaultLanguage }) +
              '<a href="' + tokenLink + '">' + tokenLink + '</a><br><br>' +
              app.i18n.__({ phrase: 'bestRegards', locale: user.language || app.customSettings.defaultLanguage })
          }
          emailResult = await sendEmail(email)
          return emailResult

        case 'resendVerifySignup':
          tokenLink = getLink('verifizieren', user.verifyToken)
          email = {
            from: process.env.FROM_EMAIL,
            to: user.email,
            subject: app.i18n.__({ phrase: 'vimaProfileRequested', locale: user.language || app.customSettings.defaultLanguage }),
            html: app.i18n.__({ phrase: 'hello', locale: user.language || app.customSettings.defaultLanguage }) +
              ' ' + user.firstName + ' ' + user.lastName + '!<br><br>' +
              app.i18n.__({ phrase: 'confirmRegistration', locale: user.language || app.customSettings.defaultLanguage }) +
              '<a href="' + tokenLink + '">' + tokenLink + '</a><br><br>' +
              app.i18n.__({ phrase: 'bestRegards', locale: user.language || app.customSettings.defaultLanguage })
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
            subject: app.i18n.__({ phrase: 'getAccessToVima', locale: user.language || app.customSettings.defaultLanguage }),
            html: app.i18n.__({ phrase: 'hello', locale: user.language || app.customSettings.defaultLanguage }) +
              greeting + '!<br><br>' +
              app.i18n.__({ phrase: 'confirmInvitation1', locale: user.language || app.customSettings.defaultLanguage }) +
              role + app.i18n.__({ phrase: 'confirmInvitation2', locale: user.language || app.customSettings.defaultLanguage }) +
              '<a href="' + tokenLink + '">' + tokenLink + '</a><br><br>' +
              app.i18n.__({ phrase: 'privacyAcceptanceNote', locale: user.language || app.customSettings.defaultLanguage }) +
              '<a href="' + process.env.CLIENT_URL + '/datenschutz">' +
              app.i18n.__({ phrase: 'privacy', locale: user.language || app.customSettings.defaultLanguage }) + '</a>. ' +
              app.i18n.__({ phrase: 'contactForQuestion', locale: user.language || app.customSettings.defaultLanguage }) +
              app.i18n.__({ phrase: 'bestRegards', locale: user.language || app.customSettings.defaultLanguage })
          }
          emailResult = await sendEmail(email)
          return emailResult

        case 'verifySignup':
          if (user.createdBy === 'signup') {
            email = {
              from: process.env.FROM_EMAIL,
              to: user.email,
              subject: app.i18n.__({ phrase: 'vimaProfileIsReady', locale: user.language || app.customSettings.defaultLanguage }),
              html: app.i18n.__({ phrase: 'hello', locale: user.language || app.customSettings.defaultLanguage }) +
              ' ' + user.firstName + ' ' + user.lastName + '!<br><br>' +
              app.i18n.__({ phrase: 'readyToLogin', locale: user.language || app.customSettings.defaultLanguage }) +
              app.i18n.__({ phrase: 'bestRegards', locale: user.language || app.customSettings.defaultLanguage })
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
              subject: app.i18n.__({ phrase: 'forgotVimaPassword', locale: user.language || app.customSettings.defaultLanguage }),
              html: app.i18n.__({ phrase: 'hello', locale: user.language || app.customSettings.defaultLanguage }) +
                ' ' + user.firstName + ' ' + user.lastName + '!<br><br>' +
                app.i18n.__({ phrase: 'youForgotVimaPassword', locale: user.language || app.customSettings.defaultLanguage }) +
                '<a href="' + tokenLink + '">' + tokenLink + '</a><br><br>' +
                app.i18n.__({ phrase: 'bestRegards', locale: user.language || app.customSettings.defaultLanguage })
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
              subject: app.i18n.__({ phrase: 'vimaPasswordReset', locale: user.language || app.customSettings.defaultLanguage }),
              html: app.i18n.__({ phrase: 'hello', locale: user.language || app.customSettings.defaultLanguage }) +
                ' ' + user.firstName + ' ' + user.lastName + '!<br><br>' +
                app.i18n.__({ phrase: 'passwordSuccessfullyReset', locale: user.language || app.customSettings.defaultLanguage }) +
                app.i18n.__({ phrase: 'bestRegards', locale: user.language || app.customSettings.defaultLanguage })
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
