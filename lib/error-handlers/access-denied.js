'use strict'

const {
  AccessDeniedError
} = require('../errors')

exports.AccessDeniedMixin = superclass => class extends superclass {
  accessDenied (fn) {
    this.handlers[AccessDeniedError.name] = fn
    return this
  }
}
