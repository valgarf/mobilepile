
/**
 * @file Custom error library, which includes integration to the logging system (tags) and has information on if and how to present it to the user
 */


/**
 * Base class for any custom error classes.
 * Contrcution parameters:
 * @param {string} message: typical error message that is logged and shown to the user
 * @param {any} details: details to be logged, which can be complete objects that can be inspected in the console.
 *                       Currently not presented in the UI, might be in the future with a 'details' button.
 * @param {string[]} tags: tags that are given to the logger
 * @param {string} name: Name of the erro, usually the name of the class
 * @param {boolean} show: wether to show this error in the UI
 * @param {boolean} log: wether to log this error
 */
export class DerivedError extends Error {

  constructor(public message: string, public details: any = null, public tags: string[] = null, public name: string = null,
    public show: boolean = true, public log: boolean = true) {
    super(message)
    if (this.details == null) {
      this.details = 'No further details available'
    }
    if (tags == null) {
      this.tags = []
    }
    if (name == null) {
      this.name = 'DerivedError'
    }

  }

  toString(): string {
    return this.name + ': ' + this.message
  }
}

/**
 * Adds default tags to an error class by decorating the constructor.
 * Must be used as a decorator with an argument, i.e.
 *  @addTags(['tag1', 'tag2']) export class XYZ extends DerivedError { };
 *
 * @param  {string[]} defaultTags: list of tags that should be shown in the log when this error is logged
 */
function addTags(defaultTags: string[] = []) {
  function wrapper(target: any) {
    var original = target;
    var createErrorInstance: any = function(message: string, details: any = null, tags: string[] = null, name: string = null,
      show: boolean = true, log: boolean = true) {
      if (tags == null) {
        tags = []
      }
      return new original(message, details, defaultTags.concat(tags), name == null ? original.name : name, show, log)
    }
    createErrorInstance.prototype = original.prototype;
    return createErrorInstance;
  }
  return wrapper
}

/*
 * Custom error classes
 */

@addTags(['unspecific']) export class RuntimeError extends DerivedError { };
@addTags(['connection']) export class ConnectionError extends DerivedError { };
@addTags(['authentication']) export class AuthenticationError extends DerivedError { };
@addTags(['data', 'server']) export class DataUnavailableError extends DerivedError { };
@addTags(['type']) export class UnknownTypeError extends DerivedError { };

/**
 * Wrapping class for errors that are thrown in some library and do not use the custom class
 */
export class WrappingError extends DerivedError {
  constructor(public message: string, public details: any = null, public tags: string[] = null, name: string = null,
    public show: boolean = true, public log: boolean = true) {
    super(message, details, ['wrapped'].concat(tags == null ? [] : tags), name == null ? 'WrappingError' : name, show, log)
  }
};


/**
 * Helper functions for handling errors
 */
export namespace error {

  /**
   * attaches tags to an error object, does not have to derived from DerivedError
   *
   * @param  {object} err: the error object
   * @param  {string[]} tags: the tags to add
   */
  export function attachTags(err, tags: string[]) {
    if (err.tags == null) {
      err.tags = []
    }
    err.tags = err.tags.concat(tags)
  }

  /**
   * wraps all errors that are not  derived from the standard Error in a WrappingError, i.e. thrown strings.
   * All Error objects and are left as is.
   * Original error is included as detail.
   *
   * @param  {object} err: the original error object
   * @returns {Error} the original error object or a WrappingError object
   */
  export function ensureErrorObject(err) {
    if (err instanceof Error) {
      return err;
    }
    let message = 'wrapping error object that is not of type "Error"'
    let name = err.name
    if (err.message != null) {
      message = err.message
    }
    let tags = []
    if (err.tags != null) {
      tags = err.tags
    }
    return new WrappingError(message, err, tags, name)
  }

  /**
   * marks this error as an expected one, i.e. do not log it or show it in the UI.
   * Example: from two connection errors, the second one can be ignored.
   *
   * @param  {type} err description
   * @returns {type}     description
   */
  export function setExpected(err) {
    err.show = false;
    err.log = false;
  }
}
