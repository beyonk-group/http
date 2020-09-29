'use strict'

const {
  ConflictError
} = require('../errors')

exports.ConflictMixin = superclass => class extends superclass {
  conflict (fn) {
    this.handlers[ConflictError.name] = fn
    return this
  }
}
