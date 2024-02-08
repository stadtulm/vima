const Proto = require('uberproto')
const Mailer = require('nodemailer')
const debug = require('debug')('feathers-mailer')

class Service {
  constructor (transport, defaults) {
    debug('constructor', transport)

    if (!transport) {
      throw new Error('feathers-mailer: constructor `transport` must be provided')
    }

    this.transporter = Mailer.createTransport(transport, defaults)
  }

  extend (obj) {
    return Proto.extend(obj, this)
  }

  async create (body, params, cb) {
    debug('create', body, params)
    /*
    return await this.transporter.sendMail({
      ...body
    })
    */
    console.log(body)
  }
}

module.exports = function init (transport, defaults) {
  return new Service(transport, defaults)
}

module.exports.Service = Service
