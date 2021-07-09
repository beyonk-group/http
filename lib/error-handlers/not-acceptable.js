import {
  NotAcceptableError
} from '../errors.js'

const NotAcceptableMixin = superclass => class NotAcceptable extends superclass {
  notAcceptable (fn) {
    this.handlers[NotAcceptableError.name] = fn
    return this
  }
}

export { NotAcceptableMixin }
