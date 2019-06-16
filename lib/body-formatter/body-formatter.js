'use strict'

exports.formatBody = function (body) {
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
