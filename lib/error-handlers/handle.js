'use strict'

function getConstructorName (c) {
  return Object.getPrototypeOf(c).constructor.name
}

exports.HandleMixin = superclass => class extends superclass {
  static getDefaultHandler () {
    return function (e) {
      console.error(getConstructorName(e), e.message, e)
    }
  }

  handle (e) {
    const handler = this.handlers[getConstructorName(e)] || this.defaultHandler
    handler(e)
  }
}
