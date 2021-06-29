'use strict'

const pino = require('pino')

/**
 * @param {ApplicationConfig} config
 */
module.exports = (config) => {
  return pino({
    level: config.LOG_LEVEL
  })
}
