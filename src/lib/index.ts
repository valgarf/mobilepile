
// export * from './reactive.ts';
export * from './errors'
export * from './logging'

/**
 * Check if object is a function
 * For other implementations and discussions see:
 * http://stackoverflow.com/questions/5999998/how-can-i-check-if-a-javascript-variable-is-function-type
 */
export function isFunction(obj): boolean {
  return !!(obj && obj.constructor && obj.call && obj.apply) // !! converts to a boolean
}

/**
 * Bind all methods of an object to that object.
 * Should be used in the constructor, e.g.
 * ```
 * bindMethods(this)
 * ```
 * Note that this replaces all functions of the OBJECT, not the prototype.
 * It is expensive to do that on a lot of objects, use sparingly!
 *
 * @param  {Object} self - the instance to bind to
 */
export function bindMethods(self: Object): void {
  var cls = Object.getPrototypeOf(self);
  for (let funName of Object.getOwnPropertyNames(cls)) {
    let fun = self[funName]
    if (fun && isFunction(fun.bind)) {
      self[funName] = fun.bind(self);
    }
  }
}


/**
 * delay - asynchronous function that delays the execution of upcoming code by the given time
 *
 * @param  {number} time given in milliseconds
 * @returns {void}
 */
export async function delay(time: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    setTimeout(resolve, time)
  })
}

export var logfunc = console.log.bind(console)
