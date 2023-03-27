import { AccessDeniedMixin } from '../error-handlers/access-denied.js'
import { ConflictMixin } from '../error-handlers/conflict.js'
import { DefaultMixin } from '../error-handlers/default.js'
import { ForbiddenMixin } from '../error-handlers/forbidden.js'
import { HandleMixin } from '../error-handlers/handle.js'
import { NotFoundMixin } from '../error-handlers/not-found.js'
import { BadDataMixin } from '../error-handlers/bad-data.js'
import { PaymentRequiredMixin } from '../error-handlers/payment-required.js'
import { PreconditionFailedMixin } from '../error-handlers/precondition-failed.js'
import { TooManyRequestsMixin } from '../error-handlers/too-many-requests.js'
import { NotAcceptableMixin } from '../error-handlers/not-acceptable.js'
import { GoneMixin } from '../error-handlers/gone.js'
import { byCode } from '../errors.js'
import { compose } from './_just-compose.js'

class ApiBase {}
const Behaviours = compose(
  AccessDeniedMixin,
  ConflictMixin,
  DefaultMixin,
  ForbiddenMixin,
  HandleMixin,
  NotFoundMixin,
  BadDataMixin,
  PaymentRequiredMixin,
  PreconditionFailedMixin,
  TooManyRequestsMixin,
  NotAcceptableMixin,
  GoneMixin
)(ApiBase)

class Api extends Behaviours {
  constructor (options) {
    super()
    this.options = Object.assign({
      retry: false,
      parseErrors: true,
      handlers: {}
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

    let result
    try {
      result = await this._doQuery(1, client, ep, options)
    } catch (e) {
      console.log(e)
      return this.handle(e, this.ctx)
    } finally {
      this.resetRequest()
    }

    const { json, httpStatus } = result
    return fn ? fn(json, httpStatus) : json
  }

  _hasContent (response) {
    const contentLength = parseInt(response.headers.get('content-length'), 10)

    const isNoContentResponse = response.status === 204
    if (isNoContentResponse) {
      return false
    }

    const headerExists = !isNaN(contentLength)
    return !headerExists || contentLength > 0
  }

  async _doQuery (attempt, client, endpoint, options) {
    const retry = this.options.retry || { attempts: 1 }
    try {
      const r = await client(endpoint, options)

      if (r.status >= 200 && r.status < 400) {
        let json

        if (this._hasContent(r)) {
          try {
            json = await r.json()
          } catch (e) {
            console.error('Unable to parse response json', e.message)
          }
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

  context (ctx) {
    if (ctx.fetch) {
      this.client = ctx.fetch
    }
    this.ctx = ctx
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

  async patch (fn) {
    this.config.method = 'patch'
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

export {
  Api
}
