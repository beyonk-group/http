import {
  PreconditionFailedError
} from '../errors/index.js'

const PreconditionFailedMixin = superclass => class PreconditionFailed extends superclass {
  preconditionFailed (fn) {
    this.handlers[PreconditionFailedError.name] = fn
    return this
  }
}

export { PreconditionFailedMixin }
