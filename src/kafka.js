'use strict'

const { Kafka } = require('kafkajs')
const { getBinding } = require('kube-service-bindings')

/**
 * @param {import('pino').Logger} log
 */
module.exports = async (log) => {
  log.info('obtaining kafka connection information from service binding')
  const cfg = getBinding('KAFKA', 'kafkajs')

  log.debug('connecting to kafka using config: %j', cfg)

  log.info('creating kafka producer')
  const kafka = new Kafka(cfg)
  const producer = kafka.producer()

  await producer.connect()

  return producer
}
