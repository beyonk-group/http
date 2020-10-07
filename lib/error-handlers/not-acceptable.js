'use strict'

const {
  NotAcceptableError
} = require('../errors')

exports.NotAcceptableMixin = superclass => class extends superclass {
  notAcceptable (fn) {
    this.handlers[NotAcceptableError.name] = fn
    return this
  }
}
