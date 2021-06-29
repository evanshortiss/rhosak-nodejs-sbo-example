'use strict'

const config = require('./config')(process.env)
const { PORT } = config
const log = require('./log')(config)
const getKafkaProducer = require('./kafka')
const createHttpServer = require('./server')

getKafkaProducer(log)
  .then((producer) => startServer(producer))
  .then(() => log.info(`server listening on port ${PORT}`))
  .catch((e) => initErrorHandler(e))

/**
 * @param {import('kafkajs').Producer} producer
 */
function startServer (producer) {
  return new Promise((resolve) => {
    const server = createHttpServer(log, producer)

    server.listen(PORT, () => resolve())
  })
}

function initErrorHandler (e) {
  log.error('error during application initialisation')
  log.error(e)
  process.exit(1)
}
