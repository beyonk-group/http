'use strict'

const errorHandlers = require('../error-handlers')
const { byCode } = require('../errors')
const compose = require('just-compose')

class ApiBase {
  constructor (options) {
    this.options = Object.assign({
      retry: false,
      parseErrors: true
    }, options)

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
      headers: {},
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

    const client = this.getClient()
    const ep = this.config.query ? `${endpoint}?${this.config.query}` : `${endpoint}`

    try {
      const { httpStatus, json } = await this._doQuery(1, client, ep, options)
      return fn ? fn(json, httpStatus) : json
    } catch (e) {
      return this.handle(e)
    } finally {
      this.resetRequest()
    }
  }

  async _doQuery (attempt, client, endpoint, options) {
    const retry = this.options.retry || { attempts: 1 }
    try {
      const r = await client(endpoint, options)

      if (r.ok) {
        let json
        try {
          json = await r.json()
        } catch (e) {
          console.error('Unable to parse response json', e.message)
        }

        return { httpStatus: r.status, json }
      }

      let content = ''
      try {
        content = this.options.parseErrors ? await r.json() : await r.text()
      } catch (e) {
        console.log('Failed to parse error body when asked.')
      }

      const ClientError = byCode(r.status)
      throw new ClientError(r.statusText, content)
    } catch (e) {
      if (attempt < retry.attempts && retry.errors.includes(e.code)) {
        console.warn(`Got ${e.code} when calling ${endpoint}. Retrying request (${attempt}/${retry.attempts})`)
        return this._doQuery(++attempt, client, endpoint, options)
      }

      throw e
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
    const q = Object.entries(query).reduce((curr, [ k, v ]) => {
      if (typeof v === 'undefined') {
        return curr
      }
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

exports.Api = compose.apply(null, Object.values(errorHandlers))(ApiBase)
