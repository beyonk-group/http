'use strict'

const {
  PreconditionFailedError
} = require('../errors')

exports.PreconditionFailedMixin = superclass => class extends superclass {
  preconditionFailed (fn) {
    this.handlers[PreconditionFailedError.name] = fn
    return this
  }
}
