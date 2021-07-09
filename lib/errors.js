class HttpError extends Error {
  constructor (message, body) {
    super(message)
    this.body = body
  }
}

class AccessDeniedError extends HttpError {
}

class PaymentRequiredError extends HttpError {
}

class ForbiddenError extends HttpError {
}

class NotFoundError extends HttpError {
}

class ConflictError extends HttpError {
}

class PreconditionFailedError extends HttpError {
}

class BadDataError extends HttpError {
}

class NotAcceptableError extends HttpError {
}

class GoneError extends HttpError {
}

class TooManyRequestsError extends HttpError {
}

const mapping = {
  401: AccessDeniedError,
  402: PaymentRequiredError,
  403: ForbiddenError,
  404: NotFoundError,
  406: NotAcceptableError,
  409: ConflictError,
  410: GoneError,
  412: PreconditionFailedError,
  422: BadDataError,
  429: TooManyRequestsError
}

function byCode (code) {
  return mapping[code] || HttpError
}

export {
  byCode,
  AccessDeniedError,
  PaymentRequiredError,
  ForbiddenError,
  NotFoundError,
  NotAcceptableError,
  HttpError,
  GoneError,
  ConflictError,
  PreconditionFailedError,
  BadDataError,
  TooManyRequestsError
}
