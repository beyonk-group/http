import {
  TooManyRequestsError
} from '../errors.js'

const TooManyRequestsMixin = superclass => class TooManyRequests extends superclass {
  tooManyRequests (fn) {
    this.handlers[TooManyRequestsError.name] = fn
    return this
  }
}

export { TooManyRequestsMixin }
