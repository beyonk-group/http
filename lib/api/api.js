'use strict'

const querystring = require('querystring')
const fetch = require('node-fetch')
const { byCode } = require('../errors')

function formatBody (body) {
  if (!body) { return {} }
  if (body instanceof FormData) {
    return {
      headers: { 'Content-Type': 'multipart/form-data' },
      body
    }
  } else {
    return {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  }
}

class Api {
  constructor (options, client) {
    if (client) {
      this.client = client
    } else if (typeof window !== 'undefined') {
      this.client = window.fetch.bind(window)
    } else {
      this.client = fetch
    }
    this.options = options
  }

  async send (method, url, data, overrides = {}) {
    const endpoint = url.includes('://') ? url : `${this.options.baseUrl}/${url}`
    const body = formatBody(data)

    const options = {
      method,
      cors: true,
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      },
      ...overrides,
      ...body
    }

    let r
    try {
      r = await this.client(endpoint, options)
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

    const ClientError = byCode(r.status)
    const content = await r.text()
    throw new ClientError(r.statusText, content)
  }

  async callWithQuery (method, endpoint, query = {}) {
    const qs = querystring.stringify(query)
    return this.send(method, `${endpoint}${qs ? `?${qs}` : ''}`)
  }

  async get (endpoint, query = {}) {
    return this.callWithQuery('get', endpoint, query)
  }

  async post (endpoint, payload) {
    return this.send('post', endpoint, payload)
  }

  async put (endpoint, payload) {
    return this.send('put', endpoint, payload)
  }

  async del (endpoint, query) {
    return this.callWithQuery('delete', endpoint, query)
  }
}

exports.Api = Api
