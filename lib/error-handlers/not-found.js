'use strict'

const {
  NotFoundError
} = require('../errors')

exports.NotFoundMixin = superclass => class extends superclass {
  notFound (fn) {
    this.handlers[NotFoundError.name] = fn
    return this
  }
}
