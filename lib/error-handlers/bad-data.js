import {
  BadDataError
} from '../errors/index.js'

const BadDataMixin = superclass => class BadData extends superclass {
  badData (fn) {
    this.handlers[BadDataError.name] = fn
    return this
  }
}

export { BadDataMixin }
