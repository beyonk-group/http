'use strict'

const { Api } = require('./api')
const errors = require('./errors')

let config

function configure (options) {
  config = options
}

function create () {
  if (!config) { throw new Error('Api client must be configured') }
  return new Api(config)
}

module.exports = { configure, create, errors }
