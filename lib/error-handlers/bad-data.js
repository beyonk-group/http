import {
  BadDataError
} from '../errors.js'

const BadDataMixin = superclass => class BadData extends superclass {
  badData (fn) {
    this.handlers[BadDataError.name] = fn
    return this
  }
}

export { BadDataMixin }
