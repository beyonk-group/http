import {
  ConflictError
} from '../errors/index.js'

const ConflictMixin = superclass => class Conflict extends superclass {
  conflict (fn) {
    this.handlers[ConflictError.name] = fn
    return this
  }
}

export { ConflictMixin }
