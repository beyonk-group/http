'use strict'

const { AccessDeniedMixin } = require('./access-denied')
const { ConflictMixin } = require('./conflict')
const { DefaultMixin } = require('./default')
const { ForbiddenMixin } = require('./forbidden')
const { HandleMixin } = require('./handle')
const { NotFoundMixin } = require('./not-found')
const { PreconditionFailedMixin } = require('./precondition-failed')

module.exports = {
  AccessDeniedMixin,
  ConflictMixin,
  DefaultMixin,
  ForbiddenMixin,
  HandleMixin,
  NotFoundMixin,
  PreconditionFailedMixin
}
