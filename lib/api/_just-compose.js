function compose (...fns) {
  return function () {
    var result = fns[0].apply(this, arguments)
    var len = fns.length
    for (var i = 1; i < len; i++) {
      result = fns[i].call(this, result)
    }
    return result
  }
}

export { compose }
