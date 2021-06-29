'use strict'

const express = require('express')
const { nanoid } = require('nanoid')
const { urlencoded } = require('body-parser')
const { readFileSync } = require('fs')
const { Joi, celebrate, Segments, errors } = require('celebrate')
const { join } = require('path')

const colors = {
  banana: 'yellow',
  mint: 'green',
  strawberry: 'red'
}
const schema = Joi.object().keys({
  email: Joi.string().email().required(),
  product: Joi.string().allow('banana', 'mint', 'strawberry'),
  quantity: Joi.number().integer().positive().required()
}).required()

/**
 * @param {import('pino').Logger} log
 * @param {import('kafkajs').Producer} producer
 */
module.exports = (log, producer) => {
  const app = express()
  const validate = celebrate(
    { [Segments.BODY]: schema },
    { allowUnknown: false, abortEarly: false }
  )

  // Serve static assets from "static" folder
  app.use(express.static(join(__dirname, '../static')))

  // Expose a POST /order endpoint
  app.post('/order', [urlencoded({ extended: true }), validate], async (req, res, next) => {
    const { email } = req.body
    const orderId = nanoid()

    try {
      const key = email
      const value = JSON.stringify({ ...req.body, orderId })

      log.info(`producing order "${key}" to kafka: %j`, value)
      await producer.send({
        topic: 'orders',
        messages: [
          {
            key,
            value
          }
        ]
      })


      // Return a rendered HTML page with the order ID
      res.end(
        readFileSync(join(__dirname, './success.html')).toString()
          .replace('{{orderId}}', orderId)
          .replace('{{color}}', colors[req.body.product]
        )
      )
    } catch (e) {
      // Pass the error to the application error handler
      next(e)
    }
  })

  // Fallthrough handler for any errors generated. Note that this could return
  // stacktraces, and should be handled appropriately in production!
  app.use(errors())

  return app
}
