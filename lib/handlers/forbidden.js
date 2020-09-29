'use strict'

const {
  ForbiddenError
} = require('../errors')

exports.ForbiddenMixin = superclass => class extends superclass {
  forbidden (fn) {
    this.handlers[ForbiddenError.name] = fn
    return this
  }
}
