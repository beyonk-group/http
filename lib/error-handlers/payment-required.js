import {
  PaymentRequiredError
} from '../errors.js'

const PaymentRequiredMixin = superclass => class PaymentRequired extends superclass {
  paymentRequired (fn) {
    this.handlers[PaymentRequiredError.name] = fn
    return this
  }
}

export { PaymentRequiredMixin }
