import {
  ExpectationFailedError
} from '../errors.js'

const ExpectationFailedMixin = superclass => class ExpectationFailed extends superclass {
  expectationFailed (fn) {
    this.handlers[ExpectationFailedError.name] = fn
    return this
  }
}

export { ExpectationFailedMixin }
