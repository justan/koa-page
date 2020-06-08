const assert = require('assert')
const http = require('http')
const pt = require('path')

const koa = require('koa')
const koaPage = require('../')

const app = new koa()
const PORT = 1234

let server

beforeAll(() => {
  server = app.listen(PORT)
})

afterAll(() => {
  server.close()
})

function fetchData(path = '', expected) {
  try {
    let page = require(`./pages${path}`)
    page.setResponse && page.setResponse(expected)
  } catch (e) {
    jest.resetModules() // funny here
  }

  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${PORT}${path}`, (res) => {
      const { statusCode } = res

      //   console.log('statusCode', statusCode)

      res.setEncoding('utf8')

      if (statusCode < 400) {
        assert.equal(res.headers['x-path'], path, 'path check')
      }

      let rawData = ''
      res.on('data', (chunk) => {
        rawData += chunk
      })
      res
        .on('end', () => {
          try {
            resolve({
              status: statusCode,
              headers: res.headers,
              body: rawData,
            })
          } catch (e) {
            reject(e)
          }
        })
        .on('error', (e) => {
          reject(e)
        })
    })
  })
}

describe('serve page: root', () => {
  let pages = koaPage({
    pagePath: pt.join(__dirname, 'pages'),
  })
  app.use(pages)

  it('GET / 200 json', async () => {
    let expected = {
      r: Math.random(),
    }

    let res = (await fetchData('/', expected)).body

    res = JSON.parse(res)
    assert.deepEqual(res, expected)
  })
  it('GET /html 200 html', async () => {
    let expected = `<!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>koa-page</title>
      </head>
      <body>
          Hello Page
      </body>
      </html>`

    let res = await fetchData('/html', expected)

    assert.equal(res.body, expected)
  })

  it('GET /path/deep/middleware 200 json', async () => {
    let expected = {
      r: Math.random(),
    }

    let res = (await fetchData('/path/deep/middleware', expected)).body

    res = JSON.parse(res)
    assert.deepEqual(res, expected)
  })

  it('GET /path/deep/returnmiddleware 200 json', async () => {
    let o = {
      r: Math.random(),
    }
    let expected = async (ctx, next) => {
      ctx.body = o

      return next()
    }

    let res = (await fetchData('/path/deep/returnmiddleware', expected)).body

    res = JSON.parse(res)
    assert.deepEqual(res, o)
  })

  it('GET /path 200 json', async () => {
    let expected = {
      r: Math.random(),
    }

    let res = (await fetchData('/path', expected)).body

    res = JSON.parse(res)
    assert.deepEqual(res, expected)
  })
})

describe('serve page: prefix', () => {
  let pages = koaPage({
    prefix: '/path',
    pagePath: pt.join(__dirname, 'pages'),
  })
  app.use(pages)

  it('GET /path 200 json', async () => {
    let expected = {
      r: Math.random(),
    }

    let res = (await fetchData('/path', expected)).body

    res = JSON.parse(res)
    assert.deepEqual(res, expected)
  })
})

describe('serve errors: root', () => {
  let pages = koaPage({
    pagePath: pt.join(__dirname, 'pages'),
  })
  app.use(pages)

  it('GET /notpath 404', async () => {
    let expected = 'Not Found'

    let res = await fetchData('/notpath', expected)

    assert.equal(res.status, 404)
    assert.equal(res.body, expected)
  })
  it('GET /path/error 500', async () => {
    let expected = 'Internal Server Error'

    let res = await fetchData('/path/error', expected)

    assert.equal(res.status, 500)
    assert.equal(res.body, expected)
  })
  it('GET /path/deep/501 501', async () => {
    let expected = 'Not Implemented'

    let res = await fetchData('/path/deep/501', expected)

    assert.equal(res.status, 501)
    assert.equal(res.body, expected)
  })
})
