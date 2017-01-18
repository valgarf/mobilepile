
// export * from './reactive.ts';


/**
 * Check if object is a function
 */
export function isFunction(obj):boolean {
  return !!(obj && obj.constructor && obj.call && obj.apply) // !! converts to a boolean
}

/**
 * Bind all methods of an object to that object.
 * Should be used in the constructor, e.g.
 * ```
 * bindMethods(this)
 * ```
 * Note that this replaces all functions of the OBJECT, not the prototype.
 * It is expensive to do that on a lot of object, use sparingly!
 *
 * @param  {Object} self - the instance to bind to
 */
export function bindMethods(self: Object) : void {
  var cls = Object.getPrototypeOf(self);
  for (let funName of Object.getOwnPropertyNames(cls) ) {
    let fun = self[funName]
    if (fun && isFunction(fun.bind)) {
      self[funName] = fun.bind(self);
    }
  }
}

export var logfunc = console.log.bind(console)
