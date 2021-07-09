import {
  NotAcceptableError
} from '../errors/index.js'

const NotAcceptableMixin = superclass => class NotAcceptable extends superclass {
  notAcceptable (fn) {
    this.handlers[NotAcceptableError.name] = fn
    return this
  }
}

export { NotAcceptableMixin }
