'use strict'

function getConstructorName (c) {
  return Object.getPrototypeOf(c).constructor.name
}

exports.HandleMixin = superclass => class extends superclass {
  get fallbackHandler () {
    return this.defaultHandler || function (e) {
      console.error(getConstructorName(e), e.message, e)
    }
  }

  handle (e) {
    const handler = this.handlers[getConstructorName(e)] || this.fallbackHandler
    return handler(e)
  }
}
