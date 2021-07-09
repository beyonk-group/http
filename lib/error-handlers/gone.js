import {
  GoneError
} from '../errors.js'

const GoneMixin = superclass => class Gone extends superclass {
  gone (fn) {
    this.handlers[GoneError.name] = fn
    return this
  }
}

export { GoneMixin }
