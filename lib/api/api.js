'use strict'

const errorHandlers = require('../error-handlers')
const { byCode } = require('../errors')
const compose = require('just-compose')
const EnhancedFetch = require('@zeit/fetch')

class ApiBase {
  constructor (options) {
    this.options = options
    this.handlers = {}
    this.client = null
    this.resetRequest()
  }

  resetRequest () {
    this.config = {
      enhancedFetch: true,
      endpoint: null,
      method: 'get',
      payload: null,
      query: null,
      headers: {},
      overrides: {}
    }
  }

  getClient () {
    if (this.options.mock) {
      console.warn('@beyonk/sapper-httpclient: Using mocked http client')
      return this.options.mock
    }

    let transport
    if (this.client) {
      transport = this.client
    } else if (typeof window !== 'undefined') {
      transport = window.fetch.bind(window)
    }

    if (!transport) {
      throw Error("No client provided and can't find one automatically")
    }

    return (!process.browser && this.options.enhancedFetch) ? EnhancedFetch(transport) : transport
  }

  async send (fn) {
    const endpoint = this.config.endpoint.includes('://') ? this.config.endpoint : `${this.options.baseUrl}/${this.config.endpoint}`

    const hasPayload = !!this.config.payload

    const options = Object.assign(
      {
        method: this.config.method,
        cors: true,
        credentials: 'include',
        headers: Object.assign(
          { Accept: 'application/json' },
          hasPayload ? { 'Content-Type': 'application/json' } : {},
          this.config.headers
        )
      },
      hasPayload ? { body: JSON.stringify(this.config.payload) } : {},
      this.config.overrides
    )

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

  headers (headers) {
    this.config.headers = headers
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
