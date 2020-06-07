let res

exports.render = async (ctx, next) => {
  ctx.set('x-path', ctx.path)

  return res
}

exports.setResponse = async (r) => {
  res = r
}
