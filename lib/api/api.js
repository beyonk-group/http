'use strict'

const errorHandlers = require('../error-handlers')
const { byCode } = require('../errors')
const compose = require('just-compose')

class ApiBase {
  constructor (options) {
    this.options = options
    this.handlers = {}
    this.client = null

    this.resetRequest()
  }

  resetRequest () {
    this.config = {
      endpoint: null,
      method: 'get',
      payload: null,
      query: null,
      overrides: {}
    }
  }

  getClient () {
    if (this.options.mock) {
      console.warn('@beyonk/sapper-httpclient: Using mocked http client')
      return this.options.mock
    }

    if (this.client) {
      return this.client
    } else if (typeof window !== 'undefined') {
      return window.fetch.bind(window)
    }
    
    throw Error("No client provided and can't find one automatically")
  }

  async send (fn) {
    const endpoint = this.config.endpoint.includes('://') ? this.config.endpoint : `${this.options.baseUrl}/${this.config.endpoint}`

    const options = {
      method: this.config.method,
      cors: true,
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      },
      ...this.config.overrides,
      ...this.config.payload ? {
        body: JSON.stringify(this.config.payload),
        headers: {
          'Content-Type': 'application/json'
        }
      } : {}
    }

    try {
      const ep = this.config.query ? `${endpoint}?${this.config.query}` : `${endpoint}`
      const client = this.getClient()
      const r = await client(ep, options)
      if (r.ok) {
        let json
        try {
          json = await r.json()
        } catch (e) {}

        return fn ? fn(json) : json
      }

      const content = await r.text()
      const ClientError = byCode(r.status)
      throw new ClientError(r.statusText, content)
    } catch (e) {
      return this.handle(e)
    } finally {
      this.resetRequest()
    }
  }

  transport (client) {
    this.client = client
    return this
  }

  override (override) {
    this.config.overrides = override
    return this
  }

  async get (fn) {
    this.config.method = 'get'
    return this.send(fn)
  }

  async post (fn) {
    this.config.method = 'post'
    return this.send(fn)
  }

  async put (fn) {
    this.config.method = 'put'
    return this.send(fn)
  }

  async del (fn) {
    this.config.method = 'delete'
    return this.send(fn)
  }

  endpoint (endpoint) {
    this.config.endpoint = endpoint
    return this
  }

  query (query) {
    const q = Object.entries(query).reduce((curr, [k, v]) => {
      if (Array.isArray(v)) {
        curr.push(...v.map(n => `${k}=${encodeURIComponent(n)}`))
      } else {
        curr.push(`${k}=${encodeURIComponent(v)}`)
      }
      return curr
    }, [])

    this.config.query = q.join('&')
    return this
  }

  payload (payload) {
    this.config.payload = payload
    return this
  }
}

exports.Api = compose(...Object.values(errorHandlers))(ApiBase)
