'use strict'

exports.DefaultMixin = superclass => class extends superclass {
  default (fn) {
    this.defaultHandler = fn
    return this
  }
}
