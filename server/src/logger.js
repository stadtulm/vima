const { createLogger, format, transports } = require('winston')
const dotenv = require('dotenv')
const path = require('path')
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
const logger = createLogger({
  // To see more detailed errors, change this to 'debug'
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.printf((info) => {
      const timestamp = info.timestamp
      const level = info.level.toUpperCase()
      const message = (info.message || '')
      const args = info[Symbol.for('splat')]
      const strArgs = (args || []).join(' ')
      return `${timestamp} [${level}] ${message} ${strArgs}`
    })
  ),
  transports: [
    new transports.Console()
  ]
})

module.exports = logger
