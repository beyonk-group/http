<p align="center">
  <img width="186" height="90" src="https://user-images.githubusercontent.com/218949/44782765-377e7c80-ab80-11e8-9dd8-fce0e37c235b.png" alt="Beyonk" />
</p>

## Sapper HttpClient

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![CircleCI](https://circleci.com/gh/beyonk-adventures/sapper-httpclient.svg?style=shield)](https://circleci.com/gh/beyonk-adventures/sapper-httpclient)

Sapper isomorphic fetch library

## Why

In sapper, there are three different ways of fetching data:

* client
* server
* isomorphic (client + server)

This library helps you abstract over where you are fetching data, meaning that your code maintains consistency without having to worry about where your data is being fetched.

The way it does this is by trying to use the first available fetch method, and failing over to alternatives if a  method is not available. The methods it tries are, in the following order:

1. Any fetch library you pass to `create()` (for example, `preload`'s `this.fetch`)
1. window.fetch if the library detects it is running clientside
1. `node-fetch`, or whatever you want to pass in, if nothing else is available (pure server-side)

Generally this means that your usage is the same no matter where you call it, with one exception - using this library in the `preload` method requires you to pass in Sapper's special `this.fetch` method, as it is not available outside of the preload method. Examples of which are below.

## Usage

### To use within a Sapper application:

### Install it

```bash
npm i -D @beyonk/sapper-httpclient
```

### Configure it (both server-side and client-side as there are two bundles)

```js
// src/client.js && src/server.js
import Api from '@beyonk/sapper-httpclient'

Api.configure({ baseUrl: 'https://example.com/your/api/base' })
```

### Use it on the client:

```js
// src/routes/some-route.html
import { create } from '@beyonk/sapper-httpclient'

// in a method (client-side)
const api = create()
const { json } = await api.endpoint('some/endpoint').get()
console.log(json)

// in preload (Svelte v2) (isomorphic)
const api = create()
const { json } = await api
  .transport(this.fetch) // Use sapper's built in "fetch" method
  .endpoint('some/endpoint')
  .get()
console.log(json)

// in preload (Svelte v3) (isomorphic)
import { fetch } from '@sapper/app'

const api = create()
const { json } = await api
  .transport(fetch) // Use sapper's built in "fetch" method
  .endpoint('some/endpoint')
  .get()
console.log(json)
```

### Use it on the server:

```js
// src/routes/some-route.js
import fetch from 'node-fetch' // or Sapper's built in fetch
import { create } from '@beyonk/sapper-httpclient'

const api = create()
const { json } = await api
  .transport(fetch) // pass node fetch in here.
  .endpoint('some/endpoint')
  .get()
console.log(json)
```

## Methods

```js
const api = create()
const client = api
  .endpoint('some/endpoint')

console.log(await client.get()) // Get endpoint
console.log(await client.payload({ foo: 'bar' }).put()) // Put with body
console.log(await client.payload({ foo: 'bar' }).post()) // Post with body
console.log(await client.query({ foo: 'bar' }).get()) // Get with query
console.log(await client.del()) // Delete
console.log(await client.headers({ foo: 'bar' }).put()) // Put with headers
```

## Using built in response handling

```js
const api = create()
const profile = await api
  .endpoint('some/endpoint')
  .get(json => {
    return json.profile
  })
console.log(profile)
```

## Catching errors

```js
  await client
    .endpoint('some/url')
    .forbidden(e => {
      console.error('Forbidden', e)
    })
    .notFound(e => {
      console.error('Not found', e)
    })
    .accessDenied(e => {
      console.error('Access denied', e)
    })
    .conflict(e => {
      console.error('Conflict', e)
    })
    .preconditionFailed(e => {
      console.error('Precondition failed', e)
    })
    .badData(e => {
      console.error('Bad data', e)
    })
    .default(e => {
      // Any other error caught here
      console.error('Some error', e)
    })
    .get()
```

## Enhanced Fetch

As of v4.0.0, your underlying http client will be wrapped in [vercel/fetch](https://github.com/vercel/fetch) to work around [some issues](https://twitter.com/rauchg/status/1259890452813082624) in `fetch`

Note that enhanced fetch will check `process.browser` to determine if it is able to use `vercel/fetch` or not.

To stop this behaviour, turn enhanced fetch off:

```js
Api.configure({
  ...,
  enhancedFetch: false
})
```

## Troubleshooting

I'm seeing missing modules in my bundler logs

```
'url' is imported by ../sapper-httpclient/node_modules/@zeit/fetch-cached-dns/index.js, but could not be resolved – treating it as an external dependency
'url' is imported by ../sapper-httpclient/node_modules/@zeit/fetch/index.js, but could not be resolved – treating it as an external dependency
'net' is imported by ../sapper-httpclient/node_modules/@zeit/fetch-cached-dns/index.js, but could not be resolved – treating it as an external dependency
'url' is imported by url?commonjs-external, but could not be resolved – treating it as an external dependency
'net' is imported by net?commonjs-external, but could not be resolved – treating it as an external dependency
'dns' is imported by ../sapper-httpclient/node_modules/@zeit/dns-cached-resolve/lib/dns-resolve.js, but could not be resolved – treating it as an external dependency
'dns' is imported by dns?commonjs-external, but could not be resolved – treating it as an external dependency
```

The `@zeit/fetch` module requires the `net` and `url` packages from nodejs. These aren't available in a browser, so you should use `rollup-plugin-node-builtins` to stub them.

## Running Tests

```sh
npm test
```

## Credits

* Original code by [Antony Jones](https://github.com/antony)
