'use strict'

function getConstructorName (c) {
  return Object.getPrototypeOf(c).constructor.name
}

function findHandlerInReallyUglyWay (localHandlers, globalHandlers, fallbackHandler, e) {
  const constructorName = getConstructorName(e)
  const globalHandlerName = `${constructorName[0].toLowerCase()}${constructorName.slice(1, -5)}`
  return localHandlers[constructorName] ||
    globalHandlers[globalHandlerName] ||
    fallbackHandler
}

exports.HandleMixin = superclass => class extends superclass {
  get fallbackHandler () {
    return this.defaultHandler || function (e) {
      console.error(getConstructorName(e), e.message, e)
    }
  }

  handle (e) {
    return findHandlerInReallyUglyWay(this.handlers, this.options.handlers, this.fallbackHandler, e)(e)
  }
}
