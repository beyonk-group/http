import { Api } from './api/index.js'
import * as errors from './errors.js'

let config

function configure (options) {
  config = options
}

function create () {
  if (!config) { throw new Error('Api client must be configured') }
  return new Api(config)
}

export default {
  configure,
  create,
  errors
}
