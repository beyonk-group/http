'use strict'

const {
  PaymentRequiredError
} = require('../errors')

exports.PaymentRequiredMixin = superclass => class extends superclass {
  paymentRequired (fn) {
    this.handlers[PaymentRequiredError.name] = fn
    return this
  }
}
