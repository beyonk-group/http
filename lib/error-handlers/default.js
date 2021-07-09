const DefaultMixin = superclass => class Default extends superclass {
  default (fn) {
    this.defaultHandler = fn
    return this
  }
}

export { DefaultMixin }
