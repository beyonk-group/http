'use strict'

const { stub } = require('sinon')
const { expect } = require('@hapi/code')
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
      })
    })

    it('fetches data from url and passes it to a function', async () => {
      clientStub.resolves({
        ok: true,
        json: stub().resolves({ foo: 'bar' })
      })
      expect(
        await api
          .transport(clientStub)
          .endpoint('some/url')
          .get(({ foo }) => foo)
      ).to.equal('bar')
    })

    it('fetches data from url and passes it to an async function', async () => {
      clientStub.resolves({
        ok: true,
        json: stub().resolves({ foo: 'bar' })
      })
      expect(
        await api
          .transport(clientStub)
          .endpoint('some/url')
          .get(async ({ foo }) => {
            await foo
            return foo
          })
      ).to.equal('bar')
    })

    it('fetches data from url and returns it', async () => {
      clientStub.resolves({
        ok: true,
        json: stub().resolves({ foo: 'bar' })
      })
      expect(
        await api
          .transport(clientStub)
          .endpoint('some/url')
          .get()
      ).to.equal({ foo: 'bar' })
    })

    it('appends baseUrl if endpoint is relative', async () => {
      clientStub.resolves({
        ok: true,
        json: stub()
      })
      await api.transport(clientStub).endpoint('some/url').get()
      expect(clientStub.firstCall.args[0]).to.equal(`https://example.com/api/v1/some/url`)
    })

    it('fetches data from url with query params', async () => {
      clientStub.resolves({
        ok: true,
        json: stub()
      })
      await api.transport(clientStub).endpoint('some/url').query({ foo: 'bar', baz: 'qux' }).get()
      expect(clientStub.firstCall.args[0]).to.endWith('/some/url?foo=bar&baz=qux')
    })

    it('fetches data from url with query params', async () => {
      clientStub.resolves({
        ok: true,
        json: stub()
      })
      await api.transport(clientStub).endpoint('some/url').query({ foo: [ 'bar', 'qux' ] }).get()
      expect(clientStub.firstCall.args[0]).to.endWith('/some/url?foo=bar&foo=qux')
    })

    it('with unknown status code', async () => {
      let error
      let expectedError = 'hit default handler'

      clientStub.resolves({
        ok: false,
        statusText: 'No',
        text: stub().resolves('No'),
        status: 419
      })

      await api
        .transport(clientStub)
        .endpoint('some/url')
        .default(e => {
          error = expectedError
        })
        .get()

      expect(error).to.equal(expectedError)
    })

    it('with known status code', async () => {
      let error
      let expectedErrorMessage = 'no'

      clientStub.resolves({
        ok: false,
        text: stub().resolves('foo'),
        statusText: expectedErrorMessage,
        status: 401
      })

      await api
        .transport(clientStub)
        .endpoint('some/url')
        .accessDenied(e => {
          error = e.message
        })
        .get()

      expect(error).to.equal(expectedErrorMessage)
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

    it('posts data to url', async () => {
      clientStub.resolves({
        ok: true,
        json: stub()
      })

      const content = { foo: 'bar' }
      await api
        .transport(clientStub)
        .endpoint('some/url')
        .payload(content)
        .post()

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
      await api.transport(clientStub).endpoint('some/url').payload(content).put()
      expect(clientStub.firstCall.args[1]).to.include({
        method: 'put',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      })
    })

    it('endpoint returns no data', async () => {
      clientStub.resolves({
        ok: true,
        json: stub().rejects('Error')
      })
      expect(
        await api
          .transport(clientStub)
          .endpoint('some/url')
          .put(() => true)
      ).to.be.true()
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
      await api.transport(clientStub).endpoint('some/url').query({ foo: 'bar', baz: 'qux' }).del()
      expect(clientStub.firstCall.args[0]).to.endWith('/some/url?foo=bar&baz=qux')
    })

    it('calls url with delete method', async () => {
      clientStub.resolves({
        ok: true
      })
      await api.transport(clientStub).endpoint('some/url').del()
      expect(clientStub.firstCall.args[1].method).equals('delete')
    })
  })
})
