import {
  AccessDeniedError
} from '../errors.js'

const AccessDeniedMixin = superclass => class AccessDenied extends superclass {
  accessDenied (fn) {
    this.handlers[AccessDeniedError.name] = fn
    return this
  }
}

export { AccessDeniedMixin }
