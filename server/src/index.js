const app = require('./app')

app.listen(app.get('port')).then(() => {
  app.logger.info(`Feathers application started on http://${app.get('host')}:${app.get('port')}`)
})

process.on('unhandledRejection', (reason, p) =>
  app.logger.error(`Unhandled Rejection at: Promise ${p.toString()}, ${reason}`)
)
