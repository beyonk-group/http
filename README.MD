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
1. `node-fetch` if nothing else is available (pure server-side)

Generally this means that your usage is the same no matter where you call it, with one exception - using this library in the `preload` method requires you to pass in Sapper's special `this.fetch` method, as it is not available outside of the preload method. Examples of which are below.

## Usage

### To use within a Sapper application:

Install it

```bash
npm i -D @beyonk/sapper-httpclient
```

Configure it (both server-side and client-side as there are two bundles)

```js
// src/client.js && src/server.js
import { configure } from '@beyonk/sapper-httpclient'

configure({ baseUrl: 'https://example.com/your/api/base' })
```

Use it on the client:

```js
// src/routes/some-route.html
import { create } from '@beyonk/sapper-httpclient'

// in a method (client-side)
const api = create()
const { json } = await api.get('some/endpoint')
console.log(json)

// in preload (isomorphic)
const api = create(this.fetch)
const { json } = await api.get('some/endpoint')
console.log(json)
```

Use it on the server:

```js
// src/routes/some-route.js
import { create } from '@beyonk/sapper-httpclient'

// in preload (isomorphic)
const api = create()
const { json } = await api.get('some/endpoint')
console.log(json)
```

Catching errors:

```js
import { errors } from '@beyonk/sapper-httpclient'
const { NotFoundError, ForbiddenError } = errors
```

## Running Tests

```js
npm test
```

## Credits

* Original code by [Antony Jones](https://github.com/antony)
