let res

let fn = async function (ctx, next) {
  ctx.set('x-path', ctx.path)
  ctx.body = res
  return next()
}

module.exports = fn

fn.setResponse = (r) => {
  res = r
}
