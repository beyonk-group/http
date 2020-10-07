'use strict'

const {
  GoneError
} = require('../errors')

exports.GoneMixin = superclass => class extends superclass {
  gone (fn) {
    this.handlers[GoneError.name] = fn
    return this
  }
}
