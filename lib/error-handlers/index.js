'use strict'

const { AccessDeniedMixin } = require('./access-denied')
const { ConflictMixin } = require('./conflict')
const { DefaultMixin } = require('./default')
const { ForbiddenMixin } = require('./forbidden')
const { HandleMixin } = require('./handle')
const { NotFoundMixin } = require('./not-found')
const { BadDataMixin } = require('./bad-data')
const { PreconditionFailedMixin } = require('./precondition-failed')
const { TooManyRequestsMixin } = require('./too-many-requests')
const { NotAcceptableMixin } = require('./not-acceptable')
const { GoneMixin } = require('./gone')

module.exports = {
  AccessDeniedMixin,
  ConflictMixin,
  DefaultMixin,
  ForbiddenMixin,
  HandleMixin,
  NotFoundMixin,
  BadDataMixin,
  PreconditionFailedMixin,
  TooManyRequestsMixin,
  NotAcceptableMixin,
  GoneMixin
}
