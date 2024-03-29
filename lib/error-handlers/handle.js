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

const HandleMixin = superclass => class Handle extends superclass {
  get fallbackHandler () {
    return this.defaultHandler || function (e) {
      console.error(getConstructorName(e), e.message, e)
    }
  }

  handle (e, ctx) {
    return findHandlerInReallyUglyWay(this.handlers, this.options.handlers, this.fallbackHandler, e)(e, ctx)
  }
}

export { HandleMixin }
