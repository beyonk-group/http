'use strict'

const {
  TooManyRequestsError
} = require('../errors')

exports.TooManyRequestsMixin = superclass => class extends superclass {
  tooManyRequests (fn) {
    this.handlers[TooManyRequestsError.name] = fn
    return this
  }
}
