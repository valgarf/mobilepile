
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

@addTags(['unspecific']) export class RuntimeError extends DerivedError { };
@addTags(['connection']) export class ConnectionError extends DerivedError { };
@addTags(['authentication']) export class AuthenticationError extends DerivedError { };
@addTags(['data', 'server']) export class DataUnavailableError extends DerivedError { };
@addTags(['type']) export class UnknownTypeError extends DerivedError { };

export class WrappingError extends DerivedError {
  constructor(public message: string, public details: any = null, public tags: string[] = null, name: string = null,
    public show: boolean = true, public log: boolean = true) {
    super(message, details, ['wrapped'].concat(tags == null ? [] : tags), name == null ? 'WrappingError' : name, show, log)
  }
};

export namespace error {
  export function attachTags(err, tags: string[]) {
    if (err.tags == null) {
      err.tags = []
    }
    err.tags = err.tags.concat(tags)
  }

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

  export function setExpected(err) {
    err.show = false;
    err.log = false;
  }
}
