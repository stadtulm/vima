// Initializes the `mailer` service on path `/mailer`
const hooks = require('./mailer.hooks')
const Mailer = require('./mailer.service.class.js')

module.exports = function (app) {
  const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: 587,
    secureConnection: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      ciphers: 'SSLv3'
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 1
  }

  // Initialize our service with any options it requires
  app.use('/mailer', Mailer(smtpConfig))
  // Get our initialized service so that we can register hooks
  const service = app.service('mailer')
  service.hooks(hooks)
}
