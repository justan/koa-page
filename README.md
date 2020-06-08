# koa-page

![npm](https://img.shields.io/npm/v/koa-page)
![GitHub](https://img.shields.io/github/license/justan/koa-page)
![Codecov](https://img.shields.io/codecov/c/github/justan/koa-page)

Serve path with a file.

## Install

Using npm

```sh
npm i koa-page
```

Using yarn

```js
yarn add koa-page
```

## Usage

```js
// app.js
const pt = require('path')
const App = require('koa')
const koaPage = require('koa-page')

const app = new App()

app.use(
  koaPage({
    pagePath: pt.join(__dir, 'views'),
  })
)

app.listen(3000)
```

```
.
├── app.js
├── package.json
├── views
│   ├── index.js  // curl http://127.0.0.0:3000/
│   ├── api.js    // curl http://127.0.0.0:3000/api
|   └── path
|       └── to.js // curl http://127.0.0.0:3000/path/to
└── yarn.lock
```

## API

### koaPage(option = {}) {function}

Return a page router middleware.

```js
app.use(
  koaPage({
    pagePath: pt.join(__dir, 'views'),
  })
)
```

#### option.pagePath {string} path which view or controller

```js
app.use(
  koaPage({
    pagePath: pt.join(__dir, 'views'),
  })
)
```

#### [option.prefix] {string} match prefix

```js
app.use(
  koaPage({
    prefix: '/path',
    pagePath: pt.join(__dir, 'views'),
  })
)
// matched  http://host/path
```

#### [option.middlewares] {koa-middleware[]} middlewares

```js
app.use(
  koaPage({
    pagePath: pt.join(__dir, 'views'),
    middlewares: [],
  })
)
```

## License

MIT
