'use strict'

class HttpError extends Error {
  constructor (message, body) {
    super(message)
    this.body = body
  }
}

class AccessDeniedError extends HttpError {
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

const mapping = {
  401: AccessDeniedError,
  403: ForbiddenError,
  404: NotFoundError,
  409: ConflictError,
  412: PreconditionFailedError,
  422: BadDataError
}

function byCode (code) {
  return mapping[code] || HttpError
}

module.exports = {
  byCode,
  AccessDeniedError,
  ForbiddenError,
  NotFoundError,
  HttpError,
  ConflictError,
  PreconditionFailedError,
  BadDataError
}
