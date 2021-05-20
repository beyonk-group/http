'use strict'

const { stub } = require('sinon')
const { expect } = require('@hapi/code')
const { Api } = require('.')

describe('util/api', () => {
  describe('#get()', () => {
    context('error handling', () => {
      let clientStub

      beforeEach(async () => {
        global.FormData = Map
        clientStub = stub()
      })

      it('with unknown status code', async () => {
        let error
        const expectedError = 'hit default handler'

        const api = new Api({
          baseUrl: 'https://example.com/api/v1'
        })

        clientStub.resolves({
          ok: false,
          statusText: 'No',
          json: stub().resolves({ error: 'no' }),
          status: 419,
          headers: new Map()
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

      it('has specific error handler', async () => {
        let error
        const expectedError = 'hit local 401 handler'

        const api = new Api({
          baseUrl: 'https://example.com/api/v1'
        })

        clientStub.resolves({
          ok: false,
          statusText: 'No',
          json: stub().resolves({ error: 'no' }),
          status: 401,
          headers: new Map()
        })

        await api
          .transport(clientStub)
          .endpoint('some/url')
          .accessDenied(() => {
            error = expectedError
          })
          .get()

        expect(error).to.equal(expectedError)
      })

      it('has global error handler', async () => {
        let error
        const expectedError = 'hit global 401 handler'

        const api = new Api({
          baseUrl: 'https://example.com/api/v1',
          handlers: {
            accessDenied: () => {
              error = expectedError
            }
          }
        })

        clientStub.resolves({
          ok: false,
          statusText: 'No',
          json: stub().resolves({ error: 'no' }),
          status: 401,
          headers: new Map()
        })

        await api
          .transport(clientStub)
          .endpoint('some/url')
          .get()

        expect(error).to.equal(expectedError)
      })

      it('prefers local error handler to global error handler', async () => {
        let globalCalled = false
        let localCalled = false

        const api = new Api({
          baseUrl: 'https://example.com/api/v1',
          handlers: {
            accessDenied: () => {
              globalCalled = true
            }
          }
        })

        clientStub.resolves({
          ok: false,
          statusText: 'No',
          json: stub().resolves({ error: 'no' }),
          status: 401,
          headers: new Map()
        })

        await api
          .transport(clientStub)
          .endpoint('some/url')
          .accessDenied(() => {
            localCalled = true
          })
          .get()

        expect(globalCalled).to.be.false()
        expect(localCalled).to.be.true()
      })

      it('prefers global error handler to default error handler', async () => {
        let globalCalled = false
        let defaultCalled = false

        const api = new Api({
          baseUrl: 'https://example.com/api/v1',
          handlers: {
            accessDenied: () => {
              globalCalled = true
            }
          }
        })

        clientStub.resolves({
          ok: false,
          statusText: 'No',
          json: stub().resolves({ error: 'no' }),
          status: 401,
          headers: new Map()
        })

        await api
          .transport(clientStub)
          .endpoint('some/url')
          .default(() => {
            defaultCalled = true
          })
          .get()

        expect(globalCalled).to.be.true()
        expect(defaultCalled).to.be.false()
      })
    })

    context('responds ok', () => {
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
          json: stub().resolves({ foo: 'bar' }),
          headers: new Map()
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
          json: stub().resolves({ foo: 'bar' }),
          headers: new Map()
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
          json: stub().resolves({ foo: 'bar' }),
          headers: new Map()
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
          json: stub(),
          headers: new Map()
        })
        await api.transport(clientStub).endpoint('some/url').get()
        expect(clientStub.firstCall.args[0]).to.equal('https://example.com/api/v1/some/url')
      })

      it('fetches data from url with query params', async () => {
        clientStub.resolves({
          ok: true,
          json: stub(),
          headers: new Map()
        })
        await api.transport(clientStub).endpoint('some/url').query({ foo: 'bar', baz: 'qux' }).get()
        expect(clientStub.firstCall.args[0]).to.endWith('/some/url?foo=bar&baz=qux')
      })

      it('fetches data from url with query params', async () => {
        clientStub.resolves({
          ok: true,
          json: stub(),
          headers: new Map()
        })
        await api.transport(clientStub).endpoint('some/url').query({ foo: [ 'bar', 'qux' ] }).get()
        expect(clientStub.firstCall.args[0]).to.endWith('/some/url?foo=bar&foo=qux')
      })

      it('fetches data from url ignoring undefined query params', async () => {
        clientStub.resolves({
          ok: true,
          json: stub(),
          headers: new Map()
        })
        await api.transport(clientStub).endpoint('some/url').query({ foo: 'bar', baz: undefined }).get()
        expect(clientStub.firstCall.args[0]).to.endWith('/some/url?foo=bar')
      })

      it('passes status code as second parameter', async () => {
        const httpStatusCode = 202

        clientStub.resolves({
          ok: true,
          json: stub().resolves({ foo: 'bar' }),
          statusText: 'Accepted',
          status: httpStatusCode,
          headers: new Map()
        })

        const code = await api
          .transport(clientStub)
          .endpoint('some/url')
          .get((json, statusCode) => {
            return statusCode
          })

        expect(code).to.equal(httpStatusCode)
      })

      it('does not parse on 204 (no content)', async () => {
        const httpStatusCode = 204
        const jsonFunction = stub()

        clientStub.resolves({
          ok: true,
          json: jsonFunction,
          statusText: 'No Content',
          status: httpStatusCode,
          headers: new Map()
        })

        await api
          .transport(clientStub)
          .endpoint('some/url')
          .get((json, statusCode) => {
            return statusCode
          })

        expect(jsonFunction.callCount).to.equal(0)
      })

      it('does not parse on empty body', async () => {
        const httpStatusCode = 200
        const jsonFunction = stub()

        const headers = new Map()
        headers.set('content-length', 0)

        clientStub.resolves({
          ok: true,
          json: jsonFunction,
          headers,
          statusText: 'OK',
          status: httpStatusCode
        })

        await api
          .transport(clientStub)
          .endpoint('some/url')
          .get((json, statusCode) => {
            return statusCode
          })

        expect(jsonFunction.callCount).to.equal(0)
      })

      it('with known status code', async () => {
        let error
        const expectedErrorMessage = 'no'

        clientStub.resolves({
          ok: false,
          text: stub().resolves('foo'),
          json: stub().resolves({ foo: 'bar' }),
          statusText: expectedErrorMessage,
          status: 401,
          headers: new Map()
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

    context('parses errors', () => {
      let api
      let clientStub

      const jsonPayload = {
        foo: 'bar'
      }

      beforeEach(async () => {
        global.FormData = Map
        clientStub = stub()
        api = new Api({
          baseUrl: 'https://example.com/api/v1',
          parseErrors: true
        })
      })

      it('with known status code', async () => {
        let payload
        const expectedErrorMessage = 'no'

        clientStub.resolves({
          ok: false,
          json: stub().resolves(jsonPayload),
          statusText: expectedErrorMessage,
          status: 401,
          headers: new Map()
        })

        await api
          .transport(clientStub)
          .endpoint('some/url')
          .accessDenied(e => {
            payload = e.body
          })
          .get()

        expect(payload).to.equal(payload)
      })
    })

    context('retries', async () => {
      context('succeeds on third try', () => {
        let api
        let clientStub
        let res

        class MySystemError extends Error {
          constructor () {
            super()
            this.code = 'ECONNRESET'
          }
        }

        beforeEach(async () => {
          global.FormData = Map
          clientStub = stub()
          clientStub.onFirstCall().rejects(new MySystemError())
          clientStub.onSecondCall().rejects(new MySystemError())
          clientStub.onThirdCall().resolves({
            ok: true,
            json: stub().resolves({ foo: 'bar' }),
            headers: new Map()
          })

          api = new Api({
            baseUrl: 'https://example.com/api/v1',
            retry: {
              errors: [ 'ECONNRESET' ],
              attempts: 3
            }
          })

          res = await api
            .transport(clientStub)
            .endpoint('some/url')
            .get(({ foo }) => foo)
        })

        afterEach(() => {
          clientStub.reset()
        })

        it('retries three times', () => {
          expect(
            clientStub.callCount
          ).to.equal(3)
        })

        it('returns value', () => {
          expect(
            res
          ).to.equal('bar')
        })
      })

      context('never succeeds', () => {
        let api
        let clientStub
        let successStub
        let error

        class MySystemError extends Error {
          constructor () {
            super()
            this.code = 'ECONNRESET'
          }
        }

        beforeEach(async () => {
          global.FormData = Map
          clientStub = stub()
          clientStub.onFirstCall().rejects(new MySystemError())
          clientStub.onSecondCall().rejects(new MySystemError())

          successStub = stub()

          api = new Api({
            baseUrl: 'https://example.com/api/v1',
            retry: {
              errors: [ 'ECONNRESET' ],
              attempts: 2
            }
          })

          await api
            .transport(clientStub)
            .endpoint('some/url')
            .default(e => {
              error = 'stuff happened'
            })
            .get(successStub)
        })

        afterEach(() => {
          clientStub.reset()
          successStub.reset()
        })

        it('retries three times', () => {
          expect(
            clientStub.callCount
          ).to.equal(2)
        })

        it('catches default error', () => {
          expect(error).to.equal('stuff happened')
        })

        it('does not call success method', () => {
          expect(
            successStub.callCount
          ).to.equal(0)
        })
      })
    })

    context('resets request after successful send', async () => {
      let api
      let clientStub

      beforeEach(async () => {
        clientStub = stub()
        clientStub.resolves({
          ok: true,
          json: stub().resolves({ foo: 'bar' }),
          headers: new Map()
        })

        api = new Api({
          baseUrl: 'https://example.com/api/v1'
        })

        await api
          .transport(clientStub)
          .endpoint('some/url')
          .get(({ foo }) => foo)
      })

      it('has cleared endpoint', () => {
        expect(api.config.endpoint).to.equal(null)
      })

      it('has cleared method', () => {
        expect(api.config.method).to.equal('get')
      })

      it('has not cleared transport', () => {
        expect(api.client).to.equal(clientStub)
      })

      it('has cleared query', () => {
        expect(api.config.query).to.equal(null)
      })

      it('has cleared payload', () => {
        expect(api.config.payload).to.equal(null)
      })

      it('has cleared overrides', () => {
        expect(api.config.overrides).to.equal({})
      })
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
        json: stub(),
        headers: new Map()
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
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      })
    })

    it('sets an authorization header', async () => {
      clientStub.resolves({
        ok: true,
        json: stub(),
        headers: new Map()
      })

      const content = { foo: 'bar' }
      await api
        .transport(clientStub)
        .endpoint('some/url')
        .headers({
          Authorization: 'Bearer xxx'
        })
        .payload(content)
        .post()

      expect(clientStub.firstCall.args[1]).to.include({
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer xxx'
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
        json: stub(),
        headers: new Map()
      })

      const content = { foo: 'bar' }
      await api.transport(clientStub).endpoint('some/url').payload(content).put()
      expect(clientStub.firstCall.args[1]).to.include({
        method: 'put',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      })
    })

    it('endpoint returns no data', async () => {
      clientStub.resolves({
        ok: true,
        json: stub().rejects('Error'),
        headers: new Map()
      })
      expect(
        await api
          .transport(clientStub)
          .endpoint('some/url')
          .put(() => true)
      ).to.be.true()
    })

    it('sets an authorization header', async () => {
      clientStub.resolves({
        ok: true,
        json: stub().resolves({ foo: 'bar' }),
        headers: new Map()
      })

      const content = { foo: 'bar' }
      await api
        .transport(clientStub)
        .endpoint('some/url')
        .headers({
          Authorization: 'Bearer xxx'
        })
        .payload(content)
        .put()

      expect(clientStub.firstCall.args[1]).to.include({
        method: 'put',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer xxx'
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
        ok: true,
        json: stub().resolves({}),
        headers: new Map()
      })
      await api.transport(clientStub).endpoint('some/url').query({ foo: 'bar', baz: 'qux' }).del()
      expect(clientStub.firstCall.args[0]).to.endWith('/some/url?foo=bar&baz=qux')
    })

    it('calls url ignoring undefined query params', async () => {
      clientStub.resolves({
        ok: true,
        json: stub().resolves({}),
        headers: new Map()
      })
      await api.transport(clientStub).endpoint('some/url').query({ foo: undefined, baz: 'qux' }).del()
      expect(clientStub.firstCall.args[0]).to.endWith('/some/url?baz=qux')
    })

    it('calls url with delete method', async () => {
      clientStub.resolves({
        ok: true,
        json: stub().resolves({}),
        headers: new Map()
      })
      await api.transport(clientStub).endpoint('some/url').del()
      expect(clientStub.firstCall.args[1].method).equals('delete')
    })
  })
})
