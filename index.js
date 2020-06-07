/**
 * Serve path with a file
 */

const pt = require('path')
const EventEmitter = require('events')

const Router = require('koa-router')

/**
 * @param {String} opts.pagePath 对应的路径
 * @param {String} [opts.prefix] prefix path
 * @param {Array} [opts.middlewares]
 * @returns {Middlware}
 */
module.exports = function (opts = {}) {
  const { pagePath, prefix, middlewares = [] } = opts
  const router = new Router({
    prefix,
  })

  const event = new EventEmitter()
  let middleware

  router.all('/:path*', ...middlewares, async (ctx, next) => {
    let page

    // won't call when got reponse
    // websocket handshake 请求没有 `ctx.res` 对象, 取 `ctx.status` 会异常. 不影响后面模块执行
    if (ctx.res && (ctx.body != null || ctx.status != 404)) {
      return next()
    }

    let modulePath = pt.join(pagePath, ctx.params.path || '')

    try {
      page = require(modulePath)
    } catch (e) {
      // TODO 有可能是子模块不存在
      if (e.code === 'MODULE_NOT_FOUND') {
        // not found
        event.emit('404', e)
      } else {
        // throw logic error
        throw e
      }
    }

    if (page) {
      if (page.render) {
        const res = await page.render(ctx)

        // render 返回的 function 作为中间件对待
        if (typeof res == 'function') {
          return res(ctx, next)
        } else if (res !== undefined) {
          ctx.body = res
        }
        // 当 `render` 方法返回 `undefined` 的时候不处理
      } else if (typeof page === 'function') {
        // 直接是个中间件
        return page(ctx, next)
      } else {
        ctx.status = 501
        // not implemented
        event.emit(
          '501',
          new Error(
            `Please implement a middleware or render function in ${modulePath}`
          )
        )
      }
    }

    return next()
  })

  middleware = router.routes()

  middleware.event = event
  middleware.Router = Router

  return middleware
}
