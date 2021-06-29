'use strict'

const { from } = require('env-var')

/**
 * @param {NodeJS.ProcessEnv} env
 * @returns {ApplicationConfig}
 */
module.exports = (env) => {
  const { get } = from(env)

  return {
    PORT: get('PORT').default(8080).asPortNumber(),
    LOG_LEVEL: get('LOG_LEVEL').default('debug').asEnum(['debug', 'info', 'warn']),
    SERVICE_BINDING_ROOT: get('SERVICE_BINDING_ROOT').required().asString()
  }
}
