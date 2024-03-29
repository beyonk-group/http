import {
  ForbiddenError
} from '../errors.js'

const ForbiddenMixin = superclass => class Forbidden extends superclass {
  forbidden (fn) {
    this.handlers[ForbiddenError.name] = fn
    return this
  }
}

export { ForbiddenMixin }
