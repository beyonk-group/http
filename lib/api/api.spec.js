const { stub } = require('sinon')
const { expect } = require('code')
const { HttpError, AccessDeniedError } = require('../errors')
const { Api } = require('.')

describe('util/api', () => {
  describe('#get()', () => {
    let api
    let clientStub

    beforeEach(async () => {
      global.FormData = Map
      clientStub = stub()
      api = new Api({
        baseUrl: 'https://example.com/api/v1'
      }, clientStub)
    })

    it('fetches data from url', async () => {
      clientStub.resolves({
        ok: true,
        json: stub().resolves({ foo: 'bar' })
      })
      expect(
        await api.get('some/url')
      ).to.equal({
        foo: 'bar'
      })
    })

    it('appends baseUrl if endpoint is relative', async () => {
      clientStub.resolves({
        ok: true,
        json: stub()
      })
      await api.get('some/url')
      expect(clientStub.firstCall.args[0]).to.equal(`https://example.com/api/v1/some/url`)
    })

    it('fetches data from url with query params', async () => {
      clientStub.resolves({
        ok: true,
        json: stub()
      })
      await api.get('some/url', { foo: 'bar', baz: 'qux' })
      expect(clientStub.firstCall.args[0]).to.endWith('/some/url?foo=bar&baz=qux')
    })

    it('fetches data from url with query params', async () => {
      clientStub.resolves({
        ok: true,
        json: stub()
      })
      await api.get('some/url', { foo: [ 'bar', 'qux' ] })
      expect(clientStub.firstCall.args[0]).to.endWith('/some/url?foo=bar&foo=qux')
    })

    it('with unknown status code', async () => {
      clientStub.resolves({
        ok: false,
        statusText: 'No',
        text: stub().resolves('No'),
        status: 419
      })

      await expect(
        api.get('some/url')
      ).to.reject(
        HttpError,
        'No'
      )
    })

    it('with known status code', async () => {
      clientStub.resolves({
        ok: false,
        text: stub().resolves('foo'),
        statusText: 'no',
        status: 401
      })
      await expect(
        api.get('some/url')
      ).to.reject(
        AccessDeniedError,
        'no'
      )
    })
  })

  describe('#post()', () => {
    let api
    let clientStub

    beforeEach(async () => {
      clientStub = stub()
      api = new Api({
        baseUrl: 'https://example.com/api/v1'
      }, clientStub)
    })

    it('fetches data from url', async () => {
      clientStub.resolves({
        ok: true,
        json: stub()
      })

      const content = { foo: 'bar' }
      await api.post('some/url', content)
      expect(clientStub.firstCall.args[1]).to.include({
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      })
    })
  })

  describe('#put()', () => {
    let api
    let clientStub

    beforeEach(async () => {
      clientStub = stub()
      api = new Api({
        baseUrl: 'https://example.com/api/v1'
      }, clientStub)
    })

    it('fetches data from url', async () => {
      clientStub.resolves({
        ok: true,
        json: stub()
      })

      const content = { foo: 'bar' }
      await api.put('some/url', content)
      expect(clientStub.firstCall.args[1]).to.include({
        method: 'put',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      })
    })
  })

  describe('#del()', () => {
    let api
    let clientStub

    beforeEach(async () => {
      clientStub = stub()
      api = new Api({
        baseUrl: 'https://example.com/api/v1'
      }, clientStub)
    })

    it('calls url with query params', async () => {
      clientStub.resolves({
        ok: true
      })
      await api.del('some/url', { foo: 'bar', baz: 'qux' })
      expect(clientStub.firstCall.args[0]).to.endWith('/some/url?foo=bar&baz=qux')
    })

    it('calls url with delete method', async () => {
      clientStub.resolves({
        ok: true
      })
      await api.del('some/url')
      expect(clientStub.firstCall.args[1].method).equals('delete')
    })
  })
})
