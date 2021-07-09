import {
  NotFoundError
} from '../errors.js'

const NotFoundMixin = superclass => class NotFound extends superclass {
  notFound (fn) {
    this.handlers[NotFoundError.name] = fn
    return this
  }
}

export { NotFoundMixin }
