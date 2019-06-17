'use strict'

const {
  BadDataError
} = require('../errors')

exports.BadDataMixin = superclass => class extends superclass {
  badData (fn) {
    this.handlers[BadDataError.name] = fn
    return this
  }
}
