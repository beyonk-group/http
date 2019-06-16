'use strict'

const querystring = require('querystring')
const errorHandlers = require('../error-handlers')
const { byCode } = require('../errors')
const compose = require('just-compose')

class ApiBase {
  constructor (options) {
    this.options = options
    this.handlers = {}
    this.client = null

    this.config = {
      endpoint: null,
      method: 'get',
      payload: {},
      query: null
    }
  }

  getClient () {
    if (this.client) {
      return this.client
    } else if (typeof window !== 'undefined') {
      return window.fetch.bind(window)
    }
    
    throw Error("No client provided and can't find one automatically")
  }

  async send (overrides = {}) {
    const endpoint = this.config.endpoint.includes('://') ? url : `${this.options.baseUrl}/${this.config.endpoint}`

    const options = {
      method: this.config.method,
      cors: true,
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      },
      ...overrides,
      ...this.config.payload ? {
        body: JSON.stringify(this.config.payload),
        headers: {
          'Content-Type': 'application/json'
        }
      } : {}
    }

    let r
    try {
      const ep = this.config.query ? `${endpoint}?${this.config.query}` : `${endpoint}`
      const client = this.getClient()
      r = await client(ep, options)
    } catch (e) {
      throw new Error(e.message)
    }

    try {
      if (r.ok) {
        return await r.json()
      }
    } catch (e) {
      return undefined
    }

    const content = await r.text()
    const ClientError = byCode(r.status)
    this.handle(new ClientError(r.statusText, content))
  }

  transport (client) {
    this.client = client
    return this
  }

  async get (overrides) {
    this.config.method = 'get'
    return this.send(overrides)
  }

  async post (overrides) {
    this.config.method = 'post'
    return this.send(overrides)
  }

  async put (overrides) {
    this.config.method = 'put'
    return this.send(overrides)
  }

  async del (overrides) {
    this.config.method = 'delete'
    return this.send(overrides)
  }

  endpoint (endpoint) {
    this.config.endpoint = endpoint
    return this
  }

  query (query = {}) {
    this.config.query = querystring.stringify(query)
    return this
  }

  payload (payload = {}) {
    this.config.payload = payload
    return this
  }
}

exports.Api = compose(...Object.values(errorHandlers))(ApiBase)
